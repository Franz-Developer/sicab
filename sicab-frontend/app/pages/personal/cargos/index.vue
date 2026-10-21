<!-- C:\sistemas\sicab\sicab-frontend\app\pages\personal\cargos\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-briefcase" title="Cargos" subtitle="Catálogo de cargos y sueldos base"
        :show-action="permisos.crear" action-label="NUEVO CARGO" action-icon="pi pi-plus" @action="openNew">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-4 py-3 bg-white">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        <div class="lg:col-span-6 lg:col-start-5 w-full">
                            <BaseSearch autofocus v-model="filters.global"
                                placeholder="Buscar: Cargo, código, descripción..." @search="onSearch" class="w-full" />
                        </div>

                        <div class="lg:col-span-2 w-full">
                            <BaseExactMatch v-model="filters.exactMatch" @update:model-value="onSearch" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo }}</span>
            </template>

            <template #body-cargo="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.cargo }}</span>
                    <span v-if="data.descripcion" class="cell-secondary text-[12px] leading-snug"
                        :title="data.descripcion">
                        <span class="font-bold">DESCRIPCIÓN:</span> {{ data.descripcion }}
                    </span>
                </div>
            </template>

            <!-- 🔥 SUELDO BASE + MONEDA -->
            <template #body-sueldo_base="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary-normal">
                        {{ formatMonto(data.sueldo_base) }}
                    </span>
                    <span v-if="data.tipo_moneda?.abreviatura" class="cell-secondary">
                        <span class="font-bold">MONEDA:</span> {{ data.tipo_moneda.abreviatura }}
                    </span>
                </div>
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
                        <!-- Auditoría -->
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

    <!-- ═══════════ DIALOG CREAR / EDITAR ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[680px] lg:w-[720px]"
        maxHeight="92vh" :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-briefcase text-white text-lg"></i>
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
                    <span>Información del Cargo</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Cargo -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Cargo <span class="text-red-500">*</span>
                        </label>
                        <BaseInput ref="cargoRef" v-model="formObj.cargo" :maxlength="100" size="sm"
                            placeholder="Ej: RECEPCIONISTA" :disabled="estaProtegido('cargo') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('cargo') && !authStore.isAdmin }"
                            @blur="touched.cargo = true" />
                        <small v-if="estaProtegido('cargo') && !authStore.isAdmin"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.cargo) && !formObj.cargo?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El nombre del cargo es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.cargo) && $rules.longitudMinima(3)(formObj.cargo) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.longitudMinima(3)(formObj.cargo) }}
                        </small>
                    </div>

                    <!-- Código -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.codigo" :maxlength="60" size="sm" placeholder="Ej: REC-01"
                            :disabled="estaProtegido('codigo') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo') && !authStore.isAdmin }"
                            @blur="touched.codigo = true" />
                        <small v-if="estaProtegido('codigo') && !authStore.isAdmin"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.codigo) && !formObj.codigo?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El código es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo) && $rules.codigoMayusculas(2)(formObj.codigo) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.codigoMayusculas(2)(formObj.codigo) }}
                        </small>
                    </div>

                    <!-- Tipo Moneda -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo Moneda <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.tipo_moneda_id" :options="tipoMonedaOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar..." size="sm"
                            :disabled="estaProtegido('tipo_moneda_id') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('tipo_moneda_id') && !authStore.isAdmin }"
                            @update:model-value="touched.tipo_moneda_id = true" />
                        <small v-if="estaProtegido('tipo_moneda_id') && !authStore.isAdmin"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.tipo_moneda_id) && !formObj.tipo_moneda_id"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe seleccionar un tipo de moneda
                        </small>
                    </div>

                    <!-- Sueldo Base -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sueldo Base <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.sueldo_base" type="number" :min="0" step="0.01" size="sm"
                            placeholder="0.00" @blur="touched.sueldo_base = true" />
                        <small
                            v-if="(submitted || touched.sueldo_base) && (formObj.sueldo_base === null || formObj.sueldo_base === undefined || formObj.sueldo_base === '')"
                            class="text-red-500 font-semibold text-[10px]">
                            El sueldo base es obligatorio
                        </small>
                        <small v-else-if="(submitted || touched.sueldo_base) && Number(formObj.sueldo_base) < 0"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe ser mayor o igual a 0
                        </small>
                        <small
                            v-else-if="(submitted || touched.sueldo_base) && !/^\d+(\.\d{1,2})?$/.test(String(formObj.sueldo_base))"
                            class="text-red-500 font-semibold text-[10px]">
                            Máximo 2 decimales
                        </small>
                    </div>

                    <!-- Descripción -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <textarea v-model="formObj.descripcion" :maxlength="255" rows="3"
                            placeholder="Observaciones o funciones del cargo (opcional)"
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] px-3 py-2 text-xs transition-all focus:outline-none focus:border-[var(--focus-color)] focus:ring-2 focus:ring-blue-100 resize-none"></textarea>
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

    <!-- ═══════════ DIALOG ELIMINAR ═══════════ -->
    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Cargo" :item-name="deleteItemName"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCargoResolver } from '~/composables/useCargoResolver';
