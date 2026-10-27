<!-- C:\sistemas\sicab\sicab-frontend\app\pages\catalogos\pesos-estandar-vacuno\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-sliders-h" title="Pesos Estándar por Vacuno"
        subtitle="Rangos de peso de referencia por raza y categoría" :show-action="permisos.crear"
        action-label="NUEVO RANGO" action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar por observaciones..."
                        :active-filters-count="filtrosActivosCount"
                        modal-subtitle="Refina la búsqueda de rangos de peso" modal-width="w-[95vw] md:w-[450px]"
                        @search="onSearch" @clear="limpiarFiltros" @apply="aplicarFiltros">

                        <template #advanced>
                            <div class="col-span-1 md:col-span-6">
                                <label class="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                                    Raza
                                </label>
                                <BaseSelect v-model="filters.raza_id" :options="razaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las razas" size="sm" filter show-clear
                                    appendTo="body" :loading="loadingRazas" class="w-full"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                            <div class="col-span-1 md:col-span-6">
                                <label class="block text-[10px] font-bold text-slate-600 mb-1 uppercase">
                                    Categoría
                                </label>
                                <BaseSelect v-model="filters.categoria_vacuno_id" :options="categoriaOptions"
                                    option-label="label" option-value="value" placeholder="Todas las categorías"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingCategorias"
                                    class="w-full" @update:model-value="aplicarFiltros" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <template #body-raza_categoria="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.raza_nombre || '—' }}</span>
                    <span class="cell-secondary">
                        <span class="font-bold text-[9px]">CATEGORÍA:</span> {{ data.categoria_vacuno_nombre || '—' }}
                    </span>
                </div>
            </template>

            <template #body-rango_peso="{ data }">
                <div class="flex flex-col text-[11px] leading-tight items-center w-full gap-0.5">
                    <span class="text-emerald-600 font-bold flex items-center w-full justify-center">
                        <i class="pi pi-arrow-down text-[10px] mr-1"></i>
                        <span class="mr-1">MIN:</span>
                        <span class="font-black">{{ data.peso_min_kg != null ? `${data.peso_min_kg} kg` : '—' }}</span>
                    </span>
                    <span class="text-purple-600 font-bold flex items-center w-full justify-center">
                        <i class="pi pi-arrow-up text-[10px] mr-1"></i>
                        <span class="mr-1">MAX:</span>
                        <span class="font-black">{{ data.peso_max_kg != null ? `${data.peso_max_kg} kg` : '—' }}</span>
                    </span>
                </div>
            </template>

            <template #body-observaciones="{ data }">
                <span class="cell-primary-normal">{{ data.observaciones || '—' }}</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" @edit="edit(data)"
                    @toggle="toggleEstado(data)" @delete="confirmDelete(data)" />
            </template>

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación:</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro:</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Actualización:</span>
                            <span class="expansion-value">{{ data.fecha_actualizacion || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[700px]" maxHeight="92vh"
        :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-sliders-h text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div
                    class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                    <span>Información del Rango de Peso</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Raza <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="razaRef" v-model="formObj.raza_id" :options="razaOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar raza..." size="sm" filter
                            :loading="loadingRazas" :disabled="estaProtegido('raza_id') || isUpdate"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('raza_id') || isUpdate }" />
                        <small v-if="isUpdate" class="text-slate-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La raza no se puede modificar en la edición
                        </small>
                        <small v-else-if="(submitted || touched.raza_id) && !formObj.raza_id"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe seleccionar una raza
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Categoría <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.categoria_vacuno_id" :options="categoriaOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar categoría..." size="sm"
                            filter :loading="loadingCategorias"
                            :disabled="estaProtegido('categoria_vacuno_id') || isUpdate"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('categoria_vacuno_id') || isUpdate }" />
                        <small v-if="isUpdate" class="text-slate-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La categoría no se puede modificar en la edición
                        </small>
                        <small v-else-if="(submitted || touched.categoria_vacuno_id) && !formObj.categoria_vacuno_id"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe seleccionar una categoría
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Peso Mínimo (kg) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.peso_min_kg" type="number" step="0.01" :min="0.01" size="sm"
                            placeholder="Ej: 150.50" @blur="touched.peso_min_kg = true" />
                        <small v-if="(submitted || touched.peso_min_kg) && !formObj.peso_min_kg"
                            class="text-red-500 font-semibold text-[10px]">
                            El peso mínimo es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.peso_min_kg) && $rules.dineroMayorACero()(formObj.peso_min_kg) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.dineroMayorACero()(formObj.peso_min_kg) }}
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Peso Máximo (kg) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.peso_max_kg" type="number" step="0.01" :min="0.01" size="sm"
                            placeholder="Ej: 250.00" @blur="touched.peso_max_kg = true" />
                        <small v-if="(submitted || touched.peso_max_kg) && !formObj.peso_max_kg"
                            class="text-red-500 font-semibold text-[10px]">
                            El peso máximo es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.peso_max_kg) && $rules.dineroMayorACero()(formObj.peso_max_kg) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.dineroMayorACero()(formObj.peso_max_kg) }}
                        </small>
                    </div>

                    <div v-if="rangoPesoInvalido" class="md:col-span-12">
                        <div
                            class="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
                            <i class="pi pi-exclamation-triangle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                El peso máximo ({{ formObj.peso_max_kg }} kg) no puede ser menor que el peso mínimo
                                ({{ formObj.peso_min_kg }} kg).
                            </span>
                        </div>
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Observaciones
                        </label>
                        <BaseInput v-model="formObj.observaciones" :maxlength="500" size="sm"
                            placeholder="Notas adicionales sobre este rango de peso" />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton :label="isUpdate ? 'Actualizar' : 'Guardar Registro'" icon="pi pi-save" :loading="loading"
                    variant="primary" @click="save" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Rango de Peso"
        :item-name="`${formObj.raza_nombre || ''} - ${formObj.categoria_vacuno_nombre || ''}`" @confirm="deleteItem" />
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, nextTick } from 'vue';
import { ESTADO_ACTIVO } from '~/constants/estados.constant';

