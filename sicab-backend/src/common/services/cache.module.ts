// C:\sistemas\sicab\sicab-backend\src\common\services\cache.module.ts
import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import { RedisCacheService } from './redis-cache.service';
import { ICacheService } from '../interfaces/cache.interface';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        RedisCacheService,
        CacheService,
        {
            provide: 'ICacheService',
            useFactory: (
                configService: ConfigService,
                redisCache: RedisCacheService,
                memoryCache: CacheService,
            ): ICacheService => {
                const logger = new Logger('CacheModule');
                const useRedis = configService.get<string>('USE_REDIS_CACHE') === 'true';

                if (useRedis) {
                    logger.log('ICacheService → RedisCacheService (caché distribuida)');
                    return redisCache;
                }

                logger.log('ICacheService → CacheService (caché en memoria)');
                return memoryCache;
            },
            inject: [ConfigService, RedisCacheService, CacheService],
        },
    ],
    exports: ['ICacheService', CacheService, RedisCacheService],
})
export class CacheModule {}