import { TipoMoneda, TIPO_MONEDA_METADATA } from '~/constants/estados.constant';

useHead({ title: 'Cargos' });

// ============ TIPOS AUXILIARES ============
interface OptionItem {
    label: string;
    value: number;
}

// ============ DEPENDENCIAS ============
const authStore = useAuthStore();
const { $rules } = useNuxtApp() as any;
const { clearCache } = useCargoResolver();

// ============ OPCIONES DERIVADAS DE CONSTANTES ============
const tipoMonedaOptions: OptionItem[] = Object.values(TipoMoneda)
    .filter((v): v is number => typeof v === 'number')
    .map((id) => {
        const meta = TIPO_MONEDA_METADATA[id as TipoMoneda];
        return meta ? { label: meta.label, value: id } : null;
    })
    .filter((o): o is OptionItem => o !== null);

// ============ CRUD PRINCIPAL (useCrudTable) ============
const {
    items, loading, totalRecords, filters, lazyParams,
    dialog, deleteDialog, formObj, submitted, touched,
    isUpdate, permisos, estaProtegido,
    onPage, onSort, onSearch,
    openNew, edit, hideDialog,
    save: saveBase,
    toggleEstado: toggleEstadoBase,
    confirmDelete,
    deleteItem: deleteItemBase,
} = useCrudTable<any>({
    tabla: 'cargos',
    sortFieldDefault: 'cargo_id',
    sortOrderDefault: -1,
    rowsDefault: 10,
    autoLoad: false,

    // Coincide con `FindCargosQueryDto.getCamposProtegidosConDependencias()`
    camposProtegidosPorDependencia: ['cargo', 'codigo', 'sueldo_base', 'tipo_moneda_id'],

    defaultFilters: {
        global: '',
        exactMatch: 0,
    },

    getExtraFilters: (f: Record<string, any>) => ({
        exactMatch: f.exactMatch ?? 0,
    }),

    getPrimaryKey: (item: any) => item.cargo_id,

    getCleanForm: () => ({
        cargo_id: null,
        cargo: '',
        codigo: '',
        sueldo_base: 0,
        tipo_moneda_id: TipoMoneda.BOLIVIANO,   // 🔥 Nuevo campo con default
        descripcion: '',
    }),

    buildPayload: (form: any) => {
        const payload: Record<string, any> = {
            cargo: form.cargo?.trim().toUpperCase(),
            codigo: form.codigo?.trim().toUpperCase(),
            sueldo_base: Number(form.sueldo_base),
            tipo_moneda_id: Number(form.tipo_moneda_id),  // 🔥 Nuevo campo
        };

        // La descripción es opcional. Si viene vacía, se envía null
        // (coincide con `emptyToNull` del CreateCargoDto en backend).
        if (form.descripcion?.trim()) {
            payload.descripcion = form.descripcion.trim();
        } else {
            payload.descripcion = null;
        }

        return payload;
    },

    validate: (form: any, rules: any, notify: any) => {
        // ── Cargo ──
        if (!form.cargo?.trim()) {
            touched.value.cargo = true;
            notify('warn', 'Cargo requerido', 'El nombre del cargo es obligatorio.');
            return false;
        }
        if (rules.longitudMinima(3)(form.cargo) !== true) {
            touched.value.cargo = true;
            notify('warn', 'Cargo inválido', rules.longitudMinima(3)(form.cargo));
            return false;
        }
        if (form.cargo.trim().length > 100) {
            touched.value.cargo = true;
            notify('warn', 'Cargo inválido', 'El cargo no puede exceder 100 caracteres.');
            return false;
        }

        // ── Código ──
        if (!form.codigo?.trim()) {
            touched.value.codigo = true;
            notify('warn', 'Código requerido', 'El código es obligatorio.');
            return false;
        }
        if (rules.codigoMayusculas(2)(form.codigo) !== true) {
            touched.value.codigo = true;
            notify('warn', 'Código inválido', rules.codigoMayusculas(2)(form.codigo));
            return false;
        }
        if (form.codigo.trim().length > 60) {
            touched.value.codigo = true;
            notify('warn', 'Código inválido', 'El código no puede exceder 60 caracteres.');
            return false;
        }

        // ── Tipo Moneda (NUEVO) ──
        if (!form.tipo_moneda_id) {
            touched.value.tipo_moneda_id = true;
            notify('warn', 'Moneda requerida', 'Debe seleccionar un tipo de moneda.');
            return false;
        }

        // ── Sueldo Base ──
        if (
            form.sueldo_base === null ||
            form.sueldo_base === undefined ||
            form.sueldo_base === ''
        ) {
            touched.value.sueldo_base = true;
            notify('warn', 'Sueldo requerido', 'El sueldo base es obligatorio.');
            return false;
        }
        if (Number(form.sueldo_base) < 0) {
            touched.value.sueldo_base = true;
            notify('warn', 'Sueldo inválido', 'El sueldo base no puede ser negativo.');
            return false;
        }
        if (!/^\d+(\.\d{1,2})?$/.test(String(form.sueldo_base))) {
            touched.value.sueldo_base = true;
            notify('warn', 'Sueldo inválido', 'El sueldo base debe tener máximo 2 decimales.');
            return false;
        }

        return true;
    },
});

