// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\tipos-cambios.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADO_BORRADO, TIPO_MONEDA_METADATA, TipoMoneda } from '../../common/constants/estados.constant';
import { EstadoGestionResponseDto, EstadoGestionMonedaDto } from './dto/estado-gestion-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateTipoCambioDto } from './dto/create-tipo-cambio.dto';
import { TipoCambioResponseDto } from './dto/tipo-cambio-response.dto';
import { FindTiposCambiosQueryDto } from './dto/find-tipos-cambios-query.dto';
import { UpdateTipoCambioDto } from './dto/update-tipo-cambio.dto';
import { TipoCambio } from './entities/tipo-cambio.entity';
import { ConfiguracionService } from '../../common/services/configuracion.service';
import * as XLSX from 'xlsx';
import { ImportarExcelResponseDto } from './dto/importar-excel-response.dto';

export interface UfvExcelEstructura {
    anio_fila: number;
    anio_columna: number;
    fila_cabecera_meses: number;
    fila_inicio_dias: number;
    columna_dias: number;
    columnas_meses: number;
    meses_validos: string[];
    anio_minimo: number;
    anio_maximo: number;
}

export interface UfvExcelValidacion {
    max_size_bytes: number;
    allowed_extensions: string[];
    allowed_mimetypes: string[];
    max_columnas: number;
    max_filas: number;
}

export interface GuardarUfvResult {
    insertado: boolean;
}

export interface GestionesDisponiblesResult {
    gestiones: number[];
    ultima_gestion: number;
    total_gestiones: number;
}

export interface ValoresInicialesResult {
    fecha_cotizacion: string;
    factor_compra: number | null;
    factor_venta: number;
    origen_moneda_id: number;
    destino_moneda_id: number;
}

