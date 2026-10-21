// C:\sistemas\sicab\sicab-frontend\app\composables\useDataInvalidation.ts

/**
 * Sistema de invalidación de datos entre módulos.
 *
 * Permite que un módulo (ej: AntecedentesCrud) notifique a otro módulo
 * (ej: ConductoresCategoriasCrud) que sus datos cambiaron y deben recargarse.
 *
 * Uso:
 *   // En el módulo que MUTA (Antecedentes):
 *   const { invalidate } = useDataInvalidation();
 *   invalidate('conductores-categorias');  // tras crear/editar/borrar
 *
 *   // En el módulo que ESCUCHA (Categorías de Conductores):
 *   const { onChange } = useDataInvalidation();
 *   onChange('conductores-categorias', () => { onSearch(); });
 */

const listeners = new Map<string, Set<() => void>>();

export const useDataInvalidation = () => {
    /**
     * Notifica a todos los componentes suscritos a `tabla` que deben recargar.
     */
    const invalidate = (tabla: string): void => {
        const cbs = listeners.get(tabla);
        if (!cbs || cbs.size === 0) {
            console.log(`[useDataInvalidation] No hay listeners para "${tabla}"`);
            return;
        }
        console.log(`[useDataInvalidation] Invalidando "${tabla}" (${cbs.size} listeners)`);
        cbs.forEach((cb) => {
            try {
                cb();
            } catch (err) {
                console.error(`[useDataInvalidation] Error en listener de "${tabla}":`, err);
            }
        });
    };

    /**
     * Notifica a VARIAS tablas a la vez.
     */
    const invalidateMany = (tablas: string[]): void => {
        tablas.forEach(invalidate);
    };

    /**
     * Suscribe un callback a los cambios de `tabla`.
     * Devuelve una función para desuscribirse.
     */
    const onChange = (tabla: string, callback: () => void): (() => void) => {
        if (!listeners.has(tabla)) {
            listeners.set(tabla, new Set());
        }
        listeners.get(tabla)!.add(callback);

        // Devuelve la función de cleanup
        return () => {
            const cbs = listeners.get(tabla);
            if (!cbs) return;
            cbs.delete(callback);
            if (cbs.size === 0) listeners.delete(tabla);
        };
    };

    return { invalidate, invalidateMany, onChange };
};
