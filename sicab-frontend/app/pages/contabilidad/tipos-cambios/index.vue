<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\tipos-cambios\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-dollar" title="Tipos de Cambio"
        subtitle="Factores de conversión entre monedas (compra / venta)" :show-action="permisos.crear"
        action-label="NUEVO TIPO DE CAMBIO" action-icon="pi pi-plus" @action="openNew">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters"
                        search-placeholder="Sin búsqueda por texto — use los filtros avanzados"
                        :active-filters-count="filtrosActivosCount" modal-title="Filtros de Tipos de Cambio"
                        modal-subtitle="Filtra por moneda o rango de fechas de cotización" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Origen -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Moneda Origen
                                </label>
                                <BaseSelect v-model="filters.origen_moneda_id" :options="monedaOptions"
                                    option-label="label" option-value="value" placeholder="Todas las monedas" size="sm"
                                    filter show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <!-- Destino -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Moneda Destino
                                </label>
                                <BaseSelect v-model="filters.destino_moneda_id" :options="monedaOptions"
                                    option-label="label" option-value="value" placeholder="Todas las monedas" size="sm"
                                    filter show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <!-- Rango de Fechas -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Cotización Desde
                                </label>
                                <BaseInput v-model="filters.fecha_desde" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Cotización Hasta
                                </label>
                                <BaseInput v-model="filters.fecha_hasta" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-conversion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">
                        {{ data.origen_moneda?.abreviatura || '—' }}
                        <i class="pi pi-arrow-right text-[9px] text-slate-400 mx-1"></i>
                        {{ data.destino_moneda?.abreviatura || '—' }}
                    </span>
                    <span class="cell-secondary">
                        <span class="font-bold">ORIGEN:</span> {{ data.origen_moneda?.label || '—' }}
                    </span>
                </div>
            </template>

            <template #body-factor_compra="{ data }">
                <span class="cell-code">{{ formatFactor(data.factor_compra) }}</span>
            </template>

            <template #body-factor_venta="{ data }">
                <span class="cell-code">{{ formatFactor(data.factor_venta) }}</span>
            </template>

            <template #body-fecha_cotizacion="{ data }">
                <span class="cell-primary-normal">{{ data.fecha_cotizacion || '—' }}</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                    @edit="edit(data)" @delete="confirmDelete(data)" />
            </template>

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Actualización</span>
                            <span class="expansion-value">{{ data.fecha_actualizacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Baja</span>
                            <span class="expansion-value">{{ data.fecha_baja || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG PRINCIPAL (CRUD) ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[760px] lg:w-[820px]"
        maxHeight="92vh" :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-dollar text-white text-lg"></i>
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
                    <span>Conversión de Monedas</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Moneda Origen -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Moneda Origen <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="origenSelectRef" v-model="formObj.origen_moneda_id" :options="monedaOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar moneda..." size="sm"
                            filter :disabled="isUpdate || estaProtegido('origen_moneda_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate || estaProtegido('origen_moneda_id') }"
                            @update:model-value="touched.origen_moneda_id = true" />
                        <small v-if="isUpdate" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La moneda no se puede modificar en edición
                        </small>
                        <small v-else-if="estaProtegido('origen_moneda_id')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.origen_moneda_id) && $rules.seleccionObligatoria()(formObj.origen_moneda_id) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Requerido
                        </small>
                    </div>

                    <!-- Moneda Destino -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Moneda Destino <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.destino_moneda_id" :options="monedaOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar moneda..." size="sm" filter
                            :disabled="isUpdate || estaProtegido('destino_moneda_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate || estaProtegido('destino_moneda_id') }"
                            @update:model-value="touched.destino_moneda_id = true" />
                        <small v-if="isUpdate" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La moneda no se puede modificar en edición
                        </small>
                        <small v-else-if="estaProtegido('destino_moneda_id')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.destino_moneda_id) && $rules.seleccionObligatoria()(formObj.destino_moneda_id) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Requerido
                        </small>
                        <small v-else-if="mismasMonedas" class="text-red-500 font-semibold text-[10px]">
                            La moneda origen y destino no pueden ser iguales
                        </small>
                    </div>

                    <!-- Factor Compra -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Factor Compra <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.factor_compra" type="number" step="0.0001" min="0.0001"
                            size="sm" placeholder="0.0000" :disabled="estaProtegido('factor_compra')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('factor_compra') }"
                            @blur="touched.factor_compra = true" />
                        <small v-if="estaProtegido('factor_compra')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.factor_compra) && $rules.dineroMayorACero()(formObj.factor_compra) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe ser mayor a 0 (máx. 4 decimales)
                        </small>
                    </div>

                    <!-- Factor Venta -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Factor Venta <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.factor_venta" type="number" step="0.0001" min="0.0001"
                            size="sm" placeholder="0.0000" :disabled="estaProtegido('factor_venta')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('factor_venta') }"
                            @blur="touched.factor_venta = true" />
                        <small v-if="estaProtegido('factor_venta')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.factor_venta) && $rules.dineroMayorACero()(formObj.factor_venta) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe ser mayor a 0 (máx. 4 decimales)
                        </small>
                        <small v-else-if="factorInvalido" class="text-red-500 font-semibold text-[10px]">
                            El factor de compra no puede ser mayor al de venta
                        </small>
                    </div>

                    <!-- Fecha Cotización -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Fecha Cotización <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.fecha_cotizacion" type="date" size="sm"
                            :disabled="estaProtegido('fecha_cotizacion')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('fecha_cotizacion') }"
                            @blur="touched.fecha_cotizacion = true" />
                        <small v-if="(submitted || touched.fecha_cotizacion) && !formObj.fecha_cotizacion"
                            class="text-red-500 font-semibold text-[10px]">
                            La fecha de cotización es obligatoria
                        </small>
                    </div>

                    <!-- Aviso de impacto -->
                    <div v-if="!isUpdate" class="md:col-span-12 mt-1">
                        <div
                            class="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg">
                            <i class="pi pi-info-circle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                Al crear un nuevo tipo de cambio, la versión activa anterior
                                (mismo origen y destino) pasará automáticamente a estado
                                <b>HISTÓRICO</b>.
                            </span>
                        </div>
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

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Tipo de Cambio" :item-name="deleteItemName"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { TipoMoneda, TIPO_MONEDA_METADATA } from '~/constants/estados.constant';
import { getTodayLocal } from '~/utils/date';

useHead({ title: 'Tipos de Cambio' });

// ============ TIPOS AUXILIARES ============
interface OptionItem {
    label: string;
    value: number;
}

// ============ DEPENDENCIAS ============
const { $rules } = useNuxtApp() as any;

// ============ OPCIONES DE MONEDA (desde constantes) ============
const monedaOptions: OptionItem[] = Object.values(TipoMoneda)
    .filter((v): v is number => typeof v === 'number')
    .map((id) => {
        const meta = TIPO_MONEDA_METADATA[id as TipoMoneda];
        return meta
            ? { label: `${meta.label} (${meta.abreviatura})`, value: id }
            : null;
    })
    .filter((o): o is OptionItem => o !== null);

// ============ CRUD PRINCIPAL (useCrudTable) ============
const {
    items, loading, totalRecords, filters, lazyParams,
    dialog, deleteDialog, formObj, submitted, touched,
    isUpdate, permisos, estaProtegido,
    onPage, onSort, onSearch,
    openNew, edit, hideDialog, save,
    confirmDelete, deleteItem,
} = useCrudTable<any>({
    tabla: 'tipos-cambios',
    tablaPermisos: 'tipos_cambios',
    sortFieldDefault: 'tipo_cambio_id',
    sortOrderDefault: -1,
    rowsDefault: 10,
    autoLoad: false,

    camposProtegidosPorDependencia: [
        'origen_moneda_id',
        'destino_moneda_id',
        'fecha_cotizacion',
    ],

    defaultFilters: {
        global: '',
        exactMatch: 0,
        origen_moneda_id: null,
        destino_moneda_id: null,
        fecha_desde: null,
        fecha_hasta: null,
    },

    getExtraFilters: (f: Record<string, any>) => {
        const extra: Record<string, any> = {
            exactMatch: f.exactMatch ?? 0,
        };
        if (f.origen_moneda_id) extra.origen_moneda_id = Number(f.origen_moneda_id);
        if (f.destino_moneda_id) extra.destino_moneda_id = Number(f.destino_moneda_id);

        // Filtros de rango de fecha de cotización
        if (f.fecha_desde) extra.fecha_desde = f.fecha_desde;
        if (f.fecha_hasta) extra.fecha_hasta = f.fecha_hasta;

        return extra;
    },

    getPrimaryKey: (item: any) => item.tipo_cambio_id,

    getCleanForm: () => ({
        tipo_cambio_id: null,
        origen_moneda_id: TipoMoneda.BOLIVIANO,
        destino_moneda_id: TipoMoneda.DOLAR,
        factor_compra: null,
        factor_venta: null,
        fecha_cotizacion: getTodayLocal(),
    }),

    buildPayload: (form: any) => {
        const esActualizacion = form.tipo_cambio_id != null && form.tipo_cambio_id !== 0;

        const payload: Record<string, any> = {
            factor_compra: Number(form.factor_compra),
            factor_venta: Number(form.factor_venta),
            fecha_cotizacion: form.fecha_cotizacion,
        };

        if (!esActualizacion) {
            payload.origen_moneda_id = Number(form.origen_moneda_id);
            payload.destino_moneda_id = Number(form.destino_moneda_id);
        }

        return payload;
    },

    validate: (form: any, rules: any, notify: any) => {
        if (rules.seleccionObligatoria()(form.origen_moneda_id) !== true) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar la moneda de origen.');
            return false;
        }
        if (rules.seleccionObligatoria()(form.destino_moneda_id) !== true) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar la moneda de destino.');
            return false;
        }
        if (Number(form.origen_moneda_id) === Number(form.destino_moneda_id)) {
            notify('warn', 'Monedas inválidas', 'La moneda de origen y destino no pueden ser iguales.');
            return false;
        }
        if (rules.dineroMayorACero()(form.factor_compra) !== true) {
            notify('warn', 'Factor inválido', 'El factor de compra debe ser mayor a 0.');
            return false;
        }
        if (rules.dineroMayorACero()(form.factor_venta) !== true) {
            notify('warn', 'Factor inválido', 'El factor de venta debe ser mayor a 0.');
            return false;
        }
        if (Number(form.factor_compra) > Number(form.factor_venta)) {
            notify('warn', 'Factores inválidos', 'El factor de compra no puede ser mayor al de venta.');
            return false;
        }
        if (!form.fecha_cotizacion) {
            notify('warn', 'Fecha inválida', 'La fecha de cotización es obligatoria.');
            return false;
        }
        return true;
    },
});

// ============ TÍTULOS DINÁMICOS ============
const tituloDialog = computed(() =>
    isUpdate.value ? 'EDITAR TIPO DE CAMBIO' : 'NUEVO TIPO DE CAMBIO'
);

const subtituloDialog = computed(() =>
    isUpdate.value
        ? 'Actualización del factor de conversión'
        : 'Registro de nuevo factor de conversión'
);

// ============ ESTADO DERIVADO ============
const mismasMonedas = computed(() =>
    formObj.value.origen_moneda_id != null &&
    formObj.value.destino_moneda_id != null &&
    Number(formObj.value.origen_moneda_id) === Number(formObj.value.destino_moneda_id)
);

const factorInvalido = computed(() =>
    formObj.value.factor_compra != null &&
    formObj.value.factor_venta != null &&
    Number(formObj.value.factor_compra) > Number(formObj.value.factor_venta)
);

const deleteItemName = computed(() => {
    const o = TIPO_MONEDA_METADATA[formObj.value.origen_moneda_id as TipoMoneda]?.abreviatura ?? '—';
    const d = TIPO_MONEDA_METADATA[formObj.value.destino_moneda_id as TipoMoneda]?.abreviatura ?? '—';
    return `Conversión ${o} → ${d} (cotización: ${formObj.value.fecha_cotizacion || '—'})`;
});

// ============ FOCUS INICIAL ============
const origenSelectRef = ref<any>(null);

const focusFirstInput = async (): Promise<void> => {
    await nextTick();
    setTimeout(() => {
        // Si es edición, el select de origen está bloqueado, así que no intentamos abrirlo
        if (isUpdate.value) return;

        const el = origenSelectRef.value?.getSelectEl?.() as HTMLElement | null;
        if (!el) return;
        const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
        if (trigger) {
            trigger.focus();
            trigger.click();
        } else {
            el.click();
        }
    }, 350);
};

// ============ HELPERS DE PRESENTACIÓN ============
const formatFactor = (value: number | string | null | undefined): string => {
    if (value == null || value === '') return '—';
    const num = Number(value);
    if (!Number.isFinite(num)) return '—';
    return num.toLocaleString('es-BO', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });
};

// ============ FILTROS AVANZADOS ============
const filtrosActivosCount = computed(() => {
    let count = 0;
    if (filters.value.origen_moneda_id) count++;
    if (filters.value.destino_moneda_id) count++;
    if (filters.value.fecha_desde) count++;
    if (filters.value.fecha_hasta) count++;
    return count;
});

const aplicarFiltros = (): void => {
    lazyParams.value.first = 0;
    onSearch();
};

const limpiarFiltros = (): void => {
    filters.value.origen_moneda_id = null;
    filters.value.destino_moneda_id = null;
    filters.value.fecha_desde = null;
    filters.value.fecha_hasta = null;
    lazyParams.value.first = 0;
    onSearch();
};

// ============ WATCH: Normalizar tipos al abrir el diálogo ============
watch(dialog, async (isOpen) => {
    if (!isOpen) return;

    await nextTick();
    setTimeout(() => {
        if (formObj.value.origen_moneda_id != null) {
            formObj.value.origen_moneda_id = Number(formObj.value.origen_moneda_id);
        }
        if (formObj.value.destino_moneda_id != null) {
            formObj.value.destino_moneda_id = Number(formObj.value.destino_moneda_id);
        }
        if (formObj.value.factor_compra != null) {
            formObj.value.factor_compra = Number(formObj.value.factor_compra);
        }
        if (formObj.value.factor_venta != null) {
            formObj.value.factor_venta = Number(formObj.value.factor_venta);
        }
    }, 150);
});

// ============ COLUMNAS DE LA TABLA ============
const columns = [
    { expander: true, class: 'w-10', bodyClass: '!text-center' },
    { field: 'origen_moneda_id', header: 'CONVERSIÓN', sortable: true, template: 'body-conversion', class: 'w-56' },
    { field: 'factor_compra', header: 'COMPRA', sortable: true, template: 'body-factor_compra', bodyClass: '!text-center', class: 'w-28' },
    { field: 'factor_venta', header: 'VENTA', sortable: true, template: 'body-factor_venta', bodyClass: '!text-center', class: 'w-28' },
    { field: 'fecha_cotizacion', header: 'COTIZACIÓN', sortable: true, template: 'body-fecha_cotizacion', bodyClass: '!text-center', class: 'w-32' },
    { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
    { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
];

// ============ INIT ============
onMounted(() => {
    lazyParams.value.sortField = 'tipo_cambio_id';
    lazyParams.value.sortOrder = -1;
    lazyParams.value.first = 0;
    onSearch();
});
</script>
