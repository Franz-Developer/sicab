// C:\sistemas\sicab\sicab-backend\src\common\validators\tabla-validador.service.ts
import { Injectable, Inject, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { logSqlQuery } from '../../common/utils/sql-logger.util';
import { ESTADO_ACTIVO, ESTADO_HISTORICO,  ESTADOS_VIVOS, EstadoOperativoVehiculo, ESTADO_OPERATIVO_VEHICULO_METADATA, Motivo, MOTIVO_METADATA } from '../constants/estados.constant';
import { DomainException } from '../exceptions/domain.exception';
import { IDataSource } from '../interfaces/repository.interface';
import { EntityManager } from 'typeorm';
import { getErrorMessage, getErrorStack, isDomainException } from '../utils/error.util';
import { ConfiguracionService } from '../services/configuracion.service';
import { obtenerDatosTablaAmigable, obtenerNombreAmigableTabla, obtenerGeneroTabla } from '../constants/nombres-tablas.constant';

interface ResultadoDependencias {
    tiene: boolean;
    tablaConflictiva?: string;
    campoFkConflictivo?: string;
}

export interface ItemValidacionFK {
    id: number;
    campo?: string;
}

const CAMPOS_INTOCABLES_POR_TABLA: Record<string, string[]> = {
    cargos: ['codigo'],
    roles: ['codigo'],
    categorias_conductores: ['codigo'],
    tipos_mantenimiento: ['codigo'],
    tipos_antecedente_detalle: ['codigo'],
    bancos: ['codigo_asfi'],
    empresas: ['codigo'],
    sucursales: ['codigo'],
};

@Injectable()
export class TablaValidadorService {
    private readonly logger = new Logger(TablaValidadorService.name);
    private permisoCache = new Map<string, { tienePermiso: boolean; timestamp: number }>();
    private readonly PERMISO_CACHE_TTL_MS: number;
    private dependenciasCache = new Map<string, { tiene: boolean; timestamp: number }>();
    private readonly DEPENDENCIAS_CACHE_TTL_MS: number;

    constructor(
        @Inject('IDataSource') private readonly dataSource: IDataSource,
        private readonly configService: ConfigService,
        private readonly configuracionService: ConfiguracionService,
    ) {
        const permisoTtlSeconds = parseInt(this.configService.get<string>('PERMISO_CACHE_TTL', '60'), 10);
        this.PERMISO_CACHE_TTL_MS = Math.max(permisoTtlSeconds, 1) * 1000;

        const dependenciasTtlSeconds = parseInt(this.configService.get<string>('DEPENDENCIAS_CACHE_TTL', '10'), 10);
        this.DEPENDENCIAS_CACHE_TTL_MS = Math.max(dependenciasTtlSeconds, 1) * 1000;
    }

    private async validarOperacion(
        tabla: string,
        pkId: number,
        campoPk: string,
        usuarioId: number,
        accion: 'leer' | 'crear' | 'editar' | 'eliminar' | 'anular' | 'archivar' | 'desarchivar',
        manager?: EntityManager,
        dto?: Record<string, any>,
    ): Promise<void> {
        const tablaNormalizada = tabla.toLowerCase().trim();

        // POLÍTICA 1: Registro comodín (pk_id = 1)
        if (Number(pkId) === 1) {
            const datosEntidad = obtenerDatosTablaAmigable(tablaNormalizada);
            throw new DomainException(
                `Operación denegada: ${datosEntidad.singular} es el registro comodín del sistema y no puede ser modificado, archivado, desarchivado ni eliminado. Esta restricción protege la integridad referencial de los datos maestros.`,
                {
                    httpStatus: HttpStatus.FORBIDDEN,
                    tabla: tablaNormalizada,
                    pkId,
                    motivo: 'REGISTRO_COMODIN_PROTEGIDO',
                },
            );
        }

        // POLÍTICA 2: Usuario ADMIN raíz (pk_id = 2 en 'usuarios')
        if (tablaNormalizada === 'usuarios' && Number(pkId) === 2) {
            throw new DomainException(
                `Operación denegada: El usuario administrador principal del sistema es un registro crítico que no puede ser modificado, archivado, desarchivado ni eliminado. Esta restricción asegura que siempre exista un usuario con privilegios de administrador en el sistema.`,
                {
                    httpStatus: HttpStatus.FORBIDDEN,
                    tabla: tablaNormalizada,
                    pkId,
                    motivo: 'USUARIO_ADMIN_PROTEGIDO',
                },
            );
        }

        // POLÍTICA 3: Registro creado por el SISTEMA (usuario_id_registro = 1)
        const tablaSanitizada = this.dataSource.escapeIdentifier(tablaNormalizada);
        const campoPkSanitizado = this.dataSource.escapeIdentifier(campoPk);
        const executor = manager ?? this.dataSource;

        const result = await executor.query(
            `SELECT usuario_id_registro FROM ${tablaSanitizada} WHERE ${campoPkSanitizado} = $1 LIMIT 1`,
            [Number(pkId)],
        );

        const registro = result?.[0];
        if (registro && Number(registro.usuario_id_registro) === 1) {
            const datosEntidad = obtenerDatosTablaAmigable(tablaNormalizada);
            const esAdmin = await this.esUsuarioAdministrador(usuarioId, manager);

            if (!esAdmin) {
                throw new DomainException(
                    `Operación denegada: ${datosEntidad.singular} es un registro del SISTEMA y no puede ser modificado, archivado, desarchivado ni eliminado. Esta restricción protege la integridad estructural del sistema.`,
                    {
                        httpStatus: HttpStatus.FORBIDDEN,
                        tabla: tablaNormalizada,
                        pkId,
                        motivo: 'REGISTRO_SISTEMA_PROTEGIDO',
                    },
                );
            }

            // Es ADMIN. Verificar campos intocables (solo aplica en 'editar')
            const camposIntocables = CAMPOS_INTOCABLES_POR_TABLA[tablaNormalizada] ?? [];

            if (accion === 'editar' && camposIntocables.length > 0) {
                const camposModificados = camposIntocables.filter(c => c in (dto ?? {}));

                if (camposModificados.length > 0) {
                    throw new DomainException(
                        `Operación denegada incluso para ADMIN: ${datosEntidad.singular} es un registro del SISTEMA y los campos ${camposModificados.join(', ')} son intocables porque el backend depende de ellos para su funcionamiento.`,
                        {
                            httpStatus: HttpStatus.FORBIDDEN,
                            tabla: tablaNormalizada,
                            pkId,
                            camposIntocables: camposModificados,
                            motivo: 'CAMPO_INTOCABLE',
                        },
                    );
                }
            }

            this.logger.warn(
                `[BYPASS ADMIN - REGISTRO SISTEMA] usuario_id=${usuarioId} (ADMIN) ejecutó "${accion}" sobre ${datosEntidad.singular} (${tablaNormalizada}#${pkId}). El ADMIN asume la responsabilidad.`,
            );
        }

        // POLÍTICA 4: Usuario que opera existe y está activo
        await this.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

        // POLÍTICA 5: Permisos del usuario sobre la tabla
        await this.validarPermisoTabla(usuarioId, tablaNormalizada, accion, manager);
    }

    async obtenerFechaInicioGestion(): Promise<Date> {
        try {
            const fecha = await this.configuracionService.obtenerValorTipado<Date>('gestion_activa');
            if (fecha && !isNaN(new Date(fecha).getTime())) {
                return new Date(fecha);
            }

            const year = new Date().getFullYear();
            const fallback = new Date(Date.UTC(year, 0, 1));
            this.logger.warn(`No se encontró gestión_activa o es inválida, usando fallback: ${fallback.toISOString()}`);
            return fallback;
        } catch (error) {
            const year = new Date().getFullYear();
            const fallback = new Date(Date.UTC(year, 0, 1));
            this.logger.error(`Error al obtener gestión_activa desde ConfiguracionService: ${getErrorMessage(error)}`);
            return fallback;
        }
    }

    invalidarCacheGestion(): void {
        this.configuracionService.invalidarCache();
        this.logger.debug(`Caché de gestión_activa invalidada mediante ConfiguracionService.`);
    }

    async validarRegistrosActivos(
        tabla: string,
        campoPk: string = 'id',
        pkId: number,
        columnasSelect?: string,
        manager?: EntityManager,
    ): Promise<any> {
        const tablaNormalizada = tabla.toLowerCase().trim();
        const tablaSanitizada = this.dataSource.escapeIdentifier(tablaNormalizada);
        const campoPkSanitizado = this.dataSource.escapeIdentifier(campoPk);

        const selectClause = columnasSelect ? columnasSelect : '1';
        const esUsuarios = tablaNormalizada === 'usuarios';

        const joinRoles = esUsuarios
            ? `INNER JOIN roles r ON r.rol_id = t.rol_id AND r.estado_id = $2`
            : '';

        const query = `
            SELECT ${selectClause}
            FROM ${tablaSanitizada} t
            ${joinRoles}
            WHERE t.${campoPkSanitizado} = $1
                AND t.estado_id = $2
                AND t.fecha_baja IS NULL
            LIMIT 1
        `;
        const params: any[] = [Number(pkId), ESTADO_ACTIVO];

        try {
            const executor = manager ?? this.dataSource;
            const resultado = await executor.query(query, params);

            if (!resultado || resultado.length === 0) {
                const datosEntidad = obtenerDatosTablaAmigable(tablaNormalizada);
                const nombreCapitalizado = datosEntidad.singular.charAt(0).toUpperCase() + datosEntidad.singular.slice(1);
                const esF = obtenerGeneroTabla(tablaNormalizada) === 'F';

                const sufijoEncontrado = esF ? 'encontrada' : 'encontrado';
                const sufijoActivo = esF ? 'activa' : 'activo';

                const mensajeFinal = esUsuarios
                    ? 'Su cuenta ya no está activa o fue deshabilitada. Inicie sesión nuevamente o contacte al administrador.'
                    : `${nombreCapitalizado} no ${sufijoEncontrado} o no está ${sufijoActivo}.`;

                throw new DomainException(
                    mensajeFinal,
                    {
                        httpStatus: esUsuarios ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST,
                        tabla: tablaNormalizada,
                        campoPk,
                        pkId,
                    }
                );
            }

            if (!columnasSelect) {
                return true;
            }

            const row = resultado[0] as Record<string, unknown>;
            const firstKey = Object.keys(row)[0];

            if (!firstKey) {
                return null;
            }

            return row[firstKey];
        } catch (error) {
            if (isDomainException(error)) {
                throw error;
            }
            this.logger.error(`Error validando ${tablaNormalizada}#${pkId}: ${getErrorMessage(error)}`);
            throw error;
        }
    }

    async validarPreUpdate(
        tabla: string,
        pkId: number,
        dto: Record<string, any>,
        campoPk: string = 'id',
        usuarioId: number,
        manager?: EntityManager,
    ): Promise<Record<string, any>> {
        const tablaNormalizada = tabla.toLowerCase().trim();

        // 1. Validar TODAS las políticas de autorización y protección.
        await this.validarOperacion(tablaNormalizada, pkId, campoPk, usuarioId, 'editar', manager, dto);

        // 2. Validar que no se modifique el estado directamente
        if ('estado_id' in dto) {
            throw new DomainException(
                `La operación de actualización no permite modificar el campo 'estado_id' directamente. Para cambiar el estado del registro, utilice los endpoints específicos de 'archivar' (para pasar a HISTORICO) o 'desarchivar' (para pasar a ACTIVO).`,
                {
                    httpStatus: HttpStatus.BAD_REQUEST,
                    tabla: tablaNormalizada,
                    pkId,
                    motivo: 'CAMBIO_ESTADO_NO_PERMITIDO'
                }
            );
        }

        // 3. Buscar el registro
        const tablaSanitizada = this.dataSource.escapeIdentifier(tablaNormalizada);
        const campoPkSanitizado = this.dataSource.escapeIdentifier(campoPk);

        const query = `
            SELECT ${campoPkSanitizado}, estado_id, fecha_baja
            FROM ${tablaSanitizada}
            WHERE ${campoPkSanitizado} = $1
                AND estado_id = $2
                AND fecha_baja IS NULL
        `;
        const params = [Number(pkId), ESTADO_ACTIVO];
        logSqlQuery(query, params, `validarPreUpdate - ${tablaSanitizada}`);

        const executor = manager ?? this.dataSource;
        const resultados = await executor.query(query, params);
        const registro = resultados?.[0];

        if (!registro) {
            throw new DomainException(
                `No se encontró un registro activo con ID ${pkId}. La operación de actualización requiere que el registro exista y esté activo.`,
                {
                    httpStatus: HttpStatus.NOT_FOUND,
                    tabla: tablaNormalizada,
                    campoPk,
                    pkId,
                }
            );
        }

        return registro;
    }

    async validarPreArchivar(
        tabla: string,
        pkId: number,
        usuarioId: number,
        campoPk: string = 'id',
        manager?: EntityManager,
    ): Promise<void> {
        const tablaNormalizada = tabla.toLowerCase().trim();

        // 1. Validar TODAS las políticas de autorización y protección.
        await this.validarOperacion(tablaNormalizada, pkId, campoPk, usuarioId, 'archivar', manager);

        const tablaSanitizada = this.dataSource.escapeIdentifier(tablaNormalizada);
        const campoPkSanitizado = this.dataSource.escapeIdentifier(campoPk);

        const query = `
            SELECT 1
            FROM ${tablaSanitizada} t
            WHERE t.${campoPkSanitizado} = $1
                AND t.estado_id = $2
                AND t.fecha_baja IS NULL
            LIMIT 1
        `;
        const params = [pkId, ESTADO_ACTIVO];
        logSqlQuery(query, params, `validarPreArchivar - ${tablaSanitizada}`);

        let existe = false;

        try {
            const executor = manager ?? this.dataSource;
            const resultados = await executor.query(query, params);
            existe = Array.isArray(resultados) && resultados.length > 0;
        } catch (error) {
            if (isDomainException(error)) {
                throw error;
            }
            this.logger.error(`Error: ${getErrorMessage(error)}`, getErrorStack(error));
            throw error;
        }

        if (!existe) {
            throw new DomainException(
                `No se encontró un registro activo con ID ${pkId}. La operación de archivado requiere que el registro exista y esté activo.`,
                {
                    httpStatus: HttpStatus.NOT_FOUND,
                    tabla: tablaNormalizada,
                    campoPk,
                    pkId,
                }
            );
        }
    }

    async validarPreDesarchivar(
        tabla: string,
        pkId: number,
        usuarioId: number,
        campoPk: string = 'id',
        manager?: EntityManager,
    ): Promise<void> {
        const tablaNormalizada = tabla.toLowerCase().trim();

        // 1. Validar TODAS las políticas de autorización y protección.
        await this.validarOperacion(tablaNormalizada, pkId, campoPk, usuarioId, 'desarchivar', manager);

        const tablaSanitizada = this.dataSource.escapeIdentifier(tablaNormalizada);
        const campoPkSanitizado = this.dataSource.escapeIdentifier(campoPk);

        const query = `
            SELECT 1
            FROM ${tablaSanitizada} t
            WHERE t.${campoPkSanitizado} = $1
                AND t.estado_id = $2
                AND t.fecha_baja IS NULL
            LIMIT 1
        `;
        const params = [pkId, ESTADO_HISTORICO];
        logSqlQuery(query, params, `validarPreDesarchivar - ${tablaSanitizada}`);

        let existe = false;

        try {
            const executor = manager ?? this.dataSource;
            const resultados = await executor.query(query, params);
            existe = Array.isArray(resultados) && resultados.length > 0;
        } catch (error) {
            if (isDomainException(error)) {
                throw error;
            }
            this.logger.error(`Error: ${getErrorMessage(error)}`, getErrorStack(error));
            throw error;
        }

        if (!existe) {
            throw new DomainException(
                `No se encontró un registro histórico con ID ${pkId}. La operación de desarchivado requiere que el registro exista y esté en estado histórico.`,
                {
                    httpStatus: HttpStatus.NOT_FOUND,
                    tabla: tablaNormalizada,
                    campoPk,
                    pkId,
                }
            );
        }
    }

    async validarPreDelete(
        tablaOrigen: string,
        pkId: number,
        tablasDependientes: Array<string | { tabla: string; campoFk: string }>,
        campoFkDefault: string,
        usuarioId: number,
        manager?: EntityManager,
    ): Promise<void> {
        const tablaNormalizada = tablaOrigen.toLowerCase().trim();

        // 1. Validar TODAS las políticas de autorización y protección.
        await this.validarOperacion(tablaNormalizada, pkId, campoFkDefault, usuarioId, 'eliminar', manager);

        const tablaSanitizada = this.dataSource.escapeIdentifier(tablaNormalizada);
        const campoPkSanitizado = this.dataSource.escapeIdentifier(campoFkDefault || 'id');

        const query = `
            SELECT estado_id, fecha_baja, ${tablaNormalizada === 'parametros_globales' ? 'editable' : '0 AS editable'}
            FROM ${tablaSanitizada}
            WHERE ${campoPkSanitizado} = $1
                AND estado_id = $2
                AND fecha_baja IS NULL
            LIMIT 1
        `;
        const params = [pkId, ESTADO_ACTIVO];
        logSqlQuery(query, params, `validarPreDelete - ${tablaSanitizada}`);

        let existeResult;
        try {
            const executor = manager ?? this.dataSource;
            existeResult = await executor.query(query, params);
        } catch (error) {
            if (isDomainException(error)) throw error;
            const errorMessage = getErrorMessage(error);
            throw new DomainException(
                `Error interno al verificar la existencia del registro con ${campoPkSanitizado} = ${pkId} en la tabla '${tablaNormalizada}'. Detalle técnico: ${errorMessage}. Por favor, contacte al administrador del sistema.`,
                {
                    tabla: tablaNormalizada,
                    pkId,
                    campoPk: campoFkDefault,
                    originalError: errorMessage,
                    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR
                }
            );
        }

        if (!existeResult || existeResult.length === 0) {
            throw new DomainException(
                `No se encontró un registro activo con ID ${pkId}. La operación de eliminación requiere que el registro exista y esté activo.`,
                {
                    httpStatus: HttpStatus.NOT_FOUND,
                    tabla: tablaNormalizada,
                    campoPk: campoFkDefault,
                    pkId,
                }
            );
        }

        const registro = existeResult[0];

        if (tablaNormalizada === 'parametros_globales' && Number(registro['editable']) === 1) {
            throw new DomainException(
                `Operación denegada: El parámetro global con ID = ${pkId} en la tabla '${tablaNormalizada}' está marcado como NO editable y no puede ser eliminado. Solo los parámetros editables pueden ser eliminados.`,
                {
                    httpStatus: HttpStatus.FORBIDDEN,
                    tabla: tablaNormalizada,
                    pkId,
                    motivo: 'PARAMETRO_NO_EDITABLE'
                }
            );
        }

        if (tablasDependientes && tablasDependientes.length > 0) {
            let resultado: ResultadoDependencias = { tiene: false };

            try {
                resultado = await this.validarDependencias(
                    tablaOrigen,
                    pkId,
                    tablasDependientes,
                    campoFkDefault,
                    manager,
                );
            } catch (error) {
                if (isDomainException(error)) throw error;

                const errorMessage = getErrorMessage(error);
                this.logger.error(
                    `Error al validar dependencias para ${tablaNormalizada}#${pkId}: ${errorMessage}`,
                    getErrorStack(error)
                );

                const tablasDependientesStr = tablasDependientes
                    .map(item => typeof item === 'string' ? item : `${item.tabla}(${item.campoFk})`)
                    .join(', ');

                throw new DomainException(
                    `Error interno al validar dependencias del registro con ${campoFkDefault} = ${pkId} en la tabla '${tablaNormalizada}'. Tablas dependientes verificadas: [${tablasDependientesStr}]. Detalle técnico: ${errorMessage}. Por favor, contacte al administrador del sistema.`,
                    {
                        tabla: tablaNormalizada,
                        pkId,
                        campoPk: campoFkDefault,
                        tablasDependientes: tablasDependientesStr,
                        originalError: errorMessage,
                        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR
                    }
                );
            }

            if (resultado.tiene && resultado.tablaConflictiva) {
                const nombreAmigable = obtenerNombreAmigableTabla(resultado.tablaConflictiva);
                const datosEntidad = obtenerDatosTablaAmigable(tablaNormalizada);

                console.warn(
                    `[DEPENDENCIAS_ACTIVAS] ${tablaNormalizada}#${pkId} (usuario ${usuarioId}) → ` +
                    `bloqueado por '${resultado.tablaConflictiva}' (campo: ${resultado.campoFkConflictivo})`
                );

                throw new DomainException(
                    `No se puede eliminar ${datosEntidad.singular} porque tiene registros relacionados en ${nombreAmigable}.`,
                    {
                        httpStatus: HttpStatus.BAD_REQUEST,
                        tabla: tablaNormalizada,
                        tablaConflictiva: resultado.tablaConflictiva,
                        motivo: 'REGISTROS_RELACIONADOS'
                    }
                );
            }
        }
    }

    async validarDependencias(
        tablaOrigen: string,
        pkId: number,
        tablasDependientes: Array<string | { tabla: string; campoFk: string }>,
        campoFkDefault: string,
        manager?: EntityManager,
    ): Promise<ResultadoDependencias> {
        if (!tablasDependientes || tablasDependientes.length === 0) {
            return { tiene: false };
        }

        if (!pkId || pkId <= 0) {
            throw new DomainException(
                `El ID de registro proporcionado (${pkId}) es inválido para verificar dependencias en la tabla '${tablaOrigen}'. El ID debe ser un número entero positivo mayor a 0.`,
                {
                    httpStatus: HttpStatus.BAD_REQUEST,
                    tabla: tablaOrigen,
                    pkId,
                    motivo: 'ID_INVALIDO'
                }
            );
        }

        const pkNumber = Number(pkId);
        const tablaNormalizada = tablaOrigen.toLowerCase().trim();
        const estadosStr = ESTADOS_VIVOS.join(', ');
        const cacheKey = `${tablaNormalizada}:${pkNumber}`;
        const cached = this.dependenciasCache.get(cacheKey);
        const now = Date.now();

        if (cached && !cached.tiene && (now - cached.timestamp < this.DEPENDENCIAS_CACHE_TTL_MS)) {
            this.logger.debug(`Usando caché de dependencias (sin dependencias): ${cacheKey}`);
            return { tiene: false };
        }

        const executor = manager ?? this.dataSource;

        for (const item of tablasDependientes) {
            const tabla = typeof item === 'string' ? item : item.tabla;
            const fk = typeof item === 'string' ? campoFkDefault : item.campoFk;
            const tablaSanitizada = this.dataSource.escapeIdentifier(tabla);
            const fkSanitizado = this.dataSource.escapeIdentifier(fk);

            const query = `
                SELECT 1
                FROM ${tablaSanitizada}
                WHERE ${fkSanitizado} = $1
                    AND estado_id IN (${estadosStr})
                    AND fecha_baja IS NULL
                LIMIT 1
            `;

            try {
                const resultados = await executor.query(query, [pkNumber]);

                if (resultados && resultados.length > 0) {
                    this.logger.debug(`Dependencia encontrada en '${tabla}' para ${tablaNormalizada}#${pkNumber}. Cortocircuito activado; no se consultan las tablas restantes.`);

                    return {
                        tiene: true,
                        tablaConflictiva: tabla,
                        campoFkConflictivo: fk,
                    };
                }

                this.logger.debug(`Sin dependencias en '${tabla}' para ${tablaNormalizada}#${pkNumber}. Pasando a la siguiente tabla.`);
            } catch (error) {
                if (isDomainException(error)) throw error;

                const errorMessage = getErrorMessage(error);
                this.logger.error(
                    `Error verificando dependencias en tabla '${tabla}' para ${tablaNormalizada}#${pkNumber}: ${errorMessage}`,
                    getErrorStack(error)
                );

                throw new DomainException(
                    `Error interno al verificar dependencias para la tabla '${tablaNormalizada}' con ID = ${pkNumber}. Tabla dependiente verificada: [${tabla}(${fk})]. Detalle técnico: ${errorMessage}. Por favor, contacte al administrador del sistema.`,
                    {
                        tablaOrigen: tablaNormalizada,
                        pkId: pkNumber,
                        tablaDependiente: tabla,
                        campoFk: fk,
                        originalError: errorMessage,
                        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR
                    }
                );
            }
        }

        this.dependenciasCache.set(cacheKey, {
            tiene: false,
            timestamp: now
        });

        this.logger.debug(`Sin dependencias para ${tablaNormalizada}#${pkNumber} en ninguna de las ${tablasDependientes.length} tablas verificadas.`);
        return { tiene: false };
    }

    invalidarDependenciasCache(tablaOrigen?: string, pkId?: number): void {
        if (tablaOrigen && pkId) {
            const key = `${tablaOrigen.toLowerCase().trim()}:${Number(pkId)}`;
            this.dependenciasCache.delete(key);
            this.logger.debug(`Caché de dependencias invalidado: ${key}`);
        } else if (tablaOrigen) {
            const prefix = `${tablaOrigen.toLowerCase().trim()}:`;
            for (const key of this.dependenciasCache.keys() || []) {
                if (key.startsWith(prefix)) {
                    this.dependenciasCache.delete(key);
                }
            }
            this.logger.debug(`Caché de dependencias invalidado para ${tablaOrigen}`);
        } else {
            this.dependenciasCache.clear();
            this.logger.debug('Caché de dependencias limpiado completamente.');
        }
    }

        async validarPermisoTabla(
        usuarioId: number,
        tabla: string,
        accion: string,
        manager?: EntityManager,
    ): Promise<boolean> {
        if (!usuarioId || usuarioId <= 0) {
            throw new DomainException(
                `El ID de usuario proporcionado (${usuarioId}) es inválido. El ID debe ser un número entero positivo.`,
                {
                    httpStatus: HttpStatus.BAD_REQUEST,
                    usuarioId,
                }
            );
        }

        const tablaNormalizada = tabla.toLowerCase().trim();
        const accionNormalizada = accion.toLowerCase().trim();

        const columnasPermisoMap: Record<string, string> = {
            leer: 'rpt.leer',
            crear: 'rpt.crear',
            editar: 'rpt.editar',
            eliminar: 'rpt.eliminar',
            anular: 'rpt.anular',
            archivar: 'rpt.archivar',
            desarchivar: 'rpt.desarchivar',
        };

        const columnaPermiso = columnasPermisoMap[accionNormalizada];
        const accionesValidas = Object.keys(columnasPermisoMap).join(', ');

        if (!columnaPermiso) {
            throw new DomainException(
                `La acción "${accion}" no es válida para la validación de permisos. Las acciones permitidas son: ${accionesValidas}.`,
                {
                    httpStatus: HttpStatus.BAD_REQUEST,
                    accion,
                    accionesPermitidas: accionesValidas,
                }
            );
        }

        const cacheKey = `${usuarioId}:${tablaNormalizada}:${accionNormalizada}`;
        const cached = this.permisoCache.get(cacheKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp < this.PERMISO_CACHE_TTL_MS)) {
            this.logger.debug(`Usando caché de permiso: ${cacheKey}`);

            if (!cached.tienePermiso) {
                throw new DomainException(
                    `Acceso denegado: El usuario con ID ${usuarioId} no tiene permiso de "${accionNormalizada}" en la tabla "${tablaNormalizada}". Contacte al administrador del sistema para solicitar los permisos necesarios.`,
                    {
                        httpStatus: HttpStatus.FORBIDDEN,
                        usuarioId,
                        tabla: tablaNormalizada,
                        accion: accionNormalizada,
                    }
                );
            }
            return true;
        }

        const query = `
            SELECT
                ${columnaPermiso} AS tiene_permiso
            FROM usuarios u
            INNER JOIN roles r ON r.rol_id = u.rol_id AND r.estado_id = $3
            INNER JOIN roles_permisos_tablas rpt ON rpt.rol_id = r.rol_id AND rpt.estado_id = $3
            INNER JOIN tablas t ON t.tabla_id = rpt.tabla_id AND t.estado_id = $3
            WHERE u.usuario_id = $1
                AND t.nombre = $2
                AND u.estado_id = ANY($4::int[])
            LIMIT 1
        `;

        const params = [Number(usuarioId), tablaNormalizada, ESTADO_ACTIVO, ESTADOS_VIVOS];
        logSqlQuery(query, params, `validarPermisoTabla - roles_permisos_tablas`);

        try {
            const executor = manager ?? this.dataSource;
            const permisosRes = await executor.query(query, params);

            const tienePermiso = permisosRes?.[0]?.tiene_permiso === 1;

            this.permisoCache.set(cacheKey, { tienePermiso, timestamp: now });

            if (!tienePermiso || !permisosRes || permisosRes.length === 0) {
                throw new DomainException(
                    `Acceso denegado: El usuario con ID ${usuarioId} no tiene permiso de "${accionNormalizada}" en la tabla "${tablaNormalizada}". Contacte al administrador del sistema para solicitar los permisos necesarios.`,
                    {
                        httpStatus: HttpStatus.FORBIDDEN,
                        usuarioId,
                        tabla: tablaNormalizada,
                        accion: accionNormalizada,
                        motivo: 'PERMISO_DENEGADO'
                    }
                );
            }

            return true;

        } catch (error) {
            if (isDomainException(error)) throw error;

            const errorMessage = getErrorMessage(error);
            this.logger.error(
                `Error validando permiso para ${tablaNormalizada}#${accionNormalizada} (usuario ${usuarioId}): ${errorMessage}`,
                getErrorStack(error)
            );

            throw new DomainException(
                `Error interno al validar permisos del usuario con ID ${usuarioId} para la acción "${accionNormalizada}" en la tabla "${tablaNormalizada}". Detalle técnico: ${errorMessage}. Por favor, contacte al administrador del sistema.`,
                {
                    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
                    usuarioId,
                    tabla: tablaNormalizada,
                    accion: accionNormalizada,
                    originalError: errorMessage
                }
            );
        }
    }

    invalidarPermisoCache(usuarioId?: number, tabla?: string): void {
        if (usuarioId && tabla) {
            const prefix = `${Number(usuarioId)}:${tabla.toLowerCase().trim()}:`;
            for (const key of this.permisoCache.keys()) {
                if (key.startsWith(prefix)) {
                    this.permisoCache.delete(key);
                }
            }
            this.logger.debug(`Caché invalidado para usuario ${usuarioId} y tabla "${tabla.toLowerCase().trim()}".`);
        } else if (usuarioId) {
            const prefix = `${Number(usuarioId)}:`;
            for (const key of this.permisoCache.keys()) {
                if (key.startsWith(prefix)) {
                    this.permisoCache.delete(key);
                }
            }
            this.logger.debug(`Caché invalidado para usuario ${usuarioId}.`);
        } else {
            this.permisoCache.clear();
            this.logger.debug('Caché de permisos limpiado completamente.');
        }
    }

    async esUsuarioAdministrador(usuarioId: number, manager?: EntityManager): Promise<boolean> {
        const executor = manager ?? this.dataSource;
        const res = await executor.query(
            `SELECT 1
            FROM usuarios u
            INNER JOIN roles r ON u.rol_id = r.rol_id
            WHERE u.usuario_id = $1
                AND u.estado_id = $2
                AND r.estado_id = $2
                AND r.es_admin = 1
            LIMIT 1`,
            [usuarioId, ESTADO_ACTIVO]
        );
        return res.length > 0;
    }

    async procesarCamposProtegidos<T extends object>(
        tabla: string,
        id: number,
        dto: T,
        dependencias: Array<string | { tabla: string; campoFk: string }>,
        camposProtegidos: string[],
        campoPk: string,
        usuarioId: number,
        manager?: EntityManager,
    ): Promise<T> {
        const tieneDependencias = await this.validarDependencias(tabla, id, dependencias, campoPk, manager);
        if (!tieneDependencias) return dto;

        const esAdmin = await this.esUsuarioAdministrador(usuarioId, manager);
        if (esAdmin) {
            this.logger.warn(
                `[BYPASS ADMIN] El usuario_id=${usuarioId} está modificando campos protegidos (${camposProtegidos.join(', ')}) en la tabla "${tabla}" id=${id} que posee dependencias activas.`
            );
            return dto;
        }

        const dtoFiltrado = { ...dto };
        camposProtegidos.forEach(campo => {
            if (campo in dtoFiltrado) {
                delete (dtoFiltrado as any)[campo];
            }
        });

        return dtoFiltrado;
    }

    async tieneDependenciasActivas(
        tablaOrigen: string,
        pkId: number,
        tablasDependientes: Array<string | { tabla: string; campoFk: string }>,
        campoFkDefault: string,
        manager?: EntityManager,
    ): Promise<boolean> {
        const resultado = await this.validarDependencias(
            tablaOrigen,
            pkId,
            tablasDependientes,
            campoFkDefault,
            manager,
        );
        return resultado.tiene;
    }

    async validarEsConductor(
        trabajadorId: number,
        manager?: EntityManager,
    ): Promise<void> {
        const trabajadorIdNum = Number(trabajadorId);

        if (!trabajadorIdNum || trabajadorIdNum <= 0) {
            throw new DomainException(
                `El ID de trabajador proporcionado (${trabajadorId}) es inválido.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const query = `
            SELECT 1
            FROM trabajadores_cargos tc
            INNER JOIN cargos c ON c.cargo_id = tc.cargo_id
            WHERE tc.trabajador_id = $1
            AND tc.estado_id = $2
            AND c.codigo = 'CON'
            AND c.estado_id = $2
            LIMIT 1
        `;
        const params = [trabajadorIdNum, ESTADO_ACTIVO];
        logSqlQuery(query, params, `validarEsConductor - trabajadores_cargos`);

        try {
            const executor = manager ?? this.dataSource;
            const result = await executor.query(query, params);

            if (!result || result.length === 0) {
                throw new DomainException(
                    `El trabajador con ID ${trabajadorIdNum} no tiene un cargo activo de CONDUCTOR. ` +
                    `Solo los conductores pueden realizar esta operación.`,
                    {
                        httpStatus: HttpStatus.BAD_REQUEST,
                        tabla: 'trabajadores_cargos',
                        trabajadorId: trabajadorIdNum,
                        motivo: 'NO_ES_CONDUCTOR',
                    },
                );
            }
        } catch (error) {
            if (isDomainException(error)) throw error;
            this.logger.error(
                `Error validando si trabajador ${trabajadorIdNum} es conductor: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    async validarVehiculoOperativo(
        vehiculoId: number,
        manager?: EntityManager,
    ): Promise<void> {
        const vehiculoIdNum = Number(vehiculoId);

        if (!vehiculoIdNum || vehiculoIdNum <= 0) {
            throw new DomainException(
                `El ID de vehículo proporcionado (${vehiculoId}) es inválido.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const query = `
            SELECT estado_operativo_id
            FROM vehiculos
            WHERE vehiculo_id = $1
            AND estado_id = $2
            AND fecha_baja IS NULL
            LIMIT 1
        `;
        const params = [vehiculoIdNum, ESTADO_ACTIVO];
        logSqlQuery(query, params, `validarVehiculoOperativo - vehiculos`);

        try {
            const executor = manager ?? this.dataSource;
            const row = await executor.query(query, params);

            if (!row || row.length === 0) {
                throw new DomainException(
                    `Vehículo con ID ${vehiculoIdNum} no encontrado o inactivo.`,
                    {
                        httpStatus: HttpStatus.NOT_FOUND,
                        tabla: 'vehiculos',
                        vehiculoId: vehiculoIdNum,
                        motivo: 'VEHICULO_NO_ENCONTRADO',
                    },
                );
            }

            const estadoOperativo = Number(row[0].estado_operativo_id);

            if (estadoOperativo !== EstadoOperativoVehiculo.OPERATIVO) {
                const meta = ESTADO_OPERATIVO_VEHICULO_METADATA[estadoOperativo as EstadoOperativoVehiculo];
                const nombreEstado = meta?.abreviatura ?? `DESCONOCIDO(${estadoOperativo})`;
                const labelEstado = meta?.label ?? nombreEstado;

                throw new DomainException(
                    `El vehículo con ID ${vehiculoIdNum} no está OPERATIVO. ` +
                    `Estado actual: ${labelEstado}. Solo se pueden asignar vehículos OPERATIVOS.`,
                    {
                        httpStatus: HttpStatus.CONFLICT,
                        tabla: 'vehiculos',
                        vehiculoId: vehiculoIdNum,
                        estado_operativo_id: estadoOperativo,
                        estado_operativo_abreviatura: nombreEstado,
                        estado_operativo_label: labelEstado,
                        motivo: 'VEHICULO_NO_OPERATIVO',
                    },
                );
            }

            await this.validarVehiculoSinSuspension(vehiculoIdNum, manager);
        } catch (error) {
            if (isDomainException(error)) throw error;
            this.logger.error(
                `Error validando vehículo ${vehiculoIdNum} operativo: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    private async validarVehiculoSinSuspension(
        vehiculoId: number,
        manager?: EntityManager,
    ): Promise<void> {
        const query = `
            SELECT motivo_id, monto_deuda, fecha_inicio
            FROM moviles_suspendidos
            WHERE vehiculo_id = $1
            AND es_activo = 1
            AND estado_id = $2
            LIMIT 1
        `;
        const params = [vehiculoId, ESTADO_ACTIVO];
        logSqlQuery(query, params, `validarVehiculoSinSuspension - moviles_suspendidos`);

        const executor = manager ?? this.dataSource;
        const row = await executor.query(query, params);

        if (row && row.length > 0) {
            const suspension = row[0];
            const motivoId = Number(suspension.motivo_id) as Motivo;

            const meta = MOTIVO_METADATA[motivoId];
            const nombreMotivo = meta?.abreviatura ?? `DESCONOCIDO(${motivoId})`;
            const labelMotivo = meta?.label ?? nombreMotivo;

            throw new DomainException(
                `El vehículo con ID ${vehiculoId} tiene una suspensión vigente por "${labelMotivo}". ` +
                `No se puede asignar hasta que se levante la suspensión.`,
                {
                    httpStatus: HttpStatus.CONFLICT,
                    tabla: 'moviles_suspendidos',
                    vehiculoId,
                    motivo_suspension_id: motivoId,
                    motivo_suspension_abreviatura: nombreMotivo,
                    motivo_suspension_label: labelMotivo,
                    monto_deuda: suspension.monto_deuda,
                    fecha_inicio: suspension.fecha_inicio,
                    motivo: 'VEHICULO_SUSPENDIDO',
                },
            );
        }
    }
}
