<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\roles-permisos-tablas\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-table"
        title="Permisos por Rol x Tabla"
        subtitle="Matriz de permisos granulares rol x tabla. Los permisos se autogeneran al crear un rol."
        :show-action="false"
    >
        <BaseTable
            :value="items"
            :loading="loading"
            :columns="columns"
            :totalRecords="totalRecords"
            :rows="lazyParams.rows"
            :first="lazyParams.first"
            :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder"
            @page="onPage"
            @sort="onSort"
        >
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: Rol, código o tabla..."
                        :active-filters-count="filtrosActivosCount" modal-title="Filtrar Permisos"
                        modal-subtitle="Refina la búsqueda de permisos rol x tabla" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Rol (OBLIGATORIO) -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Rol <span class="text-red-500">*</span>
                                </label>
                                <BaseSelect v-model="filters.rol_id" :options="rolOptions" option-label="label"
                                    option-value="value" placeholder="Seleccione un rol" size="sm" filter show-clear appendTo="body"
                                    @update:model-value="aplicarFiltros" :loading="loadingRoles"
                                    v-tooltip.top="'Selecciona el rol para gestionar sus permisos por tabla.'"
                                    class="w-full" />
                            </div>

                            <!-- Tabla -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Tabla
                                </label>
                                <BaseSelect v-model="filters.tabla_id" :options="tablaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las tablas" size="sm" filter show-clear
                                    appendTo="body"
                                    :loading="loadingTablas" :disabled="!filters.rol_id" v-tooltip.top="filters.rol_id
                                        ? 'Filtra la matriz por una tabla específica. Sin selección muestra todas.'
                                        : 'Seleccione un rol primero.'" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ HEADERS DE ROL / TABLA / ESTADO ═══════════ -->
            <template #header-rol_nombre>
                <span class="text-[9px] leading-none block text-center w-full">ROL</span>
            </template>

            <template #header-tabla_nombre>
                <span class="text-[9px] leading-none block text-center w-full">TABLA</span>
            </template>

            <template #header-estado_registro>
                <span class="text-[9px] leading-none block text-center w-full">ESTADO</span>
            </template>

            <!-- ═══════════ HEADERS DE PERMISOS (BULK) ═══════════ -->
            <template
                v-for="perm in PERMISOS_TABLA"
                :key="`header-${perm.key}`"
                #[`header-${perm.key}`]
            >
                <div class="flex flex-col items-center gap-1 py-0.5 w-full">
                    <span
                        class="text-[9px] leading-none"
                        :class="{ 'opacity-50': !columnaTieneSoporte(perm.key) }"
                    >
                        {{ perm.label.toUpperCase() }}
                    </span>
                    <button
                        type="button"
                        class="w-5 h-5 rounded flex items-center justify-center transition-all border"
                        :class="getHeaderCheckboxClass(perm.key)"
                        :disabled="!puedeToggleColumna(perm.key)"
                        :title="getHeaderTooltip(perm.key)"
                        @click="toggleAll(perm.key)"
                    >
                        <i
                            :class="bulkSaving[perm.key]
                                ? 'pi pi-spin pi-spinner text-[9px]'
                                : getHeaderCheckboxIcon(perm.key)"
                        ></i>
                    </button>
                </div>
            </template>

            <!-- ═══════════ COLUMNA: ROL ═══════════ -->
            <template #body-rol="{ data }">
                <div class="flex flex-col items-center justify-center leading-tight">
                    <span class="cell-primary">{{ data.rol_nombre }}</span>
                </div>
            </template>

            <!-- ═══════════ COLUMNA: TABLA ═══════════ -->
            <template #body-tabla="{ data }">
                <div class="flex flex-col items-center justify-center leading-tight">
                    <span class="cell-primary">
                        {{ obtenerNombreAmigableTabla(data.tabla_nombre) }}
                    </span>
                </div>
            </template>

            <!-- ═══════════ BODY DE PERMISOS (TOGGLES INLINE) ═══════════ -->
            <template
                v-for="perm in PERMISOS_TABLA"
                :key="`body-${perm.key}`"
                #[`body-${perm.key}`]="{ data }"
            >
                <div class="flex justify-center">
                    <button
                        type="button"
                        class="w-6 h-6 rounded-md flex items-center justify-center transition-all border"
                        :class="getFilaCheckboxClass(data, perm.key)"
                        :disabled="!puedeToggleFila(data, perm.key)"
                        :title="getFilaTooltip(data, perm.key)"
                        @click="togglePermiso(data, perm.key)"
                    >
                        <i :class="getFilaCheckboxIcon(data, perm.key)" />
                    </button>
                </div>
            </template>

            <!-- ═══════════ COLUMNA: ESTADO ═══════════ -->
            <template #body-estado="{ data }">
                <div class="flex justify-center">
                    <CrudEstadoBadge
                        :estado="data.estado_registro"
                        :estado-id="Number(data.estado_id)"
                    />
                </div>
            </template>

            <!-- ═══════════ ESTADO VACÍO ═══════════ -->
            <template #empty>
                <div class="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <div class="bg-amber-50 border border-amber-200 rounded-full p-4">
                        <i class="pi pi-filter text-amber-500 text-2xl"></i>
                    </div>
                    <div>
                        <p class="text-sm font-black text-slate-700 uppercase tracking-wide">
                            Seleccione un rol para comenzar
                        </p>
                        <p class="text-xs text-slate-700 mt-1 max-w-md">
                            La matriz se cargará automáticamente al elegir un rol en el filtro superior.
                        </p>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>
