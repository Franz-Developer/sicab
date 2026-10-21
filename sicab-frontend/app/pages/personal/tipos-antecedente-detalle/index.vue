<!-- C:\sistemas\sicab\sicab-frontend\app\pages\personal\tipos-antecedente-detalle\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-list"
        title="Tipos de Antecedente Detalle"
        subtitle="Catálogo de subtipos de antecedentes (reconocimientos y sanciones)"
        :show-action="permisos.crear"
        action-label="NUEVO SUBTIPO"
        action-icon="pi pi-plus"
        @action="openNew"
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
                <div class="px-4 py-3 bg-white">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        <div class="lg:col-span-3 w-full">
                            <BaseSelect
                                v-model="filters.tipo_antecedente_id"
                                :options="tipoAntecedenteOptions"
                                option-label="label"
                                option-value="value"
                                placeholder="Todos los tipos"
                                size="sm"
                                show-clear
                                v-tooltip.top="'Filtra por tipo de antecedente: Positivo o Negativo.'"
                                @update:model-value="onFilterChange"
                                class="w-full"
                            />
                        </div>

                        <div class="lg:col-span-6 w-full">
                            <BaseSearch
                                autofocus
                                v-model="filters.global"
                                placeholder="Buscar: Código, nombre, descripción..."
                                @search="onSearch"
                                class="w-full"
                            />
                        </div>

                        <div class="lg:col-span-3 w-full">
                            <BaseExactMatch v-model="filters.exactMatch" @update:model-value="onSearch" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-tipo_antecedente="{ data }">
                <Tag
                    :value="data.tipo_antecedente?.abreviatura || data.tipo_antecedente"
                    :severity="Number(data.tipo_antecedente_id) === TipoAntecedente.POSITIVO ? 'success' : 'danger'"
                    class="text-[10px] font-bold uppercase px-2"
                />
            </template>

            <template #body-nombre="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.nombre }}</span>
                    <span v-if="data.descripcion" class="cell-secondary" :title="data.descripcion">
                        <span class="font-bold">DESCRIPCIÓN:</span> {{ data.descripcion }}
                    </span>
                </div>
            </template>

            <template #body-puntaje="{ data }">
                <Tag
                    :value="Number(data.puntaje) > 0 ? `+${data.puntaje}` : `${data.puntaje}`"
                    :severity="Number(data.puntaje) > 0 ? 'success' : (Number(data.puntaje) < 0 ? 'danger' : 'secondary')"
                    class="text-[10px] font-bold px-2"
                />
            </template>

            <template #body-color_hex="{ data }">
                <div class="cell-stack items-end lg:items-center w-full">
                    <span v-if="data.color_hex" class="w-5 h-5 rounded border border-slate-300 shadow-sm"
                        :style="{ backgroundColor: data.color_hex }"></span>
                    <span class="font-mono text-[10px] text-slate-600">
                        {{ data.color_hex || '—' }}
                    </span>
                </div>
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
                    :puede="permisos"
                    @edit="handleEdit(data)"
                    @toggle="toggleEstado(data)"
                    @delete="confirmDelete(data)"
                />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Código:</span>
                            <span class="expansion-value">{{ data.codigo || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación:</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro:</span>
                            <span class="expansion-value">{{ formatFecha(data.fecha_registro) || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Actualización:</span>
                            <span class="expansion-value">{{ formatFecha(data.fecha_actualizacion) || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CREAR / EDITAR ═══════════ -->
    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[720px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusFirstInput"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-list text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div class="flex justify-between items-center mb-3 text-blue-700 uppercase tracking-wider font-black text-xs">
                    <span>Información del Subtipo</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Tipo Antecedente -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo Antecedente <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            ref="tipoAntecedenteSelectRef"
                            v-model="formObj.tipo_antecedente_id"
                            :options="tipoAntecedenteOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar..."
                            size="sm"
                            :disabled="isUpdate && estaProtegido('tipo_antecedente_id') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate && estaProtegido('tipo_antecedente_id') && !authStore.isAdmin }"
                            @update:model-value="onTipoAntecedenteChange"
                        />
                        <small v-if="isUpdate && estaProtegido('tipo_antecedente_id') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.tipo_antecedente_id) && !formObj.tipo_antecedente_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <!-- Código -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            ref="codigoRef"
                            v-model="formObj.codigo"
                            :maxlength="30"
                            size="sm"
                            placeholder="Ej. MULTA"
                            :disabled="isUpdate && estaProtegido('codigo') && !authStore.isAdmin"
                            :class="[
                                'uppercase',
                                { 'opacity-60 cursor-not-allowed': isUpdate && estaProtegido('codigo') && !authStore.isAdmin }
                            ]"
                            @blur="touched.codigo = true"
                        />
                        <small v-if="isUpdate && estaProtegido('codigo') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo) && !formObj.codigo?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El código es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo) && formObj.codigo?.trim() && !/^[A-Z0-9_-]+$/.test(formObj.codigo.toUpperCase())"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Solo mayúsculas, números, guion y guion bajo
                        </small>
                    </div>

                    <!-- Nombre -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nombre <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            ref="nombreRef"
                            v-model="formObj.nombre"
                            :maxlength="100"
                            size="sm"
                            placeholder="Ej. Mala modulación"
                            @blur="touched.nombre = true"
                        />
                        <small
                            v-if="(submitted || touched.nombre) && !formObj.nombre?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El nombre es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.nombre) && formObj.nombre?.trim() && $rules.longitudMinima(3)(formObj.nombre) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.longitudMinima(3)(formObj.nombre) }}
                        </small>
                    </div>

                    <!-- Descripción -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <textarea
                            v-model="formObj.descripcion"
                            :maxlength="500"
                            rows="3"
                            placeholder="Descripción opcional del subtipo de antecedente..."
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] px-3 py-2 text-xs transition-all focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100 resize-none"
                            @blur="touched.descripcion = true"
                        ></textarea>
                        <small
                            v-if="(submitted || touched.descripcion) && formObj.descripcion && $rules.longitudMaxima(500)(formObj.descripcion) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.longitudMaxima(500)(formObj.descripcion) }}
                        </small>
                    </div>

                    <!-- Puntaje -->
                    <div class="md:col-span-4">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Puntaje <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model.number="formObj.puntaje"
                            type="number"
                            :min="-1000"
                            :max="1000"
                            step="1"
                            size="sm"
                            placeholder="0"
                            :disabled="isUpdate && estaProtegido('puntaje') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate && estaProtegido('puntaje') && !authStore.isAdmin }"
                            @blur="touched.puntaje = true"
                        />
                        <small v-if="isUpdate && estaProtegido('puntaje') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="Number(formObj.tipo_antecedente_id) === TipoAntecedente.POSITIVO && Number(formObj.puntaje) < 0"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe ser ≥ 0 para POSITIVO
                        </small>
                        <small
                            v-else-if="Number(formObj.tipo_antecedente_id) === TipoAntecedente.NEGATIVO && Number(formObj.puntaje) > 0"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe ser ≤ 0 para NEGATIVO
                        </small>
                        <small
                            v-else-if="(submitted || touched.puntaje) && (Number(formObj.puntaje) < -1000 || Number(formObj.puntaje) > 1000)"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe estar entre -1000 y 1000
                        </small>
                    </div>

                    <!-- Color Hex -->
                    <div class="md:col-span-4">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Color (Hex)
                        </label>
                        <div class="flex items-center gap-2">
                            <input
                                type="color"
                                v-model="formObj.color_hex"
                                class="w-10 h-[38px] rounded-lg border border-[var(--border-color)] cursor-pointer p-1 bg-white flex-shrink-0"
                            />
                            <BaseInput
                                v-model="formObj.color_hex"
                                :maxlength="7"
                                size="sm"
                                placeholder="#RRGGBB"
                                class="flex-1"
                                @blur="touched.color_hex = true"
                            />
                        </div>
                        <small
                            v-if="(submitted || touched.color_hex) && formObj.color_hex && $rules.colorHex()(formObj.color_hex) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.colorHex()(formObj.color_hex) }}
                        </small>
                    </div>

                    <!-- Orden -->
                    <div class="md:col-span-4">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Orden
                        </label>
                        <BaseInput
                            v-model.number="formObj.orden"
                            type="number"
                            :min="0"
                            step="1"
                            size="sm"
                            placeholder="0"
                            @blur="touched.orden = true"
                        />
                        <small
                            v-if="(submitted || touched.orden) && formObj.orden !== null && formObj.orden !== undefined && Number(formObj.orden) < 0"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe ser mayor o igual a 0
                        </small>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton
                    label="Cancelar"
                    icon="pi pi-times"
                    :loading="loading"
                    variant="danger"
                    @click="hideDialog"
                />
                <BaseButton
                    :label="isUpdate ? 'Actualizar' : 'Guardar Registro'"
                    icon="pi pi-save"
                    :loading="loading"
                    variant="primary"
                    @click="save"
                />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIALOG ELIMINAR ═══════════ -->
    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Subtipo de Antecedente"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick, onMounted } from 'vue';
    import { formatFecha } from '~/utils/date';
    import { useAuthStore } from '@/stores/auth';
    import { TipoAntecedente, TIPO_ANTECEDENTE_METADATA } from '~/constants/estados.constant';

    useHead({ title: 'Tipos de Antecedente Detalle' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ DEPENDENCIAS ============
    const authStore = useAuthStore();
    const { $rules } = useNuxtApp() as any;

    // ============ OPCIONES DERIVADAS DE CONSTANTES ============
    const tipoAntecedenteOptions: OptionItem[] = Object.values(TipoAntecedente)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_ANTECEDENTE_METADATA[id as TipoAntecedente];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog, save,
        toggleEstado, confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'tipos-antecedente-detalle',
        tablaPermisos: 'tipos_antecedente_detalle',
        sortFieldDefault: 'tipo_antecedente_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: [
            'codigo', 'puntaje', 'tipo_antecedente_id',
        ],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            tipo_antecedente_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.tipo_antecedente_id) extra.tipo_antecedente_id = Number(f.tipo_antecedente_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.tipo_antecedente_detalle_id,

        getCleanForm: () => ({
            tipo_antecedente_detalle_id: null,
            tipo_antecedente_id: TipoAntecedente.POSITIVO,
            codigo: '',
            nombre: '',
            descripcion: '',
            puntaje: 0,
            color_hex: '',
            orden: 0,
        }),

        buildPayload: (form: any) => ({
            tipo_antecedente_id: Number(form.tipo_antecedente_id),
            codigo: form.codigo?.trim().toUpperCase(),
            nombre: form.nombre?.trim().toUpperCase(),
            descripcion: form.descripcion?.trim() || null,
            puntaje: Number(form.puntaje ?? 0),
            color_hex: form.color_hex?.trim().toUpperCase() || null,
            orden: Number(form.orden ?? 0),
        }),

        validate: (form: any, rules: any, notify: any) => {
            // ─── Tipo ───
            if (rules.seleccionObligatoria()(form.tipo_antecedente_id) !== true) {
                touched.value.tipo_antecedente_id = true;
                notify('warn', 'Campos incompletos', 'Debe seleccionar un tipo de antecedente.');
                return false;
            }
            // ─── Código ───
            if (!form.codigo?.trim()) {
                touched.value.codigo = true;
                notify('warn', 'Campos incompletos', 'El código es obligatorio.');
                return false;
            }
            if (!/^[A-Z0-9_-]+$/.test(form.codigo.trim().toUpperCase())) {
                touched.value.codigo = true;
                notify('warn', 'Código inválido', 'Solo mayúsculas, números, guion y guion bajo.');
                return false;
            }
            // ─── Nombre ───
            if (!form.nombre?.trim()) {
                touched.value.nombre = true;
                notify('warn', 'Campos incompletos', 'El nombre es obligatorio.');
                return false;
            }
            if (rules.longitudMinima(3)(form.nombre) !== true) {
                touched.value.nombre = true;
                notify('warn', 'Nombre inválido', rules.longitudMinima(3)(form.nombre));
                return false;
            }
            // ─── Color ───
            if (form.color_hex && rules.colorHex()(form.color_hex) !== true) {
                touched.value.color_hex = true;
                notify('warn', 'Color inválido', rules.colorHex()(form.color_hex));
                return false;
            }
            // ─── Descripción ───
            if (form.descripcion && rules.longitudMaxima(500)(form.descripcion) !== true) {
                notify('warn', 'Descripción muy larga', rules.longitudMaxima(500)(form.descripcion));
                return false;
            }
            // ─── Orden ───
            if (form.orden !== null && form.orden !== undefined && form.orden !== '' && Number(form.orden) < 0) {
                touched.value.orden = true;
                notify('warn', 'Orden inválido', 'El orden debe ser mayor o igual a 0.');
                return false;
            }
            // ─── Puntaje ↔ Tipo ───
            const tipo = Number(form.tipo_antecedente_id);
            const puntaje = Number(form.puntaje ?? 0);

            if (puntaje < -1000 || puntaje > 1000) {
                touched.value.puntaje = true;
                notify('warn', 'Puntaje fuera de rango', 'El puntaje debe estar entre -1000 y 1000.');
                return false;
            }
            if (tipo === TipoAntecedente.POSITIVO && puntaje < 0) {
                touched.value.puntaje = true;
                notify('warn', 'Puntaje inválido', `El puntaje ${puntaje} es inválido para POSITIVO. Debe ser ≥ 0.`);
                return false;
            }
            if (tipo === TipoAntecedente.NEGATIVO && puntaje > 0) {
                touched.value.puntaje = true;
                notify('warn', 'Puntaje inválido', `El puntaje ${puntaje} es inválido para NEGATIVO. Debe ser ≤ 0.`);
                return false;
            }
            return true;
        },
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR SUBTIPO DE ANTECEDENTE' : 'NUEVO SUBTIPO DE ANTECEDENTE'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos del subtipo'
            : 'Registro de un nuevo subtipo de antecedente'
    );

    // ============ REACTIVIDAD TIPO ↔ PUNTAJE ============
    const onTipoAntecedenteChange = (): void => {
        const tipo = Number(formObj.value.tipo_antecedente_id);
        const puntaje = Number(formObj.value.puntaje);

        // Ajuste automático del puntaje al cambiar el tipo
        if (tipo === TipoAntecedente.POSITIVO && puntaje < 0) {
            formObj.value.puntaje = Math.abs(puntaje);
        } else if (tipo === TipoAntecedente.NEGATIVO && puntaje > 0) {
            formObj.value.puntaje = -Math.abs(puntaje);
        }
        touched.value.tipo_antecedente_id = true;
    };

    // ============ FOCUS INICIAL ============
    const tipoAntecedenteSelectRef = ref<any>(null);
    const codigoRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            // Si es nuevo, enfocar el select de tipo
            if (!isUpdate.value) {
                const el = tipoAntecedenteSelectRef.value?.getSelectEl?.() as HTMLElement | null;
                const trigger = el?.querySelector('.p-select-label') as HTMLElement | null;
                if (trigger) {
                    trigger.focus();
                    trigger.click();
                    return;
                }
            }
            // Fallback: código
            const input = codigoRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ OVERRIDE openNew ============
    const openNew = (): void => {
        openNewBase();
        formObj.value.tipo_antecedente_id = TipoAntecedente.POSITIVO;
        formObj.value.puntaje = 0;
        formObj.value.orden = 0;
        formObj.value.color_hex = '';
    };

    // ============ OVERRIDE edit (con await + normalización) ============
    const handleEdit = async (data: any): Promise<void> => {
        await editBase(data);

        // Normalizar tipos explícitamente
        formObj.value.tipo_antecedente_detalle_id = data.tipo_antecedente_detalle_id != null
            ? Number(data.tipo_antecedente_detalle_id) : null;
        formObj.value.tipo_antecedente_id = Number(data.tipo_antecedente_id);
        formObj.value.puntaje = Number(data.puntaje ?? 0);
        formObj.value.orden = Number(data.orden ?? 0);
        formObj.value.color_hex = data.color_hex || '';
    };

    // ============ WATCH: Normalizar tipos al abrir el diálogo ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.tipo_antecedente_id != null) {
                formObj.value.tipo_antecedente_id = Number(formObj.value.tipo_antecedente_id);
            }
            if (formObj.value.puntaje != null) {
                formObj.value.puntaje = Number(formObj.value.puntaje);
            }
            if (formObj.value.orden != null) {
                formObj.value.orden = Number(formObj.value.orden);
            }
        }, 150);
    });

    // ============ WATCH: Código → auto-uppercase + limpieza ============
    watch(() => formObj.value.codigo, (val) => {
        if (typeof val === 'string') {
            const limpio = val.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30);
            if (limpio !== val) {
                formObj.value.codigo = limpio;
            }
        }
    });

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true,               class: 'w-10', bodyClass: '!text-center' },
        { field: 'tipo_antecedente_id', header: 'TIPO',     sortable: true,  template: 'body-tipo_antecedente', bodyClass: '!text-center', class: 'w-24' },
        { field: 'nombre',              header: 'ANTECEDENTE',   sortable: true,  template: 'body-nombre' },
        { field: 'puntaje',             header: 'PUNTAJE',  sortable: true,  template: 'body-puntaje',          bodyClass: '!text-center', class: 'w-24' },
        { field: 'color_hex',           header: 'COLOR',    sortable: false, template: 'body-color_hex',        bodyClass: '!text-center', class: 'w-24' },
        { field: 'orden',               header: 'ORDEN',    sortable: true,  bodyClass: '!text-center',         class: 'w-20' },
        { field: 'estado_registro',     header: 'ESTADO',   sortable: false, template: 'body-estado',           bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES',           template: 'body-acciones', class: '!text-center !w-24', sortable: false },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const tipo = formObj.value?.tipo_antecedente?.abreviatura
            || formObj.value?.tipo_antecedente
            || '';
        const codigo = formObj.value?.codigo ?? '';
        const nombre = formObj.value?.nombre ?? '';
        return tipo ? `${tipo} — ${codigo}: ${nombre}` : `${codigo}: ${nombre}`;
    });

    const onFilterChange = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ INIT ============
    onMounted(() => {
        lazyParams.value.sortField = 'tipo_antecedente_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
