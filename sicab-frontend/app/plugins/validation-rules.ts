// C:\sistemas\sicab\sicab-frontend\app\plugins\validation-rules.ts
export default defineNuxtPlugin(() => {
    // UTILIDADES INTERNAS
    const isEmpty = (v: any): boolean =>
        v === null || v === undefined || v === '' || (typeof v === 'string' && v.trim() === '');

    const toNumber = (v: any): number =>
        typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(',', '.'));

    // REGLAS GENERALES
    const Rules = {
        // OBLIGATORIEDAD
        obligatoria(msg?: string) {
            return (v: any) =>
                !isEmpty(v) || msg || 'Campo requerido';
        },

        seleccionObligatoria(msg?: string) {
            return (v: any) => {
                if (Array.isArray(v)) {
                    return v.length > 0 || msg || 'Debe seleccionar al menos un elemento';
                }
                if (isEmpty(v)) {
                    return msg || 'Debe seleccionar una opción';
                }
                if (typeof v === 'object') {
                    return Object.keys(v).length > 0 || msg || 'Debe seleccionar una opción';
                }
                return true;
            };
        },


        // LONGITUD
        longitudMaxima(max: number, msg?: string) {
            return (v: string) =>
                !v || v.length <= max || msg || `Máximo ${max} caracteres permitidos`;
        },

        longitudMinima(min: number, msg?: string) {
            return (v: string) =>
                !v || v.trim().length >= min || msg || `Mínimo ${min} caracteres requeridos`;
        },

        longitudRango(min: number, max: number, msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const len = v.trim().length;
                if (len < min || len > max) {
                    return msg || `Debe tener entre ${min} y ${max} caracteres`;
                }
                return true;
            };
        },

        // Códigos alfanuméricos en MAYÚSCULAS con guiones y guiones bajos.
        // Compatible con: `^[A-Z0-9_-]+$` (empresas, sucursales, cargos, roles, etc.)
        codigoMayusculas(minLength: number = 3, msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = new RegExp(`^[A-Z0-9_-]{${minLength},}$`);
                return regex.test(v) || msg || `Código inválido (mín. ${minLength} caracteres, mayúsculas, números, - y _)`;
            };
        },

        // Código con formato `^[A-Z0-9_-]+$` y longitud mínima personalizable.
        codigoAlfanumerico(minLength: number = 2, msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = new RegExp(`^[A-Z0-9_-]{${minLength},}$`);
                return regex.test(v) || msg || `Mínimo ${minLength} caracteres (A-Z, 0-9, - y _)`;
            };
        },

        // Códigos numéricos puros (ej. `codigo_asfi` CHAR(2) → `^[0-9]{2}$`).
        codigoNumericoExacto(length: number, msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = new RegExp(`^[0-9]{${length}}$`);
                return regex.test(v) || msg || `Debe contener exactamente ${length} dígitos numéricos`;
            };
        },

        // Códigos de categorías: `^[A-Z0-9-]+$` (sin guion bajo).
        codigoCategoria(minLength: number = 3, msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = new RegExp(`^[A-Z0-9-]{${minLength},}$`);
                return regex.test(v) || msg || `Código inválido (mín. ${minLength} caracteres, mayúsculas, números y -)`;
            };
        },

        soloLetrasEsp(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^[A-Za-zÑñÁÉÍÓÚÜáéíóúü]+(?: [A-Za-zÑñÁÉÍÓÚÜáéíóúü]+)*$/;
                return regex.test(v) || msg || 'Solo se permiten letras y espacios entre palabras';
            };
        },

        textoMayusculas(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                return v === v.toUpperCase() || msg || 'Debe estar en MAYÚSCULAS';
            };
        },

        textoMayusculasGuionBajo(minLength: number = 1, msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = new RegExp(`^[A-Z_]{${minLength},}$`);
                return regex.test(v) ||
                    msg ||
                    `Solo MAYÚSCULAS y guiones bajos (mín. ${minLength} carácter${minLength === 1 ? '' : 'es'})`;
            };
        },

        textoSeguro(msg?: string) {
            return (v: string) => {
                if (!v) return true;

                const latinExtRegExp = /[ÀàÈèÌìÒòÙùÂâÊêÎîÔôÛûÇçÄäËëÏïÖö]/;
                const symbolsRegExp = /[<>{}[\]\\]/;
                const trapCharsRegExp = /[\u00A0\u2013\u2014]/;

                if (latinExtRegExp.test(v)) {
                    return msg || 'Contiene caracteres de otros idiomas no permitidos';
                }
                if (symbolsRegExp.test(v)) {
                    return msg || 'Contiene símbolos especiales no permitidos';
                }
                if (trapCharsRegExp.test(v)) {
                    return msg || 'Contiene espacios o guiones con formato inválido';
                }
                return true;
            };
        },

        // COLOR HEXADECIMAL
        colorHex(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^#[0-9A-Fa-f]{6}$/;
                return regex.test(v) || msg || 'Formato de color inválido (esperado #RRGGBB)';
            };
        },


        // EMAIL (idéntica al CHECK de PostgreSQL)
        // Formato de correo electrónico. Misma regex que:
        // CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
        formatoCorreo(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
                if (v.includes(' ')) {
                    return msg ?? 'El correo no debe contener espacios';
                }
                return regex.test(v) || msg || 'Formato de correo inválido';
            };
        },


        // Teléfono: acepta dígitos, espacios, +, -, paréntesis. Mínimo 7 dígitos.
        telefono(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^[+]?[\d\s()-]{7,}$/;
                return regex.test(v) || msg || 'Teléfono inválido (mín. 7 dígitos)';
            };
        },

        // DNI: mínimo 5 caracteres alfanuméricos (compatible con CHECK de la BD).
        dni(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^[A-Za-z0-9-]{5,}$/;
                return regex.test(v) || msg || 'Documento inválido (mín. 5 caracteres)';
            };
        },

        // NIT: solo dígitos, mínimo 7 (compatible con CHECK de la BD).
        nit(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^[0-9]{7,}$/;
                return regex.test(v) || msg || 'NIT inválido (mín. 7 dígitos numéricos)';
            };
        },

        // Número de cuenta bancaria: mínimo 5 caracteres.
        numeroCuenta(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^[A-Za-z0-9-]{5,}$/;
                return regex.test(v) || msg || 'Número de cuenta inválido (mín. 5 caracteres)';
            };
        },


        // NÚMEROS Y MONTOS
        soloEnteros(msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                return /^\d+$/.test(String(v)) || msg || 'Solo se permiten números enteros';
            };
        },

        soloDinero(msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const regex = /^\d+([.,]\d{1,2})?$/;
                return regex.test(String(v)) || msg || 'Monto inválido (máximo 2 decimales)';
            };
        },

        soloDinero4Decimales(msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const regex = /^\d+([.,]\d{1,4})?$/;
                return regex.test(String(v)) || msg || 'Monto inválido (máximo 4 decimales)';
            };
        },

        dineroMayorACero(msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = toNumber(v);
                return (Number.isFinite(num) && num > 0) || msg || 'El monto debe ser mayor a 0';
            };
        },

        numeroMinimo(min: number, msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = toNumber(v);
                return (Number.isFinite(num) && num >= min) || msg || `El valor mínimo es ${min}`;
            };
        },

        numeroMaximo(max: number, msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = toNumber(v);
                return (Number.isFinite(num) && num <= max) || msg || `El valor no puede ser mayor a ${max}`;
            };
        },

        numeroRango(min: number, max: number, msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = toNumber(v);
                if (!Number.isFinite(num)) return msg || 'Valor inválido';
                return (num >= min && num <= max) || msg || `El valor debe estar entre ${min} y ${max}`;
            };
        },

        factorMayorQueUno(msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = toNumber(v);
                return (Number.isFinite(num) && num > 1) || msg || 'El factor debe ser mayor a 1';
            };
        },

        // FECHAS
        fechaNoFutura(msg?: string) {
            return (v: any) => {
                if (!v) return true;
                const fecha = new Date(v);
                const hoy = new Date();
                hoy.setHours(23, 59, 59, 999);
                return fecha <= hoy || msg || 'La fecha no puede ser mayor a la de hoy';
            };
        },

        fechaNoPasada(msg?: string) {
            return (v: any) => {
                if (!v) return true;
                const fecha = new Date(v);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                return fecha >= hoy || msg || 'La fecha no puede ser anterior a hoy';
            };
        },

        fechaFutura(msg?: string) {
            return (v: any) => {
                if (!v) return true;
                const fecha = new Date(v);
                const hoy = new Date();
                return fecha > hoy || msg || 'La fecha debe ser futura';
            };
        },

        // CONTRASEÑAS
        passwordFuerte(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                // Sincronizada con: create-usuario.dto.ts y update-password.dto.ts del backend
                const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>\/?\\|`~]).{8,20}$/;
                return regex.test(v) ||
                    msg ||
                    'La contraseña debe incluir mayúscula, minúscula, número y símbolo (mín. 8, máx. 20).';
            };
        },

        confirmarPassword(passwordOriginal: string, msg?: string) {
            return (v: string) =>
                v === passwordOriginal || msg || 'Las contraseñas no coinciden';
        },

        // STOCK / CANTIDADES
        stockMinimo(min: number = 1, msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = parseInt(String(v), 10);
                return num >= min || msg || `La cantidad mínima debe ser ${min}`;
            };
        },

        // PORCENTAJES
        porcentaje(msg?: string) {
            return (v: any) => {
                if (isEmpty(v)) return true;
                const num = toNumber(v);
                return (Number.isFinite(num) && num >= 0 && num <= 100) ||
                    msg || 'El porcentaje debe estar entre 0 y 100';
            };
        },

        // URL
        urlWeb(msg?: string) {
            return (v: string) => {
                if (!v) return true;
                const regex = /^https?:\/\/[^\s]+$/i;
                return regex.test(v) || msg || 'URL inválida (debe iniciar con http:// o https://)';
            };
        },
    };

    return {
        provide: {
            rules: Rules,
            $rules: Rules,
        },
    };
});