@Injectable()
export class TiposCambiosService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'tipos_cambios',
        nombreEntidad: 'TipoCambio',
        campoPK: 'tipo_cambio_id',
        alias: 't',
        responseDto: TipoCambioResponseDto,
        camposBusquedaEnQ: FindTiposCambiosQueryDto.getCamposParaQ(),
        tablasDependientes: FindTiposCambiosQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [
            { nombreCampo: 'origen_moneda_id', nombreColumna: 'origen_moneda_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'destino_moneda_id', nombreColumna: 'destino_moneda_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'fecha_desde', nombreColumna: 'fecha_cotizacion', tipoDatoFiltro: 'date', operador: 'gte' },
            { nombreCampo: 'fecha_hasta', nombreColumna: 'fecha_cotizacion', tipoDatoFiltro: 'date', operador: 'lte' }
        ],
        camposFiltroEspecial: [
            {
                nombreCampo: 'gestion',
                handler: (value, _queryDto, alias, paramIndexRef, params) => {
                    params.push(value);
                    return `EXTRACT(YEAR FROM ${alias}.fecha_cotizacion) = $${paramIndexRef.current++}`;
                }
            }
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'tipo_cambio_id',
            camposPermitidosParaOrdenar: FindTiposCambiosQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindTiposCambiosQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindTiposCambiosQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly configuracionService: ConfiguracionService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    async obtenerValoresIniciales(usuarioId: number, destinoMonedaId?: number): Promise<ValoresInicialesResult> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        try {
            const destinoId = destinoMonedaId || TipoMoneda.UFV;

            const ultimaTasaRows = await this.dataSource.query(
                `SELECT origen_moneda_id, destino_moneda_id, fecha_cotizacion::text AS fecha_max, factor_compra, factor_venta
                FROM tipos_cambios
                WHERE estado_id IN ($1, $2)
                    AND destino_moneda_id = $3
                ORDER BY fecha_cotizacion DESC, tipo_cambio_id DESC
                LIMIT 1`,
                [ESTADO_ACTIVO, ESTADO_HISTORICO, destinoId]
            );

            const ultimaTasa = ultimaTasaRows[0];

            if (ultimaTasa) {
                const fechaMax = new Date(ultimaTasa.fecha_max);
                fechaMax.setUTCDate(fechaMax.getUTCDate() + 1);
                const fechaSiguienteStr = fechaMax.toISOString().split('T')[0] as string;

                return {
                    fecha_cotizacion: fechaSiguienteStr,
                    factor_compra: ultimaTasa.factor_compra ? Number(ultimaTasa.factor_compra) : null,
                    factor_venta: Number(ultimaTasa.factor_venta),
                    origen_moneda_id: Number(ultimaTasa.origen_moneda_id),
                    destino_moneda_id: Number(ultimaTasa.destino_moneda_id),
                };
            }

            return {
                fecha_cotizacion: '2024-01-01',
                factor_compra: 0,
                factor_venta: 0,
                origen_moneda_id: TipoMoneda.BOLIVIANO,
                destino_moneda_id: destinoId,
            };

        } catch (error: unknown) {
            if (isDomainException(error)) throw error;
            const errorMessage = getErrorMessage(error);
            this.logger.error(`Error al obtener valores iniciales: ${errorMessage}`, getErrorStack(error));
            throw crearError(error, 'los valores iniciales', 'crear');
        }
    }

    async create(dto: CreateTipoCambioDto, usuarioId: number): Promise<TipoCambioResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            this.validarReglasNegocio(dto);

            const fechaMaxRows = await manager.query(
                `SELECT MAX(fecha_cotizacion)::text AS fecha_max
                FROM tipos_cambios
                WHERE origen_moneda_id = $1 AND destino_moneda_id = $2
                AND estado_id IN ($3, $4)`,
                [dto.origen_moneda_id, dto.destino_moneda_id, ESTADO_ACTIVO, ESTADO_HISTORICO]
            );

            const fechaMax = fechaMaxRows[0]?.fecha_max;
            const fechaNueva = new Date(dto.fecha_cotizacion);

            if (fechaMax) {
                const fechaMaxDate = new Date(fechaMax);
                if (fechaNueva <= fechaMaxDate) {
                    throw new DomainException(
                        `La fecha de cotización (${dto.fecha_cotizacion}) debe ser posterior a la última fecha registrada (${fechaMax}).`,
                        { httpStatus: HttpStatus.CONFLICT }
                    );
                }
            } else {
                const valoresIniciales = await this.configuracionService
                    .obtenerValorTipado<ValoresInicialesResult>('valores_iniciales_tipo_cambio');

                const fechaInicioStr = valoresIniciales?.fecha_cotizacion ?? '2023-01-01';
                const fechaNuevaStrFormat = fechaNueva.toISOString().split('T')[0] as string;

                if (fechaNuevaStrFormat < fechaInicioStr) {
                    throw new DomainException(
                        `La primera cotización no puede ser anterior a la fecha de inicio configurada (${fechaInicioStr}).`,
                        { httpStatus: HttpStatus.BAD_REQUEST }
                    );
                }
            }

            const tasaActiva = await manager.query(
                `SELECT tipo_cambio_id FROM tipos_cambios
                WHERE origen_moneda_id = $1 AND destino_moneda_id = $2 AND estado_id = $3
                FOR UPDATE`,
                [dto.origen_moneda_id, dto.destino_moneda_id, ESTADO_ACTIVO],
            );

            if (tasaActiva.length > 0) {
                await manager.query(
                    `UPDATE tipos_cambios
                    SET estado_id = $1, usuario_id_actualizacion = $2, fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE origen_moneda_id = $3 AND destino_moneda_id = $4 AND estado_id = $5`,
                    [ESTADO_HISTORICO, usuarioId, dto.origen_moneda_id, dto.destino_moneda_id, ESTADO_ACTIVO],
                );
            }

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const tipoCambio = manager.create(TipoCambio, {
                ...dto,
                factor_compra: dto.destino_moneda_id === TipoMoneda.UFV ? null : dto.factor_compra,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(tipoCambio);
                return this.findOne<TipoCambioResponseDto>(saved.tipo_cambio_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el tipo de cambio', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateTipoCambioDto, usuarioId: number): Promise<TipoCambioResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            const camposInmutables = ['origen_moneda_id', 'destino_moneda_id', 'fecha_cotizacion'];
            const camposEnviados = camposInmutables.filter(c => c in dto);
            if (camposEnviados.length > 0) {
                throw new DomainException(
                    `Los campos ${camposEnviados.join(', ')} no son editables. ` +
                    `Para cambiar la fecha o la combinación de monedas, registre una nueva tasa ACTIVA.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            await this.tablaValidador.validarPreUpdate(
                this.nombreTabla,
                id,
                dto,
                this.campoPK,
                usuarioId,
                manager,
            );

            const tipoCambioActual = await manager.findOne(TipoCambio, {
                where: { [this.campoPK]: id },
                lock: { mode: 'pessimistic_write' },
            });

            if (!tipoCambioActual) {
                throw new DomainException(
                    'Tipo de cambio no encontrado.',
                    { httpStatus: HttpStatus.NOT_FOUND },
                );
            }

            if (Number(tipoCambioActual.estado_id) !== ESTADO_ACTIVO) {
                throw new DomainException(
                    'Solo se pueden editar tasas ACTIVAS. Las históricas y borradas son inmutables.',
                    { httpStatus: HttpStatus.FORBIDDEN },
                );
            }

            const enUsoAmortizaciones = await manager.query(
                `SELECT 1 FROM amortizaciones_vacunos
                WHERE estado_id IN ($1, $2)
                AND fecha_cotizacion_ufv = $3
                AND (
                    cotizacion_ufv_aplicada BETWEEN $4 AND $5
                    OR valor_residual_ufv IS NOT NULL
                )
                LIMIT 1`,
                [
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                    tipoCambioActual.fecha_cotizacion,
                    tipoCambioActual.factor_compra,
                    tipoCambioActual.factor_venta,
                ],
            );

            const enUsoVacunos = await manager.query(
                `SELECT 1 FROM vacunos
                WHERE estado_id IN ($1, $2)
                AND fecha_ingreso = $3
                AND (valor_adquisicion_ufv IS NOT NULL OR valor_residual_ufv IS NOT NULL)
                LIMIT 1`,
                [ESTADO_ACTIVO, ESTADO_BORRADO, tipoCambioActual.fecha_cotizacion],
            );

            const estaEnUso = enUsoAmortizaciones.length > 0 || enUsoVacunos.length > 0;

            if (estaEnUso) {
                const intentaCambiarFactores =
                    (dto.factor_compra !== undefined && Number(dto.factor_compra) !== Number(tipoCambioActual.factor_compra)) ||
                    (dto.factor_venta !== undefined && Number(dto.factor_venta) !== Number(tipoCambioActual.factor_venta));

                if (intentaCambiarFactores) {
                    throw new DomainException(
                        'Esta tasa fue usada en vacunos o amortizaciones. Sus factores (compra/venta) son inmutables. ' +
                        'Registre una nueva tasa ACTIVA en su lugar.',
                        { httpStatus: HttpStatus.CONFLICT },
                    );
                }
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindTiposCambiosQueryDto.getDependencias(),
                FindTiposCambiosQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager,
            );

            const merged = { ...tipoCambioActual, ...dtoProcesado };
            this.validarReglasNegocio(merged);

            manager.merge(TipoCambio, tipoCambioActual, dtoProcesado);
            tipoCambioActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(tipoCambioActual);
                return this.findOne<TipoCambioResponseDto>(saved.tipo_cambio_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(
                    `Error inesperado en update - tipos-cambios ID:${id}: ${errorMessage}`,
                    getErrorStack(error),
                );
                throw crearError(error, 'el tipo de cambio', 'actualizar');
            }
        });
    }

    override async remove<T = TipoCambioResponseDto>(id: number, usuarioId: number): Promise<T> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPreDelete(
                this.nombreTabla,
                id,
                [],
                this.campoPK,
                usuarioId,
                manager,
            );

            const tipoCambio = await manager.findOne(TipoCambio, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' },
            });

            if (!tipoCambio) {
                throw new DomainException(
                    'Tipo de cambio no encontrado o inactivo.',
                    { httpStatus: HttpStatus.NOT_FOUND },
                );
            }

            const enUso = await manager.query(
                `SELECT 1 FROM amortizaciones_vacunos
                WHERE estado_id IN ($1, $2)
                AND fecha_cotizacion_ufv = $3
                AND cotizacion_ufv_aplicada BETWEEN $4 AND $5
                LIMIT 1`,
                [
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                    tipoCambio.fecha_cotizacion,
                    tipoCambio.factor_compra,
                    tipoCambio.factor_venta,
                ],
            );

            if (enUso.length > 0) {
                throw new DomainException(
                    'Esta tasa fue usada en amortizaciones y no puede borrarse. ' +
                    'Use ARCHIVAR en su lugar.',
                    { httpStatus: HttpStatus.CONFLICT },
                );
            }

            await manager.query(
                `UPDATE tipos_cambios
                SET estado_id = $1,
                    usuario_id_baja = $2,
                    fecha_baja = CURRENT_TIMESTAMP
                WHERE tipo_cambio_id = $3`,
                [ESTADO_BORRADO, usuarioId, id],
            );

            const historica = await manager.query(
                `SELECT tc.tipo_cambio_id,
                        tc.fecha_cotizacion,
                        (SELECT 1 FROM amortizaciones_vacunos av
                        WHERE av.estado_id IN ($4, $5)
                        AND av.fecha_cotizacion_ufv = tc.fecha_cotizacion
                        AND av.cotizacion_ufv_aplicada BETWEEN tc.factor_compra AND tc.factor_venta
                        LIMIT 1) AS en_uso
                FROM tipos_cambios tc
                WHERE tc.origen_moneda_id = $1
                AND tc.destino_moneda_id = $2
                AND tc.estado_id = $3
                ORDER BY tc.fecha_cotizacion DESC
                LIMIT 1
                FOR UPDATE`,
                [
                    tipoCambio.origen_moneda_id,
                    tipoCambio.destino_moneda_id,
                    ESTADO_HISTORICO,
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                ],
            );

            if (historica.length === 0) {
                this.logger.warn(
                    `Combinación ${tipoCambio.origen_moneda_id}→${tipoCambio.destino_moneda_id} ` +
                    `quedó SIN tasa ACTIVA tras borrar tasa ${id}. No hay histórica para reactivar.`,
                );
            } else if (historica[0].en_uso) {
                this.logger.warn(
                    `NO se reactiva la tasa histórica ${historica[0].tipo_cambio_id} ` +
                    `(${historica[0].fecha_cotizacion}) porque está siendo usada por amortizaciones. ` +
                    `La combinación ${tipoCambio.origen_moneda_id}→${tipoCambio.destino_moneda_id} ` +
                    `queda SIN tasa ACTIVA. Se recomienda notificar al administrador.`,
                );
            } else {
                try {
                    await manager.query(
                        `UPDATE tipos_cambios
                        SET estado_id = $1,
                            usuario_id_actualizacion = NULL,
                            fecha_actualizacion = NULL
                        WHERE tipo_cambio_id = $2`,
                        [ESTADO_ACTIVO, historica[0].tipo_cambio_id],
                    );

                    this.logger.log(
                        `Tasa histórica ${historica[0].tipo_cambio_id} ` +
                        `(${historica[0].fecha_cotizacion}) reactivada automáticamente ` +
                        `tras borrar tasa ${id} ` +
                        `(combinación ${tipoCambio.origen_moneda_id}→${tipoCambio.destino_moneda_id}).`,
                    );
                } catch (error) {
                    this.logger.error(
                        `Error al reactivar la tasa histórica ${historica[0].tipo_cambio_id}: ` +
                        `${getErrorMessage(error)}`,
                        getErrorStack(error),
                    );
                    throw new DomainException(
                        'La tasa se borró pero no se pudo reactivar la histórica. ' +
                        'La transacción se revertirá. Contacte al administrador.',
                        { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
                    );
                }
            }

            return this.findOne<T>(id, usuarioId, manager);
        });
    }

    private validarReglasNegocio(data: Record<string, any>): void {
        const origen = Number(data['origen_moneda_id']);
        const destino = Number(data['destino_moneda_id']);

        if (origen !== TipoMoneda.BOLIVIANO) {
            throw new DomainException(
                'El campo origen_moneda_id debe ser (BOLIVIANO). La moneda base del sistema es fija.',
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const destinosPermitidos = [TipoMoneda.DOLAR, TipoMoneda.EURO, TipoMoneda.UFV];
        if (!destinosPermitidos.includes(destino)) {
            throw new DomainException(
                'El campo destino_moneda_id debe ser (DÓLAR), (EURO) o (UFV).',
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (origen === destino) {
            throw new DomainException(
                'origen_moneda_id y destino_moneda_id no pueden ser iguales.',
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const esUfv = destino === TipoMoneda.UFV;

        if (esUfv) {
            if (data['factor_compra'] !== null && data['factor_compra'] !== undefined) {
                throw new DomainException(
                    'Para la UFV, factor_compra debe ser null.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (data['factor_venta'] === null || data['factor_venta'] === undefined || Number(data['factor_venta']) <= 0) {
                throw new DomainException(
                    'Para la UFV, factor_venta es obligatorio y debe ser mayor a 0.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        } else {
            if (data['factor_compra'] === null || data['factor_compra'] === undefined) {
                throw new DomainException(
                    'Para divisas (Dólar/Euro), factor_compra es obligatorio.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
            if (data['factor_venta'] === null || data['factor_venta'] === undefined) {
                throw new DomainException(
                    'Para divisas (Dólar/Euro), factor_venta es obligatorio.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
            if (Number(data['factor_compra']) <= 0 || Number(data['factor_venta']) <= 0) {
                throw new DomainException(
                    'Los factores de compra y venta deben ser mayores a 0.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
            if (Number(data['factor_compra']) > Number(data['factor_venta'])) {
                throw new DomainException(
                    'factor_compra no puede ser mayor que factor_venta.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }
    }

    async borrarGestion(
        gestion: number,
        usuarioId: number,
    ): Promise<{
        total: number;
        borradas: number;
        reactivadas: number;
        omitidasPorUso: number;
    }> {
        if (!Number.isInteger(gestion) || gestion < 1900) {
            throw new DomainException(
                `La gestión ${gestion} es inválida. Debe ser un año mayor o igual a 1900.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'eliminar', manager);

            const ultimaGestionRows = await manager.query(
                `SELECT MAX(EXTRACT(YEAR FROM fecha_cotizacion))::int AS ultima_gestion
                FROM tipos_cambios
                WHERE estado_id IN ($1, $2)`,
                [ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            const ultima = ultimaGestionRows[0]?.ultima_gestion;

            if (ultima == null) {
                throw new DomainException('No existen tasas de cambio registradas.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            if (Number(gestion) !== Number(ultima)) {
                throw new DomainException(
                    `Solo se puede borrar la última gestión (${ultima}). La gestión ${gestion} es anterior.`,
                    { httpStatus: HttpStatus.CONFLICT },
                );
            }

            const enUso = await manager.query(
                `SELECT 'vacunos' AS tabla, COUNT(*) as cantidad
                FROM vacunos v
                INNER JOIN tipos_cambios tc ON v.fecha_ingreso = tc.fecha_cotizacion
                WHERE EXTRACT(YEAR FROM tc.fecha_cotizacion) = $1
                AND tc.origen_moneda_id = $2 AND tc.destino_moneda_id = $3
                AND v.estado_id IN ($4, $5)
                AND (v.valor_adquisicion_ufv IS NOT NULL OR v.valor_residual_ufv IS NOT NULL)
                UNION ALL
                SELECT 'amortizaciones_vacunos' AS tabla, COUNT(*) as cantidad
                FROM amortizaciones_vacunos av
                INNER JOIN tipos_cambios tc ON av.fecha_cotizacion_ufv = tc.fecha_cotizacion
                WHERE EXTRACT(YEAR FROM tc.fecha_cotizacion) = $1
                AND tc.origen_moneda_id = $2 AND tc.destino_moneda_id = $3
                AND av.estado_id IN ($6, $7)`,
                [
                    gestion,
                    TipoMoneda.BOLIVIANO,
                    TipoMoneda.UFV,
                    ESTADO_ACTIVO,
                    ESTADO_BORRADO,
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                ],
            );

            const usosVacunos = Number(enUso.find((r: any) => r.tabla === 'vacunos')?.cantidad || 0);
            const usosAmortizaciones = Number(enUso.find((r: any) => r.tabla === 'amortizaciones_vacunos')?.cantidad || 0);

            if (usosVacunos > 0 || usosAmortizaciones > 0) {
                throw new DomainException(
                    `Operación denegada: No se puede borrar la gestión ${gestion} porque hay dependencias activas. ` +
                    `Existen ${usosVacunos} vacuno(s) y ${usosAmortizaciones} amortización(es) que usan las tasas de este periodo.`,
                    { httpStatus: HttpStatus.CONFLICT },
                );
            }

            const combinaciones = await manager.query(
                `SELECT DISTINCT origen_moneda_id, destino_moneda_id
                FROM tipos_cambios
                WHERE EXTRACT(YEAR FROM fecha_cotizacion) = $1
                AND estado_id IN ($2, $3)`,
                [gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            const updateResult = await manager.query(
                `UPDATE tipos_cambios
                SET estado_id = $1,
                    usuario_id_baja = $2,
                    fecha_baja = CURRENT_TIMESTAMP,
                    usuario_id_actualizacion = NULL,
                    fecha_actualizacion = NULL
                WHERE EXTRACT(YEAR FROM fecha_cotizacion) = $3
                AND estado_id IN ($4, $5)`,
                [ESTADO_BORRADO, usuarioId, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            const borradas = updateResult.rowCount || 0;

            let reactivadas = 0;
            for (const comp of combinaciones) {
                const reactivada = await this.reactivarHistoricaSiProcede(
                    manager,
                    comp.origen_moneda_id,
                    comp.destino_moneda_id,
                    usuarioId
                );
                if (reactivada) reactivadas++;
            }

            this.logger.log(
                `Gestión ${gestion} borrada: total=${borradas}, reactivadas=${reactivadas}.`
            );

            return {
                total: borradas,
                borradas: borradas,
                reactivadas: reactivadas,
                omitidasPorUso: 0
            };
        });
    }

    private async reactivarHistoricaSiProcede(
        manager: EntityManager,
        origenMonedaId: number,
        destinoMonedaId: number,
        _usuarioId: number,
    ): Promise<boolean> {
        const ultimaGestionRows = await manager.query(
            `SELECT MAX(EXTRACT(YEAR FROM fecha_cotizacion))::int AS ultima_gestion
            FROM tipos_cambios
            WHERE estado_id IN ($1, $2)`,
            [ESTADO_ACTIVO, ESTADO_HISTORICO],
        );

        const ultimaGestion = ultimaGestionRows[0]?.ultima_gestion;

        if (ultimaGestion == null) {
            this.logger.warn(
                `No existen tasas registradas. No hay histórica para reactivar ` +
                `(combinación ${origenMonedaId}→${destinoMonedaId}).`,
            );
            return false;
        }

        const historica = await manager.query(
            `SELECT tc.tipo_cambio_id,
                    tc.fecha_cotizacion,
                    (SELECT 1 FROM amortizaciones_vacunos av
                    WHERE av.estado_id IN ($4, $5)
                    AND av.fecha_cotizacion_ufv = tc.fecha_cotizacion
                    AND av.cotizacion_ufv_aplicada BETWEEN tc.factor_compra AND tc.factor_venta
                    LIMIT 1) AS en_uso
            FROM tipos_cambios tc
            WHERE tc.origen_moneda_id = $1
            AND tc.destino_moneda_id = $2
            AND tc.estado_id = $3
            AND EXTRACT(YEAR FROM tc.fecha_cotizacion) = $6
            ORDER BY tc.tipo_cambio_id DESC
            LIMIT 1
            FOR UPDATE`,
            [origenMonedaId, destinoMonedaId, ESTADO_HISTORICO, ESTADO_ACTIVO, ESTADO_HISTORICO, ultimaGestion],
        );

        if (historica.length === 0) {
            this.logger.warn(
                `Combinación ${origenMonedaId}→${destinoMonedaId} quedó SIN tasa ACTIVA. ` +
                `No hay histórica en la última gestión (${ultimaGestion}) para reactivar.`,
            );
            return false;
        }

        if (historica[0].en_uso) {
            this.logger.warn(
                `NO se reactiva la tasa histórica ${historica[0].tipo_cambio_id} ` +
                `(${historica[0].fecha_cotizacion}) porque está en uso por amortizaciones. ` +
                `La combinación ${origenMonedaId}→${destinoMonedaId} queda SIN tasa ACTIVA.`,
            );
            return false;
        }

        try {
            await manager.query(
                `UPDATE tipos_cambios
                SET estado_id = $1, usuario_id_actualizacion = NULL, fecha_actualizacion = NULL
                WHERE tipo_cambio_id = $2`,
                [ESTADO_ACTIVO, historica[0].tipo_cambio_id],
            );

            this.logger.log(
                `Tasa histórica ${historica[0].tipo_cambio_id} (${historica[0].fecha_cotizacion}) ` +
                `reactivada automáticamente (combinación ${origenMonedaId}→${destinoMonedaId}, ` +
                `gestión ${ultimaGestion}).`,
            );
            return true;
        } catch (error) {
            this.logger.error(
                `Error al reactivar la tasa histórica ${historica[0].tipo_cambio_id}: ${getErrorMessage(error)}`,
                getErrorStack(error),
            );
            throw new DomainException(
                'La tasa se borró pero no se pudo reactivar la histórica. ' +
                'La transacción se revertirá. Contacte al administrador.',
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

    async obtenerGestionesDisponibles(
        usuarioId: number,
    ): Promise<GestionesDisponiblesResult> {
        await this.tablaValidador.validarPermisoTabla(
            usuarioId,
            this.nombreTabla,
            'leer',
        );

        try {
            const rows = await this.dataSource.query(
                `SELECT DISTINCT EXTRACT(YEAR FROM fecha_cotizacion)::int AS gestion
                FROM tipos_cambios
                WHERE estado_id IN ($1, $2)
                AND tipo_cambio_id > 1
                ORDER BY gestion DESC`,
                [ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            const gestiones: number[] = (rows ?? [])
                .map((r: { gestion: number | string }) => Number(r.gestion))
                .filter((g: number) => Number.isInteger(g));

            return {
                gestiones,
                ultima_gestion: gestiones.length > 0 ? gestiones[0]! : 0,
                total_gestiones: gestiones.length,
            };
        } catch (error: unknown) {
            if (isDomainException(error)) throw error;
            const errorMessage = getErrorMessage(error);
            this.logger.error(
                `Error al obtener gestiones disponibles: ${errorMessage}`,
                getErrorStack(error),
            );
            throw crearError(error, 'las gestiones disponibles', 'crear');
        }
    }

    async importarDesdeExcel(
        file: Express.Multer.File,
        usuarioId: number,
    ): Promise<ImportarExcelResponseDto> {
        if (!file) {
            throw new DomainException('No se envió ningún archivo.', { httpStatus: HttpStatus.BAD_REQUEST });
        }

        const estructura = await this.configuracionService.obtenerValorTipado<UfvExcelEstructura>('ufv_excel_estructura');
        const validacion = await this.configuracionService.obtenerValorTipado<UfvExcelValidacion>('ufv_excel_validacion');

        if (!estructura || !validacion) {
            throw new DomainException(
                'La configuración de importación de Excel no está definida en parametros_globales.',
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }

        if (file.size > validacion.max_size_bytes) {
            throw new DomainException(
                `El archivo excede el tamaño máximo permitido (${validacion.max_size_bytes / 1024 / 1024} MB).`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const extension = file.originalname.split('.').pop()?.toLowerCase();
        if (!extension || !validacion.allowed_extensions.includes(extension)) {
            throw new DomainException(
                `Extensión de archivo no permitida. Solo se aceptan: ${validacion.allowed_extensions.join(', ')}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (!validacion.allowed_mimetypes.includes(file.mimetype)) {
            throw new DomainException(
                `Tipo MIME no permitido (${file.mimetype}).`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName!];

        if (!worksheet) {
            throw new DomainException('El archivo no contiene hojas de cálculo.', { httpStatus: HttpStatus.BAD_REQUEST });
        }

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rows.length > validacion.max_filas) {
            throw new DomainException(
                `El archivo excede el número máximo de filas (${validacion.max_filas}).`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const maxCols = Math.max(...rows.map(r => r.length));
        if (maxCols > validacion.max_columnas) {
            throw new DomainException(
                `El archivo excede el número máximo de columnas (${validacion.max_columnas}).`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const celdaAnio = String(rows[estructura.anio_fila]?.[estructura.anio_columna] || '');
        const match = celdaAnio.match(/AÑO\s+(\d{4})/i);
        if (!match) {
            throw new DomainException(
                `No se encontró el año en la celda [${estructura.anio_fila}, ${estructura.anio_columna}]. Formato esperado: "AÑO XXXX".`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const anio = parseInt(match[1]!);
        if (anio < estructura.anio_minimo || anio > estructura.anio_maximo) {
            throw new DomainException(
                `El año ${anio} está fuera del rango permitido (${estructura.anio_minimo} - ${estructura.anio_maximo}).`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const cabecera = rows[estructura.fila_cabecera_meses];
        if (!cabecera) {
            throw new DomainException(
                `La fila de cabecera de meses (${estructura.fila_cabecera_meses}) está vacía.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        for (let i = 0; i < estructura.columnas_meses; i++) {
            const colIndex = estructura.columna_dias + 1 + i;
            const mesEsperado = estructura.meses_validos[i];
            const mesActual = String(cabecera[colIndex] || '').trim().toUpperCase();

            if (!mesEsperado || mesActual !== mesEsperado) {
                throw new DomainException(
                    `Cabecera inválida en la columna ${colIndex + 1}. Se esperaba "${mesEsperado}" pero se encontró "${mesActual}".`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

               let filaInicioDatos = -1;
        for (let i = estructura.fila_inicio_dias; i < rows.length; i++) {
            const celdaDia = rows[i]?.[estructura.columna_dias];
            const diaStr = String(celdaDia || '').trim();

            if (diaStr === '1') {
                filaInicioDatos = i;
                break;
            }
        }

        if (filaInicioDatos === -1) {
            throw new DomainException(
                `Formato de Excel inválido: No se encontró el día "1" en la columna ${estructura.columna_dias + 1} a partir de la fila ${estructura.fila_inicio_dias}. Verifique que el archivo sea el original del BCB.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const mapaExcel = new Map<string, number>();
        for (let i = filaInicioDatos; i < rows.length; i++) {
            const celdaDia = rows[i]?.[estructura.columna_dias];
            const diaStr = String(celdaDia || '').trim();

            if (!/^\d+$/.test(diaStr)) break;

            const dia = parseInt(diaStr);

            for (let m = 0; m < estructura.columnas_meses; m++) {
                const colIndex = estructura.columna_dias + 1 + m;
                const valorCelda = rows[i]![colIndex];

                if (valorCelda !== undefined && valorCelda !== null && String(valorCelda).trim() !== '') {
                    try {
                        const valorLimpio = String(valorCelda).replace(/[↑↓\s]/g, '').replace(',', '.');
                        const parsed = parseFloat(valorLimpio);

                        if (!isNaN(parsed) && parsed > 0) {
                            mapaExcel.set(`${dia}-${m + 1}`, parsed);
                        }
                    } catch (e) {
                    }
                }
            }
        }

        const dataAInsertar: Partial<TipoCambio>[] = [];
        const detallesErrores: string[] = [];
        let procesados = 0;
        let errores = 0;
        let ultimoFactorValido: number | null = null;

        for (let m = 0; m < 12; m++) {
            const diasEnMes = new Date(Date.UTC(anio, m + 1, 0)).getUTCDate();

            for (let dia = 1; dia <= diasEnMes; dia++) {
                procesados++;
                const key = `${dia}-${m + 1}`;
                let factor: number | null = null;

                if (mapaExcel.has(key)) {
                    factor = mapaExcel.get(key)!;
                    ultimoFactorValido = factor;
                } else {
                    if (ultimoFactorValido !== null) {
                        factor = ultimoFactorValido;
                    } else {
                        errores++;
                        if (detallesErrores.length < 10) {
                            detallesErrores.push(`Mes ${m + 1}, Día ${dia}: Celda vacía y no hay valor previo para replicar.`);
                        }
                        continue;
                    }
                }

                const mm = String(m + 1).padStart(2, '0');
                const dd = String(dia).padStart(2, '0');
                const fechaStr = `${anio}-${mm}-${dd}`;

                dataAInsertar.push({
                    origen_moneda_id: TipoMoneda.BOLIVIANO,
                    destino_moneda_id: TipoMoneda.UFV,
                    factor_compra: null,
                    factor_venta: factor,
                    fecha_cotizacion: fechaStr as any,
                    estado_id: ESTADO_HISTORICO,
                    usuario_id_registro: usuarioId,
                    usuario_id_actualizacion: usuarioId,
                    fecha_actualizacion: new Date(),
                });
            }
        }

        if (errores > 0) {
            throw new DomainException(
                `La importación contiene ${errores} errores. No se insertaron registros.`,
                {
                    httpStatus: HttpStatus.BAD_REQUEST,
                    // Si tu DomainException lo permite, agrega los detalles aquí:
                    // details: detallesErrores
                },
            );
        }

        if (dataAInsertar.length === 0) {
            return { procesados, insertados: 0, errores: 0, mensaje: 'No se encontraron datos válidos.', detalles_errores: [] };
        }

        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            const existentes = await manager.query(
                `SELECT 1 FROM tipos_cambios
                WHERE origen_moneda_id = $1 AND destino_moneda_id = $2
                AND EXTRACT(YEAR FROM fecha_cotizacion) = $3
                AND estado_id IN ($4, $5)
                LIMIT 1`,
                [TipoMoneda.BOLIVIANO, TipoMoneda.UFV, anio, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            if (existentes.length > 0) {
                throw new DomainException(
                    `Ya existen tasas registradas para la gestión ${anio}. Borre la gestión actual antes de importar.`,
                    { httpStatus: HttpStatus.CONFLICT },
                );
            }

            dataAInsertar.sort((a, b) =>
                String(a.fecha_cotizacion).localeCompare(String(b.fecha_cotizacion))
            );

            let insertados = 0;
            const chunkSize = 500;
            const fechaActualizacion = new Date();

            for (let i = 0; i < dataAInsertar.length; i += chunkSize) {
                const chunk = dataAInsertar.slice(i, i + chunkSize);
                const values: string[] = [];
                const params: any[] = [];
                let idx = 1;

                for (const item of chunk) {
                    values.push(
                        `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, ` +
                        `$${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
                    );
                    params.push(
                        item.origen_moneda_id,
                        item.destino_moneda_id,
                        item.factor_compra,
                        item.factor_venta,
                        item.fecha_cotizacion,
                        item.estado_id,
                        item.usuario_id_registro,
                        item.usuario_id_actualizacion,
                        fechaActualizacion,
                        null,
                    );
                }

                await manager.query(
                    `INSERT INTO tipos_cambios
                    (origen_moneda_id, destino_moneda_id, factor_compra, factor_venta,
                    fecha_cotizacion, estado_id, usuario_id_registro,
                    usuario_id_actualizacion, fecha_actualizacion, usuario_id_baja)
                    VALUES ${values.join(', ')}`,
                    params,
                );
                insertados += chunk.length;
            }

            const ultimoRegistro = await manager.query(
                `SELECT tipo_cambio_id
                FROM tipos_cambios
                WHERE origen_moneda_id = $1 AND destino_moneda_id = $2
                AND EXTRACT(YEAR FROM fecha_cotizacion) = $3
                AND estado_id = $4
                ORDER BY fecha_cotizacion DESC
                LIMIT 1`,
                [TipoMoneda.BOLIVIANO, TipoMoneda.UFV, anio, ESTADO_HISTORICO],
            );

            if (ultimoRegistro.length === 0) {
                throw new DomainException(
                    'No se pudo encontrar el registro más reciente para activarlo.',
                    { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
                );
            }

            const idUltimo = ultimoRegistro[0].tipo_cambio_id;

            await manager.query(
                `UPDATE tipos_cambios
                SET estado_id = $1,
                    usuario_id_actualizacion = $2,
                    fecha_actualizacion = CURRENT_TIMESTAMP
                WHERE tipo_cambio_id = $3`,
                [ESTADO_ACTIVO, usuarioId, idUltimo],
            );

            return {
                procesados,
                insertados,
                errores,
                mensaje: `Se importaron ${insertados} registros de la gestión ${anio}.`,
                detalles_errores: detallesErrores,
            };
        });
    }

    async obtenerEstadoGestion(
        gestion: number,
        usuarioId: number,
    ): Promise<EstadoGestionResponseDto> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        const esBisiesto = (gestion % 4 === 0 && gestion % 100 !== 0) || (gestion % 400 === 0);
        const totalDiasEsperados = esBisiesto ? 366 : 365;
        const monedasDestino = [TipoMoneda.DOLAR, TipoMoneda.EURO, TipoMoneda.UFV];

        const resultados: EstadoGestionMonedaDto[] = [];

        for (const destinoId of monedasDestino) {
            const registradosRows = await this.dataSource.query(
                `SELECT COUNT(DISTINCT fecha_cotizacion)::int AS total
                FROM tipos_cambios
                WHERE EXTRACT(YEAR FROM fecha_cotizacion) = $1
                AND origen_moneda_id = $2
                AND destino_moneda_id = $3
                AND estado_id IN ($4, $5)`,
                [
                    gestion,
                    TipoMoneda.BOLIVIANO,
                    destinoId,
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                ],
            );

            const totalDiasRegistrados = Number(registradosRows[0]?.total ?? 0);
            const diasFaltantes = Math.max(0, totalDiasEsperados - totalDiasRegistrados);

            const meta = TIPO_MONEDA_METADATA[destinoId as TipoMoneda];

            resultados.push({
                destino_moneda_id: destinoId,
                destino_moneda_label: meta?.label ?? `Moneda ${destinoId}`,
                destino_moneda_abreviatura: meta?.abreviatura ?? '',
                total_dias_esperados: totalDiasEsperados,
                total_dias_registrados: totalDiasRegistrados,
                dias_faltantes: diasFaltantes,
                esta_completa: totalDiasRegistrados >= totalDiasEsperados,
            });
        }

        const estaCompletaGlobal = resultados.every(r => r.esta_completa);

        return {
            gestion,
            es_bisiesto: esBisiesto,
            monedas: resultados,
            esta_completa_global: estaCompletaGlobal,
            mensaje: estaCompletaGlobal
                ? `La gestión ${gestion} está completa para todas las monedas.`
                : `La gestión ${gestion} está incompleta para ${resultados.filter(r => !r.esta_completa).length} moneda(s).`,
        };
    }
}
