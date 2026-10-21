// C:\sistemas\sicab\sicab-backend\src\main.ts
import { join } from 'path';
import * as express from 'express';
import { Logger, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { UPLOAD_PATHS } from './common/constants/upload-paths.constant';
import { RateLimitExceptionFilter } from './common/filters/rate-limit-exception.filter';

process.stdout.setDefaultEncoding('utf8');
process.stderr.setDefaultEncoding('utf8');

// Filtrar warnings internos de path-to-regexp (NestJS 11 + Express 5)
// Bug conocido: https://github.com/nestjs/nest/issues/14329
const originalWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
    const message = args.map(String).join(' ');
    if (message.includes('Unsupported route path') && message.includes('/api/*')) {
        return;
    }
    originalWarn(...args);
};

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const isDev = (process.env['NODE_ENV'] || 'development') === 'development';

    try {
        const app = await NestFactory.create<NestExpressApplication>(AppModule, {
            logger: ['error', 'warn', 'log'], // logger: false, Desactiva el logger interno de NestJS durante el arranque. Antes era logger: getLogLevels(),
        });

        const configService = app.get(ConfigService);

        app.useLogger(app.get(PinoLogger));
        app.useGlobalFilters(new RateLimitExceptionFilter());
        app.useGlobalFilters(new AllExceptionsFilter(app.get(PinoLogger)));
        app.enableShutdownHooks();
        app.use(compression());
        app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
        app.enableCors();
        app.setGlobalPrefix('api');

        const root = process.cwd();
        const uploadDir = configService.get<string>('UPLOAD_DIR', 'uploads');

        for (const { carpeta, urlPrefix } of UPLOAD_PATHS) {
            app.use(urlPrefix, express.static(join(root, uploadDir, carpeta), {
                maxAge: '1d',           // El navegador cachea 24h
                etag: true,             // Genera ETag para validación
                lastModified: true,     // Usa Last-Modified
                immutable: true,        // No revalidar (los archivos tienen nombre único)
            }));
        }

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
                exceptionFactory: (errors) => {
                    const invalidParams = errors
                        .filter(error => error.constraints && error.constraints["whitelistValidation"])
                        .map(error => error.property);

                    if (invalidParams.length > 0) {
                        return new BadRequestException({
                            message: `❌ Parámetro(s) no permitido(s): ${invalidParams.join(', ')}`,
                            error: 'Bad Request',
                            statusCode: 400,
                            details: {
                                invalidParams,
                                hint: 'Revise los parámetros enviados en la URL. Consulte la documentación de la API para los parámetros permitidos.'
                            }
                        });
                    }

                    const messages: string[] = [];

                    for (const error of errors) {
                        if (error.constraints) {
                            for (const message of Object.values(error.constraints)) {
                                messages.push(message);
                            }
                        }
                    }

                    if (messages.length > 0) {
                        const message = messages.length === 1
                            ? messages[0]
                            : messages;

                        return new BadRequestException({
                            message,
                            error: 'Bad Request',
                            statusCode: 400
                        });
                    }

                    return new BadRequestException({
                        message: 'Error de validación en los datos enviados.',
                        error: 'Bad Request',
                        statusCode: 400,
                        details: errors.map(error => ({
                            property: error.property,
                            value: error.value,
                            constraints: error.constraints,
                            children: error.children?.map(child => ({
                                property: child.property,
                                constraints: child.constraints,
                            })),
                        })),
                    });
                },
            })
        );

        let isShuttingDown = false;
        const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

        signals.forEach(signal => {
            process.on(signal, async () => {
                if (isShuttingDown) {
                    logger.warn('Cierre ya en progreso, ignorando señal...');
                    return;
                }
                isShuttingDown = true;

                logger.warn(`Señal ${signal} recibida. Cerrando backend de forma ordenada...`);

                const timeout = setTimeout(() => {
                    logger.error('⏱️ Timeout en cierre gracioso (10s), forzando salida...');
                    process.exit(1);
                }, 10000);

                try {
                    await app.close();
                    clearTimeout(timeout);
                    logger.log('✅ Aplicación cerrada correctamente.');
                    process.exit(0);
                } catch (err) {
                    clearTimeout(timeout);
                    logger.error('❌ Error durante el cierre gracioso:', err);
                    process.exit(1);
                }
            });
        });

        const port = process.env['PORT'] || 3010;
        const env = process.env['NODE_ENV'] || 'development';
        const appName = configService.get<string>('APP_NAME', 'SICAB');

        await app.listen(port);

        logger.log(`Servidor escuchando en el puerto ${port}`);

        if (isDev) {
            console.log(`==========================================================`);
            console.log(`🚀 ${appName} - BACKEND INICIADO`);
            console.log(`==========================================================`);
            console.log(`✅ Entorno:   ${env.toUpperCase()}`);
            console.log(`📡 URL Base:  http://localhost:${port}/api`);
            console.log(`🗄️  Database: PostgreSQL (${process.env['DB_DATABASE']})`);
            console.log(`📡 Host:      ${process.env['DB_HOST']}:${process.env['DB_PORT']}`);
            console.log(`🗜️  Estado:   COMPRESIÓN GZIP Y HELMET ACTIVADOS`);
            console.log(`⏱️  Hora:      ${new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}`);
            console.log(`==========================================================`);
        }
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        const currentPort = process.env['PORT'] || 3010;
        if (err.code === 'EADDRINUSE') {
            logger.error(`Error: El puerto ${currentPort} ya está en uso.`);
        } else {
            logger.error(`Error crítico al iniciar el backend: ${err.message ?? 'Error desconocido'}`);
        }
        process.exit(1);
    }
}
bootstrap();
