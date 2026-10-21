// C:\sistemas\sicab\sicab-backend\src\common\filters\rate-limit-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response, Request } from 'express';

@Catch(ThrottlerException)
export class RateLimitExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(RateLimitExceptionFilter.name);

    catch(exception: ThrottlerException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        this.logger.warn(
            `Rate limit excedido: ${request.method} ${request.url} - IP: ${request.ip}.`
        );

        const message = exception.message ?? '';
        const retryAfterMatch = message.match(/TTL: (\d+)/);
        const retryAfter = retryAfterMatch && retryAfterMatch[1]
            ? parseInt(retryAfterMatch[1], 10)
            : 60;

        response.status(HttpStatus.TOO_MANY_REQUESTS).json({
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: 'Too Many Requests',
            message: 'Has excedido el límite de peticiones. Por favor, espera un momento.',
            retryAfter: retryAfter,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
