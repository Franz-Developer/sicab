// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\vacunos-pesajes.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADO_BORRADO, EstadoVacuno } from '../../common/constants/estados.constant';
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
            { nombreCampo: 'estado_id', nombreColumna: 'estado_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'vacuno_id', nombreColumna: 'vacuno_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'fecha_pesaje', nombreColumna: 'fecha_pesaje', tipoDatoFiltro: 'date', operador: 'eq' },
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

    private async sincronizarPesoActual(manager: EntityManager, vacunoId: number, usuarioId: number): Promise<void> {
        await manager.query(
            `UPDATE vacunos v
             SET peso_actual = (
                 SELECT p.peso
                 FROM vacunos_pesajes p
                 WHERE p.vacuno_id = v.vacuno_id
                   AND p.estado_id = $1
                 ORDER BY p.fecha_pesaje DESC
                 LIMIT 1
             ),
             usuario_id_actualizacion = $2,
             fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE v.vacuno_id = $3`,
            [ESTADO_ACTIVO, usuarioId, vacunoId]
        );
    }

    private async validarFechasPesaje(
        manager: EntityManager,
        vacunoId: number,
        fechaPesaje: string,
        idExcluir?: number
    ): Promise<void> {
        const vacuno = await manager.query(
            `SELECT fecha_ingreso, fecha_nacimiento FROM vacunos WHERE vacuno_id = $1 LIMIT 1`,
            [vacunoId]
        );

        if (vacuno?.[0]?.fecha_nacimiento) {
            const fechaNacimiento = new Date(vacuno[0].fecha_nacimiento).toISOString().split('T')[0]!;
            if (fechaPesaje < fechaNacimiento) {
                throw new DomainException(
                    `La fecha de pesaje (${fechaPesaje}) no puede ser menor a la fecha de nacimiento del vacuno (${fechaNacimiento}).`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }

        if (vacuno?.[0]?.fecha_ingreso) {
            const fechaIngreso = new Date(vacuno[0].fecha_ingreso).toISOString().split('T')[0]!;
            if (fechaPesaje < fechaIngreso) {
                throw new DomainException(
                    `La fecha de pesaje (${fechaPesaje}) no puede ser menor a la fecha de ingreso del vacuno (${fechaIngreso}).`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }

        let queryUltimoPesaje = `
            SELECT fecha_pesaje
            FROM vacunos_pesajes
            WHERE vacuno_id = $1
            AND estado_id IN (${ESTADOS_VIVOS.join(',')})
        `;
        const params: any[] = [vacunoId];

        if (idExcluir) {
            queryUltimoPesaje += ` AND pesaje_id <> $2`;
            params.push(idExcluir);
        }

        queryUltimoPesaje += ` ORDER BY fecha_pesaje DESC LIMIT 1`;

        const ultimoPesaje = await manager.query(queryUltimoPesaje, params);

        if (ultimoPesaje?.[0]?.fecha_pesaje) {
            const fechaUltimo = new Date(ultimoPesaje[0].fecha_pesaje).toISOString().split('T')[0]!;
            if (fechaPesaje < fechaUltimo) {
                throw new DomainException(
                    `La fecha de pesaje (${fechaPesaje}) no puede ser menor a la última fecha registrada (${fechaUltimo}).`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }
    }

    async create(dto: CreateVacunoPesajeDto, usuarioId: number): Promise<VacunoPesajeResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            const vacuno = await manager.query(
                `SELECT estado_vacuno_id, peso_nacimiento FROM vacunos WHERE vacuno_id = $1 AND estado_id = $2 LIMIT 1`,
                [dto.vacuno_id, ESTADO_ACTIVO]
            );
            if (!vacuno?.[0]) {
                throw new DomainException('El vacuno no existe o no está activo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const estadosInvalidos = [
                EstadoVacuno.FAENADO,
                EstadoVacuno.VENDIDO,
                EstadoVacuno.MUERTO
            ];
            if (estadosInvalidos.includes(Number(vacuno[0].estado_vacuno_id))) {
                throw new DomainException(
                    'No se puede registrar un pesaje a un vacuno que ya está FAENADO, VENDIDO o MUERTO.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            const pesoNacimiento = vacuno[0].peso_nacimiento;
            if (pesoNacimiento != null && Number(dto.peso) < Number(pesoNacimiento)) {
                throw new DomainException(
                    `El peso ingresado (${dto.peso} kg) no puede ser menor al peso de nacimiento del vacuno (${pesoNacimiento} kg).`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.validarFechasPesaje(manager, dto.vacuno_id, dto.fecha_pesaje);

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
                estado_id: ESTADO_ACTIVO,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);

                const saved = await manager.save(pesaje);

                await manager.query(
                    `UPDATE vacunos_pesajes
                     SET estado_id = $1,
                         usuario_id_actualizacion = $2,
                         fecha_actualizacion = CURRENT_TIMESTAMP
                     WHERE vacuno_id = $3
                       AND estado_id = $4
                       AND pesaje_id <> $5`,
                    [ESTADO_HISTORICO, usuarioId, dto.vacuno_id, ESTADO_ACTIVO, saved.pesaje_id]
                );

                await this.sincronizarPesoActual(manager, dto.vacuno_id, usuarioId);

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
                throw new DomainException('Pesaje no encontrado o no está activo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla, id, dto, FindVacunosPesajesQueryDto.getDependencias(),
                FindVacunosPesajesQueryDto.getCamposProtegidosConDependencias(), this.campoPK, usuarioId, manager
            );

            const vacunoId = pesajeActual.vacuno_id;
            const fechaPesaje = dtoProcesado.fecha_pesaje ?? pesajeActual.fecha_pesaje;

            if (dtoProcesado.peso !== undefined) {
                const infoVacuno = await manager.query(
                    `SELECT peso_nacimiento FROM vacunos WHERE vacuno_id = $1 LIMIT 1`,
                    [vacunoId]
                );
                const pesoNacimiento = infoVacuno?.[0]?.peso_nacimiento;

                if (pesoNacimiento != null && Number(dtoProcesado.peso) < Number(pesoNacimiento)) {
                    throw new DomainException(
                        `El peso ingresado (${dtoProcesado.peso} kg) no puede ser menor al peso de nacimiento del vacuno (${pesoNacimiento} kg).`,
                        { httpStatus: HttpStatus.BAD_REQUEST }
                    );
                }
            }

            if (dtoProcesado.fecha_pesaje != null) {
                await this.validarFechasPesaje(manager, vacunoId, String(fechaPesaje), id);

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

                if (dtoProcesado.peso !== undefined || dtoProcesado.fecha_pesaje !== undefined) {
                    await this.sincronizarPesoActual(manager, vacunoId, usuarioId);
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

    override async remove<T>(id: number, usuarioId: number): Promise<T> {
        return runInTransaction(this.dataSource, async (manager) => {
            const pesaje = await manager.findOne(VacunoPesaje, {
                where: { pesaje_id: id },
                lock: { mode: 'pessimistic_write' }
            });

            if (!pesaje || pesaje.estado_id === ESTADO_BORRADO) {
                throw new DomainException('Pesaje no encontrado o ya está borrado.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const eraActivo = pesaje.estado_id === ESTADO_ACTIVO;

            await manager.query(
                `UPDATE vacunos_pesajes
                 SET estado_id = $1,
                     usuario_id_baja = $2,
                     fecha_baja = CURRENT_TIMESTAMP
                 WHERE pesaje_id = $3`,
                [ESTADO_BORRADO, usuarioId, id]
            );

            if (eraActivo) {
                const ultimoHistorico = await manager.query(
                    `SELECT pesaje_id
                     FROM vacunos_pesajes
                     WHERE vacuno_id = $1
                       AND estado_id = $2
                     ORDER BY fecha_pesaje DESC
                     LIMIT 1`,
                    [pesaje.vacuno_id, ESTADO_HISTORICO]
                );

                if (ultimoHistorico?.[0]) {
                    await manager.query(
                        `UPDATE vacunos_pesajes
                         SET estado_id = $1,
                             usuario_id_actualizacion = NULL,
                             fecha_actualizacion = NULL
                         WHERE pesaje_id = $2`,
                        [ESTADO_ACTIVO, ultimoHistorico[0].pesaje_id]
                    );
                }
            }

            await this.sincronizarPesoActual(manager, pesaje.vacuno_id, usuarioId);

            return this.findOne<T>(id, usuarioId, manager);
        });
    }
}
