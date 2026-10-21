// C:\sistemas\sicab\sicab-backend\src\common\common.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from './services/cache.module';
import { ServicesModule } from './services/services.module';
import { ValidatorsModule } from './validators/validators.module';
import { CacheInvalidationInterceptor } from './interceptors/cache-invalidation.interceptor';

@Global()
@Module({
    imports: [
        ValidatorsModule,
        ServicesModule,
        CacheModule,
    ],
    providers: [
        CacheInvalidationInterceptor,
    ],
    exports: [
        ValidatorsModule,
        ServicesModule,
        CacheModule,
        CacheInvalidationInterceptor,
    ],
})
export class CommonModule {}