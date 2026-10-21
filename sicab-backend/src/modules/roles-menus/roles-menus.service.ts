// C:\sistemas\sicab\sicab-backend\src\modules\roles-menus\roles-menus.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADOS_VIVOS, ESTADO_METADATA } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { CreateRolMenuDto } from './dto/create-rol-menu.dto';
import { RolMenuResponseDto } from './dto/rol-menu-response.dto';
import { FindRolesMenusQueryDto } from './dto/find-roles-menus-query.dto';
import { UpdateRolMenuDto } from './dto/update-rol-menu.dto';
import { RolMenu } from './entities/rol-menu.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class RolesMenusService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'roles_menus',
        nombreEntidad: 'Asignación de Rol a Menú',
        campoPK: 'rol_menu_id',
        alias: 't',
        responseDto: RolMenuResponseDto,
        camposBusquedaEnQ: FindRolesMenusQueryDto.getCamposParaQ(),
        tablasDependientes: [],
        joins: [
            {
                table: 'roles',
                alias: 'r',
                onCondition: 'r.rol_id = t.rol_id',
                selectColumns: [
                    'r.rol AS rol_nombre',
                    'r.codigo AS rol_codigo'
                ],
                type: 'INNER'
            },
            {
                table: 'menus',
                alias: 'm',
                onCondition: 'm.menu_id = t.menu_id',
                selectColumns: [
                    'm.titulo AS menu_titulo',
                    'm.url AS menu_url',
                    'm.menu_padre_id AS menu_padre_id'
                ],
                type: 'INNER'
            },
            {
                table: 'menus',
                alias: 'mp',
                onCondition: 'mp.menu_id = m.menu_padre_id',
                selectColumns: [
                    'mp.titulo AS menu_padre_titulo'
                ],
                type: 'LEFT'
            }
        ],
        configuracionFiltros: [
            {
                nombreCampo: 'rol_id',
                nombreColumna: 'rol_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
            {
                nombreCampo: 'menu_id',
                nombreColumna: 'menu_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            }
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'rol_menu_id',
            camposPermitidosParaOrdenar: FindRolesMenusQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindRolesMenusQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindRolesMenusQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource()
        dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly unicidadValidador: UnicidadValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string {
        return this.config.nombreTabla;
    }

    private get campoPK(): string {
        return this.config.campoPK;
    }

    private async obtenerMenuIdsAfectados(
        menuId: number,
        estadoId: number,
        manager: EntityManager,
    ): Promise<number[]> {
        // 1. Descendientes (siempre, en ambos sentidos)
        const descendientesQuery = `
            WITH RECURSIVE descendientes AS (
                SELECT menu_id FROM menus WHERE menu_id = $1
                UNION ALL
                SELECT m.menu_id
                FROM menus m
                INNER JOIN descendientes d ON m.menu_padre_id = d.menu_id
                WHERE m.estado_id = 1000
            )
            SELECT menu_id FROM descendientes
        `;
        const descendientesRows = await manager.query(descendientesQuery, [menuId]);
        const ids = new Set<number>(
            (Array.isArray(descendientesRows) ? descendientesRows : descendientesRows?.rows ?? [])
                .map((r: any) => Number(r.menu_id))
        );

        // 2. Ancestros SOLO si es activación
        if (estadoId === ESTADO_ACTIVO) {
            const ancestrosQuery = `
                WITH RECURSIVE ancestros AS (
                    SELECT menu_id, menu_padre_id FROM menus WHERE menu_id = $1
                    UNION ALL
                    SELECT m.menu_id, m.menu_padre_id
                    FROM menus m
                    INNER JOIN ancestros a ON m.menu_id = a.menu_padre_id
                    WHERE m.estado_id = 1000
                )
                SELECT menu_id FROM ancestros
            `;
            const ancestrosRows = await manager.query(ancestrosQuery, [menuId]);
            (Array.isArray(ancestrosRows) ? ancestrosRows : ancestrosRows?.rows ?? [])
                .forEach((r: any) => ids.add(Number(r.menu_id)));
        }

        return Array.from(ids);
    }

    async bulkToggle(
        rolId: number,
        estadoId: number,
        usuarioId: number,
    ): Promise<{ actualizados: number }> {
        return runInTransaction(this.dataSource, async (manager) => {
            if (estadoId !== ESTADO_ACTIVO && estadoId !== ESTADO_HISTORICO) {
                throw new DomainException(
                    `Estado inválido. Solo se permite ${ESTADO_ACTIVO} (${ESTADO_METADATA[ESTADO_ACTIVO].abreviatura}) o ${ESTADO_HISTORICO} (${ESTADO_METADATA[ESTADO_HISTORICO].abreviatura}).`,
                    { httpStatus: HttpStatus.BAD_REQUEST, estadoId }
                );
            }

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'editar', manager);
            await this.tablaValidador.validarRegistrosActivos('roles', 'rol_id', rolId, undefined, manager);

            const result = await manager.query(
                `UPDATE roles_menus
                SET estado_id = $1,
                    usuario_id_actualizacion = $2,
                    fecha_actualizacion = CURRENT_TIMESTAMP,
                    usuario_id_baja = NULL,
                    fecha_baja = NULL
                WHERE rol_id = $3
                AND estado_id IN ($4, $5)
                RETURNING rol_menu_id`,
                [estadoId, Number(usuarioId), rolId, ESTADO_ACTIVO, ESTADO_HISTORICO]
            );

            const filas: any[] = Array.isArray(result)
                ? result
                : (result?.rows ?? []);

            this.logger.log(
                `Bulk toggle: ${filas.length} menús del rol ${rolId} cambiados a estado ${estadoId}.`
            );

            return { actualizados: filas.length };
        });
    }

    async toggleEstado(
        id: number,
        estadoId: number,
        usuarioId: number,
    ): Promise<RolMenuResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            if (estadoId !== ESTADO_ACTIVO && estadoId !== ESTADO_HISTORICO) {
                throw new DomainException(
                    `Estado inválido. Solo se permite ${ESTADO_ACTIVO} (${ESTADO_METADATA[ESTADO_ACTIVO].abreviatura}) o ${ESTADO_HISTORICO} (${ESTADO_METADATA[ESTADO_HISTORICO].abreviatura}).`,
                    { httpStatus: HttpStatus.BAD_REQUEST, estadoId }
                );
            }

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'editar', manager);

            // 1. Obtener el rol_menu origen
            const origenRows = await manager.query(
                `SELECT rol_menu_id, rol_id, menu_id
                FROM roles_menus
                WHERE rol_menu_id = $1
                AND estado_id IN ($2, $3)
                LIMIT 1`,
                [id, ESTADO_ACTIVO, ESTADO_HISTORICO]
            );

            if (!origenRows || origenRows.length === 0) {
                throw new DomainException(
                    `Asignación de rol a menú no encontrada.`,
                    { id, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const origen = origenRows[0];
            const rolId = Number(origen.rol_id);
            const menuId = Number(origen.menu_id);

            // 2. Calcular el conjunto de menu_id afectados (cascada)
            const menuIdsAfectados = await this.obtenerMenuIdsAfectados(
                menuId,
                estadoId,
                manager,
            );

            if (menuIdsAfectados.length === 0) {
                menuIdsAfectados.push(menuId);
            }

            // 3. Actualizar todas las filas del rol que correspondan a esos menús
            const placeholders = menuIdsAfectados
                .map((_, i) => `$${i + 4}`)
                .join(', ');

            await manager.query(
                `UPDATE roles_menus
                SET estado_id = $1,
                    usuario_id_actualizacion = $2,
                    fecha_actualizacion = CURRENT_TIMESTAMP,
                    usuario_id_baja = NULL,
                    fecha_baja = NULL
                WHERE rol_id = $3
                AND menu_id IN (${placeholders})
                AND estado_id IN ($${menuIdsAfectados.length + 4}, $${menuIdsAfectados.length + 5})`,
                [
                    estadoId,
                    Number(usuarioId),
                    rolId,
                    ...menuIdsAfectados,
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                ]
            );

            // 4. Devolver el registro original
            return this.findOne<RolMenuResponseDto>(id, usuarioId, manager);
        });
    }

    async create(dto: CreateRolMenuDto, usuarioId: number): Promise<RolMenuResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await Promise.all([
                this.tablaValidador.validarRegistrosActivos('roles', 'rol_id', dto.rol_id),
                this.tablaValidador.validarRegistrosActivos('menus', 'menu_id', dto.menu_id),
                this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [
                        { nombre: 'rol_id', valor: dto.rol_id },
                        { nombre: 'menu_id', valor: dto.menu_id }
                    ],
                    estadosValidos: [...ESTADOS_VIVOS],
                    campoPk: this.campoPK,
                }, manager),
                this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager)
            ]);

            const rolMenu = manager.create(RolMenu, {
                ...dto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(rolMenu);
                return this.findOne<RolMenuResponseDto>(saved.rol_menu_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la asignación de rol a menú', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateRolMenuDto, usuarioId: number): Promise<RolMenuResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const registroActual = await manager.findOne(RolMenu, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!registroActual) {
                throw new DomainException(
                    `Asignación de rol a menú no encontrada.`,
                    { id, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindRolesMenusQueryDto.getDependencias(),
                FindRolesMenusQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            const nuevoRolId = dtoProcesado.rol_id ?? registroActual.rol_id;
            const nuevoMenuId = dtoProcesado.menu_id ?? registroActual.menu_id;

            const validaciones: Promise<any>[] = [];

            if (dtoProcesado.rol_id !== undefined && dtoProcesado.rol_id !== registroActual.rol_id) {
                validaciones.push(
                    this.tablaValidador.validarRegistrosActivos('roles', 'rol_id', dtoProcesado.rol_id)
                );
            }

            if (dtoProcesado.menu_id !== undefined && dtoProcesado.menu_id !== registroActual.menu_id) {
                validaciones.push(
                    this.tablaValidador.validarRegistrosActivos('menus', 'menu_id', dtoProcesado.menu_id)
                );
            }

            if (dtoProcesado.rol_id !== undefined || dtoProcesado.menu_id !== undefined) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campos: [
                            { nombre: 'rol_id', valor: nuevoRolId },
                            { nombre: 'menu_id', valor: nuevoMenuId }
                        ],
                        idExcluir: id,
                        estadosValidos: [...ESTADOS_VIVOS],
                        campoPk: this.campoPK,
                    }, manager)
                );
            }

            if (validaciones.length > 0) {
                await Promise.all(validaciones);
            }

            Object.assign(registroActual, dtoProcesado);
            registroActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(registroActual);
                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la asignación de rol a menú', 'actualizar');
            }
        });
    }
}
