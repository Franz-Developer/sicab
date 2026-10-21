<!-- C:\sistemas\sicab\sicab-frontend\app\pages\catalogos\categorias-vacuno\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-sitemap" title="Categorías de Vacuno"
        subtitle="Catálogo de categorías por rango de edad y producción" :show-action="permisos.crear"
        action-label="NUEVA CATEGORÍA" action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: categoría, código, descripción..."
                        :active-filters-count="filtrosActivosCount"
                        modal-subtitle="Refina la búsqueda de categorías de vacuno" modal-width="w-[95vw] md:w-[400px]"
                        @search="onSearch" @clear="limpiarFiltros" @apply="aplicarFiltros">

                        <template #advanced>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Productor de Leche
                                </label>
                                <BaseSelect v-model="filters.es_productor_leche" :options="productorLecheOptions"
                                    option-label="label" option-value="value" placeholder="Todas las categorías"
                                    size="sm" show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Sexo Permitido
                                </label>
                                <BaseSelect v-model="filters.sexo_biologico_permitido_id" :options="sexoOptions"
                                    option-label="label" option-value="value" placeholder="Todos los sexos" size="sm"
                                    show-clear appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo }}</span>
            </template>

            <template #body-categoria="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.categoria }}</span>
                    <span v-if="data.descripcion" class="cell-secondary">
                        <span class="font-bold text-[9px]">DESC:</span> {{ data.descripcion }}
                    </span>
                </div>
            </template>

            <template #body-edad="{ data }">
                <div class="flex flex-col text-[11px] leading-tight items-center w-full gap-0.5">
                    <span class="text-emerald-600 font-bold flex items-center w-full justify-center">
                        <i class="pi pi-calendar-plus text-[11px] mr-1.5"></i>
                        <span class="mr-1">MÍN:</span>
                        <span class="font-black">
                            {{ data.edad_min_meses != null ? `${data.edad_min_meses} ${Number(data.edad_min_meses) === 1
                                ? 'mes' : 'meses'}` : '—' }}
                        </span>
                    </span>
                    <span class="text-purple-600 font-bold flex items-center w-full justify-center">
                        <i class="pi pi-calendar-minus text-[11px] mr-1.5"></i>
                        <span class="mr-1">MÁX:</span>
                        <span class="font-black">
                            {{ data.edad_max_meses != null ? `${data.edad_max_meses} ${Number(data.edad_max_meses) === 1
                                ? 'mes' : 'meses'}` : '—' }}
                        </span>
                    </span>
                </div>
            </template>

            <template #body-productor_leche="{ data }">
                <Tag :value="Number(data.es_productor_leche) === 6351 ? 'SÍ' : 'NO'"
                    :severity="Number(data.es_productor_leche) === 6351 ? 'success' : 'secondary'"
                    class="text-[10px] font-bold uppercase px-2" />
            </template>

            <template #body-sexo="{ data }">
                <Tag :value="data.sexo_biologico_permitido_label || '—'"
                    :severity="Number(data.sexo_biologico_permitido_id) === 6301 ? 'info' : 'warning'"
                    class="text-[10px] font-bold uppercase px-2" />
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

    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[780px] lg:w-[820px]"
        maxHeight="92vh" :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-sitemap text-white text-lg"></i>
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
                    <span>Información de la Categoría</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-8">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Categoría <span class="text-red-500">*</span>
                        </label>
                        <BaseInput ref="categoriaRef" v-model="formObj.categoria" :maxlength="100" size="sm"
                            :disabled="estaProtegido('categoria')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('categoria') }"
                            @blur="touched.categoria = true" />
                        <small v-if="estaProtegido('categoria')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.categoria) && !formObj.categoria?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            La categoría es obligatoria
                        </small>
                    </div>

                    <div class="md:col-span-4">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.codigo" :maxlength="30" size="sm"
                            :disabled="estaProtegido('codigo')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo') }"
                            @blur="touched.codigo = true" />
                        <small v-if="estaProtegido('codigo')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.codigo) && !formObj.codigo?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El código es obligatorio
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sexo Permitido <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.sexo_biologico_permitido_id" :options="sexoOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar sexo..." size="sm"
                            @update:model-value="touched.sexo_biologico_permitido_id = true" />
                        <small
                            v-if="(submitted || touched.sexo_biologico_permitido_id) && !formObj.sexo_biologico_permitido_id"
                            class="text-red-500 font-semibold text-[10px]">
                            El sexo es obligatorio
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Productor de Leche <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.es_productor_leche" :options="productorLecheOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar..." size="sm"
                            @update:model-value="touched.es_productor_leche = true" />
                        <small v-if="(submitted || touched.es_productor_leche) && formObj.es_productor_leche == null"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe indicar si es productor de leche
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Edad Mínima (meses)
                        </label>
                        <BaseInput v-model.number="formObj.edad_min_meses" type="number" :min="0" :max="300" size="sm"
                            placeholder="Ej: 0" @blur="touched.edad_min_meses = true" />
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Edad Máxima (meses)
                        </label>
                        <BaseInput v-model.number="formObj.edad_max_meses" type="number" :min="0" :max="300" size="sm"
                            placeholder="Ej: 24" @blur="touched.edad_max_meses = true" />
                    </div>

                    <div v-if="rangoEdadesInvalido" class="md:col-span-12">
                        <div
                            class="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
                            <i class="pi pi-exclamation-triangle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                La edad mínima ({{ formObj.edad_min_meses }} meses) no puede ser mayor que la edad
                                máxima ({{ formObj.edad_max_meses }} meses).
                            </span>
                        </div>
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <BaseInput v-model="formObj.descripcion" :maxlength="500" size="sm"
                            placeholder="Observaciones o notas adicionales" />
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

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Categoría de Vacuno"
        :item-name="formObj.categoria || 'esta categoría'" @confirm="deleteItem" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { SEXO_BIOLOGICO_METADATA, CONDICION_PRODUCTOR_LECHE_METADATA } from '~/constants/estados.constant';

