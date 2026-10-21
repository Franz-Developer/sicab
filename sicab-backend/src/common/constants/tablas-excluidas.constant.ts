// C:\sistemas\sicab\sicab-backend\src\common\constants\tablas-excluidas.constant.ts

export const TABLAS_EXCLUIDAS = ['tablas', 'constantes'] as const;

export type TablaExcluida = typeof TABLAS_EXCLUIDAS[number];

export function esTablaExcluida(nombre: string): boolean {
    return TABLAS_EXCLUIDAS.includes(nombre as TablaExcluida);
}

export function buildExclusionWhere(
    alias: string,
    columna: string = 'nombre',
): { where: string; params: readonly string[] } {
    const placeholders = TABLAS_EXCLUIDAS
        .map((_, i) => `:custom_${i + 1}`)
        .join(', ');

    return {
        where: `${alias}.${columna} NOT IN (${placeholders})`,
        params: TABLAS_EXCLUIDAS,
    };
}
