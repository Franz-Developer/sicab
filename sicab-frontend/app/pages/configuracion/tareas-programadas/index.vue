<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\tareas-programadas\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-calendar-clock"
        title="Tareas Programadas"
        subtitle="Configuración de tareas automáticas y programadas del sistema"
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
                    <FilterBar
                        :filters="filters"
                        search-placeholder="Buscar: código, nombre, descripción..."
                        :active-filters-count="filtrosActivosCount"
                        modal-title="Filtros de Tareas Programadas"
                        modal-subtitle="Refina la búsqueda de tareas"
                        @search="onSearch"
                        @clear="limpiarFiltros"
                        @apply="aplicarFiltros"
                    >
                        <template #advanced>
                            <!-- Tipo de Tarea -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Tipo de Tarea
                                </label>
                                <BaseSelect
                                    v-model="filters.tipo_tarea_id"
                                    :options="tipoTareaOptions"
                                    option-label="label"
                                    option-value="value"
                                    placeholder="Todos los tipos"
                                    size="sm"
                                    show-clear
                                    appendTo="body"
                                    @update:model-value="aplicarFiltros"
                                    class="w-full"
                                />
                            </div>

                            <!-- Frecuencia -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Frecuencia
                                </label>
                                <BaseSelect
                                    v-model="filters.frecuencia_id"
                                    :options="frecuenciaOptions"
                                    option-label="label"
                                    option-value="value"
                                    placeholder="Todas las frecuencias"
                                    size="sm"
                                    show-clear
                                    appendTo="body"
                                    @update:model-value="aplicarFiltros"
                                    class="w-full"
                                />
                            </div>

                            <!-- Notificar Admin -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Notificar al Administrador
                                </label>
                                <BaseSelect
                                    v-model="filters.notificar_admin"
                                    :options="notificarAdminOptions"
                                    option-label="label"
                                    option-value="value"
                                    placeholder="Todos"
                                    size="sm"
                                    show-clear
                                    appendTo="body"
                                    @update:model-value="aplicarFiltros"
                                    class="w-full"
                                />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-codigo="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.codigo }}</span>
                    <span v-if="Number(data.notificar_admin) === 1" class="tag-principal">
                        NOTIFICA
                    </span>
                </div>
            </template>

            <template #body-nombre="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.nombre }}</span>
                    <span v-if="data.descripcion" class="cell-secondary" :title="data.descripcion">
                        <span class="font-bold">DESC:</span> {{ data.descripcion }}
                    </span>
                </div>
            </template>

            <template #body-tipo_tarea="{ data }">
                <span class="cell-primary-normal">
                    {{ data.tipo_tarea?.label || '—' }}
                </span>
            </template>

            <template #body-frecuencia="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.frecuencia?.label || '—' }}</span>
                    <span v-if="data.frecuencia_id === 3356 && data.cron_expresion" class="cell-secondary font-mono text-[10px]">
                        <i class="pi pi-clock text-[9px] mr-1"></i>{{ data.cron_expresion }}
                    </span>
                </div>
            </template>

            <template #body-ultima_ejecucion="{ data }">
                <span class="cell-primary-normal">
                    {{ data.ultima_ejecucion ? formatFecha12h(data.ultima_ejecucion) : 'Nunca' }}
                </span>
            </template>

            <template #body-intentos_fallidos="{ data }">
                <Tag
                    :value="`${data.intentos_fallidos}`"
                    :severity="Number(data.intentos_fallidos) > 0 ? 'danger' : 'success'"
                    class="text-[10px] font-bold px-2"
                />
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge
                    :estado="data.estado_registro"
                    :estado-id="Number(data.estado_id)"
                />
            </template>

            <!-- ═══════════ ACCIONES ═══════════ -->
            <template #body-acciones="{ data }">
                <CrudRowActions
                    :estado-id="Number(data.estado_id)"
                    :puede="{ ...permisos, eliminar: false }"
                    :mostrar-archivar="true"
                    @edit="edit(data)"
                    @toggle="toggleEstado(data)"
                />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Última Ejecución:</span>
                            <span class="expansion-value">{{ data.ultima_ejecucion ? formatFecha12h(data.ultima_ejecucion) : 'Nunca' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Intentos Fallidos:</span>
                            <span class="expansion-value">
                                <Tag
                                    :value="`${data.intentos_fallidos}`"
                                    :severity="Number(data.intentos_fallidos) > 0 ? 'danger' : 'success'"
                                    class="text-[10px] font-bold"
                                />
                            </span>
                        </div>

                        <div v-if="data.ultimo_error" class="expansion-item md:col-span-2">
                            <span class="expansion-label text-red-600">Último Error:</span>
                            <span class="expansion-value text-red-700 bg-red-50 p-2 rounded border border-red-200 block whitespace-pre-wrap">{{ data.ultimo_error }}</span>
                        </div>

                        <div v-if="data.parametros" class="expansion-item md:col-span-2">
                            <span class="expansion-label">Parámetros (JSON):</span>
                            <pre class="expansion-value text-[10px] bg-slate-100 p-2 rounded max-h-32 overflow-auto">{{ JSON.stringify(data.parametros, null, 2) }}</pre>
                        </div>

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

    <!-- ═══════════ DIALOG EDITAR ═══════════ -->
    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[720px] lg:w-[780px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusFirstInput"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-calendar-clock text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">Editar Tarea Programada</h3>
                    <p class="text-xs text-sky-700">Actualización de la configuración de ejecución</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                    <span>Configuración de la Tarea</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <!-- Info no editable -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3 mb-4">
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código
                        </label>
                        <BaseInput :model-value="formObj.codigo" size="sm" disabled class="opacity-60 cursor-not-allowed" />
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nombre
                        </label>
                        <BaseInput :model-value="formObj.nombre" size="sm" disabled class="opacity-60 cursor-not-allowed" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Descripción -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <textarea
                            ref="descripcionRef"
                            v-model="formObj.descripcion"
                            :maxlength="500"
                            rows="3"
                            placeholder="Describe el propósito de la tarea (opcional)"
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] px-3 py-2 text-xs transition-all focus:outline-none focus:border-[var(--focus-color)] focus:ring-2 focus:ring-blue-100 resize-none"
                        ></textarea>
                    </div>

                    <!-- Frecuencia -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Frecuencia <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.frecuencia_id"
                            :options="frecuenciaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar frecuencia..."
                            size="sm"
                            @update:model-value="onFrecuenciaChange"
                        />
                        <small
                            v-if="(submitted || touched.frecuencia_id) && !formObj.frecuencia_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar una frecuencia
                        </small>
                    </div>

                    <!-- Notificar Admin -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Notificar al Administrador <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.notificar_admin"
                            :options="notificarAdminOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar..."
                            size="sm"
                            @update:model-value="touched.notificar_admin = true"
                        />
                        <small
                            v-if="(submitted || touched.notificar_admin) && formObj.notificar_admin === null"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe indicar si notificar
                        </small>
                    </div>

                    <!-- Cron Expresión (condicional) -->
                    <div v-if="esFrecuenciaCron" class="md:col-span-12">
                        <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-3">
                            <div class="flex items-start gap-2">
                                <i class="pi pi-info-circle text-blue-600 mt-0.5 text-xs"></i>
                                <div class="flex-1">
                                    <p class="text-[11px] font-bold text-blue-800">Expresión Cron Requerida</p>
                                    <p class="text-[10px] text-blue-700 leading-relaxed mt-1">
                                        La frecuencia seleccionada es <b>CRON</b>. Debe especificar una expresión cron válida
                                        (minuto hora día mes día-semana).
                                    </p>
                                </div>
                            </div>
                        </div>
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Expresión Cron <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.cron_expresion"
                            :maxlength="100"
                            size="sm"
                            placeholder="Ej: 0 2 * * * (todos los días a las 2:00 AM)"
                            @blur="touched.cron_expresion = true"
                        />
                        <small class="text-slate-500 text-[10px] mt-1 block">
                            Formato: <code class="bg-slate-100 px-1 rounded">* * * * *</code> = minuto, hora, día del mes, mes, día de la semana.
                        </small>
                        <small
                            v-if="(submitted || touched.cron_expresion) && esFrecuenciaCron && !formObj.cron_expresion?.trim()"
                            class="text-red-500 font-semibold text-[10px] block mt-1"
                        >
                            La expresión cron es obligatoria para frecuencia CRON
                        </small>
                    </div>

                    <!-- Parámetros JSON -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Parámetros (JSON)
                        </label>
                        <textarea
                            v-model="jsonTextValue"
                            rows="6"
                            class="w-full text-xs font-mono p-2 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
                            placeholder='{"lote_size": 100, "solo_activos": true}'
                        ></textarea>
                        <small class="text-slate-500 text-[10px]">
                            Ingrese un objeto JSON válido con los parámetros de ejecución (opcional).
                        </small>
                        <small v-if="jsonError" class="text-red-500 font-semibold text-[10px] block mt-1">
                            {{ jsonError }}
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
                    label="Actualizar"
                    icon="pi pi-save"
                    :loading="loading"
                    variant="primary"
                    @click="saveTarea"
                />
            </div>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick, onMounted } from 'vue';
    import {
        TipoTarea,
        TIPO_TAREA_METADATA,
        Frecuencia,
        FRECUENCIA_METADATA,
    } from '~/constants/estados.constant';
    import { formatFecha12h } from '~/utils/date';

    useHead({ title: 'Tareas Programadas' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();

    // ============ OPCIONES DERIVADAS DE CONSTANTES ============
    const tipoTareaOptions: OptionItem[] = Object.values(TipoTarea)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_TAREA_METADATA[id as TipoTarea];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const frecuenciaOptions: OptionItem[] = Object.values(Frecuencia)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = FRECUENCIA_METADATA[id as Frecuencia];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const notificarAdminOptions: OptionItem[] = [
        { label: 'Sí', value: 1 },
        { label: 'No', value: 0 },
    ];

    // ============ ESTADO ADICIONAL PARA JSON ============
    const jsonTextValue = ref('');

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, formObj, submitted, touched,
        permisos,
        onPage, onSort, onSearch,
        edit: editBase, hideDialog,
        toggleEstado,
        resolvePK,
    } = useCrudTable<any>({
        tabla: 'tareas-programadas',
        tablaPermisos: 'tareas_programadas',
        sortFieldDefault: 'tarea_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        defaultFilters: {
            global: '',
            exactMatch: 0,
            tipo_tarea_id: null,
            frecuencia_id: null,
            notificar_admin: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.tipo_tarea_id) extra.tipo_tarea_id = Number(f.tipo_tarea_id);
            if (f.frecuencia_id) extra.frecuencia_id = Number(f.frecuencia_id);
            if (f.notificar_admin !== null && f.notificar_admin !== undefined && f.notificar_admin !== '') {
                extra.notificar_admin = Number(f.notificar_admin);
            }
            return extra;
        },

        getPrimaryKey: (item: any) => item.tarea_id,

        getCleanForm: () => ({
            tarea_id: null,
            codigo: '',
            nombre: '',
            descripcion: '',
            tipo_tarea_id: null,
            frecuencia_id: Frecuencia.DIARIO,
            cron_expresion: '',
            parametros: null,
            notificar_admin: 0,
        }),

        buildPayload: (form: any) => {
            let parsedJson = null;
            if (jsonTextValue.value?.trim()) {
                try {
                    parsedJson = JSON.parse(jsonTextValue.value);
                } catch {
                    parsedJson = null;
                }
            }

            const payload: Record<string, any> = {
                frecuencia_id: Number(form.frecuencia_id),
                notificar_admin: Number(form.notificar_admin ?? 0),
            };

            if (form.descripcion !== undefined) {
                payload.descripcion = form.descripcion?.trim() || null;
            }

            if (Number(form.frecuencia_id) === Frecuencia.CRON) {
                payload.cron_expresion = form.cron_expresion?.trim() || null;
            } else {
                payload.cron_expresion = null;
            }

            if (parsedJson !== null) {
                payload.parametros = parsedJson;
            }

            return payload;
        },

        validate: () => true,
    });

    // ============ COMPUTED ============
    const esFrecuenciaCron = computed(() =>
        Number(formObj.value.frecuencia_id) === Frecuencia.CRON
    );

    const jsonError = computed<string | null>(() => {
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

    // ============ HANDLERS ============
    const onFrecuenciaChange = (): void => {
        touched.value.frecuencia_id = true;

        if (Number(formObj.value.frecuencia_id) !== Frecuencia.CRON) {
            formObj.value.cron_expresion = '';
        }
    };

    // ============ FOCUS INICIAL ============
    const descripcionRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const textarea = descripcionRef.value?.$el?.querySelector('textarea') as HTMLTextAreaElement | null;
            if (textarea) {
                textarea.focus();
                textarea.select();
            }
        }, 350);
    };

    // ============ OVERRIDE edit ============
    const edit = async (data: any): Promise<void> => {
        await editBase(data);

        // Normalizar tipos
        formObj.value.frecuencia_id = Number(data.frecuencia_id);
        formObj.value.notificar_admin = Number(data.notificar_admin);

        // Sincronizar JSON textarea
        if (data.parametros) {
            jsonTextValue.value = JSON.stringify(data.parametros, null, 2);
        } else {
            jsonTextValue.value = '';
        }
    };

    // ============ SAVE ============
    const saveTarea = async (): Promise<void> => {
        submitted.value = true;

        // Validaciones
        if (!formObj.value.frecuencia_id) {
            touched.value.frecuencia_id = true;
            notify('warn', 'Campos incompletos', 'Debe seleccionar una frecuencia.');
            return;
        }

        if (esFrecuenciaCron.value && !formObj.value.cron_expresion?.trim()) {
            touched.value.cron_expresion = true;
            notify('warn', 'Expresión cron requerida', 'La expresión cron es obligatoria para frecuencia CRON.');
            return;
        }

        if (!esFrecuenciaCron.value && formObj.value.cron_expresion?.trim()) {
            notify('warn', 'Expresión cron inválida', 'La expresión cron solo es válida cuando la frecuencia es CRON.');
            return;
        }

        if (jsonTextValue.value?.trim() && jsonError.value) {
            notify('warn', 'JSON inválido', jsonError.value);
            return;
        }

        if (formObj.value.notificar_admin === null || formObj.value.notificar_admin === undefined) {
            touched.value.notificar_admin = true;
            notify('warn', 'Campos incompletos', 'Debe indicar si notificar al administrador.');
            return;
        }

        try {
            loading.value = true;

            let parsedJson = null;
            if (jsonTextValue.value?.trim()) {
                try {
                    parsedJson = JSON.parse(jsonTextValue.value);
                } catch {
                    notify('warn', 'JSON inválido', 'No se pudo parsear el JSON de parámetros.');
                    return;
                }
            }

            const payload: Record<string, any> = {
                frecuencia_id: Number(formObj.value.frecuencia_id),
                notificar_admin: Number(formObj.value.notificar_admin),
            };

            if (formObj.value.descripcion !== undefined) {
                payload.descripcion = formObj.value.descripcion?.trim() || null;
            }

            if (Number(formObj.value.frecuencia_id) === Frecuencia.CRON) {
                payload.cron_expresion = formObj.value.cron_expresion?.trim() || null;
            } else {
                payload.cron_expresion = null;
            }

            if (parsedJson !== null) {
                payload.parametros = parsedJson;
            }

            const pk = resolvePK(formObj.value);
            await $api(`/tareas-programadas/${pk}`, { method: 'PATCH', body: payload });

            notify('success', 'Actualizado', 'La tarea programada se actualizó correctamente.');
            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo actualizar la tarea.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;
            notify('error', 'Error al actualizar', firstError);
            console.error('Error al guardar tarea programada:', err);
        } finally {
            loading.value = false;
        }
    };

    // ============ FILTROS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.tipo_tarea_id) count++;
        if (filters.value.frecuencia_id) count++;
        if (filters.value.notificar_admin !== null && filters.value.notificar_admin !== undefined) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.tipo_tarea_id = null;
        filters.value.frecuencia_id = null;
        filters.value.notificar_admin = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'codigo', header: 'CÓDIGO', sortable: true, template: 'body-codigo', class: 'w-44' },
        { field: 'nombre', header: 'NOMBRE / DESCRIPCIÓN', sortable: true, template: 'body-nombre' },
        { field: 'tipo_tarea_id', header: 'TIPO', sortable: true, template: 'body-tipo_tarea', bodyClass: '!text-center', class: 'w-32' },
        { field: 'frecuencia_id', header: 'FRECUENCIA', sortable: true, template: 'body-frecuencia', bodyClass: '!text-center', class: 'w-40' },
        { field: 'ultima_ejecucion', header: 'ÚLT. EJECUCIÓN', sortable: true, template: 'body-ultima_ejecucion', bodyClass: '!text-center', class: 'w-36' },
        { field: 'intentos_fallidos', header: 'FALLOS', sortable: true, template: 'body-intentos_fallidos', bodyClass: '!text-center', class: 'w-20' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-20' },
    ];

    // ============ WATCHERS ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.frecuencia_id != null) {
                formObj.value.frecuencia_id = Number(formObj.value.frecuencia_id);
            }
            if (formObj.value.notificar_admin != null) {
                formObj.value.notificar_admin = Number(formObj.value.notificar_admin);
            }
        }, 150);
    });

    // ============ INIT ============
    onMounted(() => {
        lazyParams.value.sortField = 'tarea_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
