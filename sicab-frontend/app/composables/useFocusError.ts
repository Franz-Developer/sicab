// C:\sistemas\sicab\sicab-frontend\app\composables\useFocusError.ts
/**
 * Composable global para enfocar el primer campo con error en formularios.
 *
 * Uso:
 *   const { focusFirstError } = useFocusError();
 *   await focusFirstError([
 *       { ref: razonSocialRef, invalid: !form.empresa?.trim() },
 *       { ref: codigoRef,      invalid: !form.codigo?.trim() },
 *       { ref: emailRef,       invalid: !!form.email && !esEmailValido(form.email) },
 *   ]);
 *
 * Devuelve `true` si encontró y enfocó un campo, `false` si no había errores.
 */
export const useFocusError = () => {
    /**
     * Espera al próximo tick + un pequeño delay para que el DOM esté listo
     * (útil cuando el dialog acaba de abrirse o hay transiciones).
     */
    const waitForDom = (ms = 100) =>
        new Promise<void>((resolve) => {
            nextTick(() => setTimeout(resolve, ms));
        });

    /**
     * Extrae el <input>/<select>/<textarea> real de un componente Vue.
     * Soporta: BaseInput, BaseSelect, BaseTextarea, etc. (envuelven un input nativo)
     * También funciona si le pasas directamente un HTMLElement.
     */
    const resolveElement = (target: any): HTMLElement | null => {
        if (!target) return null;
        if (target instanceof HTMLElement) return target;
        const el = target?.$el;
        return el instanceof HTMLElement ? el : null;
    };

    /**
     * Hace foco + select en el primer control válido dentro del target.
     */
    const focusTarget = (target: any): boolean => {
        const el = resolveElement(target);
        if (!el) return false;

        const control = el.querySelector(
            'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
        ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

        if (!control) return false;

        control.focus({ preventScroll: false });

        // Solo selecciona texto para inputs que lo permiten
        if (
            control instanceof HTMLInputElement &&
            ['text', 'email', 'number', 'search', 'tel', 'url', 'password'].includes(control.type)
        ) {
            try { control.select(); } catch { /* noop */ }
        }

        // Scroll suave al campo enfocado (útil en dialogs largos)
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });

        return true;
    };

    /**
     * Recorre la lista en orden y enfoca el PRIMER campo con `invalid: true`.
     * @returns true si enfocó algún campo, false si no había errores.
     */
    const focusFirstError = async (
        fields: Array<{ ref: any; invalid: boolean }>,
        delayMs = 100
    ): Promise<boolean> => {
        const first = fields.find((f) => f.invalid && f.ref);
        if (!first) return false;

        await waitForDom(delayMs);
        return focusTarget(first.ref);
    };

    const focusByName = async <K extends string>(
        errorField: K | null,
        refsMap: Record<K, any>,
        delayMs = 100
    ): Promise<boolean> => {
        if (!errorField) return false;
        const target = refsMap[errorField];
        if (!target) return false;

        await waitForDom(delayMs);
        return focusTarget(target);
    };

    return {
        focusFirstError,
        focusByName,
        focusTarget,
    };
};