useHead({ title: 'Categorías de Vacuno' });

// ✅ Opciones derivadas de los enums
const productorLecheOptions = Object.values(CONDICION_PRODUCTOR_LECHE_METADATA).map(meta => ({
    label: meta.label,
    value: meta.id
}));

const sexoOptions = Object.values(SEXO_BIOLOGICO_METADATA).map(meta => ({
    label: meta.label,
    value: meta.id
}));

const {
    items, loading, totalRecords, filters, lazyParams,
    dialog, deleteDialog, formObj, submitted, touched,
    isUpdate, permisos, estaProtegido,
    onPage, onSort, onSearch,
    openNew, edit, hideDialog, save,
    toggleEstado, confirmDelete, deleteItem,
} = useCrudTable<any>({
    tabla: 'categorias-vacuno',
    tablaPermisos: 'categorias_vacuno',
    sortFieldDefault: 'categoria_vacuno_id',
    sortOrderDefault: -1,
    rowsDefault: 10,
    autoLoad: false,

    camposProtegidosPorDependencia: ['categoria', 'codigo'],

    defaultFilters: {
        global: '',
        exactMatch: 0,
        es_productor_leche: undefined,        // ✅ undefined en lugar de null
        sexo_biologico_permitido_id: undefined, // ✅ undefined en lugar de null
    },

    getExtraFilters: (f: Record<string, any>) => {
        const extra: Record<string, any> = {
            exactMatch: Number(f.exactMatch) || 0,
        };

        if (f.es_productor_leche != null && f.es_productor_leche !== '') {
            const num = Number(f.es_productor_leche);
            if (!isNaN(num)) extra.es_productor_leche = num;
        }

        if (f.sexo_biologico_permitido_id != null && f.sexo_biologico_permitido_id !== '') {
            const num = Number(f.sexo_biologico_permitido_id);
            if (!isNaN(num)) extra.sexo_biologico_permitido_id = num;
        }

        return extra;
    },

    getPrimaryKey: (item: any) => item.categoria_vacuno_id,

    getCleanForm: () => ({
        categoria_vacuno_id: null,
        categoria: '',
        codigo: '',
        descripcion: '',
        edad_min_meses: null,
        edad_max_meses: null,
        es_productor_leche: CONDICION_PRODUCTOR_LECHE_METADATA[6350]?.id ?? 6350,
        sexo_biologico_permitido_id: SEXO_BIOLOGICO_METADATA[6300]?.id ?? 6300,
    }),

    buildPayload: (form: any) => {
        const payload: Record<string, any> = {
            categoria: form.categoria?.trim().toUpperCase(),
            codigo: form.codigo?.trim().toUpperCase(),
            es_productor_leche: Number(form.es_productor_leche ?? 6350),
            sexo_biologico_permitido_id: Number(form.sexo_biologico_permitido_id),
        };

        if (form.descripcion?.trim()) {
            payload.descripcion = form.descripcion.trim();
        } else {
            payload.descripcion = null;
        }

        payload.edad_min_meses = (form.edad_min_meses != null && form.edad_min_meses !== '')
            ? Number(form.edad_min_meses) : null;

        payload.edad_max_meses = (form.edad_max_meses != null && form.edad_max_meses !== '')
            ? Number(form.edad_max_meses) : null;

        return payload;
    },

    validate: (form: any, rules: any, notify: any) => {
        if (rules.obligatoria()(form.categoria) !== true) {
            notify('warn', 'Campos incompletos', 'La categoría es obligatoria.');
            return false;
        }
        if (rules.longitudMinima(3)(form.categoria) !== true) {
            notify('warn', 'Categoría inválida', rules.longitudMinima(3)(form.categoria));
            return false;
        }

        if (rules.obligatoria()(form.codigo) !== true) {
            notify('warn', 'Campos incompletos', 'El código es obligatorio.');
            return false;
        }
        if (rules.codigoAlfanumerico(2)(form.codigo) !== true) {
            notify('warn', 'Código inválido', rules.codigoAlfanumerico(2)(form.codigo));
            return false;
        }

        if (!form.sexo_biologico_permitido_id || Number(form.sexo_biologico_permitido_id) === 0) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar el sexo biológico permitido.');
            return false;
        }

        if (form.edad_min_meses != null && form.edad_min_meses !== '') {
            if (rules.soloEnteros()(form.edad_min_meses) !== true) {
                notify('warn', 'Edad inválida', 'La edad mínima debe ser un número entero.');
                return false;
            }
            if (rules.numeroMinimo(0)(form.edad_min_meses) !== true) {
                notify('warn', 'Edad inválida', 'La edad mínima debe ser mayor o igual a 0.');
                return false;
            }
            if (rules.numeroMaximo(300)(form.edad_min_meses) !== true) {
                notify('warn', 'Edad inválida', 'La edad mínima no puede exceder 300 meses.');
                return false;
            }
        }

        if (form.edad_max_meses != null && form.edad_max_meses !== '') {
            if (rules.soloEnteros()(form.edad_max_meses) !== true) {
                notify('warn', 'Edad inválida', 'La edad máxima debe ser un número entero.');
                return false;
            }
            if (rules.numeroMinimo(0)(form.edad_max_meses) !== true) {
                notify('warn', 'Edad inválida', 'La edad máxima debe ser mayor o igual a 0.');
                return false;
            }
            if (rules.numeroMaximo(300)(form.edad_max_meses) !== true) {
                notify('warn', 'Edad inválida', 'La edad máxima no puede exceder 300 meses.');
                return false;
            }
        }

        if (
            form.edad_min_meses != null && form.edad_min_meses !== '' &&
            form.edad_max_meses != null && form.edad_max_meses !== '' &&
            Number(form.edad_min_meses) > Number(form.edad_max_meses)
        ) {
            notify('warn', 'Rango de edades inválido', 'La edad mínima no puede ser mayor que la edad máxima.');
            return false;
        }

        if (form.es_productor_leche == null || Number(form.es_productor_leche) === 0) {
            notify('warn', 'Campos incompletos', 'Debe indicar si es productor de leche.');
            return false;
        }

        return true;
    },
});

