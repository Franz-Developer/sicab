// C:\sistemas\sicab\sicab-backend\src\common\utils\crypto.util.ts
import * as bcrypt from 'bcrypt';

/**
 * Salt rounds para bcrypt.
 *
 * OWASP recomienda un mínimo de 10. La diferencia entre 10 y 12 es que
 * 12 tarda ~4x más en hashear, lo cual es significativo en login.
 *
 * - 10 rounds → ~75ms  (recomendado para sistemas internos)
 * - 12 rounds → ~300ms (más seguro, pero más lento)
 */
const SALT_ROUNDS = 10;
const MIN_SECURE_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function isSecureHash(hash: string | undefined | null): boolean {
    if (!hash || typeof hash !== 'string') {
        return false;
    }

    const match = hash.match(/^\$2[aby]\$(\d{2})\$/);
    if (!match || !match[1]) return false;

    const rounds = parseInt(match[1], 10);
    return rounds >= MIN_SECURE_ROUNDS;
}

export function getSaltRounds(hash: string | undefined | null): number | null {
    if (!hash || typeof hash !== 'string') {
        return null;
    }

    const match = hash.match(/^\$2[aby]\$(\d{2})\$/);
    if (!match || !match[1]) return null;

    return parseInt(match[1], 10);
}

export function needsRehash(hash: string | undefined | null): boolean {
    const rounds = getSaltRounds(hash);
    if (rounds === null) return true;
    return rounds < SALT_ROUNDS;
}
