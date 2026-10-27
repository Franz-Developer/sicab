<!-- C:\sistemas\sicab\sicab-frontend\app\pages\produccion\producciones-leche\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-inbox" title="Producciones de Leche"
        subtitle="Registro diario de ordeño por sucursal, turno y vacunos"
        :show-action="permisos.crear && !!filters.empresa_id && !!filters.sucursal_id && !!filters.fecha_produccion"
        action-label="NUEVA PRODUCCIÓN" action-icon="pi pi-plus"
        @action="router.push({ path: '/produccion/producciones-leche/nuevo', query: { fecha: filters.fecha_produccion } })">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort" @row-expand="onRowExpand">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white relative">
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-36 hidden sm:block">
                        <BaseInput v-model="filters.fecha_produccion" type="date" size="sm" class="w-full shadow-sm"
                            @update:model-value="aplicarFiltros" v-tooltip.bottom="'Filtrar por fecha exacta'" />
                    </div>

                    <div class="pl-0 sm:pl-40">
                        <FilterBar :filters="filters" search-placeholder="Buscar: sucursal, turno, observaciones..."
                            :active-filters-count="filtrosActivosCount"
                            modal-subtitle="Refina la búsqueda de producciones de leche" @search="onSearch"
                            @clear="limpiarFiltros" @apply="aplicarFiltros">
                            <template #advanced>
                                <div class="md:col-span-12">
                                    <label
                                        class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                    <BaseSelect v-model="filters.empresa_id" :options="empresaOptions"
                                        option-label="label" option-value="value" placeholder="Todas las empresas"
                                        size="sm" filter show-clear appendTo="body" :loading="loadingEmpresas"
                                        @update:model-value="onEmpresaFilterChange" class="w-full" />
                                </div>
                                <div class="md:col-span-12">
                                    <label
                                        class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalesFilterOptions"
                                        option-label="label" option-value="value" placeholder="Todas las sucursales"
                                        size="sm" filter show-clear appendTo="body" :loading="loadingSucursales"
                                        @update:model-value="onFilterChange" class="w-full" />
                                </div>
                                <div class="md:col-span-12">
                                    <label
                                        class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Turno</label>
                                    <BaseSelect v-model="filters.turno_ordeno_id" :options="turnoOptions"
                                        option-label="label" option-value="value" placeholder="Todos los turnos"
                                        size="sm" filter show-clear appendTo="body" :loading="loadingTurnos"
                                        @update:model-value="onFilterChange" class="w-full" />
                                </div>
                                <div class="md:col-span-6">
                                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Fecha
                                        desde</label>
                                    <BaseInput v-model="filters.fecha_produccion_desde" type="date" size="sm"
                                        @update:model-value="aplicarFiltros" />
                                </div>
                                <div class="md:col-span-6">
                                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Fecha
                                        hasta</label>
                                    <BaseInput v-model="filters.fecha_produccion_hasta" type="date" size="sm"
                                        @update:model-value="aplicarFiltros" />
                                </div>
                            </template>
                        </FilterBar>
                    </div>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-fecha_produccion="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.fecha_produccion }}</span>
                    <span v-if="data.turno_nombre" class="cell-secondary">
                        <span class="font-bold">TURNO:</span> {{ data.turno_nombre }}
                    </span>
                </div>
            </template>

            <template #body-ubicacion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre || '—' }}</span>
                    <span v-if="data.empresa_nombre" class="cell-secondary">
                        <span class="font-bold">EMP:</span> {{ data.empresa_nombre }}
                    </span>
                </div>
            </template>

            <template #body-litros="{ data }">
                <span class="font-bold text-sky-700">
                    <i class="pi pi-inbox text-[10px] mr-1 text-blue-500"></i>
                    {{ formatNumber(data.total_litros) }} L
                </span>
            </template>

            <template #body-descartado="{ data }">
                <span :class="Number(data.total_descartado) > 0 ? 'font-bold text-red-600' : 'text-slate-500'">
                    {{ formatNumber(data.total_descartado) }} L
                </span>
            </template>

            <template #body-total_neto="{ data }">
                <span class="font-bold text-emerald-700">
                    {{ formatNumber(data.total_neto) }} L
                </span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                    @edit="irAEditar(data)" @toggle="toggleEstado(data)" @delete="handleConfirmDelete(data)" />
            </template>

            <!-- ═══════════ EXPANSIÓN con detalles ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Empresa</span>
                            <span class="expansion-value">{{ data.empresa_nombre || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Sucursal</span>
                            <span class="expansion-value">
                                {{ data.sucursal_nombre || '—' }}
                                <span v-if="data.sucursal_codigo" class="text-slate-500">({{ data.sucursal_codigo
                                    }})</span>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Turno</span>
                            <span class="expansion-value">
                                {{ data.turno_nombre || '—' }}
                                <span v-if="data.turno_codigo" class="text-slate-500">({{ data.turno_codigo }})</span>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Producción</span>
                            <span class="expansion-value">{{ data.fecha_produccion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Total Litros</span>
                            <span class="expansion-value">{{ formatNumber(data.total_litros) }} L</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Total Descartado</span>
                            <span class="expansion-value">{{ formatNumber(data.total_descartado) }} L</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Total Neto</span>
                            <span class="expansion-value font-bold text-emerald-700">{{ formatNumber(data.total_neto) }}
                                L</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Temperatura Promedio</span>
                            <span class="expansion-value">{{ data.temperatura_promedio != null ?
                                `${data.temperatura_promedio} °C` : '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Densidad Promedio</span>
                            <span class="expansion-value">{{ data.densidad_promedio != null ? `${data.densidad_promedio}
                                g/mL` : '—' }}</span>
                        </div>
                        <div class="expansion-item md:col-span-2">
                            <span class="expansion-label">Observaciones</span>
                            <span class="expansion-value" :title="data.observaciones || '—'">{{ data.observaciones ||
                                '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                    </div>

                    <div class="mt-3 border-t border-dashed border-slate-300 pt-3">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="text-[11px] font-black text-sky-900 uppercase tracking-wider">
                                <i class="pi pi-list mr-1"></i>
                                Detalle por Vacuno ({{ data.total_vacunos ?? 0 }})
                            </h4>
                        </div>

                        <div v-if="loadingDetalles[data.produccion_leche_id]"
                            class="text-center py-3 text-xs text-slate-500">
                            <i class="pi pi-spin pi-spinner mr-1"></i> Cargando vacunos...
                        </div>
                        <div v-else-if="!(detallesPorProduccion[data.produccion_leche_id]?.length)"
                            class="text-center py-3 text-xs text-slate-400">
                            Sin vacunos registrados.
                        </div>
                        <table v-else class="w-full text-[11px] border-collapse">
                            <thead>
                                <tr class="bg-sky-100 text-sky-900">
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Arete</th>
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Nombre</th>
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Raza</th>
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Categoría</th>
                                    <th class="text-right px-2 py-1 font-bold uppercase text-[9px]">Litros</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="det in detallesPorProduccion[data.produccion_leche_id]"
                                    :key="det.produccion_leche_detalle_id"
                                    class="border-b border-slate-200 hover:bg-sky-50">
                                    <td class="px-2 py-1 font-bold">{{ det.vacuno_arete || '—' }}</td>
                                    <td class="px-2 py-1">{{ det.vacuno_nombre || '—' }}</td>
                                    <td class="px-2 py-1 text-slate-600">{{ det.raza_nombre || '—' }}</td>
                                    <td class="px-2 py-1 text-slate-600">{{ det.categoria_nombre || '—' }}</td>
                                    <td class="px-2 py-1 text-right font-bold text-emerald-700">{{
                                        formatNumber(det.litros) }} L</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="bg-slate-100">
                                    <td colspan="4" class="px-2 py-1 text-right font-bold text-[10px] uppercase">Suma
                                        detalles:</td>
                                    <td class="px-2 py-1 text-right font-bold text-emerald-800">
                                        {{ formatNumber(sumaDetalles(data.produccion_leche_id)) }} L
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Producción de Leche" :item-name="deleteItemName"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { useRouter } from 'vue-router';
    import { ref, computed, shallowRef, onMounted } from 'vue';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'Producciones de Leche' });
    const router = useRouter();
    const route = useRoute();

    interface OptionItem { label: string; value: number; empresa_id?: number; }

    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    const empresaIdInicial: number | null = Number(authStore.user?.empresa_id) || null;
    const sucursalIdInicial: number | null = Number(authStore.user?.sucursal_id) || null;

    // ============ CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const sucursalesAllOptions = shallowRef<OptionItem[]>([]);
    const sucursalesFilterOptions = shallowRef<OptionItem[]>([]);
    const turnoOptions = shallowRef<OptionItem[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingTurnos = ref(false);

    const deleteItemName = ref('');

    // ============ CACHÉ DE DETALLES POR PRODUCCIÓN (para expansión) ============
    const detallesPorProduccion = ref<Record<number, any[]>>({});
    const loadingDetalles = ref<Record<number, boolean>>({});

    // ============ CARGA DE CATÁLOGOS ============
    const cargarEmpresas = async (): Promise<void> => {
        loadingEmpresas.value = true;
        try {
            const res: any = await $api('/empresas', {
                method: 'GET',
                params: { limit: 1000, sortField: 'empresa', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            empresaOptions.value = lista.map((e: any): OptionItem => ({ label: e.empresa, value: Number(e.empresa_id) }));
        } catch (err) {
            console.error('Error al cargar empresas:', err);
            empresaOptions.value = [];
        } finally { loadingEmpresas.value = false; }
    };

    const cargarSucursales = async (): Promise<void> => {
        loadingSucursales.value = true;
        try {
            const res: any = await $api('/sucursales', {
                method: 'GET',
                params: { limit: 1000, sortField: 'sucursal', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            sucursalesAllOptions.value = lista.map((s: any): OptionItem => ({
                label: `${s.sucursal}`.trim(),
                value: Number(s.sucursal_id),
                empresa_id: Number(s.empresa_id),
            }));
            sucursalesFilterOptions.value = sucursalesAllOptions.value;
        } catch (err) {
            console.error('Error al cargar sucursales:', err);
            sucursalesAllOptions.value = [];
            sucursalesFilterOptions.value = [];
        } finally { loadingSucursales.value = false; }
    };

    const cargarTurnos = async (): Promise<void> => {
        loadingTurnos.value = true;
        try {
            const res: any = await $api('/turnos-ordeno', {
                method: 'GET',
                params: { limit: 500, sortField: 'turno', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            turnoOptions.value = lista.map((t: any): OptionItem => ({ label: t.turno, value: Number(t.turno_ordeno_id) }));
        } catch (err) {
            console.error('Error al cargar turnos:', err);
            turnoOptions.value = [];
        } finally { loadingTurnos.value = false; }
    };

    // ============ FILTROS EMPRESA/SUCURSAL ============
    const onEmpresaFilterChange = (): void => {
        const empId = filters.value.empresa_id;
        if (empId) {
            sucursalesFilterOptions.value = sucursalesAllOptions.value.filter(s => s.empresa_id === Number(empId));
            if (!sucursalesFilterOptions.value.some(s => s.value === filters.value.sucursal_id)) {
                filters.value.sucursal_id = null;
            }
        } else {
            sucursalesFilterOptions.value = sucursalesAllOptions.value;
        }
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        deleteDialog, permisos,
        onPage, onSort, onSearch,
        toggleEstado, confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'producciones-leche',
        tablaPermisos: 'producciones_leche',
        sortFieldDefault: 'produccion_leche_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        defaultFilters: {
            global: '', exactMatch: 0,
            empresa_id: empresaIdInicial,
            sucursal_id: sucursalIdInicial,
            turno_ordeno_id: null,
            fecha_produccion: null,
            fecha_produccion_desde: '',
            fecha_produccion_hasta: '',
        },
        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.turno_ordeno_id) extra.turno_ordeno_id = Number(f.turno_ordeno_id);
            if (f.fecha_produccion) extra.fecha_produccion = f.fecha_produccion;
            if (f.fecha_produccion_desde) extra.fecha_produccion_desde = f.fecha_produccion_desde;
            if (f.fecha_produccion_hasta) extra.fecha_produccion_hasta = f.fecha_produccion_hasta;
            return extra;
        },
        getPrimaryKey: (item: any) => item.produccion_leche_id,
        getCleanForm: () => ({}),
        buildPayload: () => ({}),
        validate: () => true,
    });

    // ============ DETALLES EN EXPANSIÓN ============
    const cargarDetalles = async (produccionId: number): Promise<void> => {
        if (detallesPorProduccion.value[produccionId]) return;
        loadingDetalles.value = { ...loadingDetalles.value, [produccionId]: true };
        try {
            const res: any = await $api(`/producciones-leche/${produccionId}`, { method: 'GET' });
            const detalles = Array.isArray(res?.detalles) ? res.detalles : [];
            detallesPorProduccion.value = { ...detallesPorProduccion.value, [produccionId]: detalles };
        } catch (err) {
            console.error(`Error al cargar detalles de producción ${produccionId}:`, err);
            detallesPorProduccion.value = { ...detallesPorProduccion.value, [produccionId]: [] };
        } finally {
            loadingDetalles.value = { ...loadingDetalles.value, [produccionId]: false };
        }
    };

    const onRowExpand = async (event: any) => {
        const data = event.data;
        if (data?.produccion_leche_id) {
            await cargarDetalles(Number(data.produccion_leche_id));
        }
    };

    const sumaDetalles = (produccionId: number): number => {
        const arr = detallesPorProduccion.value[produccionId] ?? [];
        return arr.reduce((s: number, d: any) => s + Number(d.litros ?? 0), 0);
    };

    const handleConfirmDelete = (data: any): void => {
        deleteItemName.value = `Producción ${data.sucursal_nombre || ''} · ${data.turno_nombre || ''} · ${data.fecha_produccion || ''}`;
        confirmDelete(data);
    };

    // ============ HELPERS ============
    const formatNumber = (v: any): string => {
        if (v == null || v === '') return '0.00';
        const n = Number(v);
        if (!Number.isFinite(n)) return '0.00';
        return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'fecha_produccion', header: 'FECHA / TURNO', template: 'body-fecha_produccion', sortable: true, class: 'w-40' },
        { field: 'sucursal_nombre', header: 'UBICACIÓN', template: 'body-ubicacion', sortable: true, class: 'w-48' },
        { field: 'total_litros', header: 'LITROS', template: 'body-litros', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'total_descartado', header: 'DESCARTADO', template: 'body-descartado', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'total_neto', header: 'NETO', template: 'body-total_neto', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center acciones-col', style: 'width: 90px; min-width: 90px; max-width: 90px;', headerClass: '!text-center', bodyClass: '!text-center !px-0 !min-w-[90px]' },
    ];

    // ============ FILTROS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.turno_ordeno_id) count++;
        if (filters.value.fecha_produccion) count++;
        if (filters.value.fecha_produccion_desde) count++;
        if (filters.value.fecha_produccion_hasta) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        if (filters.value.fecha_produccion) {
            filters.value.fecha_produccion_desde = '';
            filters.value.fecha_produccion_hasta = '';
        } else if (filters.value.fecha_produccion_desde || filters.value.fecha_produccion_hasta) {
            filters.value.fecha_produccion = null;
        }
        const desde = filters.value.fecha_produccion_desde;
        const hasta = filters.value.fecha_produccion_hasta;
        if (desde && hasta && desde > hasta) {
            notify('warn', 'Rango de fechas inválido', 'La fecha "desde" no puede ser mayor que "hasta".');
            return;
        }
        if (filters.value.sucursal_id && filters.value.empresa_id) {
            const suc = sucursalesAllOptions.value.find(s => s.value === filters.value.sucursal_id);
            if (suc?.empresa_id !== Number(filters.value.empresa_id)) {
                notify('warn', 'Filtros incoherentes', 'La sucursal no pertenece a la empresa seleccionada.');
                return;
            }
        }
        lazyParams.value.first = 0;
        onSearch();
    };

    const onFilterChange = (): void => { lazyParams.value.first = 0; onSearch(); };

    const limpiarFiltros = (): void => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.turno_ordeno_id = null;
        filters.value.fecha_produccion = null;
        filters.value.fecha_produccion_desde = '';
        filters.value.fecha_produccion_hasta = '';
        sucursalesFilterOptions.value = sucursalesAllOptions.value;
        lazyParams.value.first = 0;
        onSearch();
    };

    const irAEditar = (data: any) => {
        router.push({ path: `/produccion/producciones-leche/${data.produccion_leche_id}` });
    };

    // ============ INIT ============
    onMounted(async () => {
        await Promise.all([cargarEmpresas(), cargarSucursales(), cargarTurnos()]);

        if (filters.value.empresa_id) {
            sucursalesFilterOptions.value = sucursalesAllOptions.value.filter(
                (s) => s.empresa_id === Number(filters.value.empresa_id)
            );
        }

        const queryFecha = route.query.fecha;
        if (queryFecha) {
            filters.value.fecha_produccion = queryFecha as string;
            filters.value.fecha_produccion_desde = '';
            filters.value.fecha_produccion_hasta = '';
        }

        lazyParams.value.sortField = 'produccion_leche_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
