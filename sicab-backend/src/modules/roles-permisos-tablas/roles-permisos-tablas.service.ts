// C:\sistemas\sicab\sicab-backend\src\modules\roles-permisos-tablas\roles-permisos-tablas.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_HISTORICO } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { UpdateRolPermisoTablaDto } from './dto/update-rol-permiso-tabla.dto';
import { RolPermisoTablaResponseDto } from './dto/rol-permiso-tabla-response.dto';
import { FindRolesPermisosTablasQueryDto } from './dto/find-roles-permisos-tablas-query.dto';
import { RolPermisoTabla } from './entities/rol-permiso-tabla.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class RolesPermisosTablasService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'roles_permisos_tablas',
        nombreEntidad: 'Permiso de Tabla',
        campoPK: 'rol_permiso_tabla_id',
        alias: 't',
        responseDto: RolPermisoTablaResponseDto,
        camposBusquedaEnQ: FindRolesPermisosTablasQueryDto.getCamposParaQ(),
        tablasDependientes: FindRolesPermisosTablasQueryDto.getDependencias(),
        joins: [
            {
                table: 'roles',
                alias: 'r',
                onCondition: 'r.rol_id = t.rol_id',
                selectColumns: [
                    'r.rol AS rol_nombre',
                    'r.codigo AS rol_codigo',
                    'r.estado_id AS rol_estado_id'
                ],
                type: 'INNER'
            },
            {
                table: 'tablas',
                alias: 'tb',
                onCondition: 'tb.tabla_id = t.tabla_id',
                selectColumns: [
                    'tb.nombre AS tabla_nombre',
                    'tb.permite_leer AS tabla_permite_leer',
                    'tb.permite_crear AS tabla_permite_crear',
                    'tb.permite_editar AS tabla_permite_editar',
                    'tb.permite_eliminar AS tabla_permite_eliminar',
                    'tb.permite_anular AS tabla_permite_anular',
                    'tb.permite_archivar AS tabla_permite_archivar',
                    'tb.permite_desarchivar AS tabla_permite_desarchivar',
                ],
                type: 'INNER'
            }
        ],
        configuracionFiltros: [
            {
                nombreCampo: 'rol_id',
                nombreColumna: 't.rol_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
            {
                nombreCampo: 'tabla_id',
                nombreColumna: 't.tabla_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'rol_permiso_tabla_id',
            camposPermitidosParaOrdenar: FindRolesPermisosTablasQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindRolesPermisosTablasQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindRolesPermisosTablasQueryDto.getCamposProtegidosConDependencias(),
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

    async update(id: number, dto: UpdateRolPermisoTablaDto, usuarioId: number): Promise<RolPermisoTablaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            if (
                dto.estado_id !== undefined &&
                dto.estado_id !== ESTADO_ACTIVO &&
                dto.estado_id !== ESTADO_HISTORICO
            ) {
                throw new DomainException(
                    `Estado inválido. Solo se permite ${ESTADO_ACTIVO} (ACTIVO) o ${ESTADO_HISTORICO} (HISTÓRICO).`,
                    { httpStatus: HttpStatus.BAD_REQUEST, estadoId: dto.estado_id }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const permisoActual = await manager.findOne(RolPermisoTabla, {
                where: {
                    [this.campoPK]: id,
                    estado_id: In([ESTADO_ACTIVO, ESTADO_HISTORICO])
                },
                lock: { mode: 'pessimistic_write' }
            });

            if (!permisoActual) {
                throw new DomainException(
                    `Permiso de tabla no encontrado.`,
                    { id, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindRolesPermisosTablasQueryDto.getDependencias(),
                FindRolesPermisosTablasQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            // ─────────────────────────────────────────────────────────────
            // MEJORA 1: usar tabla_id NUEVO si viene en el DTO, o el actual
            // ─────────────────────────────────────────────────────────────
            const tablaIdParaValidar = dtoProcesado.tabla_id ?? permisoActual.tabla_id;

            const tablaInfo = await manager.query(
                `SELECT
                    nombre,
                    permite_leer, permite_crear, permite_editar, permite_eliminar,
                    permite_anular, permite_archivar, permite_desarchivar
                FROM tablas
                WHERE tabla_id = $1`,
                [tablaIdParaValidar]
            );

            if (!tablaInfo || tablaInfo.length === 0) {
                throw new DomainException(
                    `Tabla asociada al permiso no encontrada.`,
                    { tablaId: tablaIdParaValidar, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const t = tablaInfo[0];
            const acciones = [
                { campo: 'leer',        permitido: Number(t.permite_leer) === 1,        nombre: 'LEER' },
                { campo: 'crear',       permitido: Number(t.permite_crear) === 1,       nombre: 'CREAR' },
                { campo: 'editar',      permitido: Number(t.permite_editar) === 1,      nombre: 'EDITAR' },
                { campo: 'eliminar',    permitido: Number(t.permite_eliminar) === 1,    nombre: 'ELIMINAR' },
                { campo: 'anular',      permitido: Number(t.permite_anular) === 1,      nombre: 'ANULAR' },
                { campo: 'archivar',    permitido: Number(t.permite_archivar) === 1,    nombre: 'ARCHIVAR' },
                { campo: 'desarchivar', permitido: Number(t.permite_desarchivar) === 1, nombre: 'DESARCHIVAR' },
            ];

            for (const accion of acciones) {
                const valor = (dtoProcesado as any)[accion.campo];
                if (valor === 1 && !accion.permitido) {
                    throw new DomainException(
                        `La tabla "${t.nombre}" no soporta la acción ${accion.nombre}.`,
                        { httpStatus: HttpStatus.BAD_REQUEST, accion: accion.campo, tabla: t.nombre }
                    );
                }
            }

            const validaciones: Promise<any>[] = [];

            // ─────────────────────────────────────────────────────────────
            // MEJORA 2: bloquear cambio a rol comodín (rol_id = 1)
            // ─────────────────────────────────────────────────────────────
            if (dtoProcesado.rol_id !== undefined && dtoProcesado.rol_id !== permisoActual.rol_id) {
                if (Number(dtoProcesado.rol_id) === 1) {
                    throw new DomainException(
                        `No se puede asignar el rol comodín (rol_id = 1) a un permiso.`,
                        { httpStatus: HttpStatus.FORBIDDEN, motivo: 'ROL_COMODIN_PROTEGIDO' }
                    );
                }

                validaciones.push(
                    this.tablaValidador.validarRegistrosActivos('roles', 'rol_id', dtoProcesado.rol_id, undefined, manager)
                );
            }

            // ─────────────────────────────────────────────────────────────
            // MEJORA 3: bloquear cambio a tabla comodín (tabla_id = 1)
            // ─────────────────────────────────────────────────────────────
            if (dtoProcesado.tabla_id !== undefined && dtoProcesado.tabla_id !== permisoActual.tabla_id) {
                if (Number(dtoProcesado.tabla_id) === 1) {
                    throw new DomainException(
                        `No se puede asignar la tabla comodín (tabla_id = 1) a un permiso.`,
                        { httpStatus: HttpStatus.FORBIDDEN, motivo: 'TABLA_COMODIN_PROTEGIDA' }
                    );
                }

                validaciones.push(
                    this.tablaValidador.validarRegistrosActivos('tablas', 'tabla_id', dtoProcesado.tabla_id, undefined, manager)
                );
            }

            if (
                (dtoProcesado.rol_id !== undefined && dtoProcesado.rol_id !== permisoActual.rol_id) ||
                (dtoProcesado.tabla_id !== undefined && dtoProcesado.tabla_id !== permisoActual.tabla_id)
            ) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campos: [
                            { nombre: 'rol_id', valor: dtoProcesado.rol_id ?? permisoActual.rol_id },
                            { nombre: 'tabla_id', valor: dtoProcesado.tabla_id ?? permisoActual.tabla_id }
                        ],
                        idExcluir: id,
                        campoPk: this.campoPK,
                        estadosValidos: [ESTADO_ACTIVO],
                    }, manager)
                );
            }

            if (validaciones.length > 0) {
                await Promise.all(validaciones);
            }

            Object.assign(permisoActual, dtoProcesado);
            permisoActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(permisoActual);
                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el permiso de tabla', 'actualizar');
            }
        });
    }

    async habilitar(id: number, usuarioId: number): Promise<RolPermisoTablaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'editar', manager);

            const permiso = await manager.findOne(RolPermisoTabla, {
                where: {
                    [this.campoPK]: id,
                    estado_id: ESTADO_HISTORICO,
                },
                lock: { mode: 'pessimistic_write' },
            });

            if (!permiso) {
                throw new DomainException(
                    `Permiso no encontrado o ya habilitado.`,
                    { id, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            await this.tablaValidador.validarRegistrosActivos(
                'roles', 'rol_id', permiso.rol_id, undefined, manager
            );
            await this.tablaValidador.validarRegistrosActivos(
                'tablas', 'tabla_id', permiso.tabla_id, undefined, manager
            );

            permiso.estado_id = ESTADO_ACTIVO;
            permiso.usuario_id_actualizacion = usuarioId;
            permiso.fecha_actualizacion = new Date();

            try {
                await manager.save(permiso);
                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en habilitar: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el permiso de tabla', 'actualizar');
            }
        });
    }
}