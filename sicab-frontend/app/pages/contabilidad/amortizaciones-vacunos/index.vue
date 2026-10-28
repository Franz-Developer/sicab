<!-- C:\sistemas\sicab\sicab-frontend\app\pages\contabilidad\amortizaciones-vacunos\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-line" title="Amortizaciones de Vacunos"
        subtitle="Cálculo y registro de la depreciación anual del hato" :show-action="false" @action="openBulkDialog">
        <template #actions>
            <BaseButton label="ELIMINAR GESTIÓN" icon="pi pi-trash" variant="danger" size="sm"
                @click="openDeleteGestionDialog" />
            <BaseButton label="CALCULAR AMORTIZACIONES" icon="pi pi-calculator" variant="primary" size="sm"
                @click="openBulkDialog" />
        </template>

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
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear
                                    appendTo="body" :loading="loadingEmpresas" @update:model-value="onEmpresaChange"
                                    class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label
                                    class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingSucursales"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-12 border-t border-slate-100 pt-2 mt-1"></div>

                            <div class="md:col-span-4">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión
                                    (Año)</label>
                                <BaseSelect v-model="filters.gestion" :options="gestionOptions" option-label="label"
                                    option-value="value" placeholder="Todas las gestiones" size="sm" filter show-clear
                                    appendTo="body" :loading="loadingGestiones" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <div class="md:col-span-4">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión
                                    Desde</label>
                                <BaseInput v-model.number="filters.gestion_desde" type="number" placeholder="Ej: 2024"
                                    size="sm" @blur="aplicarFiltrosDebounced" />
                            </div>

                            <div class="md:col-span-4">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión
                                    Hasta</label>
                                <BaseInput v-model.number="filters.gestion_hasta" type="number" placeholder="Ej: 2026"
                                    size="sm" @blur="aplicarFiltrosDebounced" />
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

            <template #body-gestion="{ data }">
                <span class="cell-primary-normal font-mono font-bold text-sky-800">{{ data.gestion }}</span>
            </template>

            <template #body-valor_inicial="{ data }">
                <span class="font-mono">{{ formatCurrency(data.valor_inicial) }}</span>
            </template>

            <template #body-amortizacion_gestion="{ data }">
                <span class="font-mono text-red-600">{{ formatCurrency(data.amortizacion_gestion) }}</span>
            </template>

            <template #body-valor_libro="{ data }">
                <span class="font-mono font-bold text-emerald-700">{{ formatCurrency(data.valor_libro) }}</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
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
                            <span class="expansion-label">Gestión</span>
                            <span class="expansion-value">{{ data.gestion }}</span>
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
                        <div class="expansion-item md:col-span-2">
                            <span class="expansion-label">Observaciones</span>
                            <span class="expansion-value">{{ data.observaciones || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Última Actualización</span>
                            <span class="expansion-value">{{ data.fecha_actualizacion || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

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
                    <div>
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Empresa <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="bulkForm.empresa_id" :options="empresaOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar empresa..." size="sm" filter show-clear
                            appendTo="body" :loading="loadingEmpresas" @update:model-value="onBulkEmpresaChange" />
                        <small class="text-slate-500 text-[10px] mt-1 block">
                            Solo se amortizarán vacunos de la empresa seleccionada.
                        </small>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Año Fiscal (Gestión) <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="anioSelectRef" v-model="bulkForm.gestion" :options="anioOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar año..." size="sm"
                            :loading="loadingAnios" :disabled="!bulkForm.empresa_id" />
                        <small v-if="!bulkForm.empresa_id" class="text-amber-600 text-[10px] mt-1 block">
                            <i class="pi pi-info-circle mr-1"></i>Seleccione primero una empresa.
                        </small>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="bulkLoading" variant="dialog-cancel"
                    @click="bulkDialog = false" />
                <BaseButton label="Iniciar Cálculo" icon="pi pi-play" :loading="bulkLoading" variant="primary"
                    :disabled="!bulkForm.empresa_id || !bulkForm.gestion" @click="ejecutarBulkAmortizacion" />
            </div>
        </template>
    </Dialog>

    <!-- ═══════════ DIÁLOGO DE ELIMINACIÓN POR GESTIÓN ═══════════ -->
    <Dialog v-model:visible="deleteGestionDialog" :modal="true" :closable="!deleteGestionLoading"
        class="custom-modal w-[95vw] sm:w-[500px]" :style="{ maxHeight: '90vh' }">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-red-600 p-2 rounded-lg shadow">
                    <i class="pi pi-exclamation-triangle text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-red-900 uppercase">Eliminar Gestión Completa</h3>
                    <p class="text-xs text-red-700">Esta acción dará de baja las amortizaciones del año.</p>
                </div>
            </div>
        </template>

        <div class="flex flex-col gap-4 py-2">
            <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                    Empresa <span class="text-red-500">*</span>
                </label>
                <BaseSelect v-model="deleteGestionForm.empresa_id" :options="empresaOptions" option-label="label"
                    option-value="value" placeholder="Seleccionar empresa..." size="sm" filter show-clear
                    appendTo="body" @update:model-value="cargarAniosBulk" />
            </div>

            <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                    Año de Gestión a Eliminar <span class="text-red-500">*</span>
                </label>
                <BaseSelect v-model="deleteGestionForm.gestion" :options="gestionDeleteOptions" option-label="label"
                    option-value="value" placeholder="Seleccionar año..." size="sm" filter
                    :disabled="!deleteGestionForm.empresa_id" />

                <small v-if="!deleteGestionForm.empresa_id" class="text-amber-600 text-[10px] mt-1 block">
                    <i class="pi pi-info-circle mr-1"></i>Seleccione primero una empresa.
                </small>
            </div>

            <div class="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p class="text-[11px] text-amber-800 font-semibold">
                    <i class="pi pi-info-circle mr-1"></i>
                    Se eliminarán <b>todos los registros ACTIVOS</b> de la empresa y gestión seleccionada.
                    Los vacunos afectados volverán a su estado de cálculo anterior.
                    Esta acción no se puede deshacer.
                </p>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="deleteGestionLoading" variant="dialog-cancel"
                    @click="deleteGestionDialog = false" />
                <BaseButton label="Sí, Eliminar Gestión" icon="pi pi-trash" :loading="deleteGestionLoading"
                    variant="danger" :disabled="!deleteGestionForm.empresa_id || !deleteGestionForm.gestion"
                    @click="ejecutarDeleteGestion" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, nextTick, onMounted } from 'vue';
    import { ESTADO_ACTIVO, TipoMoneda } from '~/constants/estados.constant';

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
        onPage, onSort, onSearch
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
            gestion: null,
            gestion_desde: null,
            gestion_hasta: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.vacuno_id) extra.vacuno_id = f.vacuno_id;
            if (f.sucursal_id) extra.sucursal_id = f.sucursal_id;
            if (f.empresa_id) extra.empresa_id = f.empresa_id;
            if (f.gestion) extra.gestion = f.gestion;
            if (f.gestion_desde) extra.gestion_desde = f.gestion_desde;
            if (f.gestion_hasta) extra.gestion_hasta = f.gestion_hasta;
            return extra;
        },

        getPrimaryKey: (item: any) => item.amortizacion_vacuno_id,

        getCleanForm: () => ({}),
        buildPayload: () => ({}),
        validate: () => true,
    });

    // ============ ESTADO ADICIONAL PARA CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const sucursalOptions = shallowRef<OptionItem[]>([]);
    const gestionOptions = shallowRef<OptionItem[]>([]);
    const gestionDeleteOptions = shallowRef<OptionItem[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingGestiones = ref(false);

    // ============ ESTADO PARA EL DIÁLOGO DE BULK ============
    const bulkDialog = ref(false);
    const bulkLoading = ref(false);
    const bulkForm = ref({
        gestion: null as number | null,
        empresa_id: null as number | null,
    });

    const anioOptions = ref<OptionItem[]>([]);
    const anioSelectRef = ref<any>(null);
    const loadingAnios = ref(false);

    // ============ FUNCIONES DE CARGA DE CATÁLOGOS ============
    const cargarCatalogos = async (): Promise<void> => {
        loadingEmpresas.value = true;
        loadingSucursales.value = true;
        loadingGestiones.value = true;
        try {
            const [resEmpresas, resSucursales] = await Promise.all([
                $api('/empresas', { method: 'GET', params: { limit: 1000, sortField: 'empresa', sortOrder: 1, estado_id: ESTADO_ACTIVO } }),
                $api('/sucursales', { method: 'GET', params: { limit: 1000, sortField: 'sucursal', sortOrder: 1, estado_id: ESTADO_ACTIVO } }),
            ]);

            const mapToOptions = (data: any[], labelKey: string, valueKey: string): OptionItem[] =>
                (data || []).map(item => ({ label: `${item[labelKey]}`, value: Number(item[valueKey]) }));

            empresaOptions.value = mapToOptions(resEmpresas.data || [], 'empresa', 'empresa_id');
            sucursalOptions.value = mapToOptions(resSucursales.data || [], 'sucursal', 'sucursal_id');

            await cargarGestiones();
        } catch (err) {
            console.error('Error al cargar catálogos:', err);
            notify('error', 'Error de carga', 'No se pudieron cargar los datos para los filtros.');
        } finally {
            loadingEmpresas.value = false;
            loadingSucursales.value = false;
            loadingGestiones.value = false;
        }
    };

    const cargarGestiones = async (empresaId?: number | null): Promise<void> => {
        try {
            const params = empresaId ? { empresa_id: empresaId } : {};
            const res = await $api('/amortizaciones-vacunos/periodos-disponibles', { params });

            if (res && res.anios && res.anios.length > 0) {
                gestionOptions.value = res.anios.map((anio: number) => ({
                    label: `${anio}`,
                    value: anio
                }));
            } else {
                gestionOptions.value = [];
            }
        } catch (err) {
            console.error('Error al cargar gestiones:', err);
            gestionOptions.value = [];
        }
    };

    // ============ HANDLERS DE CAMBIO ============
    const onEmpresaChange = async (): Promise<void> => {
        lazyParams.value.first = 0;

        if (filters.value.empresa_id) {
            await recargarSucursales(filters.value.empresa_id);
            const idsValidos = sucursalOptions.value.map(o => o.value);
            if (filters.value.sucursal_id && !idsValidos.includes(filters.value.sucursal_id)) {
                filters.value.sucursal_id = null;
            }
        } else {
            await recargarSucursales(null);
        }

        await cargarGestiones(filters.value.empresa_id);

        onSearch();
    };

    const recargarSucursales = async (empresaId: number | null): Promise<void> => {
        loadingSucursales.value = true;
        try {
            const params: Record<string, any> = {
                limit: 1000,
                sortField: 'sucursal',
                sortOrder: 1,
                estado_id: ESTADO_ACTIVO,
            };
            if (empresaId) params.empresa_id = empresaId;

            const res = await $api('/sucursales', { method: 'GET', params });
            sucursalOptions.value = (res.data || []).map((s: any) => ({
                label: s.sucursal,
                value: Number(s.sucursal_id),
            }));
        } catch (err) {
            console.error('Error al recargar sucursales:', err);
            sucursalOptions.value = [];
        } finally {
            loadingSucursales.value = false;
        }
    };

    const onBulkEmpresaChange = async (): Promise<void> => {
        bulkForm.value.gestion = null;
        anioOptions.value = [];
        await cargarAniosParaCalcular();
    };

    const cargarAniosBulk = async (): Promise<void> => {
        if (!deleteGestionForm.value.empresa_id) {
            gestionDeleteOptions.value = [];
            return;
        }

        loadingAnios.value = true;
        try {
            const params = { empresa_id: deleteGestionForm.value.empresa_id };
            const res = await $api('/amortizaciones-vacunos/periodos-disponibles', { params });

            if (res?.anios?.length > 0) {
                gestionDeleteOptions.value = res.anios.map((anio: number) => ({ label: `${anio}`, value: anio }));
                deleteGestionForm.value.gestion = res.anios[0];
            } else {
                gestionDeleteOptions.value = [];
                deleteGestionForm.value.gestion = null;
            }
        } catch (err) {
            gestionDeleteOptions.value = [];
        } finally {
            loadingAnios.value = false;
        }
    };

    const cargarAniosParaCalcular = async (): Promise<void> => {
        loadingAnios.value = true;
        try {
            const res = await $api('/amortizaciones-vacunos/periodos-para-calcular', {
                params: { moneda_destino_id: TipoMoneda.UFV }
            });

            if (res?.anios?.length > 0) {
                anioOptions.value = res.anios.map((anio: number) => ({ label: `${anio}`, value: anio }));
                bulkForm.value.gestion = res.anios[0];
            } else {
                anioOptions.value = [];
            }
        } catch (err) {
            anioOptions.value = [];
            notify('error', 'Error al obtener periodos', 'No se pudieron cargar los años disponibles.');
        } finally {
            loadingAnios.value = false;
        }
    };

    // ============ FUNCIÓN DE CÁLCULO MASIVO (BULK) ============
    const openBulkDialog = async (): Promise<void> => {
        bulkForm.value.empresa_id = filters.value.empresa_id ?? null;
        bulkForm.value.gestion = null;
        anioOptions.value = [];
        bulkDialog.value = true;
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
        if (!bulkForm.value.empresa_id) {
            notify('warn', 'Campo requerido', 'Debe seleccionar una empresa.');
            return;
        }
        if (!bulkForm.value.gestion) {
            notify('warn', 'Campo requerido', 'Debe seleccionar un año fiscal.');
            return;
        }

        bulkLoading.value = true;
        try {
            const result: any = await $api('/amortizaciones-vacunos', {
                method: 'POST',
                body: {
                    gestion: bulkForm.value.gestion,
                    empresa_id: bulkForm.value.empresa_id
                },
            });

            let message = `Proceso finalizado. Total de vacunos: ${result.total_vacunos}.`;
            if (result.insertados > 0) message += ` Insertados: ${result.insertados}.`;
            if (result.omitidos > 0) message += ` Omitidos (ya existían): ${result.omitidos}.`;

            notify('success', 'Cálculo completado', message);
            bulkDialog.value = false;
            onSearch();
            await cargarGestiones(filters.value.empresa_id);
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

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'vacuno_arete', header: 'VACUNO', sortable: true, template: 'body-vacuno_arete' },
        { field: 'sucursal_nombre', header: 'SUCURSAL / EMPRESA', sortable: true, template: 'body-sucursal_nombre', class: 'w-48' },
        { field: 'gestion', header: 'GESTIÓN', sortable: true, template: 'body-gestion', bodyClass: '!text-center', class: 'w-20' },
        { field: 'valor_inicial', header: 'VALOR INICIAL', sortable: true, template: 'body-valor_inicial', bodyClass: '!text-right', class: 'w-32' },
        { field: 'amortizacion_gestion', header: 'AMORTIZACIÓN', sortable: true, template: 'body-amortizacion_gestion', bodyClass: '!text-right', class: 'w-32' },
        { field: 'valor_libro', header: 'VALOR LIBRO', sortable: true, template: 'body-valor_libro', bodyClass: '!text-right', class: 'w-32' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-20' }
    ];

    // ============ HELPERS ============
    const formatCurrency = (value: number | string): string => {
        const num = Number(value);
        if (isNaN(num)) return '—';
        return num.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' });
    };

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.vacuno_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.empresa_id) count++;
        if (filters.value.gestion) count++;
        if (filters.value.gestion_desde) count++;
        if (filters.value.gestion_hasta) count++;
        return count;
    });

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const aplicarFiltrosDebounced = (): void => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            aplicarFiltros();
        }, 500);
    };

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.vacuno_id = null;
        filters.value.sucursal_id = null;
        filters.value.empresa_id = null;
        filters.value.gestion = null;
        filters.value.gestion_desde = null;
        filters.value.gestion_hasta = null;
        lazyParams.value.first = 0;
        onSearch();
        cargarGestiones();
    };

    // ============ ELIMINAR GESTIÓN COMPLETA ============
    const deleteGestionDialog = ref(false);
    const deleteGestionLoading = ref(false);
    const deleteGestionForm = ref({
        empresa_id: null as number | null,
        gestion: null as number | null,
    });

    const openDeleteGestionDialog = (): void => {
        deleteGestionForm.value.empresa_id = filters.value.empresa_id ?? null;
        deleteGestionForm.value.gestion = null;
        deleteGestionDialog.value = true;
    };

    const ejecutarDeleteGestion = async (): Promise<void> => {
        if (!deleteGestionForm.value.empresa_id || !deleteGestionForm.value.gestion) return;

        deleteGestionLoading.value = true;
        try {
            const res: any = await $api('/amortizaciones-vacunos/eliminar-por-gestion', {
                method: 'POST',
                body: {
                    empresa_id: deleteGestionForm.value.empresa_id,
                    gestion: deleteGestionForm.value.gestion,
                },
            });

            notify('success', 'Gestión eliminada', `Se eliminaron ${res.eliminados} registros de la gestión ${deleteGestionForm.value.gestion}.`);
            deleteGestionDialog.value = false;
            onSearch();
            await cargarGestiones(filters.value.empresa_id);
        } catch (err: any) {
            const data = err?.data || err?.response?._data || {};
            const msg = data?.message || 'Ocurrió un error al intentar eliminar la gestión.';
            notify('error', 'Error al eliminar', Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            deleteGestionLoading.value = false;
        }
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