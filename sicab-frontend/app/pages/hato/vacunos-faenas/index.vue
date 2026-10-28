<!-- C:\sistemas\sicab\sicab-frontend\app\pages\hato\vacunos-faenas\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-box" title="Registro de Faenas" subtitle="Gestión y control de vacunos faenados"
        :show-action="Boolean(permisos?.crear) && Boolean(filters.sucursal_id)" action-label="NUEVA FAENA"
        action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: arete, matadero, guía..."
                        :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de faenas"
                        modal-width="w-[95vw] md:w-[640px]" @search="onSearch" @clear="limpiarFiltros"
                        @apply="aplicarFiltros">
                        <template #advanced>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresasOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                            <div class="md:col-span-6">
                                <label
                                    class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalesOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Fecha Faena
                                    Desde</label>
                                <BaseInput v-model="filters.fecha_faena_desde" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Fecha Faena
                                    Hasta</label>
                                <BaseInput v-model="filters.fecha_faena_hasta" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-vacuno_arete="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.vacuno_arete }}</span>
                    <span v-if="data.vacuno_nombre" class="cell-secondary">
                        <span class="font-bold">NOMBRE:</span> {{ data.vacuno_nombre }}
                    </span>
                </div>
            </template>

            <template #body-fecha_faena="{ data }">
                <span class="cell-primary-normal font-semibold">{{ data.fecha_faena }}</span>
            </template>

            <template #body-peso_vivo_faena="{ data }">
                <span class="cell-primary-normal">{{ data.peso_vivo_faena }} kg</span>
            </template>

            <template #body-peso_canal_caliente="{ data }">
                <div class="cell-stack items-center">
                    <span class="text-sky-700 font-bold">{{ data.peso_canal_caliente }} kg</span>
                    <span v-if="data.peso_canal_fria" class="text-[9px] text-slate-500">
                        Fría: {{ data.peso_canal_fria }} kg
                    </span>
                </div>
            </template>

            <template #body-rendimiento_canal="{ data }">
                <Tag :value="`${data.rendimiento_canal}%`" severity="success" class="text-[10px] font-bold px-2" />
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <!-- ═══════════ EXPANSIÓN (DETALLES) ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Matadero:</span>
                            <span class="expansion-value">{{ data.matadero || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Número de Guía:</span>
                            <span class="expansion-value">{{ data.numero_guia || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Peso Vivo:</span>
                            <span class="expansion-value">{{ data.peso_vivo_faena }} kg</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Peso Canal Caliente:</span>
                            <span class="expansion-value">{{ data.peso_canal_caliente }} kg</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Peso Canal Fría:</span>
                            <span class="expansion-value">{{ data.peso_canal_fria ? `${data.peso_canal_fria} kg` : '—'
                                }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Rendimiento:</span>
                            <span class="expansion-value font-bold text-emerald-600">{{ data.rendimiento_canal
                                }}%</span>
                        </div>
                        <div class="expansion-item md:col-span-2 mt-1">
                            <span class="expansion-label text-amber-600">Observaciones:</span>
                            <span class="expansion-value">{{ data.observaciones || 'Sin observaciones registradas.'
                                }}</span>
                        </div>

                        <div class="expansion-item md:col-span-2 mt-2">
                            <span
                                class="expansion-label text-slate-400 border-b border-slate-200 pb-0.5 mb-1 block w-full">Auditoría</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Registrado por:</span>
                            <span class="expansion-value">{{ data.usuario_operacion }} <span
                                    class="text-[10px] text-slate-500">({{ formatFecha12h(data.fecha_registro)
                                    }})</span></span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CRUD (SOLO NUEVO) ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[85vw] md:w-[720px] lg:w-[760px]"
        maxHeight="88vh" :modal="true" :closable="!loading" @show="focusFirstInput">

        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-box text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div class="space-y-4">
            <!-- SECCIÓN 1: IDENTIFICACIÓN -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>1. Datos del Vacuno</span>
                    <span class="text-slate-600 normal-case font-bold text-[9px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Vacuno a Faenar - Sucursal: <span class="text-blue-600 font-black">{{
                                nombreSucursalSeleccionada
                                }}</span> <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.vacuno_id" :options="vacunosOptions" option-label="label"
                            option-value="value" placeholder="Buscar vacuno por arete..." size="sm" filter
                            :loading="loadingVacunos" />
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 2: DATOS DE LA FAENA -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>2. Datos de Faena</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Fecha de Faena <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.fecha_faena" type="date" size="sm" :max="getTodayLocal()" />
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Matadero</label>
                        <BaseInput v-model="formObj.matadero" :maxlength="150" size="sm"
                            placeholder="Ej. Matadero Municipal" />
                    </div>

                    <div class="md:col-span-4 mt-2">
                        <label class="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Peso Vivo (kg) <span class="text-red-500">*</span>
                            <!-- Tooltip Peso Vivo -->
                            <i class="pi pi-info-circle text-blue-500 cursor-help text-[11px]"
                                v-tooltip.top="'Peso del animal completo en pie, justo antes de ser sacrificado.'"></i>
                        </label>
                        <BaseInput v-model.number="formObj.peso_vivo_faena" type="number" step="0.01" min="1"
                            size="sm" />
                    </div>

                    <div class="md:col-span-4 mt-2">
                        <label class="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Peso Canal Caliente (kg) <span class="text-red-500">*</span>
                            <!-- Tooltip Peso Canal Caliente -->
                            <i class="pi pi-info-circle text-blue-500 cursor-help text-[11px]"
                                v-tooltip.top="'Peso de la carne limpia (sin vísceras, cabeza ni patas) recién faenada.'"></i>
                        </label>
                        <BaseInput v-model.number="formObj.peso_canal_caliente" type="number" step="0.01" min="1"
                            size="sm" />
                    </div>

                    <div class="md:col-span-4 mt-2">
                        <label class="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Peso Canal Fría (kg)
                            <!-- Tooltip Peso Canal Fría -->
                            <i class="pi pi-info-circle text-blue-500 cursor-help text-[11px]"
                                v-tooltip.top="'Peso de la canal después de 24 horas en cámara frigorífica (pierde agua por evaporación).'"></i>
                        </label>
                        <BaseInput v-model.number="formObj.peso_canal_fria" type="number" step="0.01" min="1"
                            size="sm" />
                    </div>

                    <div class="md:col-span-6 mt-2">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Número de
                            Guía</label>
                        <BaseInput v-model="formObj.numero_guia" :maxlength="50" size="sm"
                            placeholder="Ej. GM-2026-0001" />
                    </div>
                    <div class="md:col-span-6 mt-2">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Observaciones</label>
                        <textarea v-model="formObj.observaciones" rows="2" maxlength="500"
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-2 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100 resize-none"
                            placeholder="Notas adicionales..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton label="Registrar Faena" icon="pi pi-save" :loading="loading" variant="primary"
                    @click="saveFaena" />
            </div>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, onMounted, watch } from 'vue';
    import { EstadoVacuno, Estado } from '~/constants/estados.constant';
    import { getTodayLocal, formatFecha12h } from '~/utils/date';

    useHead({ title: 'Registro de Faenas' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem { label: string; value: any; }
    interface SucursalOption extends OptionItem { empresa_id: number; }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    // ============ OPCIONES ============
    const vacunosOptions = ref<OptionItem[]>([]);
    const loadingVacunos = ref(false);
    const empresasOptions = ref<OptionItem[]>([]);
    const sucursalesOptions = ref<SucursalOption[]>([]);

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, formObj, submitted,
        permisos,
        onPage, onSort, onSearch,
        openNew: openNewBase, hideDialog,
    } = useCrudTable<any>({
        tabla: 'vacunos-faenas',
        tablaPermisos: 'vacunos_faenas',
        sortFieldDefault: 'fecha_faena',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: null,
            sucursal_id: null,
            fecha_faena_desde: null,
            fecha_faena_hasta: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.fecha_faena_desde) extra.fecha_faena_desde = f.fecha_faena_desde;
            if (f.fecha_faena_hasta) extra.fecha_faena_hasta = f.fecha_faena_hasta;
            return extra;
        },

        getPrimaryKey: (item: any) => item.faena_id,
        buildPayload: (form: any) => form,

        getCleanForm: () => ({
            faena_id: null,
            vacuno_id: null,
            fecha_faena: getTodayLocal(),
            peso_vivo_faena: null,
            peso_canal_caliente: null,
            peso_canal_fria: null,
            matadero: '',
            numero_guia: '',
            observaciones: '',
        }),

        validate: () => true,
    });

    // ============ COMPUTADOS ============
    const nombreSucursalSeleccionada = computed(() => {
        if (!filters.value.sucursal_id) return 'NINGUNA';
        const suc = sucursalesOptions.value.find(s => s.value === Number(filters.value.sucursal_id));
        return suc ? suc.label : 'DESCONOCIDA';
    });

    const tituloDialog = computed(() => `NUEVA FAENA - ${nombreSucursalSeleccionada.value}`);
    const subtituloDialog = computed(() => 'Registro de nuevo evento de faena');

    // ============ CARGA DE COMBOS ============
    const cargarCombosFiltros = async () => {
        try {
            const [resEmp, resSuc] = await Promise.all([
                $api('/empresas', { params: { limit: 500 } }),
                $api('/sucursales', { params: { limit: 500 } }),
            ]);

            empresasOptions.value = (resEmp.data || []).map((e: any) => ({
                label: e.empresa,
                value: Number(e.empresa_id),
            }));

            sucursalesOptions.value = (resSuc.data || []).map((s: any) => ({
                label: s.sucursal,
                value: Number(s.sucursal_id),
                empresa_id: Number(s.empresa_id),
            }));
        } catch (error) {
            console.error('Error cargando combos de filtros:', error);
        }
    };

    const cargarVacunosParaFaena = async () => {
        // Si por alguna razón no hay sucursal seleccionada, no cargamos nada
        if (!filters.value.sucursal_id) {
            vacunosOptions.value = [];
            return;
        }

        loadingVacunos.value = true;
        try {
            const res = await $api('/vacunos', {
                params: {
                    limit: 1000,
                    estado_id: Estado.ACTIVO,
                    estado_vacuno_id: EstadoVacuno.PARA_FAENA,
                    sucursal_id: Number(filters.value.sucursal_id), // Filtramos por la sucursal seleccionada en el filtro
                }
            });
            vacunosOptions.value = (res.data || []).map((v: any) => ({
                label: `${v.arete} — ${v.nombre}`,
                value: Number(v.vacuno_id),
            }));
        } catch (err) {
            console.error('Error al cargar vacunos:', err);
            notify('error', 'Error', 'No se pudieron cargar los vacunos disponibles.');
        } finally {
            loadingVacunos.value = false;
        }
    };

    // ============ WATCH: Cargar último peso del vacuno seleccionado ============
    watch(() => formObj.value.vacuno_id, async (nuevoVacunoId) => {
        if (!nuevoVacunoId) {
            formObj.value.peso_vivo_faena = null;
            return;
        }

        try {

            const res = await $api('/vacunos-pesajes', {
                params: {
                    vacuno_id: Number(nuevoVacunoId),
                    estado_id: Estado.ACTIVO,
                    limit: 1,
                    sortField: 'fecha_pesaje',
                    sortOrder: -1,
                }
            });

            if (res.data && res.data.length > 0) {
                formObj.value.peso_vivo_faena = Number(res.data[0].peso);
            } else {
                formObj.value.peso_vivo_faena = null;
            }
        } catch (error) {
            console.error('Error al obtener el último peso del vacuno:', error);
            formObj.value.peso_vivo_faena = null;
        }
    });

    // ============ FOCUS ============
    const focusFirstInput = async () => {
        await nextTick();
        setTimeout(() => {
            const input = document.querySelector('.p-select-label') as HTMLElement | null;
            input?.click();
        }, 350);
    };

    // ============ OVERRIDES ============
    const openNew = async () => {
        if (!filters.value.sucursal_id) {
            return notify('warn', 'Sucursal requerida', 'Debe seleccionar una sucursal en los filtros antes de registrar una faena.');
        }
        openNewBase();
        formObj.value.peso_vivo_faena = null;
        await cargarVacunosParaFaena();
    };

    // ============ SAVE ============
    const saveFaena = async () => {
        submitted.value = true;

        // Validaciones Frontend espejo del Backend
        if (!formObj.value.vacuno_id) {
            return notify('warn', 'Campos incompletos', 'Debe seleccionar un vacuno.');
        }
        if (!formObj.value.fecha_faena) {
            return notify('warn', 'Campos incompletos', 'La fecha de faena es obligatoria.');
        }
        if (formObj.value.peso_vivo_faena == null || formObj.value.peso_vivo_faena <= 0) {
            return notify('warn', 'Peso inválido', 'El peso vivo debe ser mayor a 0.');
        }
        if (formObj.value.peso_canal_caliente == null || formObj.value.peso_canal_caliente <= 0) {
            return notify('warn', 'Peso inválido', 'El peso de canal caliente debe ser mayor a 0.');
        }
        if (formObj.value.peso_canal_caliente > formObj.value.peso_vivo_faena) {
            return notify('warn', 'Pesos incorrectos', 'El peso de canal caliente no puede superar el peso vivo.');
        }
        if (formObj.value.peso_canal_fria != null && formObj.value.peso_canal_fria > formObj.value.peso_canal_caliente) {
            return notify('warn', 'Pesos incorrectos', 'El peso de canal fría no puede superar el peso de canal caliente.');
        }

        try {
            loading.value = true;

            const payload: Record<string, any> = {
                vacuno_id: Number(formObj.value.vacuno_id),
                fecha_faena: formObj.value.fecha_faena,
                peso_vivo_faena: Number(formObj.value.peso_vivo_faena),
                peso_canal_caliente: Number(formObj.value.peso_canal_caliente),
                peso_canal_fria: formObj.value.peso_canal_fria != null ? Number(formObj.value.peso_canal_fria) : null,
                matadero: formObj.value.matadero ? String(formObj.value.matadero).trim().toUpperCase() : null,
                numero_guia: formObj.value.numero_guia ? String(formObj.value.numero_guia).trim().toUpperCase() : null,
                observaciones: formObj.value.observaciones ? String(formObj.value.observaciones).trim() : null,
            };

            await $api('/vacunos-faenas', { method: 'POST', body: payload });

            notify('success', 'Creado', 'Faena guardada correctamente.');
            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? 'No se pudo guardar la faena.';
            let msg: string;
            if (Array.isArray(rawMsg)) msg = rawMsg[0] ?? 'Error al guardar.';
            else msg = String(rawMsg);

            notify('error', 'Error al crear', msg);
            console.error('Error al guardar faena:', err);
        } finally {
            loading.value = false;
        }
    };

    // ============ COLUMNAS ============
    const columns = [
        { field: 'vacuno_arete', header: 'VACUNO', template: 'body-vacuno_arete', sortable: true, class: 'w-48' },
        { field: 'fecha_faena', header: 'FECHA FAENA', template: 'body-fecha_faena', sortable: true, class: 'w-32', bodyClass: '!text-center' },
        { field: 'peso_vivo_faena', header: 'PESO VIVO', template: 'body-peso_vivo_faena', sortable: true, class: 'w-24', bodyClass: '!text-center' },
        { field: 'peso_canal_caliente', header: 'CANAL CALIENTE/FRÍA', template: 'body-peso_canal_caliente', sortable: true, class: 'w-32', bodyClass: '!text-center' },
        { field: 'rendimiento_canal', header: 'RENDIMIENTO', template: 'body-rendimiento_canal', sortable: true, class: 'w-24', bodyClass: '!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
    ];

    // ============ FILTROS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.fecha_faena_desde) count++;
        if (filters.value.fecha_faena_hasta) count++;
        return count;
    });

    const aplicarFiltros = () => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = () => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.fecha_faena_desde = null;
        filters.value.fecha_faena_hasta = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ INIT ============
    onMounted(async () => {
        await cargarCombosFiltros();
        if (authStore.user?.empresa_id) filters.value.empresa_id = Number(authStore.user.empresa_id);
        if (authStore.user?.sucursal_id) filters.value.sucursal_id = Number(authStore.user.sucursal_id);

        lazyParams.value.sortField = 'fecha_faena';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>