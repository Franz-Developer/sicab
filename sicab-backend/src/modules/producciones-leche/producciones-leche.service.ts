// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\producciones-leche.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, Estado } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateProduccionLecheDto } from './dto/create-produccion-leche.dto';
import { ProduccionLecheResponseDto } from './dto/produccion-leche-response.dto';
import { FindProduccionesLecheQueryDto } from './dto/find-producciones-leche-query.dto';
import { UpdateProduccionLecheDto } from './dto/update-produccion-leche.dto';
import { ProduccionLeche } from './entities/produccion-leche.entity';
import { ProduccionLecheDetalle } from './entities/produccion-leche-detalle.entity';
import { VacunoValidadorService } from '../../common/validators/vacuno-validador.service';

@Injectable()
export class ProduccionesLecheService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'producciones_leche',
        nombreEntidad: 'ProduccionLeche',
        campoPK: 'produccion_leche_id',
        alias: 't',
        responseDto: ProduccionLecheResponseDto,
        camposBusquedaEnQ: FindProduccionesLecheQueryDto.getCamposParaQ(),
        tablasDependientes: FindProduccionesLecheQueryDto.getDependencias(),
        joins: [
            {
                table: 'sucursales',
                alias: 'suc',
                onCondition: 'suc.sucursal_id = t.sucursal_id',
                selectColumns: [
                    'suc.sucursal AS sucursal_nombre',
                    'suc.codigo AS sucursal_codigo',
                    'suc.empresa_id AS empresa_id'
                ],
                type: 'INNER'
            },
            {
                table: 'empresas',
                alias: 'emp',
                onCondition: 'emp.empresa_id = suc.empresa_id',
                selectColumns: [
                    'emp.empresa AS empresa_nombre',
                    'emp.codigo AS empresa_codigo'
                ],
                type: 'INNER'
            },
            {
                table: 'turnos_ordeno',
                alias: 'tur',
                onCondition: 'tur.turno_ordeno_id = t.turno_ordeno_id',
                selectColumns: [
                    'tur.turno AS turno_nombre',
                    'tur.codigo AS turno_codigo',
                    'tur.hora_inicio AS turno_hora_inicio',
                    'tur.hora_fin AS turno_hora_fin'
                ],
                type: 'INNER'
            }
        ],
        configuracionFiltros: [
            { nombreCampo: 'fecha_produccion', nombreColumna: 'fecha_produccion', tipoDatoFiltro: 'date', operador: 'eq' },
            { nombreCampo: 'sucursal_id', nombreColumna: 'sucursal_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'turno_ordeno_id', nombreColumna: 'turno_ordeno_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'fecha_produccion_desde', nombreColumna: 'fecha_produccion', tipoDatoFiltro: 'date', operador: 'gte' },
            { nombreCampo: 'fecha_produccion_hasta', nombreColumna: 'fecha_produccion', tipoDatoFiltro: 'date', operador: 'lte' },
        ],
        camposFiltroEspecial: [
            {
                nombreCampo: 'empresa_id',
                handler: (value, _queryDto, _alias, paramIndexRef, params) => {
                    params.push(value);
                    return `suc.empresa_id = $${paramIndexRef.current++}`;
                }
            }
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'fecha_produccion',
            camposPermitidosParaOrdenar: FindProduccionesLecheQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindProduccionesLecheQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindProduccionesLecheQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly vacunoValidador: VacunoValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    private validarReglasProduccion(data: Record<string, any>): void {
        const totalLitros = data['total_litros'] != null ? Number(data['total_litros']) : null;
        const totalDescartado = data['total_descartado'] != null ? Number(data['total_descartado']) : 0;
        const totalNeto = data['total_neto'] != null ? Number(data['total_neto']) : null;

        if (totalDescartado > (totalLitros ?? 0)) {
            throw new DomainException(
                'El total_descartado no puede ser mayor al total_litros.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        if (totalLitros != null && totalNeto != null) {
            const esperado = Number((totalLitros - totalDescartado).toFixed(2));
            const diff = Math.abs(esperado - totalNeto);
            if (diff > 0.01) {
                throw new DomainException(
                    `El total_neto debe ser igual a total_litros - total_descartado (${esperado.toFixed(2)}), pero se recibió ${totalNeto.toFixed(2)}.`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }
    }

    private async validarFksCabecera(sucursalId: number, turnoId: number, manager: EntityManager): Promise<void> {
        const [suc, tur] = await Promise.all([
            manager.query(`SELECT 1 FROM sucursales WHERE sucursal_id = $1 AND estado_id = $2 LIMIT 1`, [sucursalId, ESTADO_ACTIVO]),
            manager.query(`SELECT 1 FROM turnos_ordeno WHERE turno_ordeno_id = $1 AND estado_id = $2 LIMIT 1`, [turnoId, ESTADO_ACTIVO]),
        ]);

        if (!suc?.[0]) throw new DomainException(`La sucursal con ID ${sucursalId} no existe o no está activa.`, { httpStatus: HttpStatus.BAD_REQUEST });
        if (!tur?.[0]) throw new DomainException(`El turno de ordeño con ID ${turnoId} no existe o no está activo.`, { httpStatus: HttpStatus.BAD_REQUEST });
    }

    private calcularTotalNeto(totalLitros: number, totalDescartado: number, totalNetoRecibido?: number | null): number {
        if (totalNetoRecibido != null) return Number(totalNetoRecibido);
        return Number((Number(totalLitros) - Number(totalDescartado ?? 0)).toFixed(2));
    }

    async create(dto: CreateProduccionLecheDto, usuarioId: number): Promise<ProduccionLecheResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, 'producciones_leche', 'crear', manager);
            await this.tablaValidador.validarPermisoTabla(usuarioId, 'producciones_leche_detalle', 'crear', manager);

            await this.validarFksCabecera(dto.sucursal_id, dto.turno_ordeno_id, manager);
            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const produccionExistente = await manager.findOne(ProduccionLeche, {
                where: {
                    sucursal_id: dto.sucursal_id,
                    turno_ordeno_id: dto.turno_ordeno_id,
                    fecha_produccion: dto.fecha_produccion as any,
                    estado_id: ESTADO_ACTIVO
                },
                lock: { mode: 'pessimistic_write' }
            });

            if (produccionExistente) {
                const fechaCierre = new Date();

                await manager.createQueryBuilder()
                    .update(ProduccionLecheDetalle)
                    .set({
                        estado_id: Estado.HISTORICO,
                        usuario_id_actualizacion: usuarioId,
                        fecha_actualizacion: fechaCierre,
                    })
                    .where('produccion_leche_id = :id AND estado_id = :estadoActivo', {
                        id: produccionExistente.produccion_leche_id,
                        estadoActivo: ESTADO_ACTIVO,
                    })
                    .execute();

                produccionExistente.estado_id = Estado.HISTORICO;
                produccionExistente.usuario_id_actualizacion = usuarioId;
                produccionExistente.fecha_actualizacion = fechaCierre;
                await manager.save(produccionExistente);
            }

            const vacunosIds = dto.detalles.map(d => d.vacuno_id);
            const duplicados = vacunosIds.filter((id, i) => vacunosIds.indexOf(id) !== i);
            if (duplicados.length > 0) {
                const unicos = [...new Set(duplicados)];
                throw new DomainException(
                    `Hay vacunos duplicados en el detalle: ${unicos.join(', ')}. Cada vacuno solo puede registrarse una vez por producción.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            for (const det of dto.detalles) {
                await this.vacunoValidador.validarProductorLeche(det.vacuno_id, dto.sucursal_id, manager);
            }

            const totalLitros = Number(dto.detalles.reduce((s, d) => s + Number(d.litros), 0).toFixed(2));
            const totalDescartado = Number(dto.total_descartado ?? 0);
            const totalNeto = this.calcularTotalNeto(totalLitros, totalDescartado, null);

            this.validarReglasProduccion({
                total_litros: totalLitros,
                total_descartado: totalDescartado,
                total_neto: totalNeto,
            });

            try {
                const cabeceraGuardada = await manager.save(ProduccionLeche, {
                    sucursal_id: dto.sucursal_id,
                    turno_ordeno_id: dto.turno_ordeno_id,
                    fecha_produccion: dto.fecha_produccion as any,
                    total_litros: totalLitros,
                    total_descartado: totalDescartado,
                    total_neto: totalNeto,
                    observaciones: dto.observaciones ?? null,
                    usuario_id_registro: Number(usuarioId),
                });

                const detallesAGuardar = dto.detalles.map(det => ({
                    produccion_leche_id: cabeceraGuardada.produccion_leche_id,
                    vacuno_id: det.vacuno_id,
                    litros: det.litros,
                    turno_ordeno_id: cabeceraGuardada.turno_ordeno_id,
                    observaciones: det.observaciones ?? null,
                    usuario_id_registro: Number(usuarioId),
                }));
                await manager.save(ProduccionLecheDetalle, detallesAGuardar);

                return this.findOne<ProduccionLecheResponseDto>(cabeceraGuardada.produccion_leche_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la producción de leche', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateProduccionLecheDto, usuarioId: number): Promise<ProduccionLecheResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException('No se enviaron campos para actualizar.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const produccionActual = await manager.findOne(ProduccionLeche, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!produccionActual) {
                throw new DomainException('Producción de leche no encontrada o ya es histórica.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const totalLitrosFinal = produccionActual.total_litros;
            const totalDescartadoFinal = dto.total_descartado ?? produccionActual.total_descartado;
            const totalNetoFinal = this.calcularTotalNeto(Number(totalLitrosFinal), Number(totalDescartadoFinal), null);

            this.validarReglasProduccion({
                total_litros: totalLitrosFinal,
                total_descartado: totalDescartadoFinal,
                total_neto: totalNetoFinal,
            });

            manager.merge(ProduccionLeche, produccionActual, dto);
            produccionActual.total_neto = totalNetoFinal;
            produccionActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(produccionActual);
                return this.findOne<ProduccionLecheResponseDto>(saved.produccion_leche_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - producciones-leche ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la producción de leche', 'actualizar');
            }
        });
    }

    override async remove<T = any>(id: number, usuarioIdBaja: number, tablasDependientes?: string[]): Promise<T> {
        return runInTransaction(this.dataSource, async (manager) => {

            await this.tablaValidador.validarPreDelete(
                this.nombreTabla,
                id,
                (tablasDependientes || this.config.tablasDependientes) as any[],
                this.campoPK,
                usuarioIdBaja
            );

            const produccion = await manager.findOne(ProduccionLeche, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!produccion) {
                throw new DomainException('La producción de leche no existe o ya fue eliminada.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const fechaBaja = new Date();

            await manager.createQueryBuilder()
                .update(ProduccionLecheDetalle)
                .set({
                    estado_id: Estado.BORRADO,
                    usuario_id_baja: usuarioIdBaja,
                    fecha_baja: fechaBaja,
                    usuario_id_actualizacion: null,
                    fecha_actualizacion: null,
                })
                .where('produccion_leche_id = :id AND estado_id IN (:...estados)', {
                    id,
                    estados: [Estado.ACTIVO, Estado.HISTORICO],
                })
                .execute();

            produccion.estado_id = Estado.BORRADO;
            produccion.usuario_id_baja = usuarioIdBaja;
            produccion.fecha_baja = fechaBaja;
            await manager.save(produccion);

            return this.findOne<T>(id, usuarioIdBaja, manager);
        });
    }
}
