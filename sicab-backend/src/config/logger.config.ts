// C:\sistemas\sicab\sicab-backend\src\config\logger.config.ts
import * as fs from 'fs';
import { resolve } from 'path';
import { Params } from 'nestjs-pino';

const logDir = resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const getLogLevel = (): string => {
    const env = process.env['NODE_ENV'] || 'development';
    if (env === 'production') return 'info';
    return 'debug';
};

export const loggerConfig: Params = {
    pinoHttp: {
        level: getLogLevel(),
        timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

        // Hook para filtrar warnings internos de path-to-regexp (NestJS 11 + Express 5)
        // Bug conocido: https://github.com/nestjs/nest/issues/14329
        hooks: {
            logMethod(inputArgs, method, level) {
                // Nivel 40 = warn en Pino
                if (level === 40) {
                    const firstArg = inputArgs[0] as Record<string, unknown> | string | undefined;
                    const message = typeof firstArg === 'string'
                        ? firstArg
                        : (firstArg?.['msg'] as string | undefined) ?? '';

                    if (
                        typeof message === 'string' &&
                        message.includes('Unsupported route path') &&
                        message.includes('/api/*')
                    ) {
                        return; // Ignorar este warning específico
                    }
                }
                return method.apply(this, inputArgs as Parameters<typeof method>);
            },
        },

        transport: {
            targets: [
                ...(process.env['NODE_ENV'] !== 'production'
                    ? [
                          {
                              target: 'pino-pretty',
                              options: {
                                  colorize: true,
                                  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
                                  ignore: 'pid,hostname,environment,service,version,context',
                                  singleLine: false,
                              },
                          },
                      ]
                    : []),
                // Archivo general para todos los niveles (app.log) con límite ampliado a 90
                {
                    target: 'pino-roll',
                    options: {
                        file: resolve(logDir, 'app.log'),
                        frequency: 'daily',
                        size: '10m',
                        compress: true,
                        limit: { count: 90 },
                    },
                },
                // Archivo aislado exclusivamente para errores (error.log)
                {
                    level: 'error',
                    target: 'pino-roll',
                    options: {
                        file: resolve(logDir, 'error.log'),
                        frequency: 'daily',
                        size: '10m',
                        compress: true,
                        limit: { count: 90 },
                    },
                },
            ],
        },

        redact: {
            paths: [
                'password',
                'contrasena',
                'token',
                'authorization',
                '*.contrasena',
                '*.password',
                '*.token',
                '*.secret',
            ],
            censor: '***REDACTED***',
        },
        serializers: {
            req: (req: any) => {
                const statusCode = req.res?.statusCode || req.raw?.res?.statusCode;
                if (statusCode === 400) {
                    return {
                        method: req.method,
                        url: req.url,
                    };
                }
                return {
                    method: req.method,
                    url: req.url,
                    query: req.query,
                    params: req.params,
                };
            },
            res: (res: any) => {
                return {
                    statusCode: res.statusCode,
                };
            },
            err: (err: any) => {
                if (err?.context === 'LegacyRouteConverter') {
                    return undefined;
                }
                return {
                    type: err.type,
                    message: err.message,
                    stack: err.stack,
                    code: err.code,
                    name: err.name,
                };
            },
        },
    },
};
