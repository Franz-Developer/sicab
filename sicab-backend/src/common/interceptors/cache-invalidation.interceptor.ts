// C:\sistemas\sicab\sicab-backend\src\common\interceptors\cache-invalidation.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { ICacheService } from '../interfaces/cache.interface';

export const CACHE_INVALIDATION_KEY = 'cache_invalidation_key';

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
    private readonly logger = new Logger(CacheInvalidationInterceptor.name);
    private readonly isDev: boolean;

    constructor(
        @Inject('ICacheService') private readonly cacheService: ICacheService,
        private readonly reflector: Reflector,
    ) {
        this.isDev = process.env['NODE_ENV'] === 'development';
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const prefixes = this.reflector.getAllAndOverride<string[]>(
            CACHE_INVALIDATION_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!prefixes || prefixes.length === 0) {
            return next.handle();
        }

        const normalizedPrefixes = prefixes.map(prefix =>
            prefix.endsWith(':') ? prefix : `${prefix}:`
        );

        const request = context.switchToHttp().getRequest();
        const method = request?.method ?? '?';
        const url = request?.url ?? '?';

        return next.handle().pipe(
            tap({
                next: async () => {
                    if (this.isDev) {
                        this.logger.log(
                            `🔄 [${method} ${url}] Invalidando caché: ${normalizedPrefixes.join(', ')}`
                        );
                    }

                    for (const prefix of normalizedPrefixes) {
                        try {
                            if (!this.cacheService.deleteByPrefix) {
                                this.logger.warn(
                                    `⚠️ El servicio de caché no implementa deleteByPrefix. Prefijo ignorado: ${prefix}`
                                );
                                continue;
                            }

                            const deletedCount = await this.cacheService.deleteByPrefix(prefix);

                            if (this.isDev) {
                                this.logger.log(
                                    `✅ [${prefix}] ${deletedCount} clave(s) eliminada(s).`
                                );
                            }
                        } catch (error) {
                            const errorMessage = error instanceof Error
                                ? error.message
                                : 'Error desconocido al invalidar caché';

                            this.logger.error(
                                `❌ Error al invalidar prefijo "${prefix}": ${errorMessage}`
                            );
                        }
                    }
                },
                error: (err) => {
                    if (this.isDev) {
                        this.logger.warn(
                            `⚠️ [${method} ${url}] Operación falló. No se invalida caché. Motivo: ${
                                err instanceof Error ? err.message : String(err)
                            }`
                        );
                    }
                },
            })
        );
    }
}