const save = async (): Promise<void> => {
    await saveBase();
    clearCache();
};

const toggleEstado = async (item: any): Promise<void> => {
    await toggleEstadoBase(item);
    clearCache();
};

const deleteItem = async (): Promise<void> => {
    await deleteItemBase();
    clearCache();
};

// ============ TÍTULOS DINÁMICOS ============
const tituloDialog = computed(() =>
    isUpdate.value ? 'EDITAR CARGO' : 'NUEVO CARGO'
);

const subtituloDialog = computed(() =>
    isUpdate.value
        ? 'Actualización de datos del cargo'
        : 'Registro de un nuevo cargo'
);

// ============ FOCUS INICIAL ============
const cargoRef = ref<any>(null);

const focusFirstInput = async (): Promise<void> => {
    await nextTick();
    setTimeout(() => {
        const input = cargoRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
        input?.focus();
        input?.select();
    }, 350);
};

// ============ HELPERS ============
const formatMonto = (value: any): string => {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0.00';
    return num.toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const deleteItemName = computed(() => {
    const codigo = formObj.value.codigo ?? '';
    const cargo = formObj.value.cargo ?? '';
    return `${codigo} — ${cargo}`;
});

// ============ COLUMNAS DE LA TABLA ============
const columns = [
    { expander: true, class: 'w-10', bodyClass: '!text-center' },
    { field: 'codigo', header: 'CÓDIGO', sortable: true, template: 'body-codigo', bodyClass: '!text-center', class: 'w-32' },
    { field: 'cargo', header: 'CARGO', sortable: true, template: 'body-cargo' },
    { field: 'sueldo_base', header: 'SUELDO BASE', sortable: true, template: 'body-sueldo_base', bodyClass: '!text-center', class: 'w-40' },  // 🔥 Ampliado para mostrar moneda debajo
    { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
    { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
];

// ============ INIT ============
onMounted(() => {
    lazyParams.value.sortField = 'cargo_id';
    lazyParams.value.sortOrder = -1;
    lazyParams.value.first = 0;
    onSearch();
});
</script>
