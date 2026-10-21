// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\producciones-leche-detalle.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, Estado } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { VacunoValidadorService } from '../../common/validators/vacuno-validador.service';
import { ProduccionLeche } from './entities/produccion-leche.entity';
import { ProduccionLecheDetalle } from './entities/produccion-leche-detalle.entity';
import { CreateProduccionLecheDetalleDto } from './dto/create-produccion-leche-detalle.dto';
import { UpdateProduccionLecheDetalleDto } from './dto/update-produccion-leche-detalle.dto';
import { FindProduccionesLecheDetalleQueryDto } from './dto/find-producciones-leche-detalle-query.dto';
import { ProduccionLecheDetalleResponseDto } from './dto/produccion-leche-detalle-response.dto';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';

@Injectable()
export class ProduccionLecheDetalleService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'producciones_leche_detalle',
        nombreEntidad: 'ProduccionLecheDetalle',
        campoPK: 'produccion_leche_detalle_id',
        alias: 't',
        responseDto: ProduccionLecheDetalleResponseDto,
        camposBusquedaEnQ: FindProduccionesLecheDetalleQueryDto.getCamposParaQ(),
        tablasDependientes: [],
        joins: [
            {
                table: 'vacunos',
                alias: 'v',
                onCondition: 'v.vacuno_id = t.vacuno_id',
                selectColumns: [
                    'v.arete AS vacuno_arete',
                    'v.nombre AS vacuno_nombre'
                ],
                type: 'INNER'
            },
            {
                table: 'razas',
                alias: 'rz',
                onCondition: 'rz.raza_id = v.raza_id',
                selectColumns: ['rz.raza AS raza_nombre'],
                type: 'INNER'
            },
            {
                table: 'categorias_vacuno',
                alias: 'ct',
                onCondition: 'ct.categoria_vacuno_id = v.categoria_vacuno_id',
                selectColumns: ['ct.categoria AS categoria_nombre'],
                type: 'INNER'
            }
        ],
        configuracionFiltros: [
            { nombreCampo: 'vacuno_id', nombreColumna: 'vacuno_id', tipoDatoFiltro: 'number', operador: 'eq' },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'produccion_leche_detalle_id',
            camposPermitidosParaOrdenar: FindProduccionesLecheDetalleQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindProduccionesLecheDetalleQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => [],
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly vacunoValidador: VacunoValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    async findOneDetalle(
        produccionLecheId: number,
        detalleId: number,
        usuarioId: number
    ): Promise<ProduccionLecheDetalleResponseDto> {
        const detalle = await this.dataSource.query(
            `SELECT t.produccion_leche_detalle_id
             FROM producciones_leche_detalle t
             WHERE t.produccion_leche_detalle_id = $1
               AND t.produccion_leche_id = $2
               AND t.estado_id IN (1000, 1002)
             LIMIT 1`,
            [detalleId, produccionLecheId]
        );

        if (!detalle?.[0]) {
            throw new DomainException('El detalle no existe en esta producción.', { httpStatus: HttpStatus.NOT_FOUND });
        }

        return this.findOne<ProduccionLecheDetalleResponseDto>(detalleId, usuarioId);
    }

    private async recalcularTotalesCabecera(
        produccionLecheId: number,
        usuarioId: number,
        manager: EntityManager
    ): Promise<void> {
        const result = await manager.query(
            `SELECT COALESCE(SUM(litros), 0) AS suma
             FROM producciones_leche_detalle
             WHERE produccion_leche_id = $1 AND estado_id = $2`,
            [produccionLecheId, ESTADO_ACTIVO]
        );

        const nuevoTotalLitros = Number(result[0].suma);
        const cabecera = await manager.findOne(ProduccionLeche, {
            where: { produccion_leche_id: produccionLecheId, estado_id: ESTADO_ACTIVO },
            lock: { mode: 'pessimistic_write' }
        });

        if (!cabecera) {
            throw new DomainException('La producción cabecera no existe o está histórica.', { httpStatus: HttpStatus.NOT_FOUND });
        }

        // 3. Validar que el descartado no supere los nuevos litros
        if (Number(cabecera.total_descartado) > nuevoTotalLitros) {
            throw new DomainException(
                `Operación denegada: los litros resultantes en los detalles (${nuevoTotalLitros}) son menores al total descartado actual de la cabecera (${cabecera.total_descartado}). Modifique el total_descartado primero.`,
                { httpStatus: HttpStatus.CONFLICT }
            );
        }

        // 4. Actualizar cabecera
        cabecera.total_litros = nuevoTotalLitros;
        cabecera.total_neto = Number((nuevoTotalLitros - Number(cabecera.total_descartado)).toFixed(2));
        cabecera.marcarActualizacion(usuarioId);

        await manager.save(cabecera);
    }

    async create(
        produccionLecheId: number,
        dto: CreateProduccionLecheDetalleDto,
        usuarioId: number
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const cabecera = await manager.findOne(ProduccionLeche, {
                where: { produccion_leche_id: produccionLecheId, estado_id: ESTADO_ACTIVO }
            });
            if (!cabecera) {
                throw new DomainException('La producción no existe o ya es histórica. No se pueden agregar detalles.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            await this.vacunoValidador.validarProductorLeche(dto.vacuno_id, cabecera.sucursal_id, manager);

            const existe = await manager.findOne(ProduccionLecheDetalle, {
                where: { produccion_leche_id: produccionLecheId, vacuno_id: dto.vacuno_id, estado_id: ESTADO_ACTIVO }
            });
            if (existe) {
                throw new DomainException('El vacuno ya está registrado en esta producción.', { httpStatus: HttpStatus.CONFLICT });
            }

            // 4. Crear detalle
            const nuevoDetalle = await manager.save(ProduccionLecheDetalle, {
                produccion_leche_id: produccionLecheId,
                vacuno_id: dto.vacuno_id,
                litros: dto.litros,
                turno_ordeno_id: cabecera.turno_ordeno_id, // Se hereda de la cabecera
                observaciones: dto.observaciones ?? null,
                usuario_id_registro: Number(usuarioId),
            });

            await this.recalcularTotalesCabecera(produccionLecheId, usuarioId, manager);

            return this.findOne<ProduccionLecheDetalleResponseDto>(nuevoDetalle.produccion_leche_detalle_id, usuarioId, manager);
        });
    }

    async update(
        produccionLecheId: number,
        detalleId: number,
        dto: UpdateProduccionLecheDetalleDto,
        usuarioId: number
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const detalle = await manager.findOne(ProduccionLecheDetalle, {
                where: { produccion_leche_detalle_id: detalleId, produccion_leche_id: produccionLecheId, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!detalle) {
                throw new DomainException('El detalle no existe o está inactivo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            if (dto.litros !== undefined) detalle.litros = dto.litros;
            if (dto.observaciones !== undefined) detalle.observaciones = dto.observaciones;

            detalle.marcarActualizacion(usuarioId);
            await manager.save(detalle);
            await this.recalcularTotalesCabecera(produccionLecheId, usuarioId, manager);

            return this.findOne<ProduccionLecheDetalleResponseDto>(detalleId, usuarioId, manager);
        });
    }

    async removeDetalle(
        produccionLecheId: number,
        detalleId: number,
        usuarioId: number
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const detalle = await manager.findOne(ProduccionLecheDetalle, {
                where: { produccion_leche_detalle_id: detalleId, produccion_leche_id: produccionLecheId, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!detalle) {
                throw new DomainException('El detalle no existe o está inactivo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const count = await manager.count(ProduccionLecheDetalle, {
                where: { produccion_leche_id: produccionLecheId, estado_id: ESTADO_ACTIVO }
            });
            if (count <= 1) {
                throw new DomainException(
                    'No se puede eliminar el único vacuno de esta producción. Si desea anularla, elimine la producción completa.',
                    { httpStatus: HttpStatus.CONFLICT }
                );
            }

            detalle.estado_id = Estado.BORRADO;
            detalle.usuario_id_baja = usuarioId;
            detalle.fecha_baja = new Date();
            await manager.save(detalle);
            await this.recalcularTotalesCabecera(produccionLecheId, usuarioId, manager);

            // ✅ CORRECCIÓN: Retornar la entidad directamente evita el error 404
            return detalle as unknown as ProduccionLecheDetalleResponseDto;
        });
    }

    async findAllByProduccion(
        produccionLecheId: number,
        queryDto: FindProduccionesLecheDetalleQueryDto,
        usuarioId: number
    ): Promise<PaginatedResult<ProduccionLecheDetalleResponseDto>> {
        return super.findAll<ProduccionLecheDetalleResponseDto>(
            queryDto,
            usuarioId,
            `t.produccion_leche_id = $1`,
            [produccionLecheId]
        );
    }
}
