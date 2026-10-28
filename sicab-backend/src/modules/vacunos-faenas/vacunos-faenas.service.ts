// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\vacunos-faenas.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADO_ACTIVO, Estado, EstadoVacuno } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { CreateVacunoFaenaDto } from './dto/create-vacuno-faena.dto';
import { UpdateVacunoFaenaDto } from './dto/update-vacuno-faena.dto';
import { VacunoFaenaResponseDto } from './dto/vacuno-faena-response.dto';
import { FindVacunosFaenasQueryDto } from './dto/find-vacunos-faenas-query.dto';
import { VacunoFaena } from './entities/vacuno-faena.entity';
import { Vacuno } from '../vacunos/entities/vacuno.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class VacunosFaenasService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'vacunos_faenas',
        nombreEntidad: 'Faena de Vacuno',
        campoPK: 'faena_id',
        alias: 't',
        responseDto: VacunoFaenaResponseDto,
        camposBusquedaEnQ: FindVacunosFaenasQueryDto.getCamposParaQ(),
        tablasDependientes: FindVacunosFaenasQueryDto.getDependencias(),
        joins: [
            {
                table: 'vacunos',
                alias: 'v',
                onCondition: 'v.vacuno_id = t.vacuno_id',
                selectColumns: [
                    'v.arete AS vacuno_arete',
                    'v.nombre AS vacuno_nombre',
                    'v.sucursal_id'
                ],
                type: 'INNER'
            },
            {
                table: 'sucursales',
                alias: 'suc',
                onCondition: 'suc.sucursal_id = v.sucursal_id',
                selectColumns: [
                    'suc.sucursal AS sucursal_nombre',
                    'suc.codigo AS sucursal_codigo',
                    'suc.empresa_id'
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
            }
        ],
        configuracionFiltros: [
            { nombreCampo: 'vacuno_id', nombreColumna: 'vacuno_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'fecha_faena_desde', nombreColumna: 'fecha_faena', tipoDatoFiltro: 'date', operador: 'gte' },
            { nombreCampo: 'fecha_faena_hasta', nombreColumna: 'fecha_faena', tipoDatoFiltro: 'date', operador: 'lte' },
        ],
        camposFiltroEspecial: [
            {
                nombreCampo: 'sucursal_id',
                handler: (value, _queryDto, _alias, paramIndexRef, params) => {
                    params.push(value);
                    return `v.sucursal_id = $${paramIndexRef.current++}`;
                }
            },
            {
                nombreCampo: 'empresa_id',
                handler: (value, _queryDto, _alias, paramIndexRef, params) => {
                    params.push(value);
                    return `suc.empresa_id = $${paramIndexRef.current++}`;
                }
            }
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'fecha_faena',
            camposPermitidosParaOrdenar: FindVacunosFaenasQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindVacunosFaenasQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindVacunosFaenasQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    async create(dto: CreateVacunoFaenaDto, usuarioId: number): Promise<VacunoFaenaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            // 1. Validar que el vacuno exista y esté PARA_FAENA (R.4)
            const vacuno = await manager.findOne(Vacuno, {
                where: { vacuno_id: dto.vacuno_id, estado_id: ESTADO_ACTIVO }
            });

            if (!vacuno) {
                throw new DomainException('El vacuno no existe o está inactivo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            if (Number(vacuno.estado_vacuno_id) !== EstadoVacuno.PARA_FAENA) {
                throw new DomainException('El vacuno debe estar en estado PARA_FAENA para registrar su faena.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            // 2. Validar que no exista una faena previa activa o histórica (R.1)
            const faenaExistente = await manager.findOne(VacunoFaena, {
                where: { vacuno_id: dto.vacuno_id, estado_id: Estado.HISTORICO }
            });
            if (faenaExistente) {
                throw new DomainException('Este vacuno ya tiene una faena registrada.', { httpStatus: HttpStatus.CONFLICT });
            }

            // 3. Calcular rendimiento SIEMPRE en el backend (R.3)
            const rendimientoCalculado = Number(((dto.peso_canal_caliente / dto.peso_vivo_faena) * 100).toFixed(2));

            // 4. Crear el registro de faena
            const nuevaFaena = manager.create(VacunoFaena, {
                ...dto,
                rendimiento_canal: rendimientoCalculado,
                usuario_id_registro: Number(usuarioId),
            });
            const saved = await manager.save(nuevaFaena);

            // 5. Actualizar el estado del vacuno a FAENADO + HISTÓRICO (R.4)
            vacuno.estado_vacuno_id = EstadoVacuno.FAENADO;
            vacuno.estado_id = Estado.HISTORICO;
            vacuno.usuario_id_actualizacion = usuarioId;
            vacuno.fecha_actualizacion = new Date();
            vacuno.fecha_salida = new Date(dto.fecha_faena);
            vacuno.motivo_salida = 'FAENA';
            vacuno.peso_salida = dto.peso_vivo_faena;
            vacuno.precio_venta = 0;
            vacuno.causa_muerte = null;
            await manager.save(vacuno);

            // 6. Pasar la faena a histórico (R.2)
            saved.estado_id = Estado.HISTORICO;
            saved.usuario_id_actualizacion = usuarioId;
            saved.fecha_actualizacion = new Date();
            await manager.save(saved);

            return this.findOne<VacunoFaenaResponseDto>(saved.faena_id, usuarioId, manager);
        });
    }

    async update(id: number, dto: UpdateVacunoFaenaDto, usuarioId: number): Promise<VacunoFaenaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            // Validar permisos y campos protegidos
            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            // Buscar la faena (que siempre estará en estado HISTORICO, ya que las faenas no se pueden reactivar)
            const faenaActual = await manager.findOne(VacunoFaena, {
                where: { [this.campoPK]: id },
                lock: { mode: 'pessimistic_write' }
            });

            if (!faenaActual) {
                throw new DomainException('La faena no existe.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            if (faenaActual.estado_id === Estado.BORRADO) {
                throw new DomainException('No se puede modificar una faena eliminada.', { httpStatus: HttpStatus.CONFLICT });
            }

            // Recalcular rendimiento si se actualizan los pesos
            const pesoVivo = dto.peso_vivo_faena ?? Number(faenaActual.peso_vivo_faena);
            const pesoCaliente = dto.peso_canal_caliente ?? Number(faenaActual.peso_canal_caliente);

            if (dto.peso_vivo_faena !== undefined || dto.peso_canal_caliente !== undefined) {
                faenaActual.rendimiento_canal = Number(((pesoCaliente / pesoVivo) * 100).toFixed(2));
            }

            // Actualizar campos permitidos
            if (dto.peso_vivo_faena !== undefined) faenaActual.peso_vivo_faena = dto.peso_vivo_faena;
            if (dto.peso_canal_caliente !== undefined) faenaActual.peso_canal_caliente = dto.peso_canal_caliente;
            if (dto.peso_canal_fria !== undefined) faenaActual.peso_canal_fria = dto.peso_canal_fria;
            if (dto.matadero !== undefined) faenaActual.matadero = dto.matadero;
            if (dto.numero_guia !== undefined) faenaActual.numero_guia = dto.numero_guia;
            if (dto.observaciones !== undefined) faenaActual.observaciones = dto.observaciones;

            faenaActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(faenaActual);
                return this.findOne<VacunoFaenaResponseDto>(saved.faena_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - vacunos-faenas ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la faena', 'actualizar');
            }
        });
    }
}
