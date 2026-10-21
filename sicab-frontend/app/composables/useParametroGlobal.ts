// C:\sistemas\sicab\sicab-frontend\app\composables\useParametroGlobal.ts

interface ParametroGlobalResponse {
    parametro_id: number;
    clave: string;
    valor: string;
    tipo_dato_id: number;
    datos_json: Record<string, any> | null;
    descripcion: string | null;
    editable: number;
    estado_id: number;
    estado_registro: string;
}

const cache = new Map<string, ParametroGlobalResponse | null>();
const inflight = new Map<string, Promise<ParametroGlobalResponse | null>>();

export const useParametroGlobal = () => {
    const { $api } = useNuxtApp() as any;

    // ============ FETCH BASE ============
    const getByClave = async (clave: string): Promise<ParametroGlobalResponse | null> => {
        if (cache.has(clave)) return cache.get(clave)!;
        if (inflight.has(clave)) return inflight.get(clave)!;

        const promise = $api('/parametros-globales', {
            method: 'GET',
            params: { clave, estado_id: 1000, limit: 1 },
        })
            .then((res: any) => {
                const item = res?.data?.[0] ?? null;
                cache.set(clave, item);
                return item;
            })
            .catch((err: any) => {
                console.warn(`[useParametroGlobal] Error cargando "${clave}":`, err);
                cache.set(clave, null);
                return null;
            })
            .finally(() => {
                inflight.delete(clave);
            });

        inflight.set(clave, promise);
        return promise;
    };

    // ============ GETTERS TIPADOS ============

    /**
     * STRING
     * Devuelve `valor` como string (o null si no existe).
     */
    const getString = async (clave: string): Promise<string | null> => {
        const param = await getByClave(clave);
        if (!param?.valor) return null;
        return String(param.valor);
    };

    /**
     * INTEGER
     * Devuelve `valor` como número entero (o null si no es válido).
     */
    const getInt = async (clave: string): Promise<number | null> => {
        const param = await getByClave(clave);
        if (!param?.valor) return null;
        const num = parseInt(param.valor, 10);
        return Number.isFinite(num) ? num : null;
    };

    /**
     * DECIMAL
     * Devuelve `valor` como número decimal (o null si no es válido).
     */
    const getDecimal = async (clave: string): Promise<number | null> => {
        const param = await getByClave(clave);
        if (!param?.valor) return null;
        const num = parseFloat(param.valor);
        return Number.isFinite(num) ? num : null;
    };

    /**
     * BOOLEAN
     * Acepta "1", "0", "true", "false" (case-insensitive).
     * Devuelve true/false/null.
     */
    const getBoolean = async (clave: string): Promise<boolean | null> => {
        const param = await getByClave(clave);
        if (!param?.valor) return null;
        const v = String(param.valor).trim().toLowerCase();
        if (v === '1' || v === 'true')  return true;
        if (v === '0' || v === 'false') return false;
        return null;
    };

    /**
     * TIMESTAMP
     * Devuelve `valor` como string ISO (o null si no existe).
     * NO lo convierte a Date para respetar el timezone original.
     */
    const getTimestamp = async (clave: string): Promise<string | null> => {
        const param = await getByClave(clave);
        return param?.valor ? String(param.valor) : null;
    };

    /**
     * TIMESTAMP → Date
     * Igual que getTimestamp pero parseado a `Date`.
     */
    const getDate = async (clave: string): Promise<Date | null> => {
        const valor = await getTimestamp(clave);
        if (!valor) return null;
        const d = new Date(valor);
        return isNaN(d.getTime()) ? null : d;
    };

    /**
     * JSONB
     * Devuelve el objeto `datos_json` (o null).
     */
    const getJson = async <T = Record<string, any>>(clave: string): Promise<T | null> => {
        const param = await getByClave(clave);
        return (param?.datos_json as T) ?? null;
    };

    // ============ UTILIDADES ============

    /**
     * Devuelve el valor "crudo" (string) sin conversión.
     * Útil cuando no sabes el tipo o quieres manejarlo manualmente.
     */
    const getRaw = async (clave: string): Promise<string | null> => {
        const param = await getByClave(clave);
        return param?.valor ?? null;
    };

    /**
     * Devuelve el objeto completo (con metadata).
     */
    const getFull = getByClave;

    // ============ CACHE ============
    const clearCache = (clave?: string) => {
        if (clave) cache.delete(clave);
        else cache.clear();
    };

    // ============ RETORNO ============
    return {
        // Base
        getByClave,
        getFull,
        getRaw,

        // Tipados
        getString,
        getInt,
        getDecimal,
        getBoolean,
        getTimestamp,
        getDate,
        getJson,

        // Cache
        clearCache,
    };
};