const tituloDialog = computed(() => isUpdate.value ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA');

const subtituloDialog = computed(() =>
    isUpdate.value
        ? 'Actualización de la categoría de vacuno'
        : 'Registro de nueva categoría de vacuno'
);

const rangoEdadesInvalido = computed(() => {
    const min = formObj.value.edad_min_meses;
    const max = formObj.value.edad_max_meses;
    if (min == null || min === '' || max == null || max === '') return false;
    return Number(min) > Number(max);
});

const categoriaRef = ref<any>(null);

const focusFirstInput = async (): Promise<void> => {
    await nextTick();
    setTimeout(() => {
        const input = categoriaRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
        input?.focus();
        input?.select();
    }, 350);
};

const columns = [
    { expander: true, class: 'w-10', bodyClass: '!text-center' },
    { field: 'codigo', header: 'CÓDIGO', template: 'body-codigo', sortable: true, bodyClass: '!text-center' },
    { field: 'categoria', header: 'CATEGORÍA', template: 'body-categoria', sortable: true },
    { field: 'edad_min_meses', header: 'EDAD', template: 'body-edad', sortable: true, class: 'w-44', bodyClass: '!text-center' },
    { field: 'sexo_biologico_permitido_id', header: 'SEXO', template: 'body-sexo', sortable: true, class: 'w-24', bodyClass: '!text-center' },
    { field: 'es_productor_leche', header: 'LECHE', template: 'body-productor_leche', sortable: true, class: 'w-20', bodyClass: '!text-center' },
    { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
    { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center w-24', bodyClass: '!min-w-[90px]' },
];

const filtrosActivosCount = computed(() => {
    let count = 0;
    if (filters.value.es_productor_leche != null && filters.value.es_productor_leche !== '') count++;
    if (filters.value.sexo_biologico_permitido_id != null && filters.value.sexo_biologico_permitido_id !== '') count++;
    return count;
});

const aplicarFiltros = (): void => {
    lazyParams.value.first = 0;
    onSearch();
};

const limpiarFiltros = (): void => {
    filters.value.es_productor_leche = undefined;
    filters.value.sexo_biologico_permitido_id = undefined;
    lazyParams.value.first = 0;
    onSearch();
};

onMounted(() => {
    lazyParams.value.sortField = 'categoria_vacuno_id';
    lazyParams.value.sortOrder = -1;
    lazyParams.value.first = 0;
    onSearch();
});
</script>
