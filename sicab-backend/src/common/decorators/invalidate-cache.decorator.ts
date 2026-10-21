// C:\sistemas\sicab\sicab-backend\src\common\decorators\invalidate-cache.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { CACHE_INVALIDATION_KEY } from '../interceptors/cache-invalidation.interceptor';

export function InvalidateCache(prefixes: string | string[]) {
    const normalized = Array.isArray(prefixes) ? prefixes : [prefixes];
    return SetMetadata(CACHE_INVALIDATION_KEY, normalized);
}
