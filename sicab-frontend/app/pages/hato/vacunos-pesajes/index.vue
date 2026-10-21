<!-- C:\sistemas\sicab\sicab-frontend\app\pages\hato\vacunos-pesajes\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-line" title="Control de Pesajes" subtitle="Registro histórico de peso por vacuno"
        :show-action="permisos.crear" action-label="NUEVO PESAJE" action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: arete, vacuno, observaciones..."
                        :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de pesajes"
                        modal-width="w-[95vw] md:w-[450px]" @search="onSearch" @clear="limpiarFiltros"
                        @apply="aplicarFiltros">
                        <template #advanced>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresasOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear
                                    appendTo="body" @update:model-value="onEmpresaFilterChange" class="w-full" />
                            </div>
                            <div class="md:col-span-12">
                                <label
                                    class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalesFiltradasOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" filter show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Rango de
                                    Fechas</label>
                                <div class="flex gap-2 items-center">
                                    <BaseInput v-model="filters.fecha_pesaje_desde" type="date" size="sm" class="w-full"
                                        :max="getTodayLocal()" @update:model-value="aplicarFiltros" />
                                    <span class="text-slate-400 font-bold text-xs">-</span>
                                    <BaseInput v-model="filters.fecha_pesaje_hasta" type="date" size="sm" class="w-full"
                                        :max="getTodayLocal()" @update:model-value="aplicarFiltros" />
                                </div>
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-vacuno_arete="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.vacuno_arete }}</span>
                    <span v-if="data.vacuno_nombre" class="cell-secondary text-[10px]">{{ data.vacuno_nombre }}</span>
                </div>
            </template>

            <template #body-ubicacion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre || '—' }}</span>
                    <span class="cell-secondary text-[9px]">{{ data.empresa_nombre || '—' }}</span>
                </div>
            </template>

            <template #body-fecha_pesaje="{ data }">
                <div class="flex items-center justify-center gap-1 text-slate-700 font-semibold text-[11px]">
                    <i class="pi pi-calendar text-[10px] text-blue-500"></i>
                    {{ data.fecha_pesaje }}
                </div>
            </template>

            <template #body-peso="{ data }">
                <Tag :value="`${data.peso} kg`" severity="info" class="text-[10px] font-bold px-2 py-0.5" />
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <!-- ═══════════ ACCIONES ═══════════ -->
            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" @edit="edit(data)"
                    @toggle="toggleEstado(data)" @delete="confirmDelete(data)" />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid grid-cols-1 md:grid-cols-2">
                        <div class="expansion-item">
                            <span class="expansion-label">Observaciones:</span>
                            <span class="expansion-value" :title="data.observaciones || '—'">{{ data.observaciones ||
                                '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación:</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro:</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CRUD ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[80vw] md:w-[600px]" maxHeight="88vh"
        :modal="true" :closable="!loading" @show="focusFirstInput">

        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-chart-line text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast !p-4">
                <div
                    class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>Información del Pesaje</span>
                    <span class="text-slate-600 normal-case font-bold text-[9px]">Campos obligatorios <span
                            class="text-red-500">*</span></span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Vacuno -->
                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Vacuno <span
                                class="text-red-500">*</span></label>
                        <BaseSelect ref="vacunoRef" v-model="formObj.vacuno_id" :options="vacunosOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar vacuno..." size="sm"
                            filter :disabled="estaProtegido('vacuno_id')"
                            @update:model-value="touched.vacuno_id = true" />
                        <small v-if="(submitted || touched.vacuno_id) && !formObj.vacuno_id"
                            class="text-red-500 font-semibold text-[9px]">Requerido</small>
                    </div>

                    <!-- Fecha -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Fecha Pesaje <span
                                class="text-red-500">*</span></label>
                        <BaseInput ref="fechaRef" v-model="formObj.fecha_pesaje" type="date" size="sm"
                            :max="getTodayLocal()" :disabled="estaProtegido('fecha_pesaje')"
                            @blur="touched.fecha_pesaje = true" />
                        <small v-if="(submitted || touched.fecha_pesaje) && !formObj.fecha_pesaje"
                            class="text-red-500 font-semibold text-[9px]">Requerido</small>
                    </div>

                    <!-- Peso -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Peso (kg) <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.peso" type="number" step="0.01" min="0" size="sm"
                            placeholder="Ej: 450.50" @blur="touched.peso = true" />
                        <small v-if="(submitted || touched.peso) && (formObj.peso == null || formObj.peso === '')"
                            class="text-red-500 font-semibold text-[9px]">Requerido</small>
                    </div>

                    <!-- Observaciones -->
                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Observaciones</label>
                        <textarea v-model="formObj.observaciones" rows="2" maxlength="500"
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-1.5 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100"
                            placeholder="Notas adicionales sobre el pesaje..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton :label="isUpdate ? 'Actualizar' : 'Guardar Registro'" icon="pi pi-save" :loading="loading"
                    variant="primary" @click="savePesaje" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Pesaje"
        :item-name="`${formObj.peso} kg del ${formObj.fecha_pesaje}`" @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, onMounted } from 'vue';
    import { getTodayLocal } from '~/utils/date';

    useHead({ title: 'Control de Pesajes' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem { label: string; value: any; empresa_id?: number; }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    // ============ OPCIONES DINÁMICAS ============
    const empresasOptions = ref<OptionItem[]>([]);
    const sucursalesOptions = ref<OptionItem[]>([]); // Todas las sucursales (para el formulario)
    const sucursalesFiltradasOptions = ref<OptionItem[]>([]); // Filtradas para el combo de búsqueda
    const vacunosOptions = ref<OptionItem[]>([]);

    const cargarCombos = async () => {
        try {
            // 🆕 Usamos estado_id: 1000 para forzar que solo traiga activos (sin importar la constante)
            const [resEmp, resSuc, resVac] = await Promise.all([
                $api('/empresas', { params: { limit: 500 } }),
                $api('/sucursales', { params: { limit: 500 } }),
                $api('/vacunos', { params: { limit: 1000, estado_id: 1000 } })
            ]);

            empresasOptions.value = (resEmp.data || []).map((e: any) => ({ label: e.empresa, value: e.empresa_id }));

            // Guardamos las sucursales con su empresa_id para filtrar en los combos
            sucursalesOptions.value = (resSuc.data || []).map((s: any) => ({
                label: s.sucursal,
                value: s.sucursal_id,
                empresa_id: s.empresa_id
            }));

            // Filtramos vacunos activos y excluimos vendidos/muertos
            vacunosOptions.value = (resVac.data || [])
                .filter((v: any) => ![6404, 6405].includes(Number(v.estado_vacuno_id)))
                .map((v: any) => ({ label: `${v.arete} - ${v.nombre || 'S/N'}`, value: v.vacuno_id }));

        } catch (error) {
            console.error("Error cargando combos:", error);
            notify('error', 'Error', 'No se pudieron cargar los catálogos auxiliares.');
        }
    };

    // 🆕 Filtrar sucursales según la empresa seleccionada en el FILTRO de búsqueda
    const onEmpresaFilterChange = () => {
        if (filters.value.empresa_id) {
            sucursalesFiltradasOptions.value = sucursalesOptions.value.filter(
                s => s.empresa_id === filters.value.empresa_id
            );
            // Si la sucursal que estaba seleccionada no pertenece a la nueva empresa, la limpiamos
            const sucursalValida = sucursalesFiltradasOptions.value.some(s => s.value === filters.value.sucursal_id);
            if (!sucursalValida) {
                filters.value.sucursal_id = null;
            }
        } else {
            sucursalesFiltradasOptions.value = sucursalesOptions.value;
        }
        aplicarFiltros();
    };

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog,
        toggleEstado, confirmDelete, deleteItem,
        resolvePK,
    } = useCrudTable<any>({
        tabla: 'vacunos-pesajes',
        tablaPermisos: 'vacunos_pesajes',
        sortFieldDefault: 'pesaje_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: ['vacuno_id', 'fecha_pesaje'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: null,
            sucursal_id: null,
            fecha_pesaje_desde: null,
            fecha_pesaje_hasta: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.fecha_pesaje_desde) extra.fecha_pesaje_desde = f.fecha_pesaje_desde;
            if (f.fecha_pesaje_hasta) extra.fecha_pesaje_hasta = f.fecha_pesaje_hasta;
            return extra;
        },

        getPrimaryKey: (item: any) => item.pesaje_id,

        getCleanForm: () => ({
            pesaje_id: null,
            vacuno_id: null,
            fecha_pesaje: getTodayLocal(),
            peso: null,
            observaciones: '',
        }),

        buildPayload: (form: any) => ({
            vacuno_id: Number(form.vacuno_id),
            fecha_pesaje: form.fecha_pesaje,
            peso: Number(form.peso),
            observaciones: form.observaciones?.trim() || undefined,
        }),

        validate: () => true,
    });

    // ============ TÍTULOS ============
    const tituloDialog = computed(() => isUpdate.value ? 'EDITAR PESAJE' : 'NUEVO PESAJE');
    const subtituloDialog = computed(() => isUpdate.value ? 'Actualización del registro de peso' : 'Registro de nuevo peso');

    // ============ FOCUS ============
    const vacunoRef = ref<any>(null);
    const fechaRef = ref<any>(null);

    const focusFirstInput = async () => {
        await nextTick();
        setTimeout(() => {
            if (!isUpdate.value) {
                const el = vacunoRef.value?.$el as HTMLElement | null;
                el?.querySelector('.p-select-label')?.dispatchEvent(new Event('click', { bubbles: true }));
            } else {
                const input = fechaRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
                input?.focus();
                input?.select();
            }
        }, 350);
    };

    // ============ OVERRIDES ============
    const openNew = () => {
        openNewBase();
    };

    const edit = async (data: any) => {
        await editBase(data);
        formObj.value.vacuno_id = Number(data.vacuno_id);
    };

    // ============ SAVE ============
    const savePesaje = async () => {
        submitted.value = true;

        if (!formObj.value.vacuno_id) return notify('warn', 'Campos incompletos', 'Debe seleccionar un vacuno.');
        if (!formObj.value.fecha_pesaje) return notify('warn', 'Campos incompletos', 'La fecha de pesaje es obligatoria.');
        if (formObj.value.peso == null || formObj.value.peso === '') return notify('warn', 'Campos incompletos', 'El peso es obligatorio.');

        const pesoNum = Number(formObj.value.peso);
        if (pesoNum < 0) {
            return notify('warn', 'Peso inválido', 'El peso no puede ser negativo.');
        }

        const hoy = getTodayLocal();
        if (formObj.value.fecha_pesaje > hoy) {
            return notify('warn', 'Fecha inválida', 'La fecha de pesaje no puede ser mayor al día de hoy.');
        }

        try {
            loading.value = true;

            const payload = {
                vacuno_id: Number(formObj.value.vacuno_id),
                fecha_pesaje: formObj.value.fecha_pesaje,
                peso: pesoNum,
                observaciones: formObj.value.observaciones?.trim() || undefined,
            };

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;

            if (pk) {
                await $api(`/vacunos-pesajes/${pk}`, { method: 'PATCH', body: payload });
            } else {
                await $api('/vacunos-pesajes', { method: 'POST', body: payload });
            }

            notify('success', isUpdate.value ? 'Actualizado' : 'Creado', 'Registro guardado correctamente.');
            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar el pesaje.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;
            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear', firstError);
            console.error('Error al guardar pesaje:', err);
        } finally {
            loading.value = false;
        }
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'vacuno_arete', header: 'VACUNO', template: 'body-vacuno_arete', sortable: true, class: 'w-48' },
        { field: 'sucursal_nombre', header: 'UBICACIÓN', template: 'body-ubicacion', sortable: true, class: 'w-40' },
        { field: 'fecha_pesaje', header: 'FECHA', template: 'body-fecha_pesaje', sortable: true, class: 'w-32', bodyClass: '!text-center' },
        { field: 'peso', header: 'PESO', template: 'body-peso', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center w-24', bodyClass: '!min-w-[90px]' },
    ];

    // ============ FILTROS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.fecha_pesaje_desde) count++;
        if (filters.value.fecha_pesaje_hasta) count++;
        return count;
    });

    const aplicarFiltros = () => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = () => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.fecha_pesaje_desde = null;
        filters.value.fecha_pesaje_hasta = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ INIT ============
    onMounted(async () => {
        await cargarCombos();
        sucursalesFiltradasOptions.value = sucursalesOptions.value;

        if (authStore.user?.empresa_id) {
            filters.value.empresa_id = authStore.user.empresa_id;
            onEmpresaFilterChange();
        }
        if (authStore.user?.sucursal_id) {
            filters.value.sucursal_id = authStore.user.sucursal_id;
        }

        lazyParams.value.sortField = 'pesaje_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;

        onSearch();
    });
</script>