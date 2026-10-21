<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\parametros-globales\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-sliders-h"
        title="Parámetros Globales"
        subtitle="Configuración y parámetros generales del sistema"
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
                    <FilterBar :filters="filters" search-placeholder="Buscar: clave, valor, descripción..."
                        :active-filters-count="filtrosActivosCount"
                        modal-subtitle="Refina la búsqueda de parámetros globales" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Tipo de Dato -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Tipo de Dato
                                </label>
                                <BaseSelect v-model="filters.tipo_dato_id" :options="tipoDatoOptions"
                                    option-label="label" option-value="value" placeholder="Todos los tipos de dato"
                                    size="sm" show-clear appendTo="body" @update:model-value="onFilterChange" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-clave="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.clave }}</span>
                    <Tag
                        v-if="Number(data.editable) === 0"
                        value="SISTEMA"
                        severity="warn"
                        class="text-[9px] font-bold uppercase !px-1.5 !py-0 w-max"
                    />
                </div>
            </template>

            <template #body-tipo_dato="{ data }">
                <span class="cell-primary-normal">{{ data.tipo_dato?.label || data.tipo_dato_id }}</span>
            </template>

            <template #body-descripcion="{ data }">
                <span class="cell-primary-normal">{{ data.descripcion || '—' }}</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge
                    :estado="data.estado_registro"
                    :estado-id="Number(data.estado_id)"
                />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions
                    :estado-id="Number(data.estado_id)"
                    :puede="{ ...permisos, eliminar: false }"
                    :mostrar-archivar="false"
                    @edit="edit(data)"
                />
            </template>

            <!-- ═══════════ PANEL DE EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item" v-if="data.datos_json">
                            <span class="expansion-label">Datos JSON</span>
                            <pre class="expansion-value text-[10px] bg-slate-100 p-2 rounded max-h-32 overflow-auto">{{ JSON.stringify(data.datos_json, null, 2) }}</pre>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Valor</span>
                            <span class="expansion-value" :title="data.valor || '—'">
                                {{ data.valor || '—' }}
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Descripción Completa</span>
                            <span class="expansion-value" :title="data.descripcion || '—'">
                                {{ data.descripcion || '—' }}
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value" :title="data.usuario_operacion || '—'">
                                {{ data.usuario_operacion || '—' }}
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value" :title="data.fecha_registro || '—'">
                                {{ data.fecha_registro || '—' }}
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Actualización</span>
                            <span class="expansion-value" :title="data.fecha_actualizacion || '—'">
                                {{ data.fecha_actualizacion || '—' }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG PRINCIPAL (CRUD) ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[640px] lg:w-[700px]"
        maxHeight="92vh" :modal="true" :closable="!loading" @show="focusFirstInput">
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
                    class="flex justify-between items-center mb-3 text-blue-700 uppercase tracking-wider font-black text-xs">
                    <span>Información del Parámetro Global</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">

                    <!-- ═══════════ CLAVE (solo lectura) ═══════════ -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Clave
                        </label>
                        <BaseInput ref="claveRef" v-model="formObj.clave" :maxlength="100" size="sm" disabled
                            class="opacity-60 cursor-not-allowed" />
                        <small class="text-slate-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La clave no se puede modificar
                        </small>
                    </div>

                    <!-- ═══════════ TIPO DE DATO (solo lectura) ═══════════ -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo de Dato
                        </label>
                        <BaseSelect v-model="formObj.tipo_dato_id" :options="tipoDatoOptions" option-label="label"
                            option-value="value" size="sm" disabled class="opacity-60 cursor-not-allowed" />
                        <small class="text-slate-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>El tipo no se puede modificar
                        </small>
                    </div>

                    <!-- ═══════════ EDITABLE (solo lectura) ═══════════ -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Editabilidad
                        </label>
                        <div
                            class="flex items-center h-[34px] px-3 bg-slate-50 border border-slate-300 rounded-[var(--radius-std)]">
                            <Tag :value="Number(formObj.editable) === 1 ? 'EDITABLE' : 'SISTEMA'"
                                :severity="Number(formObj.editable) === 1 ? 'success' : 'warn'"
                                class="text-[10px] font-bold uppercase" />
                        </div>
                        <small class="text-slate-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Determina si el parámetro se puede editar
                        </small>
                    </div>

                    <!-- ═══════════ VALOR (si NO es JSONB) ═══════════ -->
                    <div v-if="Number(formObj.tipo_dato_id) !== 1805" class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Valor <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.valor" :maxlength="500" size="sm" placeholder="Valor del parámetro"
                            @blur="touched.valor = true" />
                        <small v-if="(submitted || touched.valor) && !formObj.valor?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El valor es obligatorio
                        </small>
                    </div>

                    <!-- ═══════════ DATOS JSON (si ES JSONB) ═══════════ -->
                    <div v-if="Number(formObj.tipo_dato_id) === 1805" class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Datos JSON (Estructura JSONB) <span class="text-red-500">*</span>
                        </label>
                        <textarea v-model="jsonTextValue" rows="10"
                            class="w-full text-xs font-mono p-2 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
                            placeholder='{"clave": "valor"}'></textarea>
                        <small class="text-slate-500 text-[10px]">
                            Ingrese un objeto JSON válido.
                        </small>
                        <small v-if="jsonError" class="text-red-500 font-semibold text-[10px] block mt-1">
                            {{ jsonError }}
                        </small>
                    </div>

                    <!-- ═══════════ DESCRIPCIÓN ═══════════ -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <BaseInput v-model="formObj.descripcion" :maxlength="500" size="sm"
                            placeholder="Observaciones o notas explicativas" />
                    </div>

                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger" @click="hideDialog" />
                <BaseButton :label="isUpdate ? 'Actualizar' : 'Guardar Registro'" icon="pi pi-save" :loading="loading" variant="primary" @click="save" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Parámetro Global"
        :item-name="formObj.clave"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick, onMounted } from 'vue';
    import { TipoDato, TIPO_DATO_METADATA } from '@/constants/estados.constant';
    import { useParametroGlobal } from '~/composables/useParametroGlobal';

    useHead({ title: 'Parámetros Globales' });

    // ============ INTERFACES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ OPCIONES DE CATÁLOGOS ============
    const tipoDatoOptions: OptionItem[] = Object.values(TipoDato)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_DATO_METADATA[id as TipoDato];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    // Campo auxiliar reactivo para edición de JSONB en Textarea
    const jsonTextValue = ref('');

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos,
        onPage, onSort, onSearch,
        edit, hideDialog, save: saveBase,
        deleteItem,
    } = useCrudTable<any>({
        tabla: 'parametros-globales',
        sortFieldDefault: 'parametro_id',
        tablaPermisos: 'parametros_globales',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        camposProtegidosPorDependencia: ['clave', 'tipo_dato_id'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            tipo_dato_id: null,
            editable: 1,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.tipo_dato_id) extra.tipo_dato_id = Number(f.tipo_dato_id);
            if (f.editable !== null && f.editable !== undefined && f.editable !== '') {
                extra.editable = Number(f.editable);
            }
            return extra;
        },

        getPrimaryKey: (item: any) => item.parametro_id,

        getCleanForm: () => ({
            parametro_id: null,
            clave: '',
            valor: '',
            tipo_dato_id: TipoDato.INTEGER,
            datos_json: null,
            descripcion: '',
            editable: 1,
        }),

        buildPayload: (form: any) => {
            let parsedJson = null;
            if (Number(form.tipo_dato_id) === 1805 && jsonTextValue.value) {
                try {
                    parsedJson = JSON.parse(jsonTextValue.value);
                } catch {
                    parsedJson = jsonTextValue.value;
                }
            }

            return {
                clave: form.clave?.trim().toLowerCase(),
                valor: form.valor?.trim(),
                tipo_dato_id: Number(form.tipo_dato_id),
                datos_json: parsedJson,
                descripcion: form.descripcion?.trim() || null,
                editable: Number(form.editable ?? 1),
            };
        },
    });

    // ============ INVALIDACIÓN DE CACHÉ DEL FRONTEND ============
    const { clearCache: clearParametrosCache } = useParametroGlobal();

    const save = async (): Promise<void> => {
        const claveModificada = formObj.value?.clave;
        await saveBase();
        if (claveModificada) {
            clearParametrosCache(claveModificada);
        } else {
            clearParametrosCache();
        }
    };

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR PARÁMETRO GLOBAL' : 'NUEVO PARÁMETRO GLOBAL'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de configuración del sistema'
            : 'Registro de nuevo parámetro global'
    );

    // ============ FOCUS INICIAL ============
    const claveRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const input = claveRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'clave', header: 'CLAVE', sortable: true, template: 'body-clave', class: 'w-48' },
        { field: 'tipo_dato_id', header: 'TIPO', sortable: true, template: 'body-tipo_dato', bodyClass: '!text-center', class: 'w-24' }, // Ancho reducido a w-24
        { field: 'descripcion', header: 'DESCRIPCIÓN', sortable: true, template: 'body-descripcion' }, // Sin clase de ancho fijo para que sea flexible
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ HELPERS DE FILTRO ============
    const onFilterChange = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ FILTROS AVANZADOS (contador y handlers) ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.tipo_dato_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.tipo_dato_id = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ WATCHERS DE NORMALIZACIÓN ============
    watch(() => formObj.value.tipo_dato_id, (val) => {
        if (val != null && val !== '' && typeof val === 'string') {
            formObj.value.tipo_dato_id = Number(val);
        }
    });

    watch(() => formObj.value.editable, (val) => {
        if (val != null && val !== '' && typeof val === 'string') {
            formObj.value.editable = Number(val);
        }
    });

    // Sincronizar el textarea del JSON al editar un registro existente
    watch(() => formObj.value.datos_json, (val) => {
        if (val) {
            jsonTextValue.value = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
        } else {
            jsonTextValue.value = '';
        }
    }, { immediate: true });

    // ============ VALIDACIÓN DEL JSON ============
    const jsonError = computed<string | null>(() => {
        if (Number(formObj.value.tipo_dato_id) !== 1805) return null;
        if (!jsonTextValue.value?.trim()) return null;

        try {
            const parsed = JSON.parse(jsonTextValue.value);
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                return 'El JSON debe ser un objeto (no un array ni un valor primitivo).';
            }
            return null;
        } catch {
            return 'El JSON no tiene un formato válido.';
        }
    });

    // ============ INIT ============
    onMounted(() => {
        lazyParams.value.sortField = 'parametro_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