useHead({ title: 'Pesos Estándar por Vacuno' });

interface OptionItem {
    label: string;
    value: number;
}

const { $rules } = useNuxtApp() as any;
const { $api } = useNuxtApp() as any;

// ============ CATÁLOGOS PARA FILTROS Y FORMULARIO ============
const razaOptions = shallowRef<OptionItem[]>([]);
const loadingRazas = ref(false);

const categoriaOptions = shallowRef<OptionItem[]>([]);
const loadingCategorias = ref(false);

const cargarRazas = async (): Promise<void> => {
    loadingRazas.value = true;
    try {
        const res: any = await $api('/razas', {
            method: 'GET',
            params: { limit: 1000, sortField: 'raza', sortOrder: 1, estado_id: ESTADO_ACTIVO },
        });
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        razaOptions.value = lista.map((r: any): OptionItem => ({
            label: r.raza,
            value: Number(r.raza_id),
        }));
    } catch (err) {
        console.error('Error al cargar razas:', err);
        razaOptions.value = [];
    } finally {
        loadingRazas.value = false;
    }
};

const cargarCategorias = async (): Promise<void> => {
    loadingCategorias.value = true;
    try {
        const res: any = await $api('/categorias-vacuno', {
            method: 'GET',
            params: { limit: 1000, sortField: 'categoria', sortOrder: 1, estado_id: ESTADO_ACTIVO },
        });
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        categoriaOptions.value = lista.map((c: any): OptionItem => ({
            label: c.categoria,
            value: Number(c.categoria_vacuno_id),
        }));
    } catch (err) {
        console.error('Error al cargar categorías:', err);
        categoriaOptions.value = [];
    } finally {
        loadingCategorias.value = false;
    }
};

