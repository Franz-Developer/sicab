// C:\sistemas\sicab\sicab-backend\src\common\decorators\cache.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY, CACHE_TTL } from '../interceptors/cache.interceptor';

export function getCacheTTL(envKey: string, fallbackMs: number): number {
    const value = process.env[envKey];
    if (value) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed * 1000; // Convertir segundos a milisegundos
        }
    }
    return fallbackMs;
}

// CACHE_BASE: TTL estándar para todos los endpoints (5 minutos por defecto)
export const CACHE_BASE = getCacheTTL('CACHE_TTL_BASE', 300000);

export function Cache(key: string, ttl: number = CACHE_BASE) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        SetMetadata(CACHE_KEY, key)(target, propertyKey, descriptor);
        SetMetadata(CACHE_TTL, ttl)(target, propertyKey, descriptor);
    };
}
