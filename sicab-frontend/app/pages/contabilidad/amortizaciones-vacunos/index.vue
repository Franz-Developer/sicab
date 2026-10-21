<!-- C:\sistemas\sicab\sicab-frontend\app\pages\contabilidad\amortizaciones-vacunos\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-line" title="Amortizaciones de Vacunos"
        subtitle="Cálculo y registro de la depreciación anual del hato" :show-action="true"
        action-label="CALCULAR AMORTIZACIONES" action-icon="pi pi-calculator" @action="openBulkDialog">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: arete, nombre, sucursal..."
                        :active-filters-count="filtrosActivosCount"
                        modal-subtitle="Refina la búsqueda de amortizaciones" @search="onSearch" @clear="limpiarFiltros"
                        @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Fila 1: Sucursal y Empresa -->
                            <div class="md:col-span-6">
                                <label
                                    class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingSucursales"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear
                                    appendTo="body" :loading="loadingEmpresas" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <!-- Fila 2: Gestión y Rango de Periodo -->
                            <div class="md:col-span-4">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión
                                    (Año)</label>
                                <BaseSelect v-model="filters.gestion_id" :options="gestionOptions" option-label="label"
                                    option-value="value" placeholder="Todas las gestiones" size="sm" filter show-clear
                                    appendTo="body" :loading="loadingGestiones" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <div class="md:col-span-4">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Periodo
                                    Desde</label>
                                <BaseInput v-model.number="filters.periodo_desde" type="number" placeholder="Ej: 2024"
                                    size="sm" @blur="aplicarFiltros" />
                            </div>

                            <div class="md:col-span-4">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Periodo
                                    Hasta</label>
                                <BaseInput v-model.number="filters.periodo_hasta" type="number" placeholder="Ej: 2026"
                                    size="sm" @blur="aplicarFiltros" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-vacuno_arete="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.vacuno_arete }}</span>
                    <span v-if="data.vacuno_nombre" class="cell-secondary">{{ data.vacuno_nombre }}</span>
                </div>
            </template>

            <template #body-sucursal_nombre="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre }}</span>
                    <span v-if="data.empresa_nombre" class="cell-secondary">{{ data.empresa_nombre }}</span>
                </div>
            </template>

            <template #body-periodo="{ data }">
                <span class="cell-primary-normal font-mono">{{ data.periodo }}</span>
            </template>

            <template #body-valor_inicial="{ data }">
                <span class="font-mono">{{ formatCurrency(data.valor_inicial) }}</span>
            </template>

            <template #body-amortizacion_periodo="{ data }">
                <span class="font-mono text-red-600">{{ formatCurrency(data.amortizacion_periodo) }}</span>
            </template>

            <template #body-valor_libro="{ data }">
                <span class="font-mono font-bold text-emerald-700">{{ formatCurrency(data.valor_libro) }}</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                    @edit="handleEdit(data)" @delete="confirmDelete(data)" />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">ID Vacuno</span>
                            <span class="expansion-value">{{ data.vacuno_id }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">ID Gestión</span>
                            <span class="expansion-value">{{ data.gestion_id }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Amortización Acumulada</span>
                            <span class="expansion-value font-mono">{{ formatCurrency(data.amortizacion_acumulada)
                            }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Cotización UFV Aplicada</span>
                            <span class="expansion-value font-mono">{{ data.cotizacion_ufv_aplicada }} ({{
                                data.fecha_cotizacion_ufv }})</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Valor Libro (UFV)</span>
                            <span class="expansion-value font-mono">{{ data.valor_libro_ufv }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Observaciones</span>
                            <span class="expansion-value">{{ data.observaciones || '—' }}</span>
                        </div>
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

    <!-- ═══════════ DIÁLOGO DE EDICIÓN (SOLO OBSERVACIONES) ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[600px]" maxHeight="92vh"
        :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-pencil text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div v-if="isUpdate">
            <div class="panel-contrast">
                <div
                    class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                    <span>Información de la Amortización</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-12">
                        <div class="info-panel">
                            <span class="info-panel-title">Datos del Cálculo (No Editables)</span>
                            <div class="info-panel-list !grid !grid-cols-2 !gap-x-4">
                                <div class="info-panel-item"><i class="pi pi-tag"></i><b>Arete:</b> {{
                                    formObj.vacuno_arete
                                }}</div>
                                <div class="info-panel-item"><i class="pi pi-calendar"></i><b>Periodo:</b> {{
                                    formObj.periodo }}</div>
                                <div class="info-panel-item"><i class="pi pi-dollar"></i><b>Valor Inicial:</b> {{
                                    formatCurrency(formObj.valor_inicial) }}</div>
                                <div class="info-panel-item"><i class="pi pi-arrow-down"></i><b>Amortización:</b> {{
                                    formatCurrency(formObj.amortizacion_periodo) }}</div>
                                <div class="info-panel-item"><i class="pi pi-book"></i><b>Valor Libro:</b> {{
                                    formatCurrency(formObj.valor_libro) }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Observaciones
                        </label>
                        <BaseInput ref="observacionesRef" v-model="formObj.observaciones" :maxlength="500" size="sm"
                            placeholder="Añadir una nota o justificación (opcional)" />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton label="Actualizar Observaciones" icon="pi pi-save" :loading="loading" variant="primary"
                    @click="save" />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIÁLOGO DE CÁLCULO MASIVO (BULK) ═══════════ -->
    <Dialog v-model:visible="bulkDialog" :modal="true" :closable="!bulkLoading"
        class="custom-modal crud-celeste-dialog w-[95vw] sm:w-[90vw] md:w-[600px]" :style="{ maxHeight: '92vh' }"
        @show="focusAnio">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-calculator text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">Calcular Amortizaciones Masivas</h3>
                    <p class="text-xs text-sky-700">Procesa la amortización de todos los vacunos para un año fiscal</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div class="flex flex-col gap-y-4">
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Año Fiscal (Periodo) <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="anioSelectRef" v-model="bulkForm.anio" :options="anioOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar año..." size="sm" />
                    </div>
                    <div class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <input id="recalcular" v-model="bulkForm.recalcular" type="checkbox"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                        <label for="recalcular"
                            class="text-[11px] font-bold text-slate-700 uppercase cursor-pointer select-none">
                            Recalcular registros existentes
                        </label>
                    </div>
                    <small class="text-slate-500 text-[10px] leading-relaxed">
                        Si marca "Recalcular", los registros de amortización ACTIVOS para el año seleccionado se
                        archivarán y se volverán a calcular. Si no, se omitirán los ya existentes.
                    </small>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="bulkLoading" variant="danger"
                    @click="bulkDialog = false" />
                <BaseButton label="Iniciar Cálculo" icon="pi pi-play" :loading="bulkLoading" variant="primary"
                    @click="ejecutarBulkAmortizacion" />
            </div>
        </template>
    </Dialog>

    <!-- ═══════════ DIÁLOGO DE ELIMINACIÓN ═══════════ -->
    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Amortización" :item-name="deleteItemName"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, nextTick, onMounted } from 'vue';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'Amortizaciones de Vacunos' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj,
        isUpdate, permisos,
        onPage, onSort, onSearch,
        edit, hideDialog, save,
        confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'amortizaciones-vacunos',
        sortFieldDefault: 'amortizacion_vacuno_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        defaultFilters: {
            global: '',
            exactMatch: 0,
            vacuno_id: null,
            sucursal_id: null,
            empresa_id: null,
            gestion_id: null,
            periodo_desde: null,
            periodo_hasta: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.vacuno_id) extra.vacuno_id = f.vacuno_id;
            if (f.sucursal_id) extra.sucursal_id = f.sucursal_id;
            if (f.empresa_id) extra.empresa_id = f.empresa_id;
            if (f.gestion_id) extra.gestion_id = f.gestion_id;
            if (f.periodo_desde) extra.periodo_desde = f.periodo_desde;
            if (f.periodo_hasta) extra.periodo_hasta = f.periodo_hasta;
            return extra;
        },

        getPrimaryKey: (item: any) => item.amortizacion_vacuno_id,

        getCleanForm: () => ({
            amortizacion_vacuno_id: null,
            vacuno_arete: '',
            periodo: '',
            valor_inicial: 0,
            amortizacion_periodo: 0,
            valor_libro: 0,
            observaciones: '',
        }),

        buildPayload: (form: any) => ({
            observaciones: form.observaciones?.trim() || null,
        }),

        validate: () => true,
    });

    // ============ ESTADO ADICIONAL PARA CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const sucursalOptions = shallowRef<OptionItem[]>([]);
    const gestionOptions = shallowRef<OptionItem[]>([]);
    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingGestiones = ref(false);

    // ============ ESTADO PARA EL DIÁLOGO DE BULK ============
    const bulkDialog = ref(false);
    const bulkLoading = ref(false);
    const bulkForm = ref({
        anio: null as number | null,
        recalcular: false,
    });
    const anioOptions = ref<OptionItem[]>([]);
    const anioSelectRef = ref<any>(null);

    // ============ FUNCIONES DE CARGA DE CATÁLOGOS ============
    const cargarCatalogos = async (): Promise<void> => {
        loadingEmpresas.value = true;
        loadingSucursales.value = true;
        loadingGestiones.value = true;
        try {
            const [resEmpresas, resSucursales, resGestiones] = await Promise.all([
                $api('/empresas', { method: 'GET', params: { limit: 1000, sortField: 'empresa', sortOrder: 1, estado_id: ESTADO_ACTIVO } }),
                $api('/sucursales', { method: 'GET', params: { limit: 1000, sortField: 'sucursal', sortOrder: 1, estado_id: ESTADO_ACTIVO } }),
                $api('/gestiones', { method: 'GET', params: { limit: 1000, sortField: 'anio', sortOrder: -1 } }),
            ]);

            const mapToOptions = (data: any[], labelKey: string, valueKey: string): OptionItem[] =>
                (data || []).map(item => ({ label: `${item[labelKey]}`, value: Number(item[valueKey]) }));

            empresaOptions.value = mapToOptions(resEmpresas.data || [], 'empresa', 'empresa_id');
            sucursalOptions.value = mapToOptions(resSucursales.data || [], 'sucursal', 'sucursal_id');
            gestionOptions.value = mapToOptions(resGestiones.data || [], 'anio', 'gestion_id');
        } catch (err) {
            console.error('Error al cargar catálogos:', err);
            notify('error', 'Error de carga', 'No se pudieron cargar los datos para los filtros.');
        } finally {
            loadingEmpresas.value = false;
            loadingSucursales.value = false;
            loadingGestiones.value = false;
        }
    };

    // ============ FUNCIÓN DE CÁLCULO MASIVO (BULK) ============
    const openBulkDialog = async (): Promise<void> => {
        try {
            const res = await $api('/amortizaciones-vacunos/periodos-disponibles');
            if (res.anios && res.anios.length > 0) {
                anioOptions.value = res.anios.map((anio: number) => ({ label: `${anio}`, value: anio }));
                bulkForm.value.anio = res.anioActual;
            } else {
                notify('warn', 'Sin periodos', 'No hay periodos disponibles para amortizar.');
                return;
            }
            bulkForm.value.recalcular = false;
            bulkDialog.value = true;
        } catch (err) {
            notify('error', 'Error al obtener periodos', 'No se pudieron cargar los años disponibles.');
        }
    };

    const focusAnio = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = anioSelectRef.value?.getSelectEl?.() as HTMLElement | null;
            if (el) {
                const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
                trigger?.focus();
                trigger?.click();
            }
        }, 350);
    };

    const ejecutarBulkAmortizacion = async (): Promise<void> => {
        if (!bulkForm.value.anio) {
            notify('warn', 'Campo requerido', 'Debe seleccionar un año fiscal.');
            return;
        }

        bulkLoading.value = true;
        try {
            const result: any = await $api('/amortizaciones-vacunos', {
                method: 'POST',
                body: {
                    anio: bulkForm.value.anio,
                    recalcular: bulkForm.value.recalcular,
                },
            });

            let message = `Proceso finalizado. Total de vacunos: ${result.total_vacunos}.`;
            if (result.insertados > 0) message += ` Insertados: ${result.insertados}.`;
            if (result.cerrados > 0) message += ` Cerrados (recalculados): ${result.cerrados}.`;
            if (result.omitidos > 0) message += ` Omitidos (ya existían): ${result.omitidos}.`;

            notify('success', 'Cálculo completado', message);
            bulkDialog.value = false;
            onSearch();
        } catch (err: any) {
            const data = err?.data || err?.response?._data || {};
            const msg = data?.message || 'Ocurrió un error al ejecutar el cálculo.';
            const errores = data?.metadata?.errores || [];

            if (errores.length > 0) {
                const detalle = errores
                    .slice(0, 3)
                    .map((e: any) => `${e.arete}: ${e.error}`)
                    .join(' | ');
                notify('error', 'Cálculo fallido', `${Array.isArray(msg) ? msg.join(', ') : msg}\n\n${detalle}`);
                console.warn('Errores en amortización masiva:', errores);
            } else {
                notify('error', 'Error en el cálculo', Array.isArray(msg) ? msg.join(', ') : msg);
            }
        } finally {
            bulkLoading.value = false;
        }
    };

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR OBSERVACIONES' : 'NUEVA AMORTIZACIÓN'
    );
    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de la nota del registro'
            : 'Registro de amortización'
    );

    // ============ FOCUS INICIAL ============
    const observacionesRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            observacionesRef.value?.focus?.();
        }, 350);
    };

    // ============ OVERRIDE edit ============
    const handleEdit = async (item: any): Promise<void> => {
        await edit(item);
        // Aseguramos que el campo observaciones esté presente
        formObj.value.observaciones = item.observaciones ?? '';
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'vacuno_arete', header: 'VACUNO', sortable: true, template: 'body-vacuno_arete' },
        { field: 'sucursal_nombre', header: 'SUCURSAL / EMPRESA', sortable: true, template: 'body-sucursal_nombre', class: 'w-48' },
        { field: 'periodo', header: 'PERIODO', sortable: true, template: 'body-periodo', bodyClass: '!text-center', class: 'w-20' },
        { field: 'valor_inicial', header: 'VALOR INICIAL', sortable: true, template: 'body-valor_inicial', bodyClass: '!text-right', class: 'w-32' },
        { field: 'amortizacion_periodo', header: 'AMORTIZACIÓN', sortable: true, template: 'body-amortizacion_periodo', bodyClass: '!text-right', class: 'w-32' },
        { field: 'valor_libro', header: 'VALOR LIBRO', sortable: true, template: 'body-valor_libro', bodyClass: '!text-right', class: 'w-32' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-20' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-24' },
    ];

    // ============ HELPERS ============
    const formatCurrency = (value: number | string): string => {
        const num = Number(value);
        if (isNaN(num)) return '—';
        return num.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' });
    };

    const deleteItemName = computed(() => {
        const arete = formObj.value.vacuno_arete ?? '';
        const periodo = formObj.value.periodo ?? '';
        return `Amortización de ${arete} para el año ${periodo}`;
    });

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.vacuno_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.empresa_id) count++;
        if (filters.value.gestion_id) count++;
        if (filters.value.periodo_desde) count++;
        if (filters.value.periodo_hasta) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.vacuno_id = null;
        filters.value.sucursal_id = null;
        filters.value.empresa_id = null;
        filters.value.gestion_id = null;
        filters.value.periodo_desde = null;
        filters.value.periodo_hasta = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ INIT ============
    onMounted(async () => {
        await cargarCatalogos();
        lazyParams.value.sortField = 'amortizacion_vacuno_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
