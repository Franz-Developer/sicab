// C:\sistemas\sicab\sicab-frontend\app\utils\date.ts

export function toDateInputValue(fecha: string | Date | null | undefined): string {
    if (fecha == null) return '';

    if (fecha instanceof Date) {
        return isNaN(fecha.getTime()) ? '' : formatDateUTC(fecha);
    }

    const s = String(fecha).trim();
    if (s.length === 0) return '';

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) {
        const [, yyyy = '', mm = '', dd = ''] = m;
        const mo = +mm;
        const d = +dd;
        if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
            return `${yyyy}-${mm}-${dd}`;
        }
    }

    const parsed = new Date(s);
    return isNaN(parsed.getTime()) ? '' : formatDateUTC(parsed);
}

function formatDateUTC(d: Date): string {
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ═══════════════════════════════════════════════════════════════════
// FORMATEO PARA PRESENTACIÓN (tablas, expansion panels, etc.)
// ═══════════════════════════════════════════════════════════════════

/**
 * Parsea una fecha que puede venir en varios formatos:
 *   - ISO 8601 con timezone: "2026-01-01T00:00:00.000-04:00"
 *   - Formato BD (con espacio): "2026-01-01 00:00:00.000 -04:00"
 *   - Date nativo
 *   - null / undefined / ''
 *
 * Devuelve un Date válido o null si no se pudo parsear.
 */
function parseFecha(value: string | Date | null | undefined): Date | null {
    if (value === null || value === undefined || value === '') return null;

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    const s = String(value).trim();
    if (s.length === 0) return null;

    // Normalizar "YYYY-MM-DD HH:mm:ss.sss -04:00" → "YYYY-MM-DDTHH:mm:ss.sss-04:00"
    // (el espacio antes del offset rompe el parser nativo de JS)
    const normalized = s
        .replace(' ', 'T')                // fecha + hora
        .replace(/ (\-|\+)(\d{2}):?(\d{2})$/, '$1$2:$3');  // offset con espacio

    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formatea una fecha mostrando la hora en formato 12h con AM/PM.
 *
 * @example
 *   formatFecha12h('2026-01-01 14:30:00 -04:00')  → '01/01/2026 02:30 PM'
 *   formatFecha12h('2026-01-01 00:00:00 -04:00')  → '01/01/2026 12:00 AM'
 */
export function formatFecha12h(
    value: string | Date | null | undefined,
    soloFecha: boolean = false,
): string {
    const date = parseFecha(value);
    if (!date) return '—';

    const dd   = String(date.getDate()).padStart(2, '0');
    const mm   = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    if (soloFecha) return `${dd}/${mm}/${yyyy}`;

    let hh = date.getHours();
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ampm = hh >= 12 ? 'PM' : 'AM';

    hh = hh % 12;
    if (hh === 0) hh = 12;

    const hhStr = String(hh).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hhStr}:${mi} ${ampm}`;
}

// ═══════════════════════════════════════════════════════════════════
// FECHAS LOCALES (para formularios, defaults, etc.)
// ═══════════════════════════════════════════════════════════════════

/**
 * Devuelve la fecha LOCAL en formato `YYYY-MM-DD`.
 *
 * ⚠️ NO usa `toISOString()` porque eso devuelve UTC y puede desfasar
 * el día cuando la hora local está cerca de medianoche (ej. Bolivia UTC-4
 * a las 22:00 ya es el día siguiente en UTC).
 *
 * @example
 *   // Si son las 22:42 del 02/10/2026 en Bolivia (UTC-4):
 *   new Date().toISOString().slice(0, 10)  // → "2026-10-03"  ❌
 *   getTodayLocal()                        // → "2026-10-02"  ✅
 */
export function getTodayLocal(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Convierte un `Date` a formato `YYYY-MM-DD` respetando la zona horaria LOCAL.
 *
 * NO usa `toISOString()` porque eso devuelve UTC.
 *
 * @example
 *   const d = new Date('2026-10-02T22:42:00-04:00');
 *   toLocalDateInput(d)  // → "2026-10-02"
 */
export function toLocalDateInput(value: Date | string | null | undefined): string {
    if (value == null) return '';

    let d: Date;
    if (value instanceof Date) {
        d = value;
    } else {
        const s = String(value).trim();
        if (s.length === 0) return '';

        // Si ya viene en formato "YYYY-MM-DD" simple, devolverlo tal cual
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

        d = new Date(s);
    }

    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