</template>

<script setup lang="ts">
    import { ref, shallowRef, computed, onMounted } from 'vue';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';
    import { obtenerNombreAmigableTabla } from '~/constants/nombres-tablas.constant';
    import { useAuthStore } from '@/stores/auth';

    useHead({ title: 'Permisos por Rol x Tabla' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    type PermisoKey = | 'leer' | 'crear' | 'editar' | 'eliminar' | 'anular' | 'archivar' | 'desarchivar';

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    // ============ CONSTANTES ============
    const PERMISOS_TABLA: ReadonlyArray<{ key: PermisoKey; label: string }> = [
        { key: 'leer',        label: 'Leer'        },
        { key: 'crear',       label: 'Crear'       },
        { key: 'editar',      label: 'Editar'      },
        { key: 'eliminar',    label: 'Eliminar'    },
        { key: 'anular',      label: 'Anular'      },
        { key: 'archivar',    label: 'Archivar'    },
        { key: 'desarchivar', label: 'Desarchivar' },
    ];

    // ============ ESTADO DE CATÁLOGOS ============
    const rolOptions = shallowRef<OptionItem[]>([]);
    const loadingRoles = ref(false);

    const tablaOptions = shallowRef<OptionItem[]>([]);
    const loadingTablas = ref(false);

    // ============ ESTADO DE OPERACIONES ============
    const saving = ref<Record<string, boolean>>({});
    const bulkSaving = ref<Record<string, boolean>>({});

    // ============ CARGA DE CATÁLOGOS ============
    const cargarRoles = async (): Promise<void> => {
        loadingRoles.value = true;
        try {
            const res: any = await $api('/roles', {
                method: 'GET',
                params: { limit: 200, sortField: 'rol', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            rolOptions.value = lista
                .filter((r: any) => Number(r.es_admin) !== 1)
                .map((r: any): OptionItem => ({
                    label: `${r.rol}`,
                    value: Number(r.rol_id),
                }));
        } catch (err) {
            console.error('Error al cargar roles:', err);
            notify('error', 'Error al cargar roles', 'No se pudo obtener la lista de roles.');
            rolOptions.value = [];
        } finally {
            loadingRoles.value = false;
        }
    };

    const cargarTablas = async (): Promise<void> => {
        loadingTablas.value = true;
        try {
            const res: any = await $api('/tablas', {
                method: 'GET',
                params: { limit: 500, sortField: 'nombre', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });

            const lista = Array.isArray(res) ? res : (res?.data ?? []);

            tablaOptions.value = lista.map((t: any): OptionItem => ({
                label: obtenerNombreAmigableTabla(t.nombre),
                value: Number(t.tabla_id),
            }));
        } catch (err) {
            console.error('Error al cargar tablas:', err);
            notify('error', 'Error al cargar tablas', 'No se pudo obtener la lista de tablas.');
            tablaOptions.value = [];
        } finally {
            loadingTablas.value = false;
        }
    };

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.rol_id) count++;
        if (filters.value.tabla_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;

        if (!filters.value.rol_id) {
            filters.value.tabla_id = null;
            items.value = [];
            totalRecords.value = 0;
            return;
        }

        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.rol_id = null;
        filters.value.tabla_id = null;
        filters.value.global = '';
        filters.value.exactMatch = 0;
        lazyParams.value.first = 0;

        items.value = [];
        totalRecords.value = 0;
    };

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        permisos,
        onPage, onSort, onSearch,
    } = useCrudTable<any>({
        tabla: 'roles-permisos-tablas',
        tablaPermisos: 'roles_permisos_tablas',
        sortFieldDefault: 'tabla_nombre',
        sortOrderDefault: 1,
        rowsDefault: 50,
        autoLoad: false,

        defaultFilters: {
            global: '',
            exactMatch: 0,
            rol_id: null,
            tabla_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.rol_id)   extra.rol_id   = Number(f.rol_id);
            if (f.tabla_id) extra.tabla_id = Number(f.tabla_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.rol_permiso_tabla_id,
        getCleanForm: () => ({}),
        buildPayload: (form: any) => form,
    });

    // ============ HELPERS DE SOPORTE (backend) ============
    const tablaSoportaAccion = (data: any, campo: PermisoKey): boolean => {
        const key = `tabla_permite_${campo}`;
        return Number(data[key]) === 1;
    };

    const filasAplicables = (campo: PermisoKey): any[] => {
        return items.value.filter((it: any) =>
            Number(it.estado_id) === ESTADO_ACTIVO &&
            Number(it.rol_estado_id) === ESTADO_ACTIVO &&
            tablaSoportaAccion(it, campo)
        );
    };

    const columnaTieneSoporte = (campo: PermisoKey): boolean => {
        return items.value.some((it: any) =>
            Number(it.estado_id) === ESTADO_ACTIVO &&
            Number(it.rol_estado_id) === ESTADO_ACTIVO &&
            tablaSoportaAccion(it, campo)
        );
    };

    // ============ FLAGS DE HABILITACIÓN ============
    const puedeToggleFila = (data: any, campo: PermisoKey): boolean => {
        if (!permisos.editar) return false;
        if (Number(data.estado_id) !== ESTADO_ACTIVO) return false;
        if (Number(data.rol_estado_id) !== ESTADO_ACTIVO) return false;
        if (!tablaSoportaAccion(data, campo)) return false;
        if (saving.value[`${data.rol_permiso_tabla_id}-${campo}`]) return false;
        if (bulkSaving.value[campo]) return false;
        return true;
    };

    const puedeToggleColumna = (campo: PermisoKey): boolean => {
        if (!permisos.editar) return false;
        if (!filters.value.rol_id) return false;
        if (bulkSaving.value[campo]) return false;
        const aplicables = filasAplicables(campo);
        return aplicables.length > 0;
    };

    // ============ CLASES E ICONOS ============
    const getFilaCheckboxClass = (data: any, campo: PermisoKey): string => {
        if (!tablaSoportaAccion(data, campo)) {
            return 'bg-red-500 text-white border-red-600 cursor-not-allowed';
        }
        if (Number(data.estado_id) !== ESTADO_ACTIVO || Number(data.rol_estado_id) !== ESTADO_ACTIVO) {
            return 'bg-slate-50 text-slate-400 border-slate-300 cursor-not-allowed';
        }
        return Number(data[campo]) === 1
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
            : 'bg-slate-200 text-slate-700 border-slate-400 hover:bg-slate-300';
    };

    const getFilaCheckboxIcon = (data: any, campo: PermisoKey): string => {
        if (saving.value[`${data.rol_permiso_tabla_id}-${campo}`] || bulkSaving.value[campo]) {
            return 'pi pi-spin pi-spinner text-[10px]';
        }
        if (!tablaSoportaAccion(data, campo)) {
            return 'pi pi-ban text-[11px] font-bold';
        }
        return Number(data[campo]) === 1
            ? 'pi pi-check text-[11px]'
            : 'pi pi-times text-[11px]';
    };

    const getHeaderCheckboxClass = (campo: PermisoKey): string => {
        if (!columnaTieneSoporte(campo)) {
            return 'bg-red-500 text-white border-red-600 cursor-not-allowed';
        }
        const state = getColumnState(campo);
        if (state === 'all') return 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200';
        if (state === 'mixed') return 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200';
        return 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200';
    };

    const getHeaderCheckboxIcon = (campo: PermisoKey): string => {
        if (!columnaTieneSoporte(campo)) return 'pi pi-ban text-[11px] font-bold';
        const state = getColumnState(campo);
        if (state === 'all') return 'pi pi-check text-[11px] font-bold';
        if (state === 'mixed') return 'pi pi-minus text-[11px] font-bold';
        return 'pi pi-times text-[11px] font-bold';
    };

    // ============ ESTADO DE COLUMNA (BULK) ============
    const getColumnState = (campo: PermisoKey): 'all' | 'none' | 'mixed' => {
        const aplicables = filasAplicables(campo);
        if (aplicables.length === 0) return 'none';

        const activos = aplicables.filter((it: any) => Number(it[campo]) === 1).length;
        if (activos === 0) return 'none';
        if (activos === aplicables.length) return 'all';
        return 'mixed';
    };

    // ============ TOOLTIPS ============
    const getFilaTooltip = (data: any, campo: PermisoKey): string => {
        if (!permisos.editar) return 'No tienes permisos para editar';
        if (Number(data.estado_id) !== ESTADO_ACTIVO) return 'Registro no activo';
        if (Number(data.rol_estado_id) !== ESTADO_ACTIVO) return 'No se editan permisos de roles archivados';
        if (!tablaSoportaAccion(data, campo)) {
            return `La tabla "${data.tabla_nombre}" no soporta ${campo.toUpperCase()}`;
        }
        return Number(data[campo]) === 1
            ? `Quitar ${campo.toUpperCase()}`
            : `Otorgar ${campo.toUpperCase()}`;
    };

    const getHeaderTooltip = (campo: PermisoKey): string => {
        if (!permisos.editar) return 'No tienes permisos para editar';
        if (!filters.value.rol_id) return 'Seleccione un rol para habilitar la acción masiva';

        const aplicables = filasAplicables(campo);
        if (aplicables.length === 0) {
            return `Ninguna tabla visible soporta ${campo.toUpperCase()}`;
        }
        if (aplicables.length < items.value.length) {
            return `${campo.toUpperCase()}: ${aplicables.length} de ${items.value.length} tablas lo soportan`;
        }
        const state = getColumnState(campo);
        if (state === 'all') return `Quitar ${campo.toUpperCase()} a todos los visibles`;
        return `Otorgar ${campo.toUpperCase()} a todos los visibles`;
    };

    // ============ TOGGLE INDIVIDUAL ============
    const togglePermiso = async (item: any, campo: PermisoKey): Promise<void> => {
        if (!permisos.editar) {
            notify('warn', 'Sin permisos', 'No tienes permiso para editar esta asignación.');
            return;
        }
        if (Number(item.estado_id) !== ESTADO_ACTIVO) {
            notify('warn', 'Registro no activo', 'Solo se pueden editar permisos activos.');
            return;
        }
        if (Number(item.rol_estado_id) !== ESTADO_ACTIVO) {
            notify('warn', 'Rol archivado', 'No se pueden editar los permisos de un rol archivado.');
            return;
        }
        if (!tablaSoportaAccion(item, campo)) {
            notify('warn', 'Acción no soportada', `La tabla "${item.tabla_nombre}" no soporta ${campo.toUpperCase()}.`);
            return;
        }

        const pk = item.rol_permiso_tabla_id;
        const key = `${pk}-${campo}`;
        if (saving.value[key]) return;

        const valorActual = Number(item[campo]) === 1 ? 1 : 0;
        const nuevoValor = valorActual === 1 ? 0 : 1;

        // Optimistic UI
        const backup = item[campo];
        item[campo] = nuevoValor;
        saving.value[key] = true;

        try {
            await $api(`/roles-permisos-tablas/${pk}`, {
                method: 'PATCH',
                body: { [campo]: nuevoValor },
            });

            manejarCambioDePermisos();
        } catch (err: any) {
            item[campo] = backup;
            const msg = err?.data?.message || 'No se pudo actualizar el permiso.';
            notify('error', 'Error', Array.isArray(msg) ? msg.join(', ') : msg);
            console.error(`Error al togglear ${campo}:`, err);
        } finally {
            delete saving.value[key];
        }
    };

    // ============ BULK: TODOS / NINGUNO POR COLUMNA ============
    const toggleAll = async (campo: PermisoKey): Promise<void> => {
        if (!permisos.editar) {
            notify('warn', 'Sin permisos', 'No tienes permiso para editar esta asignación.');
            return;
        }
        if (bulkSaving.value[campo]) return;

        const aplicables = filasAplicables(campo);
        if (aplicables.length === 0) {
            notify('warn', 'Sin filas aplicables', `Ninguna fila visible soporta ${campo.toUpperCase()}.`);
            return;
        }

        const state = getColumnState(campo);
        const nuevoValor = state === 'all' ? 0 : 1;

        const backups = aplicables.map((it: any) => ({ item: it, valor: it[campo] }));

        aplicables.forEach((it: any) => { it[campo] = nuevoValor; });
        bulkSaving.value[campo] = true;

        try {
            await Promise.all(
                aplicables.map((it: any) =>
                    $api(`/roles-permisos-tablas/${it.rol_permiso_tabla_id}`, {
                        method: 'PATCH',
                        body: { [campo]: nuevoValor },
                    })
                )
            );

            manejarCambioDePermisos();
        } catch (err: any) {
            // Rollback del optimistic UI
            backups.forEach(({ item, valor }) => { item[campo] = valor; });

            // Detectar el error 429 (rate-limit)
            const status = err?.response?.status ?? err?.status ?? err?.statusCode;
            if (status === 429) {
                notify(
                    'warn',
                    'Demasiadas peticiones',
                    'Se excedió el límite de peticiones. Espera 1 minuto y vuelve a intentar.'
                );
            } else {
                const msg = err?.data?.message || `No se pudo actualizar ${campo} en lote.`;
                notify(
                    'error',
                    'Error en actualización masiva',
                    Array.isArray(msg) ? msg.join(', ') : msg
                );
            }

            console.error(`Error al aplicar bulk en ${campo}:`, err);
        } finally {
            delete bulkSaving.value[campo];
        }
    };

    // ============ COLUMNAS ============
    const columns = [
        { field: 'rol_nombre', header: 'ROL', sortable: false, template: 'body-rol', class: 'w-44', headerClass: '!text-center', bodyClass: '!text-center' },
        { field: 'tabla_nombre', header: 'TABLA', sortable: false, template: 'body-tabla', class: 'w-56', headerClass: '!text-center', bodyClass: '!text-center' },
        ...PERMISOS_TABLA.map(p => ({ field: p.key, header: p.label.toUpperCase(), sortable: false, template: `body-${p.key}`, headerSlot: `header-${p.key}`, headerClass: '!text-center', bodyClass: '!text-center', class: 'w-20' })),
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', headerClass: '!text-center', bodyClass: '!text-center', class: 'w-24' },
    ];

    // ============ INVALIDACIÓN DE CACHÉ / AVISO DE RE-LOGIN ============
    const manejarCambioDePermisos = (): void => {
        const rolAfectado = filters.value?.rol_id != null
            ? Number(filters.value.rol_id)
            : NaN;

        const rolActual = authStore.user?.rol_id != null
            ? Number(authStore.user.rol_id)
            : NaN;

        if (!Number.isNaN(rolAfectado) && rolAfectado === rolActual) {
            notify(
                'warn',
                'Tu sesión cambiará',
                'Modificaste los permisos de tu propio rol. Serás redirigido al login en 2 segundos para aplicar los cambios.'
            );
            setTimeout(() => authStore.logout(), 2000);
            return;
        }
    };

    // ============ INIT ============
    onMounted(async () => {
        await Promise.all([cargarRoles(), cargarTablas()]);

        if (rolOptions.value.length === 0) {
            notify('warn', 'Sin roles activos', 'No hay roles disponibles para gestionar permisos.');
            return;
        }

        if (rolOptions.value.length === 1) {
            filters.value.rol_id = rolOptions.value[0]!.value;
        }

        lazyParams.value.sortField = 'tabla_nombre';
        lazyParams.value.sortOrder = 1;
        lazyParams.value.first = 0;

        if (filters.value.rol_id) {
            onSearch();
        }
    });
</script>
