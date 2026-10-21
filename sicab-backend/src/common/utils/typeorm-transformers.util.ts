// C:\sistemas\sicab\sicab-backend\src\common\utils\typeorm-transformers.util.ts

export const bigintTransformer = {
    to: (value: number): number => value,
    from: (value: string | null): number | null =>
        (value !== null && value !== undefined) ? parseInt(value, 10) : null
};

export const decimalTransformer = {
    to: (value: number | null | undefined): number | null | undefined => value,
    from: (value: string | null): number | null =>
        (value !== null && value !== undefined) ? parseFloat(value) : null,
};
