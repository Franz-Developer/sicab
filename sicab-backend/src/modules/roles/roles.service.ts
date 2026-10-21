// C:\sistemas\sicab\sicab-backend\src\modules\roles\roles.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADOS_VIVOS } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { RolResponseDto } from './dto/rol-response.dto';
import { CreateRolDto } from './dto/create-rol.dto';
import { FindRolesQueryDto } from './dto/find-roles-query.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from './entities/rol.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class RolesService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'roles',
        nombreEntidad: 'Rol',
        campoPK: 'rol_id',
        alias: 't',
        responseDto: RolResponseDto,
        camposBusquedaEnQ: FindRolesQueryDto.getCamposParaQ(),
        tablasDependientes: FindRolesQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [
            {
                nombreCampo: 'rol_id',
                nombreColumna: 'rol_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'rol_id',
            camposPermitidosParaOrdenar: FindRolesQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindRolesQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindRolesQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource()
        dataSource: DataSource,
        private readonly unicidadValidador: UnicidadValidadorService,
        tablaValidador: TablaValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string {
        return this.config.nombreTabla;
    }

    private get campoPK(): string {
        return this.config.campoPK;
    }

    async create(dto: CreateRolDto, usuarioId: number): Promise<RolResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await Promise.all([
                this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'codigo', valor: dto.codigo }],
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS]
                }, manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'rol', valor: dto.rol }],
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS]
                }, manager),
                this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager)
            ]);

            const rol = manager.create(Rol, {
                ...dto,
                estado_id: ESTADO_ACTIVO,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(rol);

                await this.autogenerarPermisosDeRol(saved.rol_id, Number(usuarioId), manager);
                await this.autogenerarMenusDeRol(saved.rol_id, Number(usuarioId), manager);

                return this.findOne<RolResponseDto>(saved.rol_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el rol', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateRolDto, usuarioId: number): Promise<RolResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const rolActual = await manager.findOne(Rol, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!rolActual) {
                throw new DomainException(
                    `Rol no encontrado.`,
                    { id, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindRolesQueryDto.getDependencias(),
                FindRolesQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            const validaciones: Promise<any>[] = [];

            if (dtoProcesado.codigo && dtoProcesado.codigo !== rolActual.codigo) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campos: [{ nombre: 'codigo', valor: dtoProcesado.codigo }],
                        idExcluir: id,
                        campoPk: this.campoPK,
                        estadosValidos: [...ESTADOS_VIVOS]
                    }, manager)
                );
            }

            if (dtoProcesado.rol && dtoProcesado.rol !== rolActual.rol) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campos: [{ nombre: 'rol', valor: dtoProcesado.rol }],
                        idExcluir: id,
                        campoPk: this.campoPK,
                        estadosValidos: [...ESTADOS_VIVOS]
                    }, manager)
                );
            }

            if (validaciones.length > 0) {
                await Promise.all(validaciones);
            }

            Object.assign(rolActual, dtoProcesado);
            rolActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(rolActual);
                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el rol', 'actualizar');
            }
        });
    }

    private async autogenerarPermisosDeRol(
        rolId: number,
        usuarioId: number,
        manager: EntityManager
    ): Promise<void> {
        const TABLAS_LECTURA_OBLIGATORIA = [
            'tablas',
            'constantes',
        ];

        const insertTablasQuery = `
            INSERT INTO roles_permisos_tablas (
                rol_id, tabla_id,
                leer, crear, editar, eliminar, anular, archivar, desarchivar,
                estado_id,
                usuario_id_registro,
                usuario_id_actualizacion,
                fecha_actualizacion
            )
            SELECT
                $1, t.tabla_id,
                CASE WHEN t.nombre = ANY($5::text[]) THEN 1 ELSE 0 END,
                0, 0, 0, 0, 0, 0,
                $2,
                $3,
                NULL,
                NULL
            FROM tablas t
            WHERE t.estado_id = $4
            AND t.tabla_id > 1
            RETURNING rol_permiso_tabla_id
        `;

        const result = await manager.query(insertTablasQuery, [
            rolId,
            ESTADO_ACTIVO,
            usuarioId,
            ESTADO_ACTIVO,
            TABLAS_LECTURA_OBLIGATORIA,
        ]);

        const permisosCreados: any[] = Array.isArray(result)
            ? result
            : (result?.rows ?? []);

        this.logger.log(
            `Autogeneración: ${permisosCreados.length} permisos de tabla (ACTIVO) creados para el rol ${rolId}.`
        );

        if (permisosCreados.length === 0) {
            return;
        }
    }

    private async autogenerarMenusDeRol(
        rolId: number,
        usuarioId: number,
        manager: EntityManager
    ): Promise<void> {
        const insertMenusQuery = `
            INSERT INTO roles_menus (
                rol_id,
                menu_id,
                estado_id,
                usuario_id_registro,
                usuario_id_actualizacion,
                fecha_actualizacion
            )
            SELECT
                $1,
                m.menu_id,
                $2,
                $3,
                NULL,
                NULL
            FROM menus m
            WHERE m.estado_id = $4
            AND m.menu_id > 1
            RETURNING rol_menu_id
        `;

        const result = await manager.query(insertMenusQuery, [
            rolId,
            ESTADO_ACTIVO,
            usuarioId,
            ESTADO_ACTIVO,
        ]);

        const menusCreados: any[] = Array.isArray(result)
            ? result
            : (result?.rows ?? []);

        this.logger.log(
            `Autogeneración: ${menusCreados.length} menús (ACTIVO) creados para el rol ${rolId}.`
        );
    }
}