// ============ COMPOSABLE CRUD ============
const {
    items, loading, totalRecords, filters, lazyParams,
    dialog, deleteDialog, formObj, submitted, touched,
    isUpdate, permisos, estaProtegido,
    onPage, onSort, onSearch,
    openNew, edit, hideDialog, save,
    toggleEstado, confirmDelete, deleteItem,
} = useCrudTable<any>({
    tabla: 'pesos-estandar-vacuno',
    tablaPermisos: 'pesos_estandar_vacuno',
    sortFieldDefault: 'peso_estandar_id',
    sortOrderDefault: -1,
    rowsDefault: 10,
    autoLoad: false,

    camposProtegidosPorDependencia: ['raza_id', 'categoria_vacuno_id'],

    defaultFilters: {
        global: '',
        exactMatch: 0,
        raza_id: null,
        categoria_vacuno_id: null,
    },

    getExtraFilters: (f: Record<string, any>) => {
        const extra: Record<string, any> = {
            exactMatch: f.exactMatch ?? 0,
        };
        if (f.raza_id) extra.raza_id = Number(f.raza_id);
        if (f.categoria_vacuno_id) extra.categoria_vacuno_id = Number(f.categoria_vacuno_id);
        return extra;
    },

    getPrimaryKey: (item: any) => item.peso_estandar_id,

    getCleanForm: () => ({
        peso_estandar_id: null,
        raza_id: null,
        categoria_vacuno_id: null,
        peso_min_kg: null,
        peso_max_kg: null,
        observaciones: '',
    }),

    buildPayload: (form: any) => {
        const payload: Record<string, any> = {
            peso_min_kg: Number(form.peso_min_kg),
            peso_max_kg: Number(form.peso_max_kg),
        };
        // Solo se envían raza_id y categoria_vacuno_id en la creación
        if (!isUpdate.value) {
            payload.raza_id = Number(form.raza_id);
            payload.categoria_vacuno_id = Number(form.categoria_vacuno_id);
        }
        if (form.observaciones?.trim()) {
            payload.observaciones = form.observaciones.trim();
        } else {
            payload.observaciones = null;
        }
        return payload;
    },

    validate: (form: any, rules: any, notify: any) => {
        if (!isUpdate.value && !form.raza_id) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar una raza.');
            return false;
        }
        if (!isUpdate.value && !form.categoria_vacuno_id) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar una categoría de vacuno.');
            return false;
        }
        if (rules.dineroMayorACero()(form.peso_min_kg) !== true) {
            notify('warn', 'Peso inválido', 'El peso mínimo debe ser mayor a 0.');
            return false;
        }
        if (rules.dineroMayorACero()(form.peso_max_kg) !== true) {
            notify('warn', 'Peso inválido', 'El peso máximo debe ser mayor a 0.');
            return false;
        }
        if (Number(form.peso_max_kg) < Number(form.peso_min_kg)) {
            notify('warn', 'Rango inválido', 'El peso máximo no puede ser menor que el peso mínimo.');
            return false;
        }
        return true;
    },
});

// ============ COMPUTADOS ============
const tituloDialog = computed(() => isUpdate.value ? 'EDITAR RANGO DE PESO' : 'NUEVO RANGO DE PESO');
const subtituloDialog = computed(() =>
    isUpdate.value
        ? 'Actualización del rango de peso estándar'
        : 'Registro de nuevo rango de peso estándar'
);

const rangoPesoInvalido = computed(() => {
    const min = formObj.value.peso_min_kg;
    const max = formObj.value.peso_max_kg;
    if (min == null || min === '' || max == null || max === '') return false;
    return Number(max) < Number(min);
});

const filtrosActivosCount = computed(() => {
    let count = 0;
    if (filters.value.raza_id) count++;
    if (filters.value.categoria_vacuno_id) count++;
    return count;
});

const aplicarFiltros = (): void => {
    lazyParams.value.first = 0;
    onSearch();
};

const limpiarFiltros = (): void => {
    filters.value.raza_id = null;
    filters.value.categoria_vacuno_id = null;
    lazyParams.value.first = 0;
    onSearch();
};

// ============ FOCUS ============
const razaRef = ref<any>(null);

const focusFirstInput = async (): Promise<void> => {
    await nextTick();
    setTimeout(() => {
        const el = razaRef.value?.$el as HTMLElement | null;
        if (el) {
            const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
            trigger?.focus();
            trigger?.click();
        }
    }, 350);
};

// ============ COLUMNAS ============
const columns = [
    { expander: true, class: 'w-10', bodyClass: '!text-center' },
    { field: 'raza_nombre', header: 'RAZA / CATEGORÍA', template: 'body-raza_categoria', sortable: true },
    { field: 'peso_min_kg', header: 'RANGO DE PESO', template: 'body-rango_peso', sortable: true, class: 'w-44', bodyClass: '!text-center' },
    { field: 'observaciones', header: 'OBSERVACIONES', template: 'body-observaciones', sortable: false },
    { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
    { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center w-24', bodyClass: '!min-w-[90px]' },
];

// ============ INIT ============
onMounted(async () => {
    await Promise.all([cargarRazas(), cargarCategorias()]);
    lazyParams.value.sortField = 'peso_estandar_id';
    lazyParams.value.sortOrder = -1;
    lazyParams.value.first = 0;
    onSearch();
});
</script>