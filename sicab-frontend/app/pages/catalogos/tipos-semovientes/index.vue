<!-- C:\sistemas\sicab\sicab-frontend\app\pages\catalogos\tipos-semovientes\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-tags" title="Tipos de Semovientes"
        subtitle="Catálogo de tipos de ganado y sus parámetros de amortización" :show-action="permisos.crear"
        action-label="NUEVO TIPO" action-icon="pi pi-plus" @action="openNew">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: Semoviente..." @search="onSearch" />
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-semoviente="{ data }">
                <span class="cell-primary">{{ data.semoviente }}</span>
            </template>

            <template #body-vida_util_anios="{ data }">
                <span class="cell-primary-normal">{{ data.vida_util_anios }} años</span>
            </template>

            <template #body-tasa_amortizacion="{ data }">
                <span class="cell-primary-normal">{{ Number(data.tasa_amortizacion).toFixed(2) }} %</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" @edit="edit(data)"
                    @toggle="toggleEstado(data)" @delete="confirmDelete(data)" />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
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
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG PRINCIPAL (CRUD) ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[600px]" maxHeight="92vh"
        :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-tag text-white text-lg"></i>
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
                    class="flex justify-between items-center mb-3 text-blue-700 uppercase tracking-wider font-black text-xs">
                    <span>Información del Tipo de Semoviente</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Semoviente -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nombre del Semoviente <span class="text-red-500">*</span>
                        </label>
                        <BaseInput ref="semovienteRef" v-model="formObj.semoviente" :maxlength="100" size="sm"
                            placeholder="Ej: VACA LECHERA" :disabled="estaProtegido('semoviente') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('semoviente') && !authStore.isAdmin }"
                            @blur="touched.semoviente = true" />
                        <small v-if="estaProtegido('semoviente') && !authStore.isAdmin"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.semoviente) && !formObj.semoviente?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El nombre es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.semoviente) && $rules.longitudMinima(3)(formObj.semoviente) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.longitudMinima(3)(formObj.semoviente) }}
                        </small>
                    </div>

                    <!-- Vida Útil -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Vida Útil (Años) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.vida_util_anios" type="number" :min="1" size="sm"
                            :disabled="estaProtegido('vida_util_anios') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('vida_util_anios') && !authStore.isAdmin }"
                            @blur="touched.vida_util_anios = true" />
                        <small v-if="estaProtegido('vida_util_anios') && !authStore.isAdmin"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.vida_util_anios) && (formObj.vida_util_anios === null || formObj.vida_util_anios <= 0)"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe ser mayor a 0
                        </small>
                    </div>

                    <!-- Tasa de Amortización -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tasa Amortización (%) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.tasa_amortizacion" type="number" :min="0" :max="100"
                            step="0.01" size="sm" :disabled="estaProtegido('tasa_amortizacion') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('tasa_amortizacion') && !authStore.isAdmin }"
                            @blur="touched.tasa_amortizacion = true" />
                        <small v-if="estaProtegido('tasa_amortizacion') && !authStore.isAdmin"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.tasa_amortizacion) && (formObj.tasa_amortizacion < 0 || formObj.tasa_amortizacion > 100)"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe estar entre 0 y 100
                        </small>
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

    <!-- ═══════════ DIALOG DE ELIMINACIÓN ═══════════ -->
    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Tipo de Semoviente" :item-name="formObj.semoviente"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

useHead({ title: 'Tipos de Semovientes' });

// ============ DEPENDENCIAS ============
const authStore = useAuthStore();
const { $rules } = useNuxtApp() as any;

// ============ CRUD PRINCIPAL (useCrudTable) ============
const {
    items, loading, totalRecords, filters, lazyParams,
    dialog, deleteDialog, formObj, submitted, touched,
    isUpdate, permisos, estaProtegido,
    onPage, onSort, onSearch,
    openNew, edit, hideDialog, save,
    toggleEstado, confirmDelete, deleteItem,
} = useCrudTable<any>({
    tabla: 'tipos-semovientes',
    tablaPermisos: 'tipos_semovientes',
    sortFieldDefault: 'tipo_id',
    sortOrderDefault: -1,
    rowsDefault: 10,
    autoLoad: false,

    // Definimos los campos que se bloquearán si el registro tiene dependencias
    camposProtegidosPorDependencia: ['semoviente', 'vida_util_anios', 'tasa_amortizacion'],

    defaultFilters: {
        global: '',
        exactMatch: 0,
    },

    getExtraFilters: (f: Record<string, any>) => ({
        exactMatch: f.exactMatch ?? 0,
    }),

    getPrimaryKey: (item: any) => item.tipo_id,

    getCleanForm: () => ({
        tipo_id: null,
        semoviente: '',
        vida_util_anios: 5, // Un valor por defecto lógico
        tasa_amortizacion: 20.00,
    }),

    buildPayload: (form: any) => ({
        semoviente: form.semoviente?.trim().toUpperCase(),
        vida_util_anios: Number(form.vida_util_anios),
        tasa_amortizacion: Number(form.tasa_amortizacion),
    }),

    validate: (form: any, rules: any, notify: any) => {
        if (!form.semoviente?.trim()) {
            touched.value.semoviente = true;
            notify('warn', 'Campos incompletos', 'El nombre del semoviente es obligatorio.');
            return false;
        }
        if (rules.longitudMinima(3)(form.semoviente) !== true) {
            touched.value.semoviente = true;
            notify('warn', 'Nombre inválido', rules.longitudMinima(3)(form.semoviente));
            return false;
        }
        if (form.vida_util_anios === null || form.vida_util_anios === undefined || form.vida_util_anios <= 0) {
            touched.value.vida_util_anios = true;
            notify('warn', 'Vida útil inválida', 'La vida útil debe ser mayor a 0 años.');
            return false;
        }
        if (form.tasa_amortizacion === null || form.tasa_amortizacion === undefined || form.tasa_amortizacion < 0 || form.tasa_amortizacion > 100) {
            touched.value.tasa_amortizacion = true;
            notify('warn', 'Tasa inválida', 'La tasa de amortización debe estar entre 0 y 100.');
            return false;
        }
        return true;
    },
});

// ============ TÍTULOS DINÁMICOS ============
const tituloDialog = computed(() =>
    isUpdate.value ? 'EDITAR TIPO DE SEMOVIENTE' : 'NUEVO TIPO DE SEMOVIENTE'
);

const subtituloDialog = computed(() =>
    isUpdate.value
        ? 'Actualización de los parámetros del semoviente'
        : 'Registro de nuevo tipo de semoviente'
);

// ============ FOCUS INICIAL ============
const semovienteRef = ref<any>(null);

const focusFirstInput = async (): Promise<void> => {
    await nextTick();
    setTimeout(() => {
        const input = semovienteRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
        input?.focus();
        input?.select();
    }, 350);
};

// ============ COLUMNAS DE LA TABLA ============
const columns = [
    { expander: true, class: 'w-10', bodyClass: '!text-center' },
    { field: 'semoviente', header: 'SEMOVIENTE', sortable: true, template: 'body-semoviente' },
    { field: 'vida_util_anios', header: 'VIDA ÚTIL', sortable: true, template: 'body-vida_util_anios', bodyClass: '!text-center', class: 'w-32' },
    { field: 'tasa_amortizacion', header: 'TASA AMORT.', sortable: true, template: 'body-tasa_amortizacion', bodyClass: '!text-center', class: 'w-32' },
    { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
    { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
];

// ============ INIT ============
onMounted(() => {
    lazyParams.value.sortField = 'tipo_id';
    lazyParams.value.sortOrder = -1;
    lazyParams.value.first = 0;
    onSearch();
});
</script>
