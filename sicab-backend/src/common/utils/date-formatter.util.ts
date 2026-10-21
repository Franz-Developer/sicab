// C:\sistemas\sicab\sicab-backend\src\common\utils\date-formatter.util.ts

/**
 * Zona horaria oficial de Bolivia.
 * No tiene horario de verano desde 1993.
 */
const BOLIVIA_TIMEZONE = 'America/La_Paz';

/**
 * Offset fijo de Bolivia respecto a UTC.
 *
 * IMPORTANTE: no se calcula con `date.getTimezoneOffset()` porque esa función
 * devuelve el offset del sistema operativo del servidor, no el de Bolivia.
 * Si el servidor corre en UTC (habitual en contenedores y cloud), el offset
 * calculado sería +00:00 mientras que la hora mostrada es de La Paz (-04:00),
 * produciendo un string contradictorio.
 *
 * Bolivia no aplica horario de verano desde 1993, por lo que el offset es
 * constante todo el año.
 */
const BOLIVIA_TIMEZONE_OFFSET = '-04:00';

/**
 * Formatea marcas de tiempo con zona horaria (TIMESTAMPTZ) para la API,
 * aplicando la zona horaria de Bolivia ('America/La_Paz'), milisegundos
 * y el offset fijo de Bolivia (-04:00).
 *
 * @param value - Valor de fecha a formatear (string, objeto Date o timestamp).
 * @returns La fecha y hora formateada en formato `YYYY-MM-DD HH:mm:ss.SSS -04:00`,
 *          o `null` si el valor es inválido.
 *
 * @example
 *   formatLocalDate('2026-01-15T15:00:00Z')
 *   // → '2026-01-15 11:00:00.000 -04:00'
 */
export const formatLocalDate = (value: any): string | null => {
    if (!value) return null;

    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: BOLIVIA_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const get = (type: string): string =>
        parts.find(p => p.type === type)?.value ?? '';

    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    const fecha =
        `${get('year')}-${get('month')}-${get('day')} ` +
        `${get('hour')}:${get('minute')}:${get('second')}.${milliseconds}`;

    return `${fecha} ${BOLIVIA_TIMEZONE_OFFSET}`;
};

/**
 * Formatea campos exclusivamente de FECHA (DATE: `YYYY-MM-DD`),
 * evitando desfases indeseados provocados por la conversión de zona horaria.
 *
 * Reglas:
 * - Si el valor ya es un string con formato `YYYY-MM-DD`, se devuelve tal cual.
 * - Si el valor es un `Date` o timestamp, se extrae la parte UTC de la fecha.
 * - Cualquier valor inválido devuelve `null`.
 *
 * @param value - Valor de fecha a formatear (string `YYYY-MM-DD`, objeto Date o timestamp).
 * @returns La fecha limpia en formato `YYYY-MM-DD`, o `null` si el valor es inválido.
 *
 * @example
 *   formatOnlyDate('2026-01-15')          // → '2026-01-15'
 *   formatOnlyDate(new Date('2026-01-15T00:00:00Z')) // → '2026-01-15'
 */
export const formatOnlyDate = (value: any): string | null => {
    if (!value) return null;

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Retorna la fecha de "hoy" en zona horaria Bolivia (formato `YYYY-MM-DD`).
 *
 * A diferencia de `formatOnlyDate(new Date())`, que usa la parte UTC del Date
 * y puede adelantar un día entre las 20:00 y 23:59 hora Bolivia (UTC-4),
 * esta función respeta la zona horaria 'America/La_Paz'.
 *
 * @returns Fecha de hoy en Bolivia en formato `YYYY-MM-DD`.
 *
 * @example
 *   // Si en Bolivia son las 22:00 del 04/10/2026
 *   obtenerFechaHoyBolivia() // → '2026-10-04'  (no '2026-10-05')
 */
export const obtenerFechaHoyBolivia = (): string => {
    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: BOLIVIA_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
};

/**
 * Normaliza un `Date` o string a fecha `YYYY-MM-DD` en zona horaria Bolivia.
 *
 * @param fecha - Valor a normalizar (`Date`, ISO string o string `YYYY-MM-DD`).
 * @returns La fecha en formato `YYYY-MM-DD` según la zona horaria de Bolivia,
 *          o `null` si el valor es inválido.
 *
 * @example
 *   obtenerFechaBolivia('2026-10-04T02:00:00Z')
 *   // → '2026-10-03'  (en Bolivia aún es el día 3 a las 22:00)
 */
export const obtenerFechaBolivia = (fecha: Date | string): string | null => {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(d.getTime())) return null;

    return new Intl.DateTimeFormat('sv-SE', {
        timeZone: BOLIVIA_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(d);
};

export const parseDateOnly = (value: string | Date | null | undefined): Date | null => {
    if (!value) return null;

    if (value instanceof Date) {
        if (isNaN(value.getTime())) return null;
        return new Date(Date.UTC(
            value.getUTCFullYear(),
            value.getUTCMonth(),
            value.getUTCDate(),
        ));
    }

    if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const parts = value.split('-');
            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);

            if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
                return null;
            }

            return new Date(Date.UTC(year, month - 1, day));
        }

        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) return null;
        return new Date(Date.UTC(
            parsed.getUTCFullYear(),
            parsed.getUTCMonth(),
            parsed.getUTCDate(),
        ));
    }

    return null;
};
