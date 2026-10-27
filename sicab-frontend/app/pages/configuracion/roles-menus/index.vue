<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\roles-menus\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-sitemap" title="Permisos por Rol"
        subtitle="Asigne los menús visibles por rol. Los roles nuevos nacen sin menús visibles." :show-action="false">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white flex flex-wrap items-center gap-2">

                    <!-- 1. Filtro de Rol Directo (PRIMERO) -->
                    <div class="w-64 flex-shrink-0">
                        <BaseSelect v-model="filters.rol_id" :options="rolOptions" option-label="label"
                            option-value="value" placeholder="Seleccione un rol" size="sm" filter show-clear
                            appendTo="body" :loading="loadingRoles"
                            v-tooltip.top="'Selecciona el rol para gestionar sus permisos.'"
                            @update:model-value="onFilterChange" class="w-full" />
                    </div>

                    <!-- 2. Buscador Global + 3. Coincidencia (A la derecha) -->
                    <!-- Al no tener el slot #advanced, el botón de filtros desaparece automáticamente -->
                    <div class="flex-1 min-w-[240px]">
                        <FilterBar :filters="filters" search-placeholder="Buscar: Rol, código, título o URL..."
                            @search="onSearch" @clear="limpiarFiltros" />
                    </div>

                </div>
            </template>

            <!-- ═══════════ HEADER DE VISIBLE (CHECKBOX MASIVO) ═══════════ -->
            <template #header-visible>
                <div class="flex flex-col items-center justify-center gap-1 py-0.5 w-full">
                    <span class="text-[9px] leading-none">VISIBLE</span>
                    <button type="button"
                        class="w-6 h-6 rounded-md flex items-center justify-center transition-all border"
                        :class="getHeaderCheckboxClass()" :disabled="!puedeToggleMasivo" :title="getHeaderTooltip()"
                        @click="toggleAll">
                        <i :class="bulkSaving ? 'pi pi-spin pi-spinner text-[10px]' : getHeaderCheckboxIcon()" />
                    </button>
                </div>
            </template>

            <!-- ═══════════ COLUMNA: ROL (CENTRADA) ═══════════ -->
            <template #body-rol="{ data }">
                <div class="flex flex-col justify-center leading-tight items-end md:items-center">
                    <span class="cell-primary">{{ data.rol_nombre }}</span>
                </div>
            </template>

            <!-- ═══════════ COLUMNA: MENÚ (COMPACTA + VERDE) ═══════════ -->
            <template #body-menu="{ data }">
                <div class="cell-stack relative" :class="{ 'pl-4': data.menu_padre_id }">
                    <!-- Línea vertical para hijos (pegada, sutil) -->
                    <span v-if="data.menu_padre_id"
                        class="absolute left-1 top-0 bottom-0 w-[2px] bg-emerald-300 rounded-full"
                        aria-hidden="true"></span>

                    <!-- Fila 1: Badge / Icono + Título -->
                    <div class="flex items-center gap-1.5 justify-end md:justify-start">
                        <span v-if="!data.menu_padre_id"
                            class="inline-flex items-center px-1.5 h-4 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-300 shrink-0">
                            PADRE
                        </span>
                        <i v-else class="pi pi-level-down-alt text-emerald-500 text-[9px] -rotate-90 shrink-0"
                            :title="`Hijo de: ${data.menu_padre_titulo}`" />

                        <span class="cell-primary">{{ data.menu_titulo }}</span>
                    </div>

                    <!-- Fila 2: URL o indicador de grupo -->
                    <span v-if="data.menu_url" class="cell-code text-right md:text-left block">
                        {{ data.menu_url }}
                    </span>
                    <span v-else class="text-[9px] text-emerald-600 italic font-semibold text-right md:text-left block">
                        <i class="pi pi-folder mr-1" />Grupo (sin URL)
                    </span>
                </div>
            </template>

            <!-- ═══════════ COLUMNA: VISIBLE (CHECKBOX INDIVIDUAL) ═══════════ -->
            <template #body-visible="{ data }">
                <div class="flex justify-center">
                    <button type="button"
                        class="w-7 h-7 rounded-md flex items-center justify-center transition-all border" :class="Number(data.estado_id) === ESTADO_ACTIVO
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'"
                        :disabled="!puedeToggleFila || saving[data.rol_menu_id] || bulkSaving" :title="!permisos.editar
                            ? 'No tienes permisos para editar'
                            : (!filters.rol_id
                                ? 'Seleccione un rol para habilitar esta acción'
                                : (Number(data.estado_id) === ESTADO_ACTIVO
                                    ? 'Ocultar menú para este rol'
                                    : 'Mostrar menú para este rol'))" @click="toggleVisible(data)">
                        <i :class="saving[data.rol_menu_id]
                            ? 'pi pi-spin pi-spinner text-[10px]'
                            : (Number(data.estado_id) === ESTADO_ACTIVO
                                ? 'pi pi-check text-[12px]'
                                : 'pi pi-times text-[12px]')" />
                    </button>
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
    import { ESTADO_ACTIVO, ESTADO_HISTORICO } from '~/constants/estados.constant';
    import { useAuthStore } from '@/stores/auth';

    useHead({ title: 'Permisos por Rol' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    // ============ ESTADO DE CATÁLOGOS ============
    const rolOptions = shallowRef<OptionItem[]>([]);
    const loadingRoles = ref(false);

    // ============ CARGA DE ROLES ============
    const cargarRoles = async (): Promise<void> => {
        loadingRoles.value = true;
        try {
            const res: any = await $api('/roles', {
                method: 'GET',
                params: {
                    limit: 200,
                    sortField: 'rol',
                    sortOrder: 1,
                    estado_id: ESTADO_ACTIVO,
                },
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

    // ============ FILTROS AVANZADOS ============
    const limpiarFiltros = (): void => {
        filters.value.rol_id = null;
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
        tabla: 'roles-menus',
        tablaPermisos: 'roles_menus',
        sortFieldDefault: 'rol_menu_id',
        sortOrderDefault: -1,
        rowsDefault: 50,
        autoLoad: false,

        defaultFilters: {
            global: '',
            exactMatch: 0,
            rol_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.rol_id) extra.rol_id = Number(f.rol_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.rol_menu_id,
        getCleanForm: () => ({}),
        buildPayload: () => ({}),
        validate: () => true,
    });

    // ============ FLAGS DE HABILITACIÓN ============
    const puedeToggleFila = computed<boolean>(() =>
        permisos.editar && !!filters.value.rol_id
    );

    const puedeToggleMasivo = computed<boolean>(() =>
        permisos.editar
        && !!filters.value.rol_id
        && items.value.length > 0
        && !bulkSaving.value
    );

    // ============ TOGGLE INDIVIDUAL ============
    const saving = ref<Record<number, boolean>>({});
    const bulkSaving = ref(false);

    const toggleVisible = async (item: any): Promise<void> => {
        if (!permisos.editar) {
            notify('warn', 'Sin permisos', 'No tienes permiso para editar esta asignación.');
            return;
        }
        if (!filters.value.rol_id) {
            notify('warn', 'Sin rol seleccionado', 'Seleccione un rol para editar la visibilidad.');
            return;
        }

        const pk = item.rol_menu_id;
        if (saving.value[pk]) return;

        const estadoActual = Number(item.estado_id);
        const nuevoEstado = estadoActual === ESTADO_ACTIVO
            ? ESTADO_HISTORICO
            : ESTADO_ACTIVO;

        // Optimistic UI
        const backup = item.estado_id;
        item.estado_id = nuevoEstado;
        saving.value[pk] = true;

        try {
            await $api(`/roles-menus/${pk}/toggle`, {
                method: 'PATCH',
                body: { estado_id: nuevoEstado },
            });

            // El backend cascada a hijos/ancestros. Recargamos para reflejarlo.
            onSearch();
            manejarCambioDeMenu();
        } catch (err: any) {
            item.estado_id = backup;
            const msg = err?.data?.message || 'No se pudo actualizar la visibilidad.';
            notify('error', 'Error', Array.isArray(msg) ? msg.join(', ') : msg);
            console.error('Error al togglear visibilidad:', err);
        } finally {
            delete saving.value[pk];
        }
    };

    // ============ TOGGLE MASIVO (CHECKBOX DE CABECERA) ============
    const getColumnState = (): 'all' | 'none' | 'mixed' => {
        const visibles = items.value;
        if (visibles.length === 0) return 'none';

        const activos = visibles.filter((it: any) => Number(it.estado_id) === ESTADO_ACTIVO).length;
        if (activos === 0) return 'none';
        if (activos === visibles.length) return 'all';
        return 'mixed';
    };

    const getHeaderCheckboxClass = (): string => {
        const state = getColumnState();
        if (state === 'all') return 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200';
        if (state === 'mixed') return 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200';
        return 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200';
    };

    const getHeaderCheckboxIcon = (): string => {
        const state = getColumnState();
        if (state === 'all') return 'pi pi-check text-[10px]';
        if (state === 'mixed') return 'pi pi-minus text-[10px]';
        return 'pi pi-times text-[10px]';
    };

    const getHeaderTooltip = (): string => {
        if (!permisos.editar) return 'No tienes permisos para editar';
        if (!filters.value.rol_id) return 'Seleccione un rol para habilitar la acción masiva';

        const state = getColumnState();
        if (state === 'all') return 'Ocultar todos los visibles en esta página';
        return 'Mostrar todos los visibles en esta página';
    };

    const toggleAll = async (): Promise<void> => {
        if (!permisos.editar) {
            notify('warn', 'Sin permisos', 'No tienes permiso para editar.');
            return;
        }
        if (bulkSaving.value) return;
        if (items.value.length === 0) return;

        const rolId = filters.value.rol_id;
        if (!rolId) {
            notify('warn', 'Sin rol seleccionado', 'Seleccione un rol en el filtro para hacer el toggle masivo.');
            return;
        }

        const state = getColumnState();
        const nuevoEstado = state === 'all' ? ESTADO_HISTORICO : ESTADO_ACTIVO;

        bulkSaving.value = true;
        try {
            await $api('/roles-menus/bulk-toggle', {
                method: 'POST',
                body: { rol_id: Number(rolId), estado_id: nuevoEstado },
            });
            onSearch();
            manejarCambioDeMenu();
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo completar la operación masiva.';
            notify('error', 'Error', Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            bulkSaving.value = false;
        }
    };

    // ============ COLUMNAS (ANCHOS AJUSTADOS) ============
    const columns = [
        { field: 'rol_nombre', header: 'ROL', sortable: false, template: 'body-rol', class: 'w-36', bodyClass: '!text-center', hideOnMobile: true },
        { field: 'menu_titulo', header: 'MENÚ', sortable: false, template: 'body-menu' },
        { field: 'estado_id', header: 'VISIBLE', sortable: false, template: 'body-visible', headerSlot: 'header-visible', bodyClass: '!text-center', class: 'w-24' },
    ];

    // ============ HELPERS ============
    const onFilterChange = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ 🔑 INVALIDACIÓN DE CACHÉ / AVISO DE RE-LOGIN ============
    const manejarCambioDeMenu = (): void => {
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
                'Modificaste el menú de tu propio rol. Serás redirigido al login en 2 segundos para aplicar los cambios.'
            );
            setTimeout(() => authStore.logout(), 2000);
            return;
        }
    };

    // ============ INIT ============
    onMounted(async () => {
        await cargarRoles();

        if (rolOptions.value.length === 1) {
            filters.value.rol_id = rolOptions.value[0]!.value;
        }

        if (filters.value.rol_id) {
            onSearch();
        }
    });
</script>
