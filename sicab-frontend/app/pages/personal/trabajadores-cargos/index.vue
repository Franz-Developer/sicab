<!-- C:\sistemas\sicab\sicab-frontend\app\pages\personal\trabajadores-cargos\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-briefcase"
        title="Historial de Cargos"
        subtitle="Asignaciones de cargo por trabajador"
        :show-action="permisos.crear && !!filters.trabajador_id"
        action-label="NUEVA ASIGNACIÓN"
        action-icon="pi pi-plus"
        @action="openNewConTrabajador"
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
                    <FilterBar :filters="filters" search-placeholder="Buscar: Trabajador, DNI, cargo, observaciones..."
                        :active-filters-count="filtrosActivosCount" modal-title="Filtrar Asignaciones"
                        modal-subtitle="Refina la búsqueda de asignaciones de cargo" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- ═══ FILA 1: Trabajador + Cargo ═══ -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Trabajador
                                </label>
                                <BaseSelect v-model="filters.trabajador_id" :options="trabajadorOptions"
                                    option-label="label" option-value="value" placeholder="Todos los trabajadores"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingTrabajadores"
                                    v-tooltip.top="'Filtra las asignaciones por trabajador.'"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Cargo
                                </label>
                                <BaseSelect v-model="filters.cargo_id" :options="cargoOptions" option-label="label"
                                    option-value="value" placeholder="Todos los cargos" size="sm" filter show-clear
                                    appendTo="body"
                                    :loading="loadingCargos" v-tooltip.top="'Filtra las asignaciones por cargo.'"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <!-- ═══ FILA 2: Moneda ═══ -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Tipo Moneda
                                </label>
                                <BaseSelect v-model="filters.tipo_moneda_id" :options="tipoMonedaOptions"
                                    option-label="label" option-value="value" placeholder="Todas las monedas" size="sm"
                                    show-clear appendTo="body" v-tooltip.top="'Filtra por tipo de moneda del sueldo.'"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-trabajador="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary uppercase">{{ data.trabajador_nombre_completo }}</span>
                    <span v-if="data.trabajador_apodo" class="cell-secondary">
                        <span class="font-bold">ALIAS:</span> {{ data.trabajador_apodo }}
                    </span>
                </div>
            </template>

            <template #body-cargo="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.cargo_nombre }}</span>
                    <span v-if="data.cargo_codigo" class="cell-secondary">
                        <span class="font-bold">CÓDIGO:</span> {{ data.cargo_codigo }}
                    </span>
                </div>
            </template>

            <template #body-sueldo_base="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ formatMonto(data.sueldo_base) }}</span>
                    <span v-if="data.tipo_moneda?.abreviatura" class="cell-secondary">
                        <span class="font-bold">MONEDA:</span> {{ data.tipo_moneda.abreviatura }}
                    </span>
                </div>
            </template>

            <template #body-fechas="{ data }">
                <div class="cell-stack">
                    <span class="text-emerald-700 font-semibold">
                        <i class="pi pi-calendar-plus text-[9px] mr-1"></i>{{ data.fecha_desde || '—' }}
                    </span>
                    <span v-if="data.fecha_hasta" class="text-red-700 font-semibold">
                        <i class="pi pi-calendar-minus text-[9px] mr-1"></i>{{ data.fecha_hasta }}
                    </span>
                    <span v-else class="text-blue-600 text-[12px]">
                        (vigente)
                    </span>
                </div>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge
                    :estado="data.estado_registro"
                    :estado-id="Number(data.estado_id)"
                />
            </template>

            <!-- ═══ ACCIONES ═══ -->
            <template #body-acciones="{ data }">
                <div class="flex gap-1 justify-center items-center">
                    <CrudRowActions
                        :estado-id="Number(data.estado_id)"
                        :puede="permisos"
                        :mostrar-archivar="false"
                        @edit="handleEdit(data)"
                        @delete="confirmDelete(data)"
                    />
                    <BaseButton
                        v-if="permisos.crear && Number(data.estado_id) === 1000"
                        icon="pi pi-arrow-right-arrow-left"
                        variant="ghost-amber"
                        size="xs"
                        class="!p-0 !w-5 !h-5"
                        @click="openCambiarCargo(data)"
                        v-tooltip.top="'Cambiar Cargo'"
                    />
                </div>
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Observaciones:</span>
                            <span class="expansion-value" :title="data.observaciones">
                                {{ data.observaciones || '—' }}
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Tipo Moneda:</span>
                            <span class="expansion-value">
                                {{ data.tipo_moneda?.label || '—' }}
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Desde:</span>
                            <span class="expansion-value">{{ data.fecha_desde || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Hasta:</span>
                            <span class="expansion-value">{{ data.fecha_hasta || '—' }}</span>
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

    <!-- ═══════════ DIALOG CREAR / EDITAR ═══════════ -->
    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[640px] lg:w-[680px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusTrabajador"
    >
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
                <div class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                    <span>Asignación de Cargo</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Trabajador -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Trabajador <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            ref="trabajadorSelectRef"
                            v-model="formObj.trabajador_id"
                            :options="trabajadorOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar trabajador..."
                            size="sm"
                            filter
                            :loading="loadingTrabajadores"
                            :disabled="isUpdate || !!filters.trabajador_id"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate || !!filters.trabajador_id }"
                            @update:model-value="touched.trabajador_id = true"
                        />
                        <small v-if="isUpdate" class="text-blue-600 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>No editable en modo edición
                        </small>
                        <small
                            v-else-if="(submitted || touched.trabajador_id) && !formObj.trabajador_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un trabajador
                        </small>
                    </div>

                    <!-- Cargo -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Cargo <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.cargo_id"
                            :options="cargoOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar cargo..."
                            size="sm"
                            filter
                            :loading="loadingCargos"
                            :disabled="isUpdate"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate }"
                            @update:model-value="onCargoChange"
                        />
                        <small v-if="isUpdate" class="text-blue-600 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Use "Cambiar Cargo" para modificar la asignación
                        </small>
                        <small
                            v-else-if="(submitted || touched.cargo_id) && !formObj.cargo_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un cargo
                        </small>
                    </div>

                    <!-- Sueldo Base -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sueldo Base
                            <span class="text-slate-400 font-normal normal-case">(opcional)</span>
                        </label>
                        <BaseInput
                            v-model.number="formObj.sueldo_base"
                            type="number"
                            :min="0"
                            step="0.01"
                            size="sm"
                            placeholder="Heredar del cargo"
                        />
                        <small class="text-slate-400 text-[10px] block mt-0.5">
                            Déjalo vacío para heredar el sueldo del cargo seleccionado.
                        </small>
                    </div>

                    <!-- Tipo Moneda -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo Moneda <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.tipo_moneda_id"
                            :options="tipoMonedaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar..."
                            size="sm"
                            @update:model-value="touched.tipo_moneda_id = true"
                        />
                        <small
                            v-if="(submitted || touched.tipo_moneda_id) && !formObj.tipo_moneda_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un tipo de moneda
                        </small>
                    </div>

                    <!-- Fecha Desde -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Fecha Desde <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.fecha_desde"
                            type="date"
                            size="sm"
                            @blur="touched.fecha_desde = true"
                        />
                        <small
                            v-if="(submitted || touched.fecha_desde) && !formObj.fecha_desde"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            La fecha desde es obligatoria
                        </small>
                    </div>

                    <!-- Fecha Hasta (solo en update) -->
                    <div v-if="isUpdate" class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Fecha Hasta
                        </label>
                        <BaseInput
                            v-model="formObj.fecha_hasta"
                            type="date"
                            size="sm"
                        />
                        <small class="text-slate-400 text-[10px] block mt-0.5">
                            Déjala vacía si la asignación sigue activa.
                        </small>
                    </div>

                    <!-- Observaciones -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Observaciones
                        </label>
                        <textarea
                            v-model="formObj.observaciones"
                            :maxlength="500"
                            rows="3"
                            placeholder="Motivo del cambio: ascenso, reasignación, etc."
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] px-3 py-2 text-xs transition-all focus:outline-none focus:border-[var(--focus-color)] focus:ring-2 focus:ring-blue-100 resize-none"
                        ></textarea>
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
                    @click="saveWrapper"
                />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIALOG CAMBIAR CARGO ═══════════ -->
    <BaseDialog
        v-model:visible="cambiarCargoDialog"
        dialogClass=""
        width="w-[95vw] sm:w-[88vw] md:w-[560px] lg:w-[600px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loadingCambiarCargo"
        @show="focusCargoCambiar"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-amber-600 p-2 rounded-lg shadow">
                    <i class="pi pi-arrow-right-arrow-left text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">Cambiar Cargo</h3>
                    <p class="text-xs text-sky-700">{{ subtituloCambiarCargo }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                    <span>Cambio de Cargo del Trabajador</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        <i class="pi pi-info-circle mr-1"></i>Operación transaccional
                    </span>
                </div>

                <!-- Cargo actual (una sola línea) -->
                <div class="mb-4 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-3">
                    <span class="text-[11px] font-bold text-slate-600 uppercase whitespace-nowrap">
                        Cargo Actual:
                    </span>
                    <span class="text-sm font-black text-slate-800 flex-1 truncate">
                        {{ cargoActualNombre }}
                    </span>
                    <span class="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                        {{ cargoActualCodigo }}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Nuevo Cargo (excluye el actual) -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nuevo Cargo <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="cargoCambiarSelectRef" v-model="cambiarCargoForm.cargo_id"
                            :options="cargoOptionsSinActual" option-label="label" option-value="value"
                            placeholder="Seleccionar nuevo cargo..." size="sm" filter :loading="loadingCargos"
                            @update:model-value="onCargoCambiarChange" />
                        <small
                            v-if="(submittedCambiarCargo || touchedCambiarCargo.cargo_id) && !cambiarCargoForm.cargo_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un cargo
                        </small>
                    </div>

                    <!-- Sueldo Base -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sueldo Base
                            <span class="text-slate-400 font-normal normal-case">(opcional)</span>
                        </label>
                        <BaseInput
                            v-model.number="cambiarCargoForm.sueldo_base"
                            type="number"
                            :min="0"
                            step="0.01"
                            size="sm"
                            placeholder="Heredar del nuevo cargo"
                        />
                        <small class="text-slate-400 text-[10px] block mt-0.5">
                            Déjalo vacío para heredar el sueldo del cargo.
                        </small>
                    </div>

                    <!-- Tipo Moneda -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo Moneda <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="cambiarCargoForm.tipo_moneda_id"
                            :options="tipoMonedaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar..."
                            size="sm"
                            @update:model-value="touchedCambiarCargo.tipo_moneda_id = true"
                        />
                        <small
                            v-if="(submittedCambiarCargo || touchedCambiarCargo.tipo_moneda_id) && !cambiarCargoForm.tipo_moneda_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un tipo de moneda
                        </small>
                    </div>

                    <!-- Fecha Desde -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Fecha Desde <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="cambiarCargoForm.fecha_desde"
                            type="date"
                            size="sm"
                            @blur="touchedCambiarCargo.fecha_desde = true"
                        />
                        <small
                            v-if="(submittedCambiarCargo || touchedCambiarCargo.fecha_desde) && !cambiarCargoForm.fecha_desde"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            La fecha desde es obligatoria
                        </small>
                    </div>

                    <!-- Observaciones -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Observaciones
                        </label>
                        <textarea
                            v-model="cambiarCargoForm.observaciones"
                            :maxlength="500"
                            rows="3"
                            placeholder="Motivo del cambio: ascenso, reasignación, etc."
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] px-3 py-2 text-xs transition-all focus:outline-none focus:border-[var(--focus-color)] focus:ring-2 focus:ring-blue-100 resize-none"
                        ></textarea>
                    </div>

                    <!-- Aviso -->
                    <div class="md:col-span-12">
                        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
                            <i class="pi pi-exclamation-triangle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                El cargo actual pasará a estado <b>HISTÓRICO</b> y se creará una nueva asignación activa.
                                Esta operación es <b>irreversible</b>.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton
                    label="Cancelar"
                    icon="pi pi-times"
                    :loading="loadingCambiarCargo"
                    variant="danger"
                    @click="cerrarCambiarCargo"
                />
                <BaseButton
                    label="Cambiar Cargo"
                    icon="pi pi-check"
                    :loading="loadingCambiarCargo"
                    variant="primary"
                    @click="confirmarCambiarCargo"
                />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIALOG ELIMINAR ═══════════ -->
    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Asignación"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
    import { TipoMoneda, TIPO_MONEDA_METADATA, ESTADO_ACTIVO } from '~/constants/estados.constant';
    import { useCargoResolver } from '~/composables/useCargoResolver';

    useHead({ title: 'Historial de Cargos' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    interface CargoOptionItem {
        label: string;
        value: number;
        sueldo_base: number;
        tipo_moneda_id: number;
    }

    // ============ HELPERS ============
    const toOptionalNumber = (v: unknown): number | undefined => {
        if (v === undefined || v === null || v === '') return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.trabajador_id) count++;
        if (filters.value.cargo_id) count++;
        if (filters.value.tipo_moneda_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.trabajador_id = null;
        filters.value.cargo_id = null;
        filters.value.tipo_moneda_id = null;
        filters.value.global = '';
        filters.value.exactMatch = 0;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { resolverCargoConductor } = useCargoResolver();

    // ============ CONSTANTES ============
    const trabajadorIdInicial: number | null = null;

    // ============ OPCIONES DERIVADAS DE CONSTANTES ============
    const tipoMonedaOptions: OptionItem[] = Object.values(TipoMoneda)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_MONEDA_METADATA[id as TipoMoneda];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    // ============ ESTADO DE CATÁLOGOS ============
    const trabajadorOptions = shallowRef<OptionItem[]>([]);
    const cargoOptions = shallowRef<CargoOptionItem[]>([]);
    const loadingTrabajadores = ref(false);
    const loadingCargos = ref(false);

    // ============ CARGA DE TRABAJADORES ============
    const cargarTrabajadores = async (): Promise<void> => {
        loadingTrabajadores.value = true;
        try {
            const res: any = await $api('/trabajadores', {
                method: 'GET',
                params: {
                    limit: 200,
                    sortField: 'trabajador_nombre_completo',
                    sortOrder: 1,
                    estado_id: ESTADO_ACTIVO,
                },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            trabajadorOptions.value = lista.map((t: any): OptionItem => ({
                label: `${t.trabajador_nombre_completo} — ${t.apodo}`,
                value: Number(t.trabajador_id),
            }));
        } catch (err) {
            console.error('Error al cargar trabajadores:', err);
            trabajadorOptions.value = [];
        } finally {
            loadingTrabajadores.value = false;
        }
    };

    // ============ CARGA DE CARGOS ============
    const cargarCargos = async (): Promise<void> => {
        loadingCargos.value = true;
        try {
            const res: any = await $api('/cargos', {
                method: 'GET',
                params: { limit: 1000, sortField: 'cargo', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            cargoOptions.value = lista.map((c: any): CargoOptionItem => ({
                label: `${c.cargo}`,
                value: Number(c.cargo_id),
                sueldo_base: Number(c.sueldo_base),
                tipo_moneda_id: Number(c.tipo_moneda_id),
            }));
        } catch (err) {
            console.error('Error al cargar cargos:', err);
            cargoOptions.value = [];
        } finally {
            loadingCargos.value = false;
        }
    };

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog, save,
        confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'trabajadores-cargos',
        tablaPermisos: 'trabajadores_cargos',
        sortFieldDefault: 'trabajador_cargo_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        camposProtegidosPorDependencia: [],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            trabajador_id: trabajadorIdInicial,
            cargo_id: null,
            tipo_moneda_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.trabajador_id) extra.trabajador_id = Number(f.trabajador_id);
            if (f.cargo_id) extra.cargo_id = Number(f.cargo_id);
            if (f.tipo_moneda_id) extra.tipo_moneda_id = Number(f.tipo_moneda_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.trabajador_cargo_id,

        getCleanForm: () => ({
            trabajador_cargo_id: null,
            trabajador_id: trabajadorIdInicial,
            cargo_id: null,
            sueldo_base: undefined,
            tipo_moneda_id: TipoMoneda.BOLIVIANO,
            fecha_desde: new Date().toISOString().slice(0, 10),
            fecha_hasta: null,
            observaciones: '',
        }),

        buildPayload: (form: any) => {
            const payload: Record<string, any> = {
                tipo_moneda_id: Number(form.tipo_moneda_id),
            };

            if (!isUpdate.value) {
                payload.trabajador_id = Number(form.trabajador_id);
                payload.cargo_id = Number(form.cargo_id);
                payload.fecha_desde = form.fecha_desde;

                const sueldo = toOptionalNumber(form.sueldo_base);
                if (sueldo !== undefined) payload.sueldo_base = sueldo;
            } else {
                if (form.fecha_desde) payload.fecha_desde = form.fecha_desde;
                if (form.fecha_hasta) payload.fecha_hasta = form.fecha_hasta;

                const sueldo = toOptionalNumber(form.sueldo_base);
                if (sueldo !== undefined) payload.sueldo_base = sueldo;
            }

            if (form.observaciones?.trim()) {
                payload.observaciones = form.observaciones.trim();
            }

            return payload;
        },

        validate: (form: any, _rules: any, notify: any) => {
            if (!isUpdate.value && !form.trabajador_id) {
                touched.value.trabajador_id = true;
                notify('warn', 'Trabajador requerido', 'Debe seleccionar un trabajador.');
                return false;
            }
            if (!isUpdate.value && !form.cargo_id) {
                touched.value.cargo_id = true;
                notify('warn', 'Cargo requerido', 'Debe seleccionar un cargo.');
                return false;
            }
            if (!form.tipo_moneda_id) {
                touched.value.tipo_moneda_id = true;
                notify('warn', 'Moneda requerida', 'Debe seleccionar un tipo de moneda.');
                return false;
            }
            if (!form.fecha_desde) {
                touched.value.fecha_desde = true;
                notify('warn', 'Fecha requerida', 'La fecha desde es obligatoria.');
                return false;
            }

            const sueldo = toOptionalNumber(form.sueldo_base);
            if (sueldo !== undefined) {
                if (sueldo < 0) {
                    notify('warn', 'Sueldo inválido', 'El sueldo base no puede ser negativo.');
                    return false;
                }
                if (!/^\d+(\.\d{1,2})?$/.test(String(sueldo))) {
                    notify('warn', 'Sueldo inválido', 'El sueldo base debe tener máximo 2 decimales.');
                    return false;
                }
            }

            if (form.fecha_hasta && form.fecha_desde && form.fecha_hasta < form.fecha_desde) {
                notify('warn', 'Fechas inválidas', 'La fecha hasta no puede ser anterior a la fecha desde.');
                return false;
            }

            return true;
        },
    });

    // ============ SAVE con TOAST informativo de categoría inicial ============
    const saveWrapper = async (): Promise<void> => {
        const dialogAntes = dialog.value;
        const esCreacion = !isUpdate.value;
        const cargoIdSeleccionado = formObj.value.cargo_id;

        await save();

        if (dialogAntes && !dialog.value && esCreacion) {
            try {
                const cargoConductorId = await resolverCargoConductor();
                if (cargoConductorId && Number(cargoIdSeleccionado) === cargoConductorId) {
                    notify(
                        'info',
                        'Categoría inicial asignada',
                        'El trabajador recibió automáticamente la categoría K (Kualificado).',
                    );
                }
            } catch {
                // Silencioso
            }
        }
    };

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR ASIGNACIÓN' : 'NUEVA ASIGNACIÓN'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de la asignación de cargo'
            : 'Registro de una nueva asignación'
    );

    // ============ ON CARGO CHANGE ============
    const onCargoChange = (): void => {
        touched.value.cargo_id = true;

        const cargoId = formObj.value.cargo_id;
        if (!cargoId) return;

        const cargo = cargoOptions.value.find(o => o.value === Number(cargoId));
        if (!cargo) return;

        formObj.value.sueldo_base = cargo.sueldo_base;
        formObj.value.tipo_moneda_id = cargo.tipo_moneda_id;
    };

    const onCargoCambiarChange = (): void => {
        touchedCambiarCargo.value.cargo_id = true;

        const cargoId = cambiarCargoForm.value.cargo_id;
        if (!cargoId) return;

        const cargo = cargoOptions.value.find(o => o.value === Number(cargoId));
        if (!cargo) return;

        cambiarCargoForm.value.sueldo_base = cargo.sueldo_base;
        cambiarCargoForm.value.tipo_moneda_id = cargo.tipo_moneda_id;
    };

    // ============ FOCUS INICIAL ============
    const trabajadorSelectRef = ref<any>(null);

    const focusTrabajador = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = trabajadorSelectRef.value?.$el as HTMLElement | null;
            if (!el) return;
            const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
            trigger?.click();
        }, 350);
    };

    // ============ OVERRIDE openNew / edit ============
    const openNewConTrabajador = (): void => {
        openNewBase();
        if (filters.value.trabajador_id) {
            formObj.value.trabajador_id = Number(filters.value.trabajador_id);
        }
    };

    const handleEdit = async (data: any): Promise<void> => {
        await editBase(data);

        formObj.value.trabajador_id = Number(data.trabajador_id);
        formObj.value.cargo_id = Number(data.cargo_id);
        formObj.value.tipo_moneda_id = Number(data.tipo_moneda_id);
        formObj.value.sueldo_base = Number(data.sueldo_base);
    };

    // ══════════════════════════════════════════════════════════════
    // CAMBIAR CARGO
    // ══════════════════════════════════════════════════════════════
    const cambiarCargoDialog = ref(false);
    const loadingCambiarCargo = ref(false);
    const submittedCambiarCargo = ref(false);
    const touchedCambiarCargo = ref<Record<string, boolean>>({});
    const cambiarCargoRefItem = ref<any>(null);
    const cargoCambiarSelectRef = ref<any>(null);

    const cambiarCargoForm = ref({
        cargo_id: null as number | null,
        sueldo_base: undefined as number | undefined,
        tipo_moneda_id: TipoMoneda.BOLIVIANO as number,
        fecha_desde: new Date().toISOString().slice(0, 10),
        observaciones: '',
    });

    const cargoActualNombre = computed(() => cambiarCargoRefItem.value?.cargo_nombre ?? '—');
    const cargoActualCodigo = computed(() => cambiarCargoRefItem.value?.cargo_codigo ?? '—');

    const subtituloCambiarCargo = computed(() => {
        const item = cambiarCargoRefItem.value;
        if (!item) return '';
        const nombre = item.trabajador_nombre_completo ?? '';
        const alias = item.trabajador_apodo ? ` (${item.trabajador_apodo})` : '';
        return `${nombre}${alias}`;
    });

    const cargoOptionsSinActual = computed<CargoOptionItem[]>(() => {
        const actualId = Number(cambiarCargoRefItem.value?.cargo_id);
        if (!actualId) return cargoOptions.value;
        return cargoOptions.value.filter(o => o.value !== actualId);
    });

    const openCambiarCargo = (item: any): void => {
        cambiarCargoRefItem.value = item;
        cambiarCargoForm.value = {
            cargo_id: null,
            sueldo_base: undefined,
            tipo_moneda_id: TipoMoneda.BOLIVIANO,
            fecha_desde: new Date().toISOString().slice(0, 10),
            observaciones: '',
        };
        submittedCambiarCargo.value = false;
        touchedCambiarCargo.value = {};
        cambiarCargoDialog.value = true;
    };

    const cerrarCambiarCargo = (): void => {
        if (loadingCambiarCargo.value) return;
        cambiarCargoDialog.value = false;
        cambiarCargoRefItem.value = null;
    };

    const focusCargoCambiar = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = cargoCambiarSelectRef.value?.$el as HTMLElement | null;
            if (!el) return;
            const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
            trigger?.focus();
            trigger?.click();
        }, 350);
    };

    const confirmarCambiarCargo = async (): Promise<void> => {
        submittedCambiarCargo.value = true;

        const item = cambiarCargoRefItem.value;
        if (!item) return;

        if (!cambiarCargoForm.value.cargo_id) {
            touchedCambiarCargo.value.cargo_id = true;
            notify('warn', 'Cargo requerido', 'Debe seleccionar el nuevo cargo.');
            return;
        }
        if (!cambiarCargoForm.value.tipo_moneda_id) {
            touchedCambiarCargo.value.tipo_moneda_id = true;
            notify('warn', 'Moneda requerida', 'Debe seleccionar un tipo de moneda.');
            return;
        }
        if (!cambiarCargoForm.value.fecha_desde) {
            touchedCambiarCargo.value.fecha_desde = true;
            notify('warn', 'Fecha requerida', 'La fecha desde es obligatoria.');
            return;
        }
        if (Number(cambiarCargoForm.value.cargo_id) === Number(item.cargo_id)) {
            notify('warn', 'Cargo idéntico', 'El nuevo cargo es el mismo que el actual.');
            return;
        }

        try {
            loadingCambiarCargo.value = true;

            const payload: Record<string, any> = {
                trabajador_id: Number(item.trabajador_id),
                cargo_id: Number(cambiarCargoForm.value.cargo_id),
                tipo_moneda_id: Number(cambiarCargoForm.value.tipo_moneda_id),
                fecha_desde: cambiarCargoForm.value.fecha_desde,
            };

            const sueldo = toOptionalNumber(cambiarCargoForm.value.sueldo_base);
            if (sueldo !== undefined) payload.sueldo_base = sueldo;

            if (cambiarCargoForm.value.observaciones?.trim()) {
                payload.observaciones = cambiarCargoForm.value.observaciones.trim();
            }

            await $api('/trabajadores-cargos/cambiar-cargo', {
                method: 'POST',
                body: payload,
            });

            notify('success', 'Cargo cambiado', 'La asignación se actualizó correctamente.');

            try {
                const cargoConductorId = await resolverCargoConductor();
                if (cargoConductorId && Number(cambiarCargoForm.value.cargo_id) === cargoConductorId) {
                    notify(
                        'info',
                        'Categoría verificada',
                        'Si el trabajador no tenía categoría, se le asignó la categoría K automáticamente.',
                    );
                }
            } catch {
                // Silencioso
            }

            cambiarCargoDialog.value = false;
            cambiarCargoRefItem.value = null;
            onSearch();
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo cambiar el cargo.';
            notify('error', 'Error al cambiar cargo', Array.isArray(msg) ? msg[0] : msg);
            console.error('Error al cambiar cargo:', err);
        } finally {
            loadingCambiarCargo.value = false;
        }
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'trabajador_id', header: 'TRABAJADOR', sortable: true, template: 'body-trabajador', class: 'w-56' },
        { field: 'cargo_id', header: 'CARGO', sortable: true, template: 'body-cargo', class: 'w-48' },
        { field: 'sueldo_base', header: 'SUELDO', sortable: true, template: 'body-sueldo_base', class: 'w-40' },
        { field: 'fecha_desde', header: 'VIGENCIA', sortable: true, template: 'body-fechas', bodyClass: '!text-center', class: 'w-32' },
        { field: 'estado_registro', header: 'REGISTRO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const nombre = formObj.value?.trabajador_nombre_completo ?? '';
        const cargo = formObj.value?.cargo_nombre ?? '';
        return nombre && cargo ? `${nombre} — ${cargo}` : `Asignación ${formObj.value?.trabajador_cargo_id ?? ''}`;
    });

    const formatMonto = (value: any): string => {
        const num = Number(value);
        if (!Number.isFinite(num)) return '—';
        return num.toLocaleString('es-BO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // ============ WATCH ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.trabajador_id != null) {
                formObj.value.trabajador_id = Number(formObj.value.trabajador_id);
            }
            if (formObj.value.cargo_id != null) {
                formObj.value.cargo_id = Number(formObj.value.cargo_id);
            }
            if (formObj.value.tipo_moneda_id != null) {
                formObj.value.tipo_moneda_id = Number(formObj.value.tipo_moneda_id);
            }
        }, 150);
    });

    // ============ INIT ============
    onMounted(async () => {
        await Promise.all([
            cargarTrabajadores(),
            cargarCargos(),
        ]);

        lazyParams.value.sortField = 'trabajador_cargo_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
