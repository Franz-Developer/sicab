// C:\sistemas\sicab\sicab-backend\src\common\services\configuracion.service.ts
import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy, HttpStatus } from '@nestjs/common';
import { IDataSource } from '../interfaces/repository.interface';
import { ESTADO_ACTIVO, TipoDato } from '../constants/estados.constant';
import { DomainException } from '../exceptions/domain.exception';
import { RedisCacheService } from './redis-cache.service';

export interface ParametroGlobalConfig {
    parametro_id: number;
    clave: string;
    valor: string;
    tipo_dato_id: number;
    datos_json: any | null;
    editable: number;
}

@Injectable()
export class ConfiguracionService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ConfiguracionService.name);
    private cacheParametros: Map<string, ParametroGlobalConfig> = new Map();
    private ultimaCargaTimestamp: number = 0;
    private readonly CACHE_TTL_MS: number;
    private readonly MAX_REINTENTOS: number;
    private readonly DELAY_REINTENTO_MS: number;

    private readonly REDIS_CHANNEL = 'config:invalidate';
    private isRedisEnabled: boolean = false;
    private unsubscribeFn?: () => Promise<void>;

    constructor(
        @Inject('IDataSource') private readonly dataSource: IDataSource,
        private readonly redisCache: RedisCacheService,
    ) {
        this.CACHE_TTL_MS = parseInt(process.env['CONFIG_CACHE_TTL'] || '3600000', 10);
        this.MAX_REINTENTOS = parseInt(process.env['CONFIG_MAX_REINTENTOS'] || '5', 10);
        this.DELAY_REINTENTO_MS = parseInt(process.env['CONFIG_DELAY_REINTENTO_MS'] || '2000', 10);
        this.isRedisEnabled = process.env['USE_REDIS_CACHE'] === 'true';
    }

    async onModuleInit(): Promise<void> {
        // 1. Cargar configuración inicial con reintentos
        for (let intento = 1; intento <= this.MAX_REINTENTOS; intento++) {
            try {
                await this.cargarConfiguracionCompleta();
                this.logger.log(
                    `Configuración global cargada exitosamente ` +
                    `(${this.cacheParametros.size} parámetros, intento ${intento}/${this.MAX_REINTENTOS})`
                );
                break;
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                this.logger.warn(
                    `Intento ${intento}/${this.MAX_REINTENTOS} fallido al cargar configuración: ${errorMsg}`
                );

                if (intento === this.MAX_REINTENTOS) {
                    this.logger.error(
                        `No se pudo cargar la configuración después de ${this.MAX_REINTENTOS} intentos. ` +
                        `La aplicación no puede arrancar sin la configuración global.`
                    );
                    throw error;
                }

                await this.sleep(this.DELAY_REINTENTO_MS);
            }
        }

        // 2. Suscribirse al canal de invalidación (solo si Redis está habilitado)
        if (this.isRedisEnabled) {
            try {
                this.unsubscribeFn = await this.redisCache.subscribe(
                    this.REDIS_CHANNEL,
                    async () => {
                        this.logger.debug('Recibida notificación de invalidación de configuración. Recargando...');
                        try {
                            await this.cargarConfiguracionCompleta();
                        } catch (error) {
                            this.logger.error(
                                `Error al recargar configuración tras notificación: ${error instanceof Error ? error.message : error}`
                            );
                        }
                    },
                );
                this.logger.log(`Suscrito al canal Redis "${this.REDIS_CHANNEL}" para invalidación distribuida.`);
            } catch (error) {
                this.logger.error(
                    `No se pudo suscribir al canal Redis "${this.REDIS_CHANNEL}": ${error instanceof Error ? error.message : error}. ` +
                    `La invalidación distribuida queda deshabilitada. Se usará solo TTL.`
                );
            }
        } else {
            this.logger.log('Redis deshabilitado. La invalidación será solo por TTL (no distribuida).');
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.unsubscribeFn) {
            try {
                await this.unsubscribeFn();
            } catch (error) {
                this.logger.warn(`Error al desuscribirse del canal Redis: ${error instanceof Error ? error.message : error}`);
            }
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async cargarConfiguracionCompleta(): Promise<void> {
        const query = `
            SELECT parametro_id, clave, valor, tipo_dato_id, datos_json, editable
            FROM parametros_globales
            WHERE estado_id = $1
        `;
        const params = [ESTADO_ACTIVO];

        try {
            const resultados = await this.dataSource.query(query, params);

            this.cacheParametros.clear();
            if (Array.isArray(resultados)) {
                for (const row of resultados) {
                    this.cacheParametros.set(row.clave, {
                        parametro_id: Number(row.parametro_id),
                        clave: row.clave,
                        valor: row.valor,
                        tipo_dato_id: Number(row.tipo_dato_id),
                        datos_json: row.datos_json ?? null,
                        editable: Number(row.editable),
                    });
                }
            }
            this.ultimaCargaTimestamp = Date.now();
            this.logger.debug(`Se cargaron ${this.cacheParametros.size} parámetros globales en memoria.`);
        } catch (error) {
            this.logger.error(`Error al cargar configuración global: ${error}`);
            throw new DomainException(
                `Error crítico al cargar la configuración global desde la base de datos.`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR }
            );
        }
    }

    private async asegurarCacheVigente(): Promise<void> {
        // Fallback: TTL por si la suscripción no funciona o Redis está caído
        const ahora = Date.now();
        if (ahora - this.ultimaCargaTimestamp > this.CACHE_TTL_MS || this.cacheParametros.size === 0) {
            this.logger.warn('Caché de configuración expirada por TTL. Recargando...');
            await this.cargarConfiguracionCompleta();
        }
    }

    /**
     * Invalida la caché local y notifica a todas las instancias
     * suscritas al canal Redis para que recarguen también.
     */
    public async invalidarCache(): Promise<void> {
        this.logger.log('Invalidando caché de configuración global...');

        // 1. Recargar esta instancia
        await this.cargarConfiguracionCompleta();

        // 2. Notificar a las demás instancias vía Redis
        if (this.isRedisEnabled) {
            try {
                await this.redisCache.publish(this.REDIS_CHANNEL);
                this.logger.debug('Notificación de invalidación enviada al canal Redis.');
            } catch (error) {
                this.logger.error(
                    `Error al publicar notificación de invalidación en Redis: ${error instanceof Error ? error.message : error}. ` +
                    `Las demás instancias recargarán por TTL.`
                );
            }
        }
    }

    async obtenerParametro(clave: string): Promise<ParametroGlobalConfig | null> {
        await this.asegurarCacheVigente();
        return this.cacheParametros.get(clave) || null;
    }

    async obtenerValorTipado<T = any>(clave: string): Promise<T | null> {
        const param = await this.obtenerParametro(clave);
        if (!param) return null;

        switch (param.tipo_dato_id) {
            case TipoDato.INTEGER:
                return parseInt(param.valor, 10) as unknown as T;
            case TipoDato.DECIMAL:
                return parseFloat(param.valor) as unknown as T;
            case TipoDato.BOOLEAN:
                return (param.valor === '1' || param.valor.toLowerCase() === 'true') as unknown as T;
            case TipoDato.TIMESTAMP:
                return new Date(param.valor) as unknown as T;
            case TipoDato.JSONB:
                return param.datos_json as T;
            case TipoDato.STRING:
            default:
                return param.valor as unknown as T;
        }
    }
}
