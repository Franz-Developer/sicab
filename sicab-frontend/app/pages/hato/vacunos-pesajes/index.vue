<!-- C:\sistemas\sicab\sicab-frontend\app\pages\hato\vacunos-pesajes\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-line" title="Control de Pesajes" subtitle="Registro histórico de peso por vacuno"
        :show-action="permisos.crear && !!filters.sucursal_id && !!filters.fecha_pesaje" action-label="NUEVO PESAJE"
        action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <!-- Contenedor relativo para poder posicionar el input absoluto -->
                <div class="px-3 py-1.5 bg-white relative">

                    <!-- 🆕 Input de Fecha posicionado absolutamente a la izquierda -->
                    <div class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-36 hidden sm:block">
                        <BaseInput v-model="filters.fecha_pesaje" type="date" size="sm" class="w-full shadow-sm"
                            :max="getTodayLocal()" @update:model-value="aplicarFiltros"
                            v-tooltip.bottom="'Filtrar por fecha exacta'" />
                    </div>

                    <!-- El FilterBar empujado a la derecha con padding-left -->
                    <div class="pl-0 sm:pl-40">
                        <FilterBar :filters="filters" search-placeholder="Buscar: arete, vacuno, observaciones..."
                            :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de pesajes"
                            modal-width="w-[95vw] md:w-[450px]" @search="onSearch" @clear="limpiarFiltros"
                            @apply="aplicarFiltros">
                            <template #advanced>
                                <div class="md:col-span-12">
                                    <label
                                        class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                    <BaseSelect v-model="filters.empresa_id" :options="empresasOptions"
                                        option-label="label" option-value="value" placeholder="Todas las empresas"
                                        size="sm" filter show-clear appendTo="body"
                                        @update:model-value="onEmpresaFilterChange" class="w-full" />
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
                                        <BaseInput v-model="filters.fecha_pesaje_desde" type="date" size="sm"
                                            class="w-full" :max="getTodayLocal()"
                                            @update:model-value="aplicarFiltros" />
                                        <span class="text-slate-400 font-bold text-xs">-</span>
                                        <BaseInput v-model="filters.fecha_pesaje_hasta" type="date" size="sm"
                                            class="w-full" :max="getTodayLocal()"
                                            @update:model-value="aplicarFiltros" />
                                    </div>
                                </div>
                            </template>
                        </FilterBar>
                    </div>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-vacuno_arete="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.vacuno_arete }}</span>
                    <span v-if="data.vacuno_nombre" class="cell-secondary text-[10px]">
                        <span class="font-bold">NOMBRE:</span> {{ data.vacuno_nombre }}
                    </span>
                </div>
            </template>

            <template #body-ubicacion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre || '—' }}</span>
                    <span class="cell-secondary text-[9px]">
                        <span class="font-bold">EMP:</span> {{ data.empresa_nombre || '—' }}
                    </span>
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
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                    @edit="edit(data)" @toggle="toggleEstado(data)" @delete="confirmDelete(data)" />
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

                    <!-- 🆕 Buscador Rápido por Arete -->
                    <div class="md:col-span-12 mb-2">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Escanear / Buscar
                            Arete</label>
                        <BaseInput ref="areteRef" v-model="busquedaArete"
                            placeholder="Escriba el arete y presione Enter..." size="sm" icon="pi pi-search"
                            @keydown.enter.prevent="saltarAPeso" />
                    </div>

                    <!-- Vacuno -->
                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Vacuno <span class="text-red-500">*</span>
                        </label>

                        <BaseSelect ref="vacunoRef" v-model="formObj.vacuno_id" :options="vacunosFiltradosOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar vacuno..." size="sm"
                            filter :disabled="estaProtegido('vacuno_id')" @update:model-value="onVacunoChange" />

                        <small v-if="(submitted || touched.vacuno_id) && !formObj.vacuno_id"
                            class="text-red-500 font-semibold text-[9px]">Requerido</small>
                    </div>

                    <!-- Empresa (BLOQUEADA) -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Empresa</label>
                        <BaseSelect :model-value="filters.empresa_id" :options="empresasOptions" option-label="label"
                            option-value="value" size="sm" disabled class="w-full opacity-70" />
                    </div>

                    <!-- Sucursal (BLOQUEADA) -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Sucursal</label>
                        <BaseSelect :model-value="filters.sucursal_id" :options="sucursalesFiltradasOptions"
                            option-label="label" option-value="value" size="sm" disabled class="w-full opacity-70" />
                    </div>

                    <!-- Fecha (BLOQUEADA - Toma el valor del filtro) -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Fecha Pesaje <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.fecha_pesaje" type="date" size="sm" disabled />
                    </div>

                    <!-- Peso -->
                    <div class="md:col-span-6">
                        <div class="flex justify-between items-center mb-0.5">
                            <label class="block text-[10px] font-bold text-slate-600 uppercase">Peso (kg) <span
                                    class="text-red-500">*</span></label>
                            <!-- 🆕 Etiqueta de último peso -->
                            <span v-if="ultimoPesoRegistrado"
                                class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Último: {{ ultimoPesoRegistrado }} kg
                            </span>
                        </div>
                        <BaseInput ref="pesoRef" v-model="formObj.peso" type="number" step="0.01" min="0" max="1500"
                            size="sm" placeholder="Ej: 450.50" @blur="touched.peso = true"
                            @keydown.enter.prevent="savePesaje" />
                        <small v-if="(submitted || touched.peso) && (formObj.peso == null || formObj.peso === '')"
                            class="text-red-500 font-semibold text-[9px]">Requerido</small>
                        <small v-else-if="pesoError" class="text-red-500 font-semibold text-[9px]">{{ pesoError
                            }}</small>
                    </div>

                    <!-- Observaciones -->
                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Observaciones</label>
                        <textarea v-model="formObj.observaciones" rows="2" maxlength="500"
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-1.5 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100"
                            placeholder="Notas adicionales sobre el pesaje..."></textarea>
                        <small v-if="observacionesError" class="text-red-500 font-semibold text-[9px]">{{
                            observacionesError
                            }}</small>
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
    import { ESTADOS_VACUNO_FINALES, ESTADO_ACTIVO, Estado } from '~/constants/estados.constant';

    useHead({ title: 'Control de Pesajes' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem { label: string; value: any; empresa_id?: number; }

    const PESO_MIN = 0;
    const PESO_MAX = 1500;

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();
    const { invalidate } = useDataInvalidation();

    // ============ OPCIONES DINÁMICAS ============
    const empresasOptions = ref<OptionItem[]>([]);
    const sucursalesOptions = ref<OptionItem[]>([]);
    const sucursalesFiltradasOptions = ref<OptionItem[]>([]);
    const vacunosOptions = ref<OptionItem[]>([]);
    const vacunosMap = ref<Map<number, any>>(new Map());

    const vacunosFiltradosOptions = computed(() => {
        if (!filters.value.empresa_id || !filters.value.sucursal_id) {
            return [];
        }

        return vacunosOptions.value.filter(v => {
            const vacunoOriginal = vacunosMap.value.get(Number(v.value));
            if (!vacunoOriginal) return false;
            if (Number(vacunoOriginal.sucursal_id) !== Number(filters.value.sucursal_id)) {
                return false;
            }
            if (Number(vacunoOriginal.empresa_id) !== Number(filters.value.empresa_id)) {
                return false;
            }
            return true;
        });
    });

    const cargarCombos = async () => {
        try {
            const [resEmp, resSuc] = await Promise.all([
                $api('/empresas', { params: { limit: 500 } }),
                $api('/sucursales', { params: { limit: 500 } }),
            ]);

            empresasOptions.value = (resEmp.data || []).map((e: any) => ({ label: e.empresa, value: e.empresa_id }));

            sucursalesOptions.value = (resSuc.data || []).map((s: any) => ({
                label: s.sucursal,
                value: s.sucursal_id,
                empresa_id: s.empresa_id
            }));

            await cargarVacunosFiltrados();
        } catch (error) {
            console.error("Error cargando combos:", error);
            notify('error', 'Error', 'No se pudieron cargar los catálogos auxiliares.');
        }
    };

    const cargarVacunosFiltrados = async () => {
        try {
            const resVac = await $api('/vacunos', {
                params: {
                    limit: 1000,
                    estado_id: Estado.ACTIVO
                }
            });

            const todosLosVacunos = (resVac.data || []).filter(
                (v: any) => !ESTADOS_VACUNO_FINALES.includes(Number(v.estado_vacuno_id))
            );

            vacunosOptions.value = todosLosVacunos.map((v: any) => ({
                label: `${v.arete} - ${v.nombre || 'S/N'}`,
                value: v.vacuno_id
            }));

            vacunosMap.value = new Map(todosLosVacunos.map((v: any) => [Number(v.vacuno_id), v]));
        } catch (error) {
            console.error("Error cargando vacunos:", error);
        }
    };

    const onEmpresaFilterChange = () => {
        if (filters.value.empresa_id) {
            sucursalesFiltradasOptions.value = sucursalesOptions.value.filter(
                s => s.empresa_id === filters.value.empresa_id
            );
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
            fecha_pesaje: null,
            fecha_pesaje_desde: null,
            fecha_pesaje_hasta: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
                estado_id: ESTADO_ACTIVO,

                sortField: lazyParams.value.sortField || 'pesaje_id',
                sortOrder: lazyParams.value.sortOrder || -1,
            };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.fecha_pesaje) extra.fecha_pesaje = f.fecha_pesaje;
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

        buildPayload: (form: any) => {
            const payload: any = {
                fecha_pesaje: form.fecha_pesaje,
                peso: Number(form.peso),
            };
            if (form.observaciones?.trim()) payload.observaciones = form.observaciones.trim();
            if (!isUpdate.value) payload.vacuno_id = Number(form.vacuno_id);
            return payload;
        },

        validate: () => true,
    });

    // ============ TÍTULOS ============
    const tituloDialog = computed(() => isUpdate.value ? 'EDITAR PESAJE' : 'NUEVO PESAJE');
    const subtituloDialog = computed(() => isUpdate.value ? 'Actualización del registro de peso' : 'Registro de nuevo peso');

    // ============ LÓGICA DE FLUJO RÁPIDO ============
    const areteRef = ref<any>(null);
    const fechaRef = ref<any>(null);
    const pesoRef = ref<any>(null);

    const busquedaArete = ref('');
    const ultimoPesoRegistrado = ref<number | null>(null);

    const focusFirstInput = async () => {
        busquedaArete.value = '';
        ultimoPesoRegistrado.value = null;

        await nextTick();
        setTimeout(() => {
            if (!isUpdate.value) {
                const input = areteRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
                input?.focus();
            } else {
                const input = fechaRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
                input?.focus();
                input?.select();
            }
        }, 350);
    };

    let isSearching = false;

    const saltarAPeso = () => {
        if (isSearching || !busquedaArete.value) return;
        isSearching = true;

        const termino = busquedaArete.value.toLowerCase().trim();

        const encontrado = vacunosFiltradosOptions.value.find(v => {
            const arete = (v.label.split(' - ')[0] || '').toLowerCase();
            return arete === termino || arete.includes(termino);
        });

        if (encontrado) {
            formObj.value.vacuno_id = encontrado.value;
            onVacunoChange();
            busquedaArete.value = '';

            nextTick(() => {
                const input = pesoRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
                if (input) {
                    input.focus();
                    input.select();
                }
                setTimeout(() => { isSearching = false; }, 200);
            });
        } else {
            notify('warn', 'No encontrado', `No existe un vacuno activo con el arete "${termino}".`);
            setTimeout(() => { isSearching = false; }, 200);
        }
    };

    const onVacunoChange = () => {
        touched.value.vacuno_id = true;
        fechaError.value = validarFechaPesaje(formObj.value.fecha_pesaje);
        ultimoPesoRegistrado.value = null;

        if (!formObj.value.vacuno_id) return;

        const vacuno = vacunosMap.value.get(Number(formObj.value.vacuno_id));
        if (vacuno && vacuno.peso_actual) {
            ultimoPesoRegistrado.value = Number(vacuno.peso_actual);
        }
    };

    // ============ OVERRIDES ============
    const openNew = () => {
        lazyParams.value.sortField = 'pesaje_id';
        lazyParams.value.sortOrder = -1;

        openNewBase();

        // 🆕 Inyectar la fecha del filtro al formulario
        if (filters.value.fecha_pesaje) {
            formObj.value.fecha_pesaje = filters.value.fecha_pesaje;
        }
    };

    const edit = async (data: any) => {
        if (data.sucursal_id) {
            filters.value.sucursal_id = Number(data.sucursal_id);
        }
        if (data.empresa_id) {
            filters.value.empresa_id = Number(data.empresa_id);
            onEmpresaFilterChange();
        }

        await editBase(data);
        formObj.value.vacuno_id = Number(data.vacuno_id);
        onVacunoChange();
    };

    // ============ VALIDACIONES (coherentes con backend) ============
    const pesoError = computed(() => {
        if (!touched.value.peso && !submitted.value) return null;
        return validarPeso(formObj.value.peso);
    });

    const fechaError = ref<string | null>(null);

    const observacionesError = computed(() => validarTextoSeguro(formObj.value.observaciones));

    const validarPeso = (peso: any): string | null => {
        if (peso == null || peso === '') return 'El peso es obligatorio.';
        const num = Number(peso);
        if (!Number.isFinite(num)) return 'El peso debe ser un número válido.';
        if (num < PESO_MIN) return `El peso no puede ser menor a ${PESO_MIN} kg.`;
        if (num > PESO_MAX) return `El peso no puede exceder ${PESO_MAX} kg.`;
        if (!/^\d+(\.\d{1,2})?$/.test(String(num))) return 'El peso admite máximo 2 decimales.';
        return null;
    };

    const validarTextoSeguro = (texto: string | null | undefined): string | null => {
        if (!texto) return null;
        if (texto.length > 500) return 'Las observaciones no pueden exceder 500 caracteres.';
        const latinExt = /[ÀàÈèÌìÒòÙùÂâÊêÎîÔôÛûÇçÄäËëÏïÖö]/;
        const symbols = /[<>{}[\]\\]/;
        const trapChars = /[\u00A0\u2013\u2014]/;
        if (latinExt.test(texto)) return 'Contiene caracteres no permitidos.';
        if (symbols.test(texto)) return 'Contiene símbolos especiales no permitidos.';
        if (trapChars.test(texto)) return 'Contiene espacios o guiones con formato inválido.';
        return null;
    };

    const validarFechaPesaje = (fecha: string): string | null => {
        if (!fecha) return 'La fecha de pesaje es obligatoria.';
        const hoy = getTodayLocal();
        if (fecha > hoy) return 'La fecha de pesaje no puede ser mayor al día de hoy.';

        const vacunoId = formObj.value.vacuno_id ? Number(formObj.value.vacuno_id) : null;
        if (!vacunoId) return null;

        const vacuno = vacunosMap.value.get(vacunoId);
        if (!vacuno) return null;

        if (vacuno.fecha_nacimiento) {
            const fNac = String(vacuno.fecha_nacimiento).split('T')[0];
            if (fecha < fNac!) return `La fecha no puede ser menor a la fecha de nacimiento (${fNac}).`;
        }
        if (vacuno.fecha_ingreso) {
            const fIng = String(vacuno.fecha_ingreso).split('T')[0];
            if (fecha < fIng!) return `La fecha no puede ser menor a la fecha de ingreso (${fIng}).`;
        }
        return null;
    };

    // ============ SAVE ============
    const savePesaje = async () => {
        submitted.value = true;

        if (!isUpdate.value && !formObj.value.vacuno_id) {
            return notify('warn', 'Campos incompletos', 'Debe seleccionar un vacuno.');
        }

        fechaError.value = validarFechaPesaje(formObj.value.fecha_pesaje);
        if (fechaError.value) return notify('warn', 'Fecha inválida', fechaError.value);

        const errPeso = validarPeso(formObj.value.peso);
        if (errPeso) return notify('warn', 'Peso inválido', errPeso);

        const errObs = validarTextoSeguro(formObj.value.observaciones);
        if (errObs) return notify('warn', 'Observaciones inválidas', errObs);

        try {
            loading.value = true;

            const payload: any = {
                fecha_pesaje: formObj.value.fecha_pesaje,
                peso: Number(formObj.value.peso),
            };
            if (formObj.value.observaciones?.trim()) {
                payload.observaciones = formObj.value.observaciones.trim();
            }
            if (!isUpdate.value) {
                payload.vacuno_id = Number(formObj.value.vacuno_id);
            }

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;

            if (pk) {
                await $api(`/vacunos-pesajes/${pk}`, { method: 'PATCH', body: payload });
            } else {
                await $api('/vacunos-pesajes', { method: 'POST', body: payload });
            }

            notify('success', isUpdate.value ? 'Actualizado' : 'Creado', 'Registro guardado correctamente.');
            invalidate('vacunos');
            hideDialog();

        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar el pesaje.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;
            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear', firstError);
            console.error('Error al guardar pesaje:', err);
        } finally {
            loading.value = false;
        }

        try {
            lazyParams.value.first = 0;
            lazyParams.value.sortField = 'pesaje_id';
            lazyParams.value.sortOrder = -1;
            await onSearch();
        } catch (e) {
            console.warn('El pesaje se guardó, pero no se pudo recargar la lista:', e);
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
        if (filters.value.fecha_pesaje) count++;
        if (filters.value.fecha_pesaje_desde) count++;
        if (filters.value.fecha_pesaje_hasta) count++;
        return count;
    });

    const aplicarFiltros = () => {
        if (filters.value.fecha_pesaje) {
            filters.value.fecha_pesaje_desde = null;
            filters.value.fecha_pesaje_hasta = null;
        } else if (filters.value.fecha_pesaje_desde || filters.value.fecha_pesaje_hasta) {
            filters.value.fecha_pesaje = null;
        }
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = () => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.fecha_pesaje = null;
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

        await cargarVacunosFiltrados();

        lazyParams.value.sortField = 'pesaje_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;

        onSearch();
    });
</script>