// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\vacunos-pesajes.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO, EstadoVacuno } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateVacunoPesajeDto } from './dto/create-vacuno-pesaje.dto';
import { VacunoPesajeResponseDto } from './dto/vacuno-pesaje-response.dto';
import { FindVacunosPesajesQueryDto } from './dto/find-vacunos-pesajes-query.dto';
import { UpdateVacunoPesajeDto } from './dto/update-vacuno-pesaje.dto';
import { VacunoPesaje } from './entities/vacuno-pesaje.entity';

@Injectable()
export class VacunosPesajesService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'vacunos_pesajes',
        nombreEntidad: 'Pesaje',
        campoPK: 'pesaje_id',
        alias: 't',
        responseDto: VacunoPesajeResponseDto,
        camposBusquedaEnQ: FindVacunosPesajesQueryDto.getCamposParaQ(),
        tablasDependientes: FindVacunosPesajesQueryDto.getDependencias(),
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
            { nombreCampo: 'fecha_pesaje_desde', nombreColumna: 'fecha_pesaje', tipoDatoFiltro: 'date', operador: 'gte' },
            { nombreCampo: 'fecha_pesaje_hasta', nombreColumna: 'fecha_pesaje', tipoDatoFiltro: 'date', operador: 'lte' },
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
            campoOrdenPorDefecto: 'pesaje_id',
            camposPermitidosParaOrdenar: FindVacunosPesajesQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindVacunosPesajesQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindVacunosPesajesQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly unicidadValidador: UnicidadValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    async create(dto: CreateVacunoPesajeDto, usuarioId: number): Promise<VacunoPesajeResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            const vacuno = await manager.query(
                `SELECT estado_vacuno_id FROM vacunos WHERE vacuno_id = $1 AND estado_id = $2 LIMIT 1`,
                [dto.vacuno_id, ESTADO_ACTIVO]
            );
            if (!vacuno?.[0]) {
                throw new DomainException('El vacuno no existe o no está activo.', { httpStatus: HttpStatus.NOT_FOUND });
            }
            if ([EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO].includes(Number(vacuno[0].estado_vacuno_id))) {
                throw new DomainException('No se puede registrar un pesaje a un vacuno VENDIDO o MUERTO.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [
                    { nombre: 'vacuno_id', valor: dto.vacuno_id },
                    { nombre: 'fecha_pesaje', valor: dto.fecha_pesaje }
                ],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe un pesaje registrado para este vacuno en la fecha indicada.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const pesaje = manager.create(VacunoPesaje, {
                ...dto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(pesaje);

                await manager.query(
                    `UPDATE vacunos
                     SET peso_actual = $1, usuario_id_actualizacion = $2, fecha_actualizacion = CURRENT_TIMESTAMP
                     WHERE vacuno_id = $3`,
                    [dto.peso, usuarioId, dto.vacuno_id]
                );

                return this.findOne<VacunoPesajeResponseDto>(saved.pesaje_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el pesaje', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateVacunoPesajeDto, usuarioId: number): Promise<VacunoPesajeResponseDto> {
        const result = await runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException('No se enviaron campos para actualizar.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const pesajeActual = await manager.findOne(VacunoPesaje, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!pesajeActual) {
                throw new DomainException('Pesaje no encontrado.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla, id, dto, FindVacunosPesajesQueryDto.getDependencias(),
                FindVacunosPesajesQueryDto.getCamposProtegidosConDependencias(), this.campoPK, usuarioId, manager
            );

            const vacunoId = dtoProcesado.vacuno_id ?? pesajeActual.vacuno_id;
            const fechaPesaje = dtoProcesado.fecha_pesaje ?? pesajeActual.fecha_pesaje;

            if (dtoProcesado.vacuno_id != null || dtoProcesado.fecha_pesaje != null) {
                await this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [
                        { nombre: 'vacuno_id', valor: vacunoId },
                        { nombre: 'fecha_pesaje', valor: fechaPesaje }
                    ],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe un pesaje registrado para este vacuno en la fecha indicada.`
                }, manager);
            }

            manager.merge(VacunoPesaje, pesajeActual, dtoProcesado);
            pesajeActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(pesajeActual);

                if (dtoProcesado.peso !== undefined) {
                    await manager.query(
                        `UPDATE vacunos
                         SET peso_actual = $1, usuario_id_actualizacion = $2, fecha_actualizacion = CURRENT_TIMESTAMP
                         WHERE vacuno_id = $3`,
                        [pesajeActual.peso, usuarioId, pesajeActual.vacuno_id]
                    );
                }

                return this.findOne<VacunoPesajeResponseDto>(saved.pesaje_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - vacunos-pesajes ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el pesaje', 'actualizar');
            }
        });

        return result;
    }
}
