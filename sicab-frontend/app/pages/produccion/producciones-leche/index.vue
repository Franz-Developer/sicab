<!-- C:\sistemas\sicab\sicab-frontend\app\pages\produccion\producciones-leche\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-inbox" title="Producciones de Leche"
        subtitle="Registro diario de ordeño por sucursal, turno y vacunos" :show-action="permisos.crear"
        action-label="NUEVA PRODUCCIÓN" action-icon="pi pi-plus" @action="openNew">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort" @row-expand="onRowExpand">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: sucursal, turno, observaciones..."
                        :active-filters-count="filtrosActivosCount"
                        modal-subtitle="Refina la búsqueda de producciones de leche" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear
                                    appendTo="body" :loading="loadingEmpresas"
                                    @update:model-value="onEmpresaFilterChange" class="w-full" />
                            </div>
                            <div class="md:col-span-12">
                                <label
                                    class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalesFilterOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingSucursales"
                                    @update:model-value="onFilterChange" class="w-full" />
                            </div>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Turno</label>
                                <BaseSelect v-model="filters.turno_ordeno_id" :options="turnoOptions"
                                    option-label="label" option-value="value" placeholder="Todos los turnos" size="sm"
                                    filter show-clear appendTo="body" :loading="loadingTurnos"
                                    @update:model-value="onFilterChange" class="w-full" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Fecha
                                    desde</label>
                                <BaseInput v-model="filters.fecha_produccion_desde" type="date" size="sm" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Fecha
                                    hasta</label>
                                <BaseInput v-model="filters.fecha_produccion_hasta" type="date" size="sm" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-fecha_produccion="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.fecha_produccion }}</span>
                    <span v-if="data.turno_nombre" class="cell-secondary">
                        <span class="font-bold">TURNO:</span> {{ data.turno_nombre }}
                    </span>
                </div>
            </template>

            <template #body-ubicacion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre || '—' }}</span>
                    <span v-if="data.empresa_nombre" class="cell-secondary">
                        <span class="font-bold">EMP:</span> {{ data.empresa_nombre }}
                    </span>
                </div>
            </template>

            <template #body-vacunos="{ data }">
                <span class="font-bold text-sky-700">
                    <i class="pi pi-users text-[10px] mr-1"></i>
                    {{ data.total_vacunos ?? 0 }}
                </span>
            </template>

            <template #body-litros="{ data }">
                <div class="cell-stack items-end lg:items-center w-full">
                    <span class="cell-primary">
                        <i class="pi pi-inbox text-[10px] mr-1 text-blue-500"></i>
                        {{ formatNumber(data.total_litros) }} L
                    </span>
                    <span v-if="Number(data.total_descartado) > 0" class="cell-secondary text-red-600">
                        <span class="font-bold">DESC.:</span> {{ formatNumber(data.total_descartado) }} L
                    </span>
                </div>
            </template>

            <template #body-total_neto="{ data }">
                <span class="font-bold text-emerald-700">{{ formatNumber(data.total_neto) }} L</span>
            </template>

            <template #body-calidad="{ data }">
                <div class="flex flex-col text-[10px] leading-tight items-end lg:items-center w-full">
                    <span v-if="data.temperatura_promedio != null" class="text-slate-700">
                        <i class="pi pi-sun text-[9px] mr-1 text-amber-500"></i>
                        {{ data.temperatura_promedio }} °C
                    </span>
                    <span v-if="data.densidad_promedio != null" class="text-slate-700">
                        <i class="pi pi-chart-bar text-[9px] mr-1 text-sky-500"></i>
                        {{ data.densidad_promedio }} g/mL
                    </span>
                    <span v-if="data.temperatura_promedio == null && data.densidad_promedio == null"
                        class="text-slate-400">—</span>
                </div>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" @edit="edit(data)"
                    @toggle="toggleEstado(data)" @delete="handleConfirmDelete(data)" />
            </template>

            <!-- ═══════════ EXPANSIÓN con detalles ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <!-- Datos de cabecera -->
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Empresa</span>
                            <span class="expansion-value">{{ data.empresa_nombre || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Sucursal</span>
                            <span class="expansion-value">
                                {{ data.sucursal_nombre || '—' }}
                                <span v-if="data.sucursal_codigo" class="text-slate-500">({{ data.sucursal_codigo
                                    }})</span>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Turno</span>
                            <span class="expansion-value">
                                {{ data.turno_nombre || '—' }}
                                <span v-if="data.turno_codigo" class="text-slate-500">({{ data.turno_codigo }})</span>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Producción</span>
                            <span class="expansion-value">{{ data.fecha_produccion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Total Litros</span>
                            <span class="expansion-value">{{ formatNumber(data.total_litros) }} L</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Total Descartado</span>
                            <span class="expansion-value">{{ formatNumber(data.total_descartado) }} L</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Total Neto</span>
                            <span class="expansion-value font-bold text-emerald-700">{{ formatNumber(data.total_neto) }}
                                L</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Temperatura Promedio</span>
                            <span class="expansion-value">{{ data.temperatura_promedio != null ?
                                `${data.temperatura_promedio} °C` : '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Densidad Promedio</span>
                            <span class="expansion-value">{{ data.densidad_promedio != null ? `${data.densidad_promedio}
                                g/mL` : '—' }}</span>
                        </div>
                        <div class="expansion-item md:col-span-2">
                            <span class="expansion-label">Observaciones</span>
                            <span class="expansion-value" :title="data.observaciones || '—'">{{ data.observaciones ||
                                '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                    </div>

                    <!-- Detalles (vacunos) -->
                    <div class="mt-3 border-t border-dashed border-slate-300 pt-3">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="text-[11px] font-black text-sky-900 uppercase tracking-wider">
                                <i class="pi pi-list mr-1"></i>
                                Detalle por Vacuno ({{ data.total_vacunos ?? 0 }})
                            </h4>
                            <BaseButton v-if="permisos.crear && data.estado_id === ESTADO_ACTIVO" label="Agregar Vacuno"
                                icon="pi pi-plus" variant="ghost-sky" size="xs" @click="abrirDetalleDialog(data)" />
                        </div>

                        <div v-if="loadingDetalles[data.produccion_leche_id]"
                            class="text-center py-3 text-xs text-slate-500">
                            <i class="pi pi-spin pi-spinner mr-1"></i> Cargando vacunos...
                        </div>
                        <div v-else-if="!(detallesPorProduccion[data.produccion_leche_id]?.length)"
                            class="text-center py-3 text-xs text-slate-400">
                            Sin vacunos registrados.
                        </div>
                        <table v-else class="w-full text-[11px] border-collapse">
                            <thead>
                                <tr class="bg-sky-100 text-sky-900">
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Arete</th>
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Nombre</th>
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Raza</th>
                                    <th class="text-left px-2 py-1 font-bold uppercase text-[9px]">Categoría</th>
                                    <th class="text-right px-2 py-1 font-bold uppercase text-[9px]">Litros</th>
                                    <th class="text-center px-2 py-1 font-bold uppercase text-[9px] w-16">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="det in detallesPorProduccion[data.produccion_leche_id]"
                                    :key="det.produccion_leche_detalle_id"
                                    class="border-b border-slate-200 hover:bg-sky-50">
                                    <td class="px-2 py-1 font-bold">{{ det.vacuno_arete || '—' }}</td>
                                    <td class="px-2 py-1">{{ det.vacuno_nombre || '—' }}</td>
                                    <td class="px-2 py-1 text-slate-600">{{ det.raza_nombre || '—' }}</td>
                                    <td class="px-2 py-1 text-slate-600">{{ det.categoria_nombre || '—' }}</td>
                                    <td class="px-2 py-1 text-right font-bold text-emerald-700">{{
                                        formatNumber(det.litros) }} L</td>
                                    <td class="px-2 py-1 text-center">
                                        <div class="flex gap-0.5 justify-center">
                                            <BaseButton v-if="permisos.editar && data.estado_id === ESTADO_ACTIVO"
                                                icon="pi pi-pencil" variant="ghost-purple" size="xs"
                                                class="!p-0 !w-5 !h-5" v-tooltip.top="'Editar'"
                                                @click="editarDetalle(data, det)" />
                                            <BaseButton v-if="permisos.eliminar && data.estado_id === ESTADO_ACTIVO"
                                                icon="pi pi-trash" variant="ghost-red" size="xs" class="!p-0 !w-5 !h-5"
                                                v-tooltip.top="'Eliminar'" @click="eliminarDetalle(data, det)" />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="bg-slate-100">
                                    <td colspan="4" class="px-2 py-1 text-right font-bold text-[10px] uppercase">Suma
                                        detalles:</td>
                                    <td class="px-2 py-1 text-right font-bold text-emerald-800">
                                        {{ formatNumber(sumaDetalles(data.produccion_leche_id)) }} L
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════════════════════════════════════════════════════════════
         DIALOG PRINCIPAL (Cabecera + Grid de Vacunos en creación)
         ═══════════════════════════════════════════════════════════════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[860px] lg:w-[920px]"
        maxHeight="92vh" :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-inbox text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div class="space-y-4">
            <!-- ─── 1. UBICACIÓN Y TURNO ─── -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>1. Ubicación y Turno</span>
                    <span class="text-slate-600 normal-case font-bold text-[9px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Empresa <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="empresaSeleccionadaId" :options="empresaOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar empresa..." size="sm" filter
                            :loading="loadingEmpresas" @update:model-value="onEmpresaFormChange" />
                        <small v-if="submitted && !empresaSeleccionadaId"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe seleccionar una empresa
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Sucursal <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="sucursalRef" v-model="formObj.sucursal_id" :options="sucursalesFormOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar sucursal..." size="sm"
                            filter :loading="loadingSucursales" :disabled="estaProtegido('sucursal_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('sucursal_id') }"
                            @update:model-value="touched.sucursal_id = true" />
                        <small v-if="estaProtegido('sucursal_id')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.sucursal_id) && !formObj.sucursal_id"
                            class="text-red-500 font-semibold text-[10px]">Requerido</small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Turno de Ordeño <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.turno_ordeno_id" :options="turnoOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar turno..." size="sm" filter
                            :loading="loadingTurnos" :disabled="estaProtegido('turno_ordeno_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('turno_ordeno_id') }"
                            @update:model-value="touched.turno_ordeno_id = true" />
                        <small v-if="estaProtegido('turno_ordeno_id')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.turno_ordeno_id) && !formObj.turno_ordeno_id"
                            class="text-red-500 font-semibold text-[10px]">Requerido</small>
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Fecha de Producción <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.fecha_produccion" type="date" size="sm"
                            :disabled="estaProtegido('fecha_produccion')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('fecha_produccion') }"
                            @blur="touched.fecha_produccion = true" />
                        <small v-if="estaProtegido('fecha_produccion')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.fecha_produccion) && !formObj.fecha_produccion"
                            class="text-red-500 font-semibold text-[10px]">Requerido</small>
                        <small v-else-if="formObj.fecha_produccion && formObj.fecha_produccion > hoyLocal"
                            class="text-red-500 font-semibold text-[10px]">La fecha no puede ser futura</small>
                    </div>
                </div>
            </div>

            <!-- ─── 2. VOLUMEN Y CALIDAD (Rediseñado a 2 filas) ─── -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>2. Volumen y Calidad</span>
                    <span v-if="!isUpdate" class="text-slate-600 normal-case font-bold text-[9px]">
                        El total de litros se calcula desde los vacunos
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <!-- Fila 1: Volúmenes -->
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Total Litros <span class="text-slate-400 text-[9px] normal-case">(calc.)</span>
                        </label>
                        <div
                            class="w-full h-[32px] px-3 flex items-center bg-sky-50 border border-sky-300 rounded-[var(--radius-std)] text-xs font-bold text-sky-800">
                            <i class="pi pi-calculator text-sky-600 mr-1.5 text-[11px]"></i>
                            {{ formatNumber(totalLitrosCalculado) }} L
                        </div>
                    </div>

                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Total
                            Descartado</label>
                        <BaseInput v-model="formObj.total_descartado" type="number" step="0.01" min="0" size="sm"
                            @blur="touched.total_descartado = true" />
                        <small v-if="Number(formObj.total_descartado) > totalLitrosCalculado"
                            class="text-red-500 font-semibold text-[9px] block leading-tight">
                            No puede superar el total ({{ formatNumber(totalLitrosCalculado) }})
                        </small>
                        <small v-else-if="Number(formObj.total_descartado) < 0"
                            class="text-red-500 font-semibold text-[9px] block leading-tight">
                            No puede ser negativo
                        </small>
                    </div>

                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Total Neto <span class="text-slate-400 text-[9px] normal-case">(calc.)</span>
                        </label>
                        <div
                            class="w-full h-[32px] px-3 flex items-center bg-emerald-50 border border-emerald-300 rounded-[var(--radius-std)] text-xs font-bold text-emerald-800">
                            <i class="pi pi-check-circle text-emerald-600 mr-1.5 text-[11px]"></i>
                            {{ formatNumber(totalNetoCalculado) }} L
                        </div>
                    </div>

                    <!-- Fila 2: Calidad -->
                    <div class="md:col-span-6 mt-1">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Temperatura Promedio
                            (°C)</label>
                        <BaseInput v-model="formObj.temperatura_promedio" type="number" step="0.01" min="-10" max="50"
                            size="sm" @blur="touched.temperatura_promedio = true" />
                        <small
                            v-if="formObj.temperatura_promedio !== '' && formObj.temperatura_promedio != null && (Number(formObj.temperatura_promedio) < -10 || Number(formObj.temperatura_promedio) > 50)"
                            class="text-red-500 font-semibold text-[9px] block leading-tight">Debe estar entre -10 y 50
                            °C</small>
                        <small v-else class="text-slate-500 text-[9px] block leading-tight">Permitido: -10 a 50
                            °C</small>
                    </div>

                    <div class="md:col-span-6 mt-1">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Densidad Promedio
                            (g/mL)</label>
                        <BaseInput v-model="formObj.densidad_promedio" type="number" step="0.0001" min="1" max="1.1"
                            size="sm" @blur="touched.densidad_promedio = true" />
                        <small
                            v-if="formObj.densidad_promedio !== '' && formObj.densidad_promedio != null && (Number(formObj.densidad_promedio) < 1 || Number(formObj.densidad_promedio) > 1.1)"
                            class="text-red-500 font-semibold text-[9px] block leading-tight">Debe estar entre 1.0000 y
                            1.1000</small>
                        <small v-else class="text-slate-500 text-[9px] block leading-tight">Permitido: 1.0000 a
                            1.1000</small>
                    </div>
                </div>

                <!-- Barra de progreso -->
                <div v-if="totalLitrosCalculado > 0" class="mt-3">
                    <div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                        <span>Aprovechable</span>
                        <span>Descartado</span>
                    </div>
                    <div class="h-2 rounded-full bg-slate-200 overflow-hidden flex">
                        <div class="bg-emerald-500 transition-all" :style="{ width: `${porcentajeNeto}%` }"></div>
                        <div class="bg-red-400 transition-all" :style="{ width: `${100 - porcentajeNeto}%` }"></div>
                    </div>
                </div>
            </div>

            <!-- ─── 3. DETALLE POR VACUNO (grid editable) ─── -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>3. Detalle por Vacuno</span>
                    <span class="text-slate-600 normal-case font-bold text-[9px]">
                        Mínimo 1 vacuno <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="space-y-2">
                    <div v-for="(fila, idx) in filasDetalle" :key="fila._key"
                        class="grid grid-cols-1 md:grid-cols-12 gap-x-2 gap-y-1.5 p-2 bg-white border border-slate-200 rounded-lg relative">
                        <!-- Indicador de fila -->
                        <div class="md:col-span-12 flex items-center justify-between">
                            <span class="text-[9px] font-bold text-slate-500 uppercase">Vacuno #{{ idx + 1 }}</span>
                            <BaseButton icon="pi pi-times" variant="ghost-red" size="xs" class="!p-0 !w-5 !h-5"
                                v-tooltip.top="'Quitar'" :disabled="filasDetalle.length <= 1"
                                @click="quitarFilaDetalle(idx)" />
                        </div>

                        <!-- Vacuno -->
                        <div class="md:col-span-6">
                            <label class="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Vacuno *</label>
                            <BaseSelect v-model="fila.vacuno_id" :options="vacunoOptionsFiltrados(fila)"
                                option-label="label" option-value="value"
                                :placeholder="formObj.sucursal_id ? 'Seleccionar vacuno...' : 'Elija sucursal primero'"
                                size="sm" filter :loading="loadingVacunos"
                                :disabled="fila._persisted || !formObj.sucursal_id"
                                @update:model-value="onVacunoChange(fila)" />
                            <small v-if="!formObj.sucursal_id" class="text-amber-500 font-semibold text-[9px]">
                                <i class="pi pi-info-circle mr-1"></i>Seleccione una sucursal
                            </small>
                        </div>

                        <!-- Litros -->
                        <div class="md:col-span-3">
                            <label class="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Litros *</label>
                            <BaseInput v-model="fila.litros" type="number" step="0.01" min="0" size="sm"
                                @blur="fila._touched = true" />
                            <small v-if="fila._touched && (fila.litros === '' || fila.litros == null)"
                                class="text-red-500 font-semibold text-[9px]">Requerido</small>
                            <small v-else-if="Number(fila.litros) < 0" class="text-red-500 font-semibold text-[9px]">No
                                puede ser negativo</small>
                        </div>

                        <!-- Observaciones -->
                        <div class="md:col-span-3">
                            <label class="block text-[9px] font-bold text-slate-500 mb-0.5 uppercase">Obs.</label>
                            <BaseInput v-model="fila.observaciones" size="sm" placeholder="Opcional" maxlength="500" />
                        </div>

                        <!-- Badge para filas persistidas -->
                        <div v-if="fila._persisted" class="md:col-span-12">
                            <span class="text-[9px] font-bold text-emerald-600 uppercase">
                                <i class="pi pi-check-circle mr-1"></i>Vacuno ya registrado
                            </span>
                        </div>
                    </div>
                </div>

                <div class="mt-2 flex justify-center">
                    <BaseButton label="Agregar Vacuno" icon="pi pi-plus" variant="ghost-sky" size="sm"
                        @click="agregarFilaDetalle" />
                </div>

                <!-- Resumen -->
                <div class="mt-3 flex items-center justify-end gap-4 text-[11px] font-bold">
                    <span class="text-slate-600">Vacunos: <span class="text-sky-800">{{ filasDetalle.length
                            }}</span></span>
                    <span class="text-slate-600">Suma litros: <span class="text-emerald-700">{{
                        formatNumber(totalLitrosCalculado) }} L</span></span>
                </div>
            </div>

            <!-- ─── 4. OBSERVACIONES ─── -->
            <div class="panel-contrast !p-3">
                <span
                    class="block text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">Observaciones</span>
                <textarea v-model="formObj.observaciones" rows="2" maxlength="1000"
                    class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-2 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100"
                    placeholder="Notas adicionales (máx. 1000 caracteres)"></textarea>
                <div class="text-right text-[9px] text-slate-500 font-bold mt-1">
                    {{ (formObj.observaciones || '').length }} / 1000
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton :label="isUpdate ? 'Actualizar' : 'Guardar Producción'" icon="pi pi-save" :loading="loading"
                    variant="primary" @click="saveProduccion" />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════════════════════════════════════════════════════════════
         DIALOG DETALLE INDIVIDUAL (para agregar/editar un vacuno desde expansión)
         ═══════════════════════════════════════════════════════════════════ -->
    <BaseDialog v-model:visible="detalleDialog" dialogClass="" width="w-[95vw] sm:w-[85vw] md:w-[520px]"
        maxHeight="92vh" :modal="true" :closable="!loadingDetalleDialog">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-emerald-600 p-2 rounded-lg shadow">
                    <i class="pi pi-plus text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-emerald-900 uppercase">
                        {{ detalleEditando ? 'Editar Vacuno' : 'Agregar Vacuno' }}
                    </h3>
                    <p class="text-xs text-emerald-700">
                        Producción: {{ detalleProduccionActual?.fecha_produccion }} — {{
                            detalleProduccionActual?.sucursal_nombre }}
                    </p>
                </div>
            </div>
        </template>

        <div class="panel-contrast !p-3">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                <div class="md:col-span-12">
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                        Vacuno <span class="text-red-500">*</span>
                    </label>
                    <BaseSelect v-model="detalleForm.vacuno_id" :options="vacunoOptions" option-label="label"
                        option-value="value" placeholder="Seleccionar vacuno..." size="sm" filter
                        :loading="loadingVacunos" :disabled="!!detalleEditando" />
                </div>
                <div class="md:col-span-12">
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                        Litros <span class="text-red-500">*</span>
                    </label>
                    <BaseInput v-model="detalleForm.litros" type="number" step="0.01" min="0" size="sm" />
                </div>
                <div class="md:col-span-12">
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Observaciones</label>
                    <textarea v-model="detalleForm.observaciones" rows="2" maxlength="500"
                        class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-2 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100"
                        placeholder="Notas (máx. 500 caracteres)"></textarea>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loadingDetalleDialog" variant="danger"
                    @click="detalleDialog = false" />
                <BaseButton :label="detalleEditando ? 'Actualizar' : 'Agregar'" icon="pi pi-save"
                    :loading="loadingDetalleDialog" variant="primary" @click="guardarDetalle" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Producción de Leche" :item-name="deleteItemName"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
    import { Estado, ESTADO_ACTIVO, SexoBiologico, CondicionProductorLeche, ESTADOS_VACUNO_FINALES } from '~/constants/estados.constant';

    useHead({ title: 'Producciones de Leche' });

    interface OptionItem { label: string; value: number; empresa_id?: number; }
    interface FilaDetalle {
        _key: string;
        _persisted: boolean;
        _touched: boolean;
        produccion_leche_detalle_id: number | null;
        vacuno_id: number | null;
        litros: number | string | null;
        observaciones: string;
    }

    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    const empresaIdInicial: number | null = Number(authStore.user?.empresa_id) || null;
    const sucursalIdInicial: number | null = Number(authStore.user?.sucursal_id) || null;

    const hoyLocal = computed<string>(() => {
        return new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(new Date());
    });

    // ============ CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const sucursalesAllOptions = shallowRef<OptionItem[]>([]);
    const sucursalesFilterOptions = shallowRef<OptionItem[]>([]);
    const sucursalesFormOptions = shallowRef<OptionItem[]>([]);
    const turnoOptions = shallowRef<OptionItem[]>([]);
    const vacunoOptions = shallowRef<OptionItem[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingTurnos = ref(false);
    const loadingVacunos = ref(false);

    const empresaSeleccionadaId = ref<number | null>(empresaIdInicial);
    const deleteItemName = ref('');

    // ============ ESTADO DEL GRID DE DETALLES ============
    const filasDetalle = ref<FilaDetalle[]>([]);
    let filaKeyCounter = 0;
    const nuevaFila = (): FilaDetalle => ({
        _key: `fila-${++filaKeyCounter}`,
        _persisted: false,
        _touched: false,
        produccion_leche_detalle_id: null,
        vacuno_id: null,
        litros: null,
        observaciones: '',
    });

    // ============ ESTADO DEL DIALOG DETALLE INDIVIDUAL ============
    const detalleDialog = ref(false);
    const detalleEditando = ref<any | null>(null);
    const detalleProduccionActual = ref<any | null>(null);
    const detalleForm = ref({ vacuno_id: null as number | null, litros: null as number | string | null, observaciones: '' });
    const loadingDetalleDialog = ref(false);

    // ============ CACHÉ DE DETALLES POR PRODUCCIÓN (para expansión) ============
    const detallesPorProduccion = ref<Record<number, any[]>>({});
    const loadingDetalles = ref<Record<number, boolean>>({});

    // ============ CARGA DE CATÁLOGOS ============
    const cargarEmpresas = async (): Promise<void> => {
        loadingEmpresas.value = true;
        try {
            const res: any = await $api('/empresas', {
                method: 'GET',
                params: { limit: 1000, sortField: 'empresa', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            empresaOptions.value = lista.map((e: any): OptionItem => ({ label: e.empresa, value: Number(e.empresa_id) }));
        } catch (err) {
            console.error('Error al cargar empresas:', err);
            empresaOptions.value = [];
        } finally { loadingEmpresas.value = false; }
    };

    const cargarSucursales = async (): Promise<void> => {
        loadingSucursales.value = true;
        try {
            const res: any = await $api('/sucursales', {
                method: 'GET',
                params: { limit: 1000, sortField: 'sucursal', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            sucursalesAllOptions.value = lista.map((s: any): OptionItem => ({
                label: `${s.codigo ?? ''} — ${s.sucursal}`.trim(),
                value: Number(s.sucursal_id),
                empresa_id: Number(s.empresa_id),
            }));
            sucursalesFilterOptions.value = sucursalesAllOptions.value;
            sucursalesFormOptions.value = sucursalesAllOptions.value;
        } catch (err) {
            console.error('Error al cargar sucursales:', err);
            sucursalesAllOptions.value = [];
            sucursalesFilterOptions.value = [];
            sucursalesFormOptions.value = [];
        } finally { loadingSucursales.value = false; }
    };

    const cargarTurnos = async (): Promise<void> => {
        loadingTurnos.value = true;
        try {
            const res: any = await $api('/turnos-ordeno', {
                method: 'GET',
                params: { limit: 500, sortField: 'turno', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            turnoOptions.value = lista.map((t: any): OptionItem => ({ label: t.turno, value: Number(t.turno_ordeno_id) }));
        } catch (err) {
            console.error('Error al cargar turnos:', err);
            turnoOptions.value = [];
        } finally { loadingTurnos.value = false; }
    };

    const cargarVacunos = async (sucursalId?: number | null): Promise<void> => {
        const idSucursal = sucursalId ?? formObj.value.sucursal_id;

        if (!idSucursal) {
            vacunoOptions.value = [];
            return;
        }

        loadingVacunos.value = true;
        try {
            const res: any = await $api('/vacunos', {
                method: 'GET',
                params: {
                    limit: 1000,
                    sortField: 'arete',
                    sortOrder: 1,
                    estado_id: Estado.ACTIVO,
                    sexo_biologico_id: SexoBiologico.HEMBRA,
                    es_productor_leche: CondicionProductorLeche.PRODUCTOR,
                    sucursal_id: Number(idSucursal), // ✅ FILTRO CLAVE
                },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            vacunoOptions.value = lista
                .filter((v: any) => !ESTADOS_VACUNO_FINALES.includes(Number(v.estado_vacuno_id) as any))
                .map((v: any): OptionItem => ({
                    label: `${v.arete} — ${v.nombre || 'S/N'}`,
                    value: Number(v.vacuno_id),
                }));
        } catch (err) {
            console.error('Error al cargar vacunos:', err);
            vacunoOptions.value = [];
        } finally {
            loadingVacunos.value = false;
        }
    };


    const vacunoOptionsFiltrados = (filaActual: FilaDetalle): OptionItem[] => {
        const usados = new Set(
            filasDetalle.value
                .filter(f => f._key !== filaActual._key && f.vacuno_id != null)
                .map(f => Number(f.vacuno_id))
        );
        return vacunoOptions.value.filter(o => !usados.has(o.value));
    };

    const onVacunoChange = (fila: FilaDetalle): void => {
        fila._touched = true;
    };

    // ============ FILTROS EMPRESA/SUCURSAL ============
    const onEmpresaFilterChange = (): void => {
        const empId = filters.value.empresa_id;
        if (empId) {
            sucursalesFilterOptions.value = sucursalesAllOptions.value.filter(s => s.empresa_id === Number(empId));
            if (!sucursalesFilterOptions.value.some(s => s.value === filters.value.sucursal_id)) {
                filters.value.sucursal_id = null;
            }
        } else {
            sucursalesFilterOptions.value = sucursalesAllOptions.value;
        }
        lazyParams.value.first = 0;
        onSearch();
    };

    const onEmpresaFormChange = (): void => {
        const empId = empresaSeleccionadaId.value;
        if (empId) {
            sucursalesFormOptions.value = sucursalesAllOptions.value.filter(s => s.empresa_id === Number(empId));
            if (!sucursalesFormOptions.value.some(s => s.value === formObj.value.sucursal_id)) {
                formObj.value.sucursal_id = null;
            }
        } else {
            sucursalesFormOptions.value = sucursalesAllOptions.value;
        }
    };

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog,
        toggleEstado, confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'producciones-leche',
        tablaPermisos: 'producciones_leche',
        sortFieldDefault: 'produccion_leche_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        camposProtegidosPorDependencia: ['sucursal_id', 'turno_ordeno_id', 'fecha_produccion'],
        defaultFilters: {
            global: '', exactMatch: 0,
            empresa_id: empresaIdInicial,
            sucursal_id: sucursalIdInicial,
            turno_ordeno_id: null,
            fecha_produccion_desde: '',
            fecha_produccion_hasta: '',
        },
        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.turno_ordeno_id) extra.turno_ordeno_id = Number(f.turno_ordeno_id);
            if (f.fecha_produccion_desde) extra.fecha_produccion_desde = f.fecha_produccion_desde;
            if (f.fecha_produccion_hasta) extra.fecha_produccion_hasta = f.fecha_produccion_hasta;
            return extra;
        },
        getPrimaryKey: (item: any) => item.produccion_leche_id,
        getCleanForm: () => ({
            produccion_leche_id: null,
            sucursal_id: null,
            turno_ordeno_id: null,
            fecha_produccion: hoyLocal.value,
            total_descartado: 0,
            temperatura_promedio: null,
            densidad_promedio: null,
            observaciones: '',
        }),
        buildPayload: () => ({}),
        validate: () => true,
    });

    const tituloDialog = computed(() => isUpdate.value ? 'EDITAR PRODUCCIÓN' : 'NUEVA PRODUCCIÓN');
    const subtituloDialog = computed(() => isUpdate.value ? 'Actualización del registro de ordeño' : 'Registro de producción diaria de leche');

    // ============ CÁLCULOS DERIVADOS ============
    const totalLitrosCalculado = computed<number>(() => {
        return filasDetalle.value.reduce((s, f) => {
            const n = Number(f.litros);
            return Number.isFinite(n) && n > 0 ? s + n : s;
        }, 0);
    });

    const totalNetoCalculado = computed<number>(() => {
        const litros = totalLitrosCalculado.value;
        const desc = Number(formObj.value.total_descartado ?? 0);
        if (!Number.isFinite(litros) || !Number.isFinite(desc)) return 0;
        return Number((litros - desc).toFixed(2));
    });

    const porcentajeNeto = computed<number>(() => {
        const litros = totalLitrosCalculado.value;
        if (litros <= 0) return 100;
        const neto = Math.max(0, Math.min(litros, totalNetoCalculado.value));
        return Math.max(0, Math.min(100, Number(((neto / litros) * 100).toFixed(1))));
    });

    // ============ DETALLES EN EXPANSIÓN ============
    const cargarDetalles = async (produccionId: number): Promise<void> => {
        if (detallesPorProduccion.value[produccionId]) return; // ya cacheado
        loadingDetalles.value = { ...loadingDetalles.value, [produccionId]: true };
        try {
            const res: any = await $api(`/producciones-leche/${produccionId}`, { method: 'GET' });
            const detalles = Array.isArray(res?.detalles) ? res.detalles : [];
            detallesPorProduccion.value = { ...detallesPorProduccion.value, [produccionId]: detalles };
        } catch (err) {
            console.error(`Error al cargar detalles de producción ${produccionId}:`, err);
            detallesPorProduccion.value = { ...detallesPorProduccion.value, [produccionId]: [] };
        } finally {
            loadingDetalles.value = { ...loadingDetalles.value, [produccionId]: false };
        }
    };

    const onRowExpand = async (event: any) => {
        const data = event.data;
        if (data?.produccion_leche_id) {
            await cargarDetalles(Number(data.produccion_leche_id));
        }
    };

    const sumaDetalles = (produccionId: number): number => {
        const arr = detallesPorProduccion.value[produccionId] ?? [];
        return arr.reduce((s: number, d: any) => s + Number(d.litros ?? 0), 0);
    };

    const invalidarCacheDetalles = (produccionId: number): void => {
        const copy = { ...detallesPorProduccion.value };
        delete copy[produccionId];
        detallesPorProduccion.value = copy;
    };

    // ============ OPEN / EDIT PRINCIPAL ============
    const openNew = (): void => {
        openNewBase();
        if (authStore.user?.empresa_id) {
            empresaSeleccionadaId.value = Number(authStore.user.empresa_id);
            onEmpresaFormChange();
        }
        if (authStore.user?.sucursal_id) {
            const sucId = Number(authStore.user.sucursal_id);
            const suc = sucursalesAllOptions.value.find(s => s.value === sucId);
            if (suc && suc.empresa_id === empresaSeleccionadaId.value) {
                formObj.value.sucursal_id = sucId;
            }
        }
        filasDetalle.value = [nuevaFila()];

        // Si ya hay sucursal por defecto, cargar vacunos
        if (formObj.value.sucursal_id) {
            cargarVacunos(Number(formObj.value.sucursal_id));
        }
    };

    const edit = async (data: any): Promise<void> => {
        await editBase(data);

        const empId = data.empresa_id != null
            ? Number(data.empresa_id)
            : (() => {
                const suc = sucursalesAllOptions.value.find(s => s.value === Number(data.sucursal_id));
                return suc?.empresa_id ?? null;
            })();
        empresaSeleccionadaId.value = empId;
        onEmpresaFormChange();

        formObj.value.sucursal_id = Number(data.sucursal_id);
        formObj.value.turno_ordeno_id = Number(data.turno_ordeno_id);
        formObj.value.total_descartado = Number(data.total_descartado ?? 0);
        formObj.value.temperatura_promedio = data.temperatura_promedio != null ? Number(data.temperatura_promedio) : null;
        formObj.value.densidad_promedio = data.densidad_promedio != null ? Number(data.densidad_promedio) : null;

        // Cargar detalles como filas persistidas
        try {
            const res: any = await $api(`/producciones-leche/${data.produccion_leche_id}`, { method: 'GET' });
            const detalles = Array.isArray(res?.detalles) ? res.detalles : [];
            filasDetalle.value = detalles.map((d: any): FilaDetalle => ({
                _key: `det-${d.produccion_leche_detalle_id}`,
                _persisted: true,
                _touched: false,
                produccion_leche_detalle_id: Number(d.produccion_leche_detalle_id),
                vacuno_id: Number(d.vacuno_id),
                litros: Number(d.litros),
                observaciones: d.observaciones ?? '',
            }));
            if (filasDetalle.value.length === 0) {
                filasDetalle.value = [nuevaFila()];
            }
            // Actualizar caché de expansión
            detallesPorProduccion.value = { ...detallesPorProduccion.value, [data.produccion_leche_id]: detalles };

            // Cargar vacunos de la sucursal de esta producción
            await cargarVacunos(Number(data.sucursal_id));
        } catch (err) {
            console.error('Error al cargar detalles para edición:', err);
            filasDetalle.value = [nuevaFila()];
        }
    };

    const handleConfirmDelete = (data: any): void => {
        deleteItemName.value = `Producción ${data.sucursal_nombre || ''} · ${data.turno_nombre || ''} · ${data.fecha_produccion || ''}`;
        confirmDelete(data);
    };

    // ============ GRID DE DETALLES EN FORMULARIO PRINCIPAL ============
    const agregarFilaDetalle = (): void => {
        filasDetalle.value.push(nuevaFila());
    };

    const quitarFilaDetalle = (idx: number): void => {
        if (filasDetalle.value.length <= 1) {
            notify('warn', 'Acción no permitida', 'Debe haber al menos un vacuno en el detalle.');
            return;
        }
        const fila = filasDetalle.value[idx];
        if (!fila) return; // TypeScript fix
        if (fila._persisted && fila.produccion_leche_detalle_id) {
            // Eliminar en backend inmediatamente
            confirmarEliminarFilaPersistida(idx);
            return;
        }
        filasDetalle.value.splice(idx, 1);
    };

    const confirmarEliminarFilaPersistida = async (idx: number): Promise<void> => {
        const fila = filasDetalle.value[idx];
        if (!fila || !fila.produccion_leche_detalle_id || !formObj.value.produccion_leche_id) return; // TypeScript fix
        try {
            await $api(`/producciones-leche/${formObj.value.produccion_leche_id}/detalles/${fila.produccion_leche_detalle_id}`, { method: 'DELETE' });
            filasDetalle.value.splice(idx, 1);
            notify('success', 'Eliminado', 'Vacuno eliminado del detalle.');
            invalidarCacheDetalles(Number(formObj.value.produccion_leche_id));
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo eliminar el vacuno.';
            notify('error', 'Error al eliminar', Array.isArray(rawMsg) ? rawMsg[0] : rawMsg);
        }
    };

    // ============ DIALOG DETALLE INDIVIDUAL (desde expansión) ============
    const abrirDetalleDialog = (produccion: any): void => {
        detalleProduccionActual.value = produccion;
        detalleEditando.value = null;
        detalleForm.value = { vacuno_id: null, litros: null, observaciones: '' };
        detalleDialog.value = true;
    };

    const editarDetalle = (produccion: any, detalle: any): void => {
        detalleProduccionActual.value = produccion;
        detalleEditando.value = detalle;
        detalleForm.value = {
            vacuno_id: Number(detalle.vacuno_id),
            litros: Number(detalle.litros),
            observaciones: detalle.observaciones ?? '',
        };
        detalleDialog.value = true;
    };

    const guardarDetalle = async (): Promise<void> => {
        const prod = detalleProduccionActual.value;
        if (!prod) return;
        if (!detalleForm.value.vacuno_id) return notify('warn', 'Campos incompletos', 'Seleccione un vacuno.');
        if (detalleForm.value.litros === '' || detalleForm.value.litros == null) return notify('warn', 'Campos incompletos', 'Los litros son obligatorios.');
        const litros = Number(detalleForm.value.litros);
        if (!Number.isFinite(litros) || litros < 0) return notify('warn', 'Litros inválidos', 'Debe ser mayor o igual a 0.');
        if ((detalleForm.value.observaciones || '').length > 500) return notify('warn', 'Observaciones muy largas', 'Máximo 500 caracteres.');

        loadingDetalleDialog.value = true;
        try {
            const payload = {
                vacuno_id: Number(detalleForm.value.vacuno_id),
                litros: Number(litros.toFixed(2)),
                observaciones: detalleForm.value.observaciones?.trim() || undefined,
            };
            if (detalleEditando.value) {
                // Solo se envían litros y observaciones en update
                await $api(`/producciones-leche/${prod.produccion_leche_id}/detalles/${detalleEditando.value.produccion_leche_detalle_id}`, {
                    method: 'PATCH',
                    body: { litros: payload.litros, observaciones: payload.observaciones },
                });
                notify('success', 'Actualizado', 'Vacuno actualizado correctamente.');
            } else {
                await $api(`/producciones-leche/${prod.produccion_leche_id}/detalles`, {
                    method: 'POST',
                    body: payload,
                });
                notify('success', 'Agregado', 'Vacuno agregado correctamente.');
            }
            detalleDialog.value = false;
            invalidarCacheDetalles(Number(prod.produccion_leche_id));
            await onSearch();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar el vacuno.';
            notify('error', 'Error al guardar', Array.isArray(rawMsg) ? rawMsg[0] : rawMsg);
        } finally {
            loadingDetalleDialog.value = false;
        }
    };

    const eliminarDetalle = async (produccion: any, detalle: any): Promise<void> => {
        if (!confirm(`¿Eliminar el vacuno ${detalle.vacuno_arete || ''} de esta producción?`)) return;
        try {
            await $api(`/producciones-leche/${produccion.produccion_leche_id}/detalles/${detalle.produccion_leche_detalle_id}`, { method: 'DELETE' });
            notify('success', 'Eliminado', 'Vacuno eliminado correctamente.');
            invalidarCacheDetalles(Number(produccion.produccion_leche_id));
            await onSearch();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo eliminar el vacuno.';
            notify('error', 'Error al eliminar', Array.isArray(rawMsg) ? rawMsg[0] : rawMsg);
        }
    };

    // ============ SAVE PRINCIPAL ============
    const saveProduccion = async (): Promise<void> => {
        submitted.value = true;

        // Validaciones cabecera
        if (!empresaSeleccionadaId.value) return notify('warn', 'Campos incompletos', 'Debe seleccionar una empresa.');
        if (!formObj.value.sucursal_id) return notify('warn', 'Campos incompletos', 'La sucursal es obligatoria.');
        if (!formObj.value.turno_ordeno_id) return notify('warn', 'Campos incompletos', 'El turno de ordeño es obligatorio.');
        if (!formObj.value.fecha_produccion) return notify('warn', 'Campos incompletos', 'La fecha de producción es obligatoria.');
        if (formObj.value.fecha_produccion > hoyLocal.value) return notify('warn', 'Fecha inválida', 'La fecha de producción no puede ser futura.');

        // Validaciones detalles
        if (filasDetalle.value.length === 0) return notify('warn', 'Sin vacunos', 'Debe agregar al menos un vacuno al detalle.');
        for (let i = 0; i < filasDetalle.value.length; i++) {
            const f = filasDetalle.value[i];
            if (!f) continue; // TypeScript fix
            if (!f.vacuno_id) return notify('warn', 'Vacuno faltante', `Fila #${i + 1}: seleccione un vacuno.`);
            if (f.litros === '' || f.litros == null) return notify('warn', 'Litros faltantes', `Fila #${i + 1}: los litros son obligatorios.`);
            const l = Number(f.litros);
            if (!Number.isFinite(l) || l < 0) return notify('warn', 'Litros inválidos', `Fila #${i + 1}: litros deben ser ≥ 0.`);
        }

        // Validar duplicados de vacuno
        const vacunosIds = filasDetalle.value.map(f => Number(f.vacuno_id));
        const duplicados = vacunosIds.filter((id, i) => vacunosIds.indexOf(id) !== i);
        if (duplicados.length > 0) {
            return notify('warn', 'Vacunos duplicados', `No se puede registrar el mismo vacuno dos veces: ${[...new Set(duplicados)].join(', ')}`);
        }

        // Validaciones volumen
        const litros = totalLitrosCalculado.value;
        const desc = Number(formObj.value.total_descartado ?? 0);
        if (!Number.isFinite(desc) || desc < 0) return notify('warn', 'Descartado inválido', 'Debe ser mayor o igual a 0.');
        if (desc > litros) return notify('warn', 'Volumen incoherente', 'El total descartado no puede superar el total de litros.');

        // Validaciones calidad
        const temp = formObj.value.temperatura_promedio;
        if (temp !== '' && temp != null) {
            const t = Number(temp);
            if (!Number.isFinite(t) || t < -10 || t > 50) return notify('warn', 'Temperatura inválida', 'Debe estar entre -10 y 50 °C.');
        }
        const dens = formObj.value.densidad_promedio;
        if (dens !== '' && dens != null) {
            const d = Number(dens);
            if (!Number.isFinite(d) || d < 1 || d > 1.1) return notify('warn', 'Densidad inválida', 'Debe estar entre 1.0000 y 1.1000 g/mL.');
        }
        if ((formObj.value.observaciones || '').length > 1000) return notify('warn', 'Observaciones muy largas', 'Máximo 1000 caracteres.');

        loading.value = true;
        try {
            if (isUpdate.value) {
                // ── EDICIÓN: PATCH cabecera + operaciones sobre detalles ──
                const prodId = Number(formObj.value.produccion_leche_id);

                // 1) PATCH cabecera
                await $api(`/producciones-leche/${prodId}`, {
                    method: 'PATCH',
                    body: {
                        total_descartado: Number(desc.toFixed(2)),
                        temperatura_promedio: temp !== '' && temp != null ? Number(temp) : null,
                        densidad_promedio: dens !== '' && dens != null ? Number(dens) : null,
                        observaciones: formObj.value.observaciones?.trim() || null,
                    },
                });

                // 2) Detalles: nuevos (POST), editados (PATCH), eliminados (DELETE)
                const idsPersistidosOriginales = new Set<number>();
                const resActual: any = await $api(`/producciones-leche/${prodId}`, { method: 'GET' });
                (resActual?.detalles ?? []).forEach((d: any) => idsPersistidosOriginales.add(Number(d.produccion_leche_detalle_id)));

                const idsEnFormulario = new Set<number>();
                for (const f of filasDetalle.value) {
                    if (f._persisted && f.produccion_leche_detalle_id) {
                        idsEnFormulario.add(Number(f.produccion_leche_detalle_id));
                        await $api(`/producciones-leche/${prodId}/detalles/${f.produccion_leche_detalle_id}`, {
                            method: 'PATCH',
                            body: {
                                litros: Number(Number(f.litros).toFixed(2)),
                                observaciones: f.observaciones?.trim() || undefined,
                            },
                        });
                    } else {
                        await $api(`/producciones-leche/${prodId}/detalles`, {
                            method: 'POST',
                            body: {
                                vacuno_id: Number(f.vacuno_id),
                                litros: Number(Number(f.litros).toFixed(2)),
                                observaciones: f.observaciones?.trim() || undefined,
                            },
                        });
                    }
                }

                // DELETE de los que ya no están
                for (const oldId of idsPersistidosOriginales) {
                    if (!idsEnFormulario.has(oldId)) {
                        await $api(`/producciones-leche/${prodId}/detalles/${oldId}`, { method: 'DELETE' });
                    }
                }
            } else {
                // ── CREACIÓN: un solo POST con cabecera + detalles ──
                await $api('/producciones-leche', {
                    method: 'POST',
                    body: {
                        sucursal_id: Number(formObj.value.sucursal_id),
                        turno_ordeno_id: Number(formObj.value.turno_ordeno_id),
                        fecha_produccion: formObj.value.fecha_produccion,
                        total_descartado: Number(desc.toFixed(2)),
                        temperatura_promedio: temp !== '' && temp != null ? Number(temp) : null,
                        densidad_promedio: dens !== '' && dens != null ? Number(dens) : null,
                        observaciones: formObj.value.observaciones?.trim() || undefined,
                        detalles: filasDetalle.value.map(f => ({
                            vacuno_id: Number(f.vacuno_id),
                            litros: Number(Number(f.litros).toFixed(2)),
                            observaciones: f.observaciones?.trim() || undefined,
                        })),
                    },
                });
            }

            notify('success', isUpdate.value ? 'Actualizado' : 'Creado', 'Producción guardada correctamente.');
            if (isUpdate.value) invalidarCacheDetalles(Number(formObj.value.produccion_leche_id));
            lazyParams.value.first = 0;
            await onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar la producción.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;
            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear', firstError);
            console.error('Error al guardar producción de leche:', err);
        } finally {
            loading.value = false;
        }
    };

    // ============ HELPERS ============
    const formatNumber = (v: any): string => {
        if (v == null || v === '') return '0.00';
        const n = Number(v);
        if (!Number.isFinite(n)) return '0.00';
        return n.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'fecha_produccion', header: 'FECHA / TURNO', template: 'body-fecha_produccion', sortable: true, class: 'w-44' },
        { field: 'sucursal_nombre', header: 'UBICACIÓN', template: 'body-ubicacion', sortable: true, class: 'w-52' },
        { field: 'total_vacunos', header: 'VACUNOS', template: 'body-vacunos', sortable: false, class: 'w-20', bodyClass: '!text-center' },
        { field: 'total_litros', header: 'LITROS', template: 'body-litros', sortable: true, class: 'w-32', bodyClass: '!text-right lg:!text-center' },
        { field: 'total_neto', header: 'NETO', template: 'body-total_neto', sortable: true, class: 'w-28', bodyClass: '!text-right lg:!text-center' },
        { field: 'temperatura_promedio', header: 'CALIDAD', template: 'body-calidad', sortable: false, class: 'w-32', bodyClass: '!text-right lg:!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center acciones-col', style: 'width: 90px; min-width: 90px; max-width: 90px;', headerClass: '!text-center', bodyClass: '!text-center !px-0 !min-w-[90px]' },
    ];

    // ============ FILTROS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.turno_ordeno_id) count++;
        if (filters.value.fecha_produccion_desde) count++;
        if (filters.value.fecha_produccion_hasta) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        const desde = filters.value.fecha_produccion_desde;
        const hasta = filters.value.fecha_produccion_hasta;
        if (desde && hasta && desde > hasta) {
            notify('warn', 'Rango de fechas inválido', 'La fecha "desde" no puede ser mayor que "hasta".');
            return;
        }
        if (filters.value.sucursal_id && filters.value.empresa_id) {
            const suc = sucursalesAllOptions.value.find(s => s.value === filters.value.sucursal_id);
            if (suc?.empresa_id !== Number(filters.value.empresa_id)) {
                notify('warn', 'Filtros incoherentes', 'La sucursal no pertenece a la empresa seleccionada.');
                return;
            }
        }
        lazyParams.value.first = 0;
        onSearch();
    };

    const onFilterChange = (): void => { lazyParams.value.first = 0; onSearch(); };

    const limpiarFiltros = (): void => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.turno_ordeno_id = null;
        filters.value.fecha_produccion_desde = '';
        filters.value.fecha_produccion_hasta = '';
        sucursalesFilterOptions.value = sucursalesAllOptions.value;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ WATCH: normalizar al abrir ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;
        await nextTick();
        setTimeout(() => {
            if (formObj.value.sucursal_id != null) formObj.value.sucursal_id = Number(formObj.value.sucursal_id);
            if (formObj.value.turno_ordeno_id != null) formObj.value.turno_ordeno_id = Number(formObj.value.turno_ordeno_id);
            formObj.value.total_descartado = Number(formObj.value.total_descartado ?? 0);

            const sucId = formObj.value.sucursal_id;
            if (sucId) {
                const suc = sucursalesAllOptions.value.find((s) => s.value === sucId);
                if (suc?.empresa_id && suc.empresa_id !== empresaSeleccionadaId.value) {
                    empresaSeleccionadaId.value = suc.empresa_id;
                    onEmpresaFormChange();
                }
            }
        }, 150);
    });

    // ============ FOCUS ============
    const sucursalRef = ref<any>(null);
    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = sucursalRef.value?.$el as HTMLElement | null;
            if (!el) return;
            const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
            trigger?.click();
        }, 350);
    };

    // ============ WATCH: recargar vacunos al cambiar sucursal ============
    watch(() => formObj.value.sucursal_id, async (newSucursalId, oldSucursalId) => {
        if (!dialog.value || newSucursalId === oldSucursalId) return;

        // 1. Limpiar selección anterior si no están persistidos
        if (filasDetalle.value.length > 0) {
            filasDetalle.value.forEach(fila => {
                if (!fila._persisted) {
                    fila.vacuno_id = null;
                    fila.litros = null;
                    fila._touched = false;
                }
            });
        }

        // 2. Pasarle la nueva sucursal al cargador
        await cargarVacunos(Number(newSucursalId));
    });

    // ============ INIT ============
    onMounted(async () => {
        await Promise.all([cargarEmpresas(), cargarSucursales(), cargarTurnos()]);

        if (filters.value.empresa_id) {
            sucursalesFilterOptions.value = sucursalesAllOptions.value.filter(
                (s) => s.empresa_id === Number(filters.value.empresa_id)
            );
        }

        lazyParams.value.sortField = 'produccion_leche_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
