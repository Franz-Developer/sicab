// C:\sistemas\sicab\sicab-backend\src\common\utils\transform-metadata.util.ts

export interface EnumMetadataItem {
    id: number;
    abreviatura: string;
    label?: string;
    prefijo: string | null;
    valor: number;
    descripcion: string;
    es_defecto?: boolean;
    categoria?: string;
}

export interface MetadataTransformResult {
    abreviatura: string;
    label: string;
    valor: number;
    prefijo: string;
}

const EMPTY_METADATA_RESULT: MetadataTransformResult = {
    abreviatura: '',
    label: '',
    valor: 0,
    prefijo: '',
};

export const transformMetadata = (
    id: unknown,
    metadata: Record<number, EnumMetadataItem>,
): MetadataTransformResult => {
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
        return EMPTY_METADATA_RESULT;
    }

    const meta = metadata[numId];
    if (!meta) {
        return EMPTY_METADATA_RESULT;
    }

    return {
        abreviatura: meta.abreviatura,
        label: meta.label ?? '',
        valor: meta.valor,
        prefijo: meta.prefijo ?? '',
    };
};

/**
 * Variante que devuelve SOLO la abreviatura como string.
 * Útil para campos donde solo necesitas el nombre técnico (ej. `estado_registro`).
 */
export const transformMetadataAbreviatura = (
    id: unknown,
    metadata: Record<number, EnumMetadataItem>,
): string => {
    return transformMetadata(id, metadata).abreviatura;
};

/**
 * Variante que devuelve SOLO el label como string.
 * Útil para campos donde necesitas el nombre legible para UI (ej. `estado_label`).
 */
export const transformMetadataLabel = (
    id: unknown,
    metadata: Record<number, EnumMetadataItem>,
): string => {
    return transformMetadata(id, metadata).label;
};

/**
 * Convierte un valor BIGINT/SMALLINT de PostgreSQL (string) a number.
 * Devuelve null si el valor es null o undefined.
 */
export const toNumber = ({ value }: { value: unknown }): number | null =>
    value !== null && value !== undefined ? Number(value) : null;

/**
 * Convierte un valor BIGINT/SMALLINT a number, pero SIN permitir null.
 */
export const toRequiredNumber = ({ value }: { value: unknown }): number =>
    Number(value);