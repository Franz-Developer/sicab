// C:\sistemas\sicab\sicab-backend\src\common\utils\nombre-completo.util.ts

export function buildNombreCompleto(
    paterno?: string | null,
    materno?: string | null,
    nombres?: string | null,
    fallback: string | null = null,
): string | null {
    const partes = [paterno, materno, nombres]
        .map((p) => (typeof p === 'string' ? p.trim() : ''))
        .filter((p) => p.length > 0);

    return partes.length > 0 ? partes.join(' ') : fallback;
}
