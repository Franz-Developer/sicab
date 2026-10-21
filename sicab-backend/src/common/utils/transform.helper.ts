// C:\sistemas\sicab\sicab-backend\src\common\utils\transform.helper.ts

/**
 * Utilidades de transformación reutilizables para DTOs.
 *
 * Patrones cubiertos:
 *   - trim + null       → emptyToNull         (ej. descripcion, observaciones)
 *   - trim + undefined  → emptyToUndefined    (ej. opcionales que prefieres no persistir null)
 *   - trim + UPPER + null      → emptyToNullUpper
 *   - trim + UPPER + undefined → emptyToUndefinedUpper
 *   - trim + lower + null      → emptyToNullLower
 *   - trim + lower + undefined → emptyToUndefinedLower
 *   - trim (siempre string)    → trimString      (obligatorios que NO deben colapsar a null)
 *   - trim + UPPER (siempre)   → trimUpperString
 *   - trim + lower (siempre)   → trimLowerString
 *   - null → undefined         → nullToUndefined
 *   - undefined → null         → undefinedToNull
 */

type TransformArgs = { value: unknown };

// ─────────────────────────────────────────────────────────────
// CAMPOS OPCIONALES (colapsan "" a null o undefined)
// ─────────────────────────────────────────────────────────────

/**
 * Trim y convierte cadena vacía a `null`.
 * Uso: campos opcionales donde el DDL tiene CHECK ..._notempty o donde
 * `null` es semánticamente correcto (ej. descripcion, observaciones).
 */
export const emptyToNull = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
    return value ?? null;
};

/**
 * Trim y convierte cadena vacía a `undefined`.
 * Uso: campos opcionales donde prefieres NO persistir null explícito
 * (el backend mantiene el valor por defecto del DDL o el valor previo en update).
 */
export const emptyToUndefined = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
    }
    return value;
};

/**
 * Trim + MAYÚSCULAS. Cadena vacía → `null`.
 * Uso: campos opcionales en MAYÚSCULAS con CHECK ..._notempty
 * (ej. lugar, representante, direccion, municipio_fiscal, direccion_fiscal,
 *  numero_chasis, numero_motor).
 */
export const emptyToNullUpper = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim().toUpperCase();
        return trimmed === '' ? null : trimmed;
    }
    return value ?? null;
};

/**
 * Trim + MAYÚSCULAS. Cadena vacía → `undefined`.
 * Uso: campos opcionales en MAYÚSCULAS donde prefieres undefined sobre null
 * (ej. eslogan).
 */
export const emptyToUndefinedUpper = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim().toUpperCase();
        return trimmed === '' ? undefined : trimmed;
    }
    return value;
};

/**
 * Trim + minúsculas. Cadena vacía → `null`.
 * Uso: campos opcionales en minúsculas (ej. ciertas claves/configuración,
 * valores normalizados de catálogo en minúsculas).
 */
export const emptyToNullLower = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim().toLowerCase();
        return trimmed === '' ? null : trimmed;
    }
    return value ?? null;
};

/**
 * Trim + minúsculas. Cadena vacía → `undefined`.
 * Uso: campos opcionales en minúsculas donde prefieres undefined sobre null.
 */
export const emptyToUndefinedLower = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim().toLowerCase();
        return trimmed === '' ? undefined : trimmed;
    }
    return value;
};

// ─────────────────────────────────────────────────────────────
// CAMPOS OBLIGATORIOS (solo trim, nunca colapsan)
// ─────────────────────────────────────────────────────────────

/**
 * Solo trim. NO colapsa cadena vacía a null.
 * Uso: campos OBLIGATORIOS (NOT NULL en DDL). La cadena vacía será rechazada
 * por @IsNotEmpty(), @MinLength() o por el CHECK correspondiente.
 */
export const trimString = ({ value }: TransformArgs): unknown =>
    typeof value === 'string' ? value.trim() : value;

/**
 * Trim + MAYÚSCULAS. NO colapsa cadena vacía.
 * Uso: campos OBLIGATORIOS en MAYÚSCULAS (ej. codigo, empresa, banco, placa,
 * marca, modelo, color, nombres, paterno, apodo, nit, razon_social, etiqueta).
 */
export const trimUpperString = ({ value }: TransformArgs): unknown =>
    typeof value === 'string' ? value.trim().toUpperCase() : value;

/**
 * Trim + minúsculas. NO colapsa cadena vacía.
 * Uso: campos OBLIGATORIOS en minúsculas (ej. login si fuera lowercase,
 * claves de configuración).
 */
export const trimLowerString = ({ value }: TransformArgs): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

// ─────────────────────────────────────────────────────────────
// UTILIDADES ESPECIALES
// ─────────────────────────────────────────────────────────────

/**
 * `null` → `undefined`. Deja cualquier otro valor tal cual.
 * Uso: normalizar entradas donde el frontend envía null pero el DTO
 * espera undefined (ej. campos opcionales con @IsOptional()).
 */
export const nullToUndefined = ({ value }: TransformArgs): unknown =>
    value === null ? undefined : value;

/**
 * `undefined` → `null`. Deja cualquier otro valor tal cual.
 * Uso: forzar null explícito cuando el DDL requiere que un campo opcional
 * se persista como null en lugar de omitirse.
 */
export const undefinedToNull = ({ value }: TransformArgs): unknown =>
    value === undefined ? null : value;

/**
 * Trim + MAYÚSCULAS para emails → normaliza a minúsculas.
 * Cadena vacía → `null`.
 * Uso: campos de email opcionales (ej. email en empresas, trabajadores,
 * proveedores — todos NULL en DDL).
 */
export const emptyEmailToNull = ({ value }: TransformArgs): unknown => {
    if (typeof value === 'string') {
        const trimmed = value.trim().toLowerCase();
        return trimmed === '' ? null : trimmed;
    }
    return value ?? null;
};

/**
 * Trim + minúsculas para emails obligatorios. NO colapsa.
 * Uso: campos de email NOT NULL (ej. email_fiscal en empresas_nits).
 */
export const trimEmail = ({ value }: TransformArgs): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

// ─────────────────────────────────────────────────────────────
// COMPOSICIÓN: trim + UPPER + null preservando null de entrada
// ─────────────────────────────────────────────────────────────

/**
 * Trim + MAYÚSCULAS respetando `null`/`undefined` de entrada.
 * Si el valor es null → null. Si es undefined → null (para DDL nullable).
 * Si es string vacío tras trim → null.
 * Uso: campos opcionales en MAYÚSCULAS donde quieres que null/undefined
 * se normalicen a null.
 */
export const normalizeUpperNullable = ({ value }: TransformArgs): unknown => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim().toUpperCase();
        return trimmed === '' ? null : trimmed;
    }
    return value;
};

/**
 * Trim + minúsculas respetando `null`/`undefined` de entrada.
 * Uso: campos opcionales en minúsculas donde quieres normalizar a null.
 */
export const normalizeLowerNullable = ({ value }: TransformArgs): unknown => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim().toLowerCase();
        return trimmed === '' ? null : trimmed;
    }
    return value;
};
