// C:\sistemas\sicab\sicab-frontend\app\composables\useCargoResolver.ts
import { ESTADO_ACTIVO } from '~/constants/estados.constant';

export const useCargoResolver = () => {
    const { $api } = useNuxtApp() as any;

    const cache = new Map<string, number | null>();
    const inflight = new Map<string, Promise<number | null>>();

    const resolverCargoId = async (codigo: string): Promise<number | null> => {
        const clave = codigo.trim().toUpperCase();
        if (cache.has(clave)) return cache.get(clave)!;
        if (inflight.has(clave)) return inflight.get(clave)!;

        const promise = $api('/cargos', {
            method: 'GET',
            params: { codigo: clave, estado_id: ESTADO_ACTIVO, limit: 1 },
        })
            .then((res: any) => {
                const lista = Array.isArray(res) ? res : (res?.data ?? []);
                const cargo = lista[0];
                const id = cargo ? Number(cargo.cargo_id) : null;
                cache.set(clave, id);
                return id;
            })
            .catch((err: any) => {
                console.error(`[useCargoResolver] Error al resolver cargo "${clave}":`, err);
                cache.set(clave, null);
                return null;
            })
            .finally(() => {
                inflight.delete(clave);
            });

        inflight.set(clave, promise);
        return promise;
    };

    const resolverCargoConductor   = (): Promise<number | null> => resolverCargoId('CON');
    const resolverCargoAdministrador = (): Promise<number | null> => resolverCargoId('ADM');
    const resolverCargoGerente     = (): Promise<number | null> => resolverCargoId('GER');
    const resolverCargoOperador    = (): Promise<number | null> => resolverCargoId('OPE');

    const clearCache = (codigo?: string): void => {
        if (codigo) cache.delete(codigo.trim().toUpperCase());
        else cache.clear();
    };

    return {
        resolverCargoId,
        resolverCargoConductor,
        resolverCargoAdministrador,
        resolverCargoGerente,
        resolverCargoOperador,
        clearCache,
    };
};
