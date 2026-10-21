// C:\sistemas\sicab\sicab-backend\src\common\interceptors\cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createHash } from 'crypto';
import { ICacheService } from '../interfaces/cache.interface';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger(CacheInterceptor.name);
    private readonly isDev: boolean;

    constructor(
        @Inject('ICacheService') private readonly cacheService: ICacheService,
        private readonly reflector: Reflector,
    ) {
        this.isDev = process.env['NODE_ENV'] === 'development';
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        if (request.method !== 'GET') {
            return next.handle();
        }

        const cacheKey = this.reflector.get<string>(
            CACHE_KEY,
            context.getHandler(),
        );
        const ttl = this.reflector.get<number>(
            CACHE_TTL,
            context.getHandler(),
        );

        if (!cacheKey) {
            return next.handle();
        }

        const fullKey = this.buildCacheKey(
            cacheKey,
            request.params || {},
            request.query || {},
        );

        if (this.isDev) {
            this.logger.log(`[${request.method}] ${request.url} → ${fullKey}`);
        } else {
            this.logger.log(`[${request.method}] → ${fullKey}`);
        }

        const cached = await this.cacheService.get(fullKey);
        if (cached) {
            this.logger.log(`HIT  → ${fullKey}`);
            return of(cached);
        }

        return next.handle().pipe(
            tap(async (data) => {
                this.logger.log(`SET  → ${fullKey} (ttl: ${ttl || 300000}ms)`);
                await this.cacheService.set(fullKey, data, ttl || 300000);
            }),
        );
    }

    private buildCacheKey(
        baseKey: string,
        params: Record<string, any>,
        query: Record<string, any>,
    ): string {
        const sortedParams = this.sortObjectKeys(params);
        const sortedQuery = this.sortObjectKeys(query);

        const payload = JSON.stringify({
            params: sortedParams,
            query: sortedQuery,
        });

        const hash = createHash('sha1').update(payload).digest('hex');

        return `${baseKey}:${hash}`;
    }

    private sortObjectKeys<T extends Record<string, any>>(obj: T): T {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return obj;
        }

        const sorted: Record<string, any> = {};

        for (const key of Object.keys(obj).sort()) {
            sorted[key] = obj[key];
        }

        return sorted as T;
    }
}
