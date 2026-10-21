// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\tipos-cambios.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TipoMoneda, ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADO_BORRADO } from '../../common/constants/estados.constant';
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

export interface GuardarUfvResult {
    insertado: boolean;
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
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    async guardarUfvSiNoExiste(
        valor: number,
        fechaCotizacion: string,
        usuarioId: number = 1,
    ): Promise<GuardarUfvResult> {
        const existe = await this.dataSource.query(
            `SELECT 1 FROM tipos_cambios
             WHERE origen_moneda_id = $1
               AND destino_moneda_id = $2
               AND fecha_cotizacion = $3
               AND estado_id = $4
             LIMIT 1`,
            [TipoMoneda.BOLIVIANO, TipoMoneda.UFV, fechaCotizacion, ESTADO_ACTIVO],
        );

        if (existe.length > 0) {
            this.logger.debug(`UFV para ${fechaCotizacion} ya existe. Omitiendo.`);
            return { insertado: false };
        }

        await this.dataSource.query(
            `INSERT INTO tipos_cambios
                (origen_moneda_id, destino_moneda_id, factor_compra, factor_venta,
                 fecha_cotizacion, usuario_id_registro)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                TipoMoneda.BOLIVIANO,
                TipoMoneda.UFV,
                valor,
                valor,
                fechaCotizacion,
                usuarioId,
            ],
        );

        this.logger.log(`UFV insertada para ${fechaCotizacion}: ${valor} Bs`);
        return { insertado: true };
    }

    async create(dto: CreateTipoCambioDto, usuarioId: number): Promise<TipoCambioResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            this.validarReglasNegocio(dto);

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

            await this.tablaValidador.validarPreUpdate(
                this.nombreTabla,
                id,
                dto,
                this.campoPK,
                usuarioId,
                manager,
            );

            const tipoCambioActual = await manager.findOne(TipoCambio, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' },
            });

            if (!tipoCambioActual) {
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
                    tipoCambioActual.fecha_cotizacion,
                    tipoCambioActual.factor_compra,
                    tipoCambioActual.factor_venta,
                ],
            );

            if (enUso.length > 0) {
                throw new DomainException(
                    'Esta tasa fue usada en amortizaciones y no puede modificarse. ' +
                    'Registre una nueva tasa ACTIVA en su lugar.',
                    { httpStatus: HttpStatus.CONFLICT },
                );
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
                    'Esta tasa fue usada en amortizaciones y no puede borrarse. Use ARCHIVAR (1002) en su lugar.',
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
                `SELECT tipo_cambio_id FROM tipos_cambios
                WHERE origen_moneda_id = $1
                AND destino_moneda_id = $2
                AND estado_id = $3
                ORDER BY fecha_cotizacion DESC
                LIMIT 1`,
                [
                    tipoCambio.origen_moneda_id,
                    tipoCambio.destino_moneda_id,
                    ESTADO_HISTORICO,
                ],
            );

            if (historica.length > 0) {
                // R.8 — Reactivación AUTOMÁTICA: limpia usuario_id_actualizacion y fecha_actualizacion
                await manager.query(
                    `UPDATE tipos_cambios
                    SET estado_id = $1,
                        usuario_id_actualizacion = NULL,
                        fecha_actualizacion = NULL
                    WHERE tipo_cambio_id = $2`,
                    [ESTADO_ACTIVO, historica[0].tipo_cambio_id],
                );

                this.logger.log(
                    `Tasa histórica ${historica[0].tipo_cambio_id} reactivada automáticamente ` +
                    `tras borrar tasa ${id} (combinación ${tipoCambio.origen_moneda_id}→${tipoCambio.destino_moneda_id}).`,
                );
            } else {
                this.logger.warn(
                    `Combinación ${tipoCambio.origen_moneda_id}→${tipoCambio.destino_moneda_id} ` +
                    `quedó SIN tasa ACTIVA tras borrar tasa ${id}. No hay histórica para reactivar.`,
                );
            }

            return this.findOne<T>(id, usuarioId, manager);
        });
    }

    private validarReglasNegocio(data: Record<string, any>): void {
        if (Number(data['origen_moneda_id']) === Number(data['destino_moneda_id'])) {
            throw new DomainException(
                'origen_moneda_id y destino_moneda_id no pueden ser iguales.',
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
