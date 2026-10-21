// C:\sistemas\sicab\sicab-backend\src\config\jwt.config.ts
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

export class JwtConfig {
    private static readonly logger = new Logger('JwtConfig');

    static create(configService: ConfigService) {
        const privateKey = this.getRequiredKey(configService, 'JWT_PRIVATE_KEY');
        const publicKey = this.getRequiredKey(configService, 'JWT_PUBLIC_KEY');

        this.validateKeys(privateKey, publicKey);

        const expiresIn = configService.get<StringValue>('JWT_EXPIRES_IN', '8h');
        this.logger.log(`🔐 JWT Configuration loaded (Expires: ${expiresIn})`);

        return {
            privateKey,
            publicKey,
            signOptions: {
                algorithm: 'RS256' as const,
                expiresIn,
            },
        };
    }

    private static getRequiredKey(configService: ConfigService, keyName: string): string {
        const raw = configService.get<string>(keyName);

        if (!raw || raw.trim().length === 0) {
            throw new Error(
                `❌ ${keyName} is not set.\n` +
                `   💡 Solution: Add "${keyName}" to your .env\n` +
                `   📖 Generar con: npx ts-node src/scripts/generar-env-keys.ts`
            );
        }

        return raw.replace(/\\n/g, '\n');
    }

    private static validateKeys(privateKey: string, publicKey: string): void {
        if (!privateKey.includes('PRIVATE KEY')) {
            throw new Error('❌ Invalid JWT_PRIVATE_KEY format (must be RSA/PEM)');
        }

        if (!publicKey.includes('PUBLIC KEY')) {
            throw new Error('❌ Invalid JWT_PUBLIC_KEY format (must be RSA/PEM)');
        }
    }
}
