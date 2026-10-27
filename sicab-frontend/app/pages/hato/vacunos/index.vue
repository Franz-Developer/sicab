<!-- C:\sistemas\sicab\sicab-frontend\app\pages\hato\vacunos\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-list" title="Registro de Vacunos" subtitle="Gestión del hato ganadero"
        :show-action="permisos.crear" action-label="NUEVO VACUNO" action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: arete, nombre, color..."
                        :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de vacunos"
                        modal-width="w-[95vw] md:w-[640px]" @search="onSearch" @clear="limpiarFiltros"
                        @apply="aplicarFiltros">
                        <template #advanced>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Arete</label>
                                <BaseInput v-model="filters.arete" placeholder="Ej: 000035" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresasOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalesOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sexo</label>
                                <BaseSelect v-model="filters.sexo_biologico_id" :options="sexoOptions"
                                    option-label="label" option-value="value" placeholder="Todos" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Prod. Leche</label>
                                <BaseSelect v-model="filters.es_productor_leche" :options="productorLecheOptions"
                                    option-label="label" option-value="value" placeholder="Todos" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Estado Animal</label>
                                <BaseSelect v-model="filters.estado_vacuno_id" :options="estadoVacunoOptions"
                                    option-label="label" option-value="value" placeholder="Todos" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Estado Registro</label>
                                <BaseSelect v-model="filters.estado_id" :options="estadosRegistroOptions"
                                    option-label="label" option-value="value" placeholder="Activos" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión Ingreso</label>
                                <BaseSelect v-model="filters.gestion_ingreso" :options="gestionesIngresoOptions"
                                    option-label="label" option-value="value" placeholder="Todos los años" size="sm"
                                    filter show-clear appendTo="body"
                                    empty-message="No hay gestiones de ingreso registradas"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión Nacimiento</label>
                                <BaseSelect v-model="filters.gestion_nacimiento" :options="gestionesNacimientoOptions"
                                    option-label="label" option-value="value" placeholder="Todos los años" size="sm"
                                    filter show-clear appendTo="body"
                                    empty-message="No hay gestiones de nacimiento registradas"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Ingreso Desde</label>
                                <BaseInput v-model="filters.fecha_ingreso_desde" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Ingreso Hasta</label>
                                <BaseInput v-model="filters.fecha_ingreso_hasta" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Nacimiento Desde</label>
                                <BaseInput v-model="filters.fecha_nacimiento_desde" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Nacimiento Hasta</label>
                                <BaseInput v-model="filters.fecha_nacimiento_hasta" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-arete="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.arete }}</span>
                    <span v-if="data.nombre" class="cell-secondary">
                        <span class="font-bold">NOMBRE:</span> {{ data.nombre }}
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

            <template #body-sexo="{ data }">
                <Tag :value="data.sexo_label || (Number(data.sexo_biologico_id) === SexoBiologico.MACHO ? 'MACHO' : 'HEMBRA')"
                    :severity="Number(data.sexo_biologico_id) === SexoBiologico.MACHO ? 'info' : 'warning'"
                    class="text-[10px] font-bold uppercase px-2" />
            </template>

            <template #body-categoria="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary text-[10px] font-bold uppercase leading-tight">
                        {{ data.categoria_vacuno_nombre || '—' }}
                    </span>
                    <span v-if="data.categoria_edad_min_meses != null || data.categoria_edad_max_meses != null"
                        class="text-[9px] text-slate-500 font-semibold">
                        {{ data.categoria_edad_min_meses ?? 0 }} - {{ data.categoria_edad_max_meses ?? '∞' }} meses
                    </span>
                </div>
            </template>

            <template #body-edad="{ data }">
                <span class="cell-primary-normal">{{ formatEdad(data.edad_anios, data.edad_meses) }}</span>
            </template>

            <template #body-peso_actual="{ data }">
                <span class="cell-primary-normal">
                    {{ data.peso_actual != null ? `${data.peso_actual} kg` : '—' }}
                </span>
            </template>

            <template #body-productor_leche="{ data }">
                <Tag :value="Number(data.es_productor_leche) === CondicionProductorLeche.PRODUCTOR ? 'SÍ' : 'NO'"
                    :severity="Number(data.es_productor_leche) === CondicionProductorLeche.PRODUCTOR ? 'success' : 'secondary'"
                    class="text-[10px] font-bold uppercase px-2" />
            </template>

            <template #body-estado-vacuno="{ data }">
                <Tag :value="data.estado_vacuno_label || '—'"
                    :severity="severityEstadoVacuno(Number(data.estado_vacuno_id))"
                    class="text-[10px] font-bold uppercase px-2" />
            </template>

            <template #body-acciones="{ data }">
                <div class="flex gap-0.5 justify-center">
                    <BaseButton
                        v-if="permisos.editar && Number(data.estado_id) === Estado.ACTIVO && transicionesDisponibles(Number(data.estado_vacuno_id)).length > 0"
                        icon="pi pi-sync" variant="ghost-amber" size="xs"
                        class="!p-0 !w-5 !h-5 flex items-center justify-center" @click="abrirDialogoEstado(data)"
                        v-tooltip.top="'Cambiar Estado'" />

                    <BaseButton
                        v-if="permisos.editar && Number(data.estado_id) === Estado.ACTIVO && !esEstadoFinal(Number(data.estado_vacuno_id))"
                        icon="pi pi-arrow-right-arrow-left" variant="ghost-sky" size="xs"
                        class="!p-0 !w-5 !h-5 flex items-center justify-center" @click="openTransfer(data)"
                        v-tooltip.top="'Transferir a otra sucursal'" />

                    <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                        @edit="edit(data)" @delete="confirmDelete(data)" />
                </div>
            </template>

            <!-- ═══════════ EXPANSIÓN (DETALLES) ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-with-photo">
                        <div class="expansion-photo">
                            <img v-if="data.foto" :src="data.foto" :alt="data.arete" @error="onImageError($event)" />
                            <div v-else
                                class="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center border border-blue-500">
                                <i class="pi pi-image text-blue-400 text-3xl"></i>
                            </div>
                        </div>

                        <div class="expansion-grid">
                            <!-- IDENTIFICACIÓN -->
                            <div class="expansion-item">
                                <span class="expansion-label">Raza:</span>
                                <span class="expansion-value">{{ data.raza_nombre || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Fecha Nacimiento:</span>
                                <span class="expansion-value">{{ data.fecha_nacimiento || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Fecha Ingreso:</span>
                                <span class="expansion-value">{{ data.fecha_ingreso || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Edad:</span>
                                <span class="expansion-value">{{ formatEdadDetallada(data.edad_anios, data.edad_meses) }}</span>
                            </div>

                            <!-- GENEALOGÍA -->
                            <div class="expansion-item md:col-span-2 mt-1">
                                <span class="expansion-label text-blue-700 border-b border-blue-200 pb-0.5 mb-1 block w-full">Genealogía</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Padre:</span>
                                <span class="expansion-value">
                                    <template v-if="data.padre_id > 1">
                                        {{ data.padre_arete }} - {{ data.padre_nombre }}
                                        <Tag v-if="data.padre_estado_label" :value="data.padre_estado_vacuno_label || data.padre_estado_label" size="small" :severity="data.padre_estado_id === 1000 ? 'success' : 'secondary'" class="ml-1 text-[9px] px-1 py-0" />
                                    </template>
                                    <span v-else class="text-slate-400 italic">No registrado</span>
                                </span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Madre:</span>
                                <span class="expansion-value">
                                    <template v-if="data.madre_id > 1">
                                        {{ data.madre_arete }} - {{ data.madre_nombre }}
                                        <Tag v-if="data.madre_estado_label" :value="data.madre_estado_vacuno_label || data.madre_estado_label" size="small" :severity="data.madre_estado_id === 1000 ? 'success' : 'secondary'" class="ml-1 text-[9px] px-1 py-0" />
                                    </template>
                                    <span v-else class="text-slate-400 italic">No registrado</span>
                                </span>
                            </div>

                            <!-- DATOS DE SALIDA -->
                            <template v-if="esEstadoFinal(Number(data.estado_vacuno_id))">
                                <div class="expansion-item md:col-span-2 mt-2">
                                    <span class="expansion-label text-red-600 border-b border-red-200 pb-0.5 mb-1 block w-full">Datos de Salida</span>
                                </div>
                                <div class="expansion-item">
                                    <span class="expansion-label text-red-600">Fecha Salida:</span>
                                    <span class="expansion-value font-semibold">{{ data.fecha_salida || '—' }}</span>
                                </div>
                                <div class="expansion-item">
                                    <span class="expansion-label text-red-600">Motivo Salida:</span>
                                    <span class="expansion-value">{{ data.motivo_salida || '—' }}</span>
                                </div>
                                <div class="expansion-item">
                                    <span class="expansion-label text-red-600">Peso Salida:</span>
                                    <span class="expansion-value">{{ data.peso_salida != null ? `${data.peso_salida} kg` : '—' }}</span>
                                </div>
                                <div class="expansion-item">
                                    <span class="expansion-label text-red-600">Precio Venta:</span>
                                    <span class="expansion-value">{{ data.precio_venta != null ? `Bs. ${data.precio_venta}` : '—' }}</span>
                                </div>
                                <div v-if="Number(data.estado_vacuno_id) === EstadoVacuno.MUERTO" class="expansion-item md:col-span-2">
                                    <span class="expansion-label text-red-600">Causa Muerte:</span>
                                    <span class="expansion-value">{{ data.causa_muerte || '—' }}</span>
                                </div>
                            </template>

                            <!-- OBSERVACIONES -->
                            <div class="expansion-item md:col-span-2 mt-2">
                                <span class="expansion-label text-amber-600">Observaciones:</span>
                                <span class="expansion-value font-semibold text-slate-700" :title="data.observaciones || '—'">
                                    {{ data.observaciones || 'Sin observaciones registradas.' }}
                                </span>
                            </div>

                            <!-- AUDITORÍA -->
                            <div class="expansion-item md:col-span-2 mt-2">
                                <span class="expansion-label text-slate-400 border-b border-slate-200 pb-0.5 mb-1 block w-full">Auditoría</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Estado Registro:</span>
                                <span class="expansion-value">
                                    <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
                                </span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Registrado por:</span>
                                <span class="expansion-value">{{ data.usuario_operacion }} <span class="text-[10px] text-slate-500">({{ formatFecha12h(data.fecha_registro) }})</span></span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Últ. Actualización:</span>
                                <span class="expansion-value">{{ data.fecha_actualizacion ? formatFecha12h(data.fecha_actualizacion) : '—' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CRUD (EDITAR / NUEVO) ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[85vw] md:w-[720px] lg:w-[760px]"
        maxHeight="88vh" :modal="true" :closable="!loading" @show="focusFirstInput">

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

        <div class="space-y-4">
            <!-- SECCIÓN 1: IDENTIFICACIÓN -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>1. Identificación del Vacuno</span>
                    <span class="text-slate-600 normal-case font-bold text-[9px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <!-- Arete -->
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Arete</label>
                        <div v-if="!isUpdate"
                            class="flex items-center h-[32px] px-3 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800 font-semibold">
                            <i class="pi pi-info-circle mr-2 text-blue-500"></i>
                            Autogenerado por el sistema
                        </div>
                        <BaseInput v-else v-model="formObj.arete" size="sm" disabled
                            class="!bg-slate-100 !text-slate-500" />
                    </div>

                    <!-- Nombre (OBLIGATORIO) -->
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Nombre <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.nombre" :maxlength="150" size="sm" placeholder="Ej: La Vaca Lola" />
                        <small class="text-[9px] text-slate-500 mt-0.5 block">
                            Único entre vacunos activos
                        </small>
                    </div>

                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Color</label>
                        <BaseInput v-model="formObj.color" :maxlength="50" size="sm" />
                    </div>

                    <!-- Fechas y sexo -->
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Fecha Ingreso <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.fecha_ingreso" type="date" size="sm" :max="getTodayLocal()"
                            :disabled="estaProtegido('fecha_ingreso')" />
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Fecha Nacimiento <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.fecha_nacimiento" type="date" size="sm" :max="getTodayLocal()"
                            :disabled="isUpdate || estaProtegido('fecha_nacimiento')" />
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Sexo <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.sexo_biologico_id" :options="sexoOptions" option-label="label"
                            option-value="value" size="sm" :disabled="estaProtegido('sexo_biologico_id')" />
                    </div>

                    <!-- Raza y categoría -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Raza <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.raza_id" :options="razasOptions" option-label="label"
                            option-value="value" size="sm" filter :disabled="estaProtegido('raza_id')" />
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Categoría</label>
                        <BaseSelect :model-value="formObj.categoria_vacuno_id" :options="categoriasOptions"
                            option-label="label" option-value="value" size="sm" filter disabled
                            class="!bg-slate-100 !text-slate-500"
                            v-tooltip.top="'Calculado automáticamente por el sistema según la edad y el sexo'" />
                    </div>

                    <!-- Progenitores por ID con búsqueda -->
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Padre</label>
                        <BaseSelect v-model="formObj.padre_id" :options="padresOptions" option-label="label"
                            option-value="value" size="sm" filter show-clear appendTo="body"
                            placeholder="Buscar padre por arete/nombre..." :loading="cargandoPadres"
                            @filter="buscarPadres" />
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Madre</label>
                        <BaseSelect v-model="formObj.madre_id" :options="madresOptions" option-label="label"
                            option-value="value" size="sm" filter show-clear appendTo="body"
                            placeholder="Buscar madre por arete/nombre..." :loading="cargandoMadres"
                            @filter="buscarMadres" />
                    </div>

                    <!-- Observaciones (Movido aquí, justo debajo de los padres) -->
                    <div class="md:col-span-12 mt-1">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Observaciones</label>
                        <textarea v-model="formObj.observaciones" rows="2" maxlength="1000"
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-2 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100 resize-none"
                            placeholder="Notas adicionales, incidencias o comentarios sobre el vacuno..."></textarea>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 2: VALORES PRODUCTIVOS -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>2. Datos Productivos</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Peso Nac.
                            (kg)</label>
                        <BaseInput v-model.number="formObj.peso_nacimiento" type="number" step="0.01" min="0"
                            size="sm" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Peso Act.
                            (kg)</label>
                        <BaseInput v-model.number="formObj.peso_actual" type="number" step="0.01" min="0" size="sm" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Valor Adq. (Bs) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.valor_adquisicion" type="number" step="0.01" min="0"
                            size="sm" :disabled="estaProtegido('valor_adquisicion')" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Valor Resid. (Bs) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.valor_residual" type="number" step="0.01" min="0" size="sm"
                            :disabled="estaProtegido('valor_residual')" />
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 3: UBICACIÓN -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>3. Ubicación</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2">
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Empresa <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="empresaSeleccionadaId" :options="empresasOptions" option-label="label"
                            option-value="value" size="sm" filter :disabled="isUpdate"
                            v-tooltip.top="isUpdate ? 'Use la acción Transferir para cambiar de sucursal/empresa' : ''"
                            @update:model-value="onEmpresaChange" />
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Sucursal <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.sucursal_id" :options="sucursalesFiltradasOptions"
                            option-label="label" option-value="value" size="sm" filter :disabled="isUpdate" />
                        <small v-if="isUpdate" class="text-[9px] text-amber-600 mt-0.5 block">
                            Para cambiar la sucursal, use la acción "Transferir".
                        </small>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 4: FOTOGRAFÍA (A lo ancho) -->
            <div class="panel-contrast !p-3">
                <span class="block text-[10px] font-black text-blue-700 uppercase tracking-wider mb-3">
                    Fotografía del Vacuno
                </span>

                <div class="flex flex-col md:flex-row items-center gap-4">
                    <div class="flex-1 w-full flex items-center justify-center">
                        <div class="dropzone cursor-pointer relative w-full max-w-[280px] h-[160px]"
                            @click="abrirSelectorFoto">
                            <img v-if="fotoPreview" :src="fotoPreview" class="w-full h-full object-contain" />
                            <div v-else class="dropzone-empty">
                                <i class="pi pi-image text-3xl"></i>
                                <span class="dropzone-hint">Sin foto</span>
                                <span class="dropzone-subhint">Click para cargar</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 w-full flex flex-col items-center gap-3">
                        <div class="info-panel !bg-white w-full">
                            <span class="info-panel-title">Requisitos de la foto</span>
                            <ul class="info-panel-list !min-h-0">
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Peso máximo: <b>{{ fotoConfig?.maxSizeKB ?? '—' }} KB</b></span>
                                </li>
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Formatos: <b>{{ fotoConfig?.formats ?? '—' }}</b></span>
                                </li>
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Dimensiones máximas: <b>{{ fotoConfig?.maxWidth ?? '—' }} × {{
                                            fotoConfig?.maxHeight ?? '—' }} px</b></span>
                                </li>
                                <li class="info-panel-item info-panel-item-file">
                                    <i class="pi pi-file"></i>
                                    <span class="truncate" :title="nombreArchivoFoto || '—'">
                                        Archivo: <b class="truncate">{{ nombreArchivoFoto || '—' }}</b>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div class="flex justify-center gap-2 w-full max-w-[280px]">
                            <input ref="fotoInput" type="file" class="hidden" :accept="acceptFoto"
                                :disabled="!puedeSubirFoto" @change="onFotoChange" />
                            <BaseButton :label="fotoPreview ? 'Cambiar' : 'Cargar Foto'" icon="pi pi-upload"
                                variant="foto-subir" size="sm" class="flex-1" @click="abrirSelectorFoto" />
                            <BaseButton v-if="isUpdate && formObj.foto" label="Quitar" icon="pi pi-trash"
                                variant="foto-quitar" size="sm" class="flex-1" @click="quitarFoto" />
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton :label="isUpdate ? 'Actualizar' : 'Guardar Registro'" icon="pi pi-save" :loading="loading"
                    variant="primary" @click="saveVacuno" />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIALOG CAMBIO DE ESTADO ═══════════ -->
    <BaseDialog v-model:visible="showEstadoDialog" dialogClass="" width="w-[95vw] sm:w-[500px]" maxHeight="85vh"
        :modal="true" :closable="!loadingEstado">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-amber-600 p-2 rounded-lg shadow">
                    <i class="pi pi-sync text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-amber-900 uppercase">Cambiar Estado del Vacuno</h3>
                    <p class="text-xs text-amber-700">Arete: <b>{{ vacunoEstado.arete }}</b></p>
                </div>
            </div>
        </template>

        <div class="space-y-4">
            <div class="panel-contrast !p-3">
                <div class="mb-3">
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                        Nuevo Estado <span class="text-red-500">*</span>
                    </label>
                    <BaseSelect v-model="formEstado.estado_vacuno_id" :options="estadosFiltradosOptions"
                        option-label="label" option-value="value" size="sm" class="w-full"
                        placeholder="Seleccione nuevo estado" />
                    <small class="text-[9px] text-slate-500 mt-1 block">
                        Solo se muestran las transiciones válidas desde el estado actual.
                    </small>
                </div>

                <div v-if="esEstadoFinal(Number(formEstado.estado_vacuno_id))"
                    class="bg-amber-50 p-3 rounded-xl border border-amber-200 flex flex-col gap-3 mt-3">
                    <p class="text-[11px] font-bold text-amber-800">
                        <i class="pi pi-exclamation-triangle mr-1"></i> Datos de salida requeridos
                    </p>

                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Fecha Salida <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formEstado.fecha_salida" type="date" size="sm" :max="getTodayLocal()" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Motivo Salida <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formEstado.motivo_salida" size="sm" />
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Peso Salida (kg) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formEstado.peso_salida" type="number" step="0.01" min="0" size="sm" />
                    </div>

                    <div v-if="Number(formEstado.estado_vacuno_id) === EstadoVacuno.VENDIDO ||
                              Number(formEstado.estado_vacuno_id) === EstadoVacuno.FAENADO">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Precio Venta (Bs) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formEstado.precio_venta" type="number" step="0.01" min="0" size="sm" />
                    </div>

                    <div v-if="Number(formEstado.estado_vacuno_id) === EstadoVacuno.MUERTO">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                            Causa Muerte <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formEstado.causa_muerte" size="sm" />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loadingEstado" variant="danger"
                    @click="showEstadoDialog = false" />
                <BaseButton label="Confirmar Cambio" icon="pi pi-check" :loading="loadingEstado" variant="primary"
                    @click="ejecutarCambioEstado" />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIALOG TRANSFERENCIA ═══════════ -->
    <BaseDialog v-model:visible="transferDialog" dialogClass="" width="w-[95vw] sm:w-[500px]" maxHeight="80vh"
        :modal="true" :closable="!loadingTransfer">

        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-amber-600 p-2 rounded-lg shadow">
                    <i class="pi pi-arrow-right-arrow-left text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-amber-900 uppercase">Transferir Vacuno</h3>
                    <p class="text-xs text-amber-700">Mover el vacuno {{ formObj.arete }} a otra sucursal</p>
                </div>
            </div>
        </template>

        <div class="space-y-4">
            <div class="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <i class="pi pi-info-circle text-amber-600 text-sm mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Conserva su arete
                    </p>
                    <p class="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                        El vacuno conservará su arete actual (<b>{{ formObj.arete }}</b>) y solo cambiará de sucursal.
                        La operación queda registrada en auditoría.
                    </p>
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Sucursal Actual</label>
                <div class="h-[32px] px-3 flex items-center bg-slate-100 border border-slate-300 rounded-lg text-[11px] text-slate-600 font-semibold">
                    <i class="pi pi-building mr-2 text-slate-400"></i>
                    {{ formObj.sucursal_nombre || '—' }} ({{ formObj.sucursal_codigo || '—' }})
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">
                    Sucursal de Destino <span class="text-red-500">*</span>
                </label>
                <BaseSelect v-model="transferSucursalId" :options="sucursalesDestinoOptions" option-label="label"
                    option-value="value" placeholder="Seleccione la sucursal destino" size="sm" filter appendTo="body"
                    class="w-full" />
                <small v-if="sucursalesDestinoOptions.length === 0" class="text-[10px] text-red-500 mt-1 block">
                    No hay otras sucursales disponibles en su empresa.
                </small>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Motivo (Opcional)</label>
                <textarea v-model="transferMotivo" rows="2" maxlength="500"
                    class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-1.5 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100"
                    placeholder="Razón de la transferencia (ej. Traslado por pastoreo)"></textarea>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loadingTransfer" variant="danger"
                    @click="transferDialog = false" />
                <BaseButton label="Transferir Vacuno" icon="pi pi-arrow-right-arrow-left" :loading="loadingTransfer"
                    variant="warning" :disabled="!transferSucursalId" @click="ejecutarTransferencia" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Vacuno" :item-name="formObj.arete || 'este vacuno'"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, onMounted, watch } from 'vue';
    import type { ImageConfigDisplay } from '~/composables/useImageValidator';
    import {
        SexoBiologico, CondicionProductorLeche, EstadoVacuno, Estado,
        SEXO_BIOLOGICO_METADATA, CONDICION_PRODUCTOR_LECHE_METADATA, ESTADO_VACUNO_METADATA,
        ESTADO_METADATA, ESTADOS_VACUNO_FINALES,
    } from '~/constants/estados.constant';
    import { getTodayLocal, formatFecha12h } from '~/utils/date';

    useHead({ title: 'Registro de Vacunos' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem { label: string; value: any; }
    interface RazaOption extends OptionItem { tipo_semoviente_id: number; }
    interface SucursalOption extends OptionItem { empresa_id: number; }
    interface CategoriaOption extends OptionItem { edad_min_meses: number | null; edad_max_meses: number | null; }
    interface VacunoBuscable extends OptionItem { arete: string; }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { validate: validateImage, getConfigDisplay } = useImageValidator();
    const authStore = useAuthStore();

    // ============ OPCIONES DINÁMICAS ============
    const empresasOptions = ref<OptionItem[]>([]);
    const sucursalesOptions = ref<SucursalOption[]>([]);
    const razasOptions = ref<RazaOption[]>([]);
    const categoriasOptions = ref<CategoriaOption[]>([]);

    const empresaSeleccionadaId = ref<number | null>(null);
    const sucursalesFiltradasOptions = ref<SucursalOption[]>([]);

    // Progenitores (búsqueda server-side)
    const padresOptions = ref<VacunoBuscable[]>([]);
    const madresOptions = ref<VacunoBuscable[]>([]);
    const cargandoPadres = ref(false);
    const cargandoMadres = ref(false);

    // ============ GESTIONES DISPONIBLES ============
    const gestionesIngreso = ref<number[]>([]);
    const gestionesNacimiento = ref<number[]>([]);

    const gestionesIngresoOptions = computed(() =>
        gestionesIngreso.value.map(g => ({ label: String(g), value: g }))
    );
    const gestionesNacimientoOptions = computed(() =>
        gestionesNacimiento.value.map(g => ({ label: String(g), value: g }))
    );

    const cargarGestiones = async (): Promise<void> => {
        try {
            const res = await $api('/vacunos/gestiones', { method: 'GET' });
            if (Array.isArray(res?.gestiones_ingreso)) gestionesIngreso.value = res.gestiones_ingreso;
            if (Array.isArray(res?.gestiones_nacimiento)) gestionesNacimiento.value = res.gestiones_nacimiento;
        } catch (error: any) {
            const msg = error?.data?.message || 'No se pudieron cargar las gestiones.';
            notify('error', 'Error al cargar gestiones', Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    // ============ OPCIONES DESDE CONSTANTES ============
    const sexoOptions = computed<OptionItem[]>(() =>
        Object.values(SEXO_BIOLOGICO_METADATA).map((m) => ({
            label: m.label || m.abreviatura,
            value: m.id,
        }))
    );

    const productorLecheOptions = computed<OptionItem[]>(() =>
        Object.values(CONDICION_PRODUCTOR_LECHE_METADATA).map((m) => ({
            label: m.label || m.abreviatura,
            value: m.id,
        }))
    );

    const estadoVacunoOptions = computed<OptionItem[]>(() =>
        Object.values(ESTADO_VACUNO_METADATA).map((m) => ({
            label: m.label || m.abreviatura,
            value: m.id,
        }))
    );

    // Estados de registro consultables (1000/1002)
    const estadosRegistroOptions = computed<OptionItem[]>(() =>
        [Estado.ACTIVO, Estado.HISTORICO].map((id) => ({
            label: ESTADO_METADATA[id]?.label ?? String(id),
            value: id,
        }))
    );

    // ============ HELPERS DE ESTADO VACUNO ============
    const esEstadoFinal = (id: number): boolean =>
        (ESTADOS_VACUNO_FINALES as readonly number[]).includes(Number(id));

    const severityEstadoVacuno = (id: number): string => {
        if (id === EstadoVacuno.ACTIVO) return 'success';
        if (id === EstadoVacuno.PARA_FAENA || id === EstadoVacuno.PARA_VENTA) return 'info';
        if (id === EstadoVacuno.FAENADO || id === EstadoVacuno.VENDIDO) return 'warning';
        if (id === EstadoVacuno.MUERTO) return 'danger';
        return 'secondary';
    };

    // Transiciones válidas según backend
    const transicionesDisponibles = (estadoActual: number): number[] => {
        switch (Number(estadoActual)) {
            case EstadoVacuno.ACTIVO:
                return [EstadoVacuno.PARA_FAENA, EstadoVacuno.PARA_VENTA, EstadoVacuno.MUERTO];
            case EstadoVacuno.PARA_FAENA:
                return [EstadoVacuno.FAENADO, EstadoVacuno.MUERTO];
            case EstadoVacuno.PARA_VENTA:
                return [EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO];
            default:
                return [];
        }
    };

    // ============ CARGA DE COMBOS ============
    const cargarCombos = async () => {
        try {
            const [resEmp, resSuc, resRazas] = await Promise.all([
                $api('/empresas', { params: { limit: 500 } }),
                $api('/sucursales', { params: { limit: 500 } }),
                $api('/razas', { params: { limit: 500 } }),
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

            razasOptions.value = (resRazas.data || []).map((r: any) => ({
                label: r.raza,
                value: Number(r.raza_id),
                tipo_semoviente_id: Number(r.tipo_semoviente_id),
            }));

            await cargarCategoriasFiltradas();
        } catch (error) {
            console.error('Error cargando combos:', error);
            notify('error', 'Error', 'No se pudieron cargar los catálogos auxiliares.');
        }
    };

    const cargarCategoriasFiltradas = async () => {
        if (!formObj.value.sexo_biologico_id) {
            categoriasOptions.value = [];
            return;
        }

        try {
            const params: Record<string, any> = {
                limit: 500,
                estado_id: Estado.ACTIVO,
                sexo_biologico_permitido_id: Number(formObj.value.sexo_biologico_id),
            };

            if (formObj.value.es_productor_leche != null) {
                params.es_productor_leche = Number(formObj.value.es_productor_leche);
            }

            const resCategorias = await $api('/categorias-vacuno', { params });

            categoriasOptions.value = (resCategorias.data || []).map((c: any) => {
                const min = c.edad_min_meses;
                const max = c.edad_max_meses;
                let edadTexto = '';

                if (min != null && max != null) edadTexto = ` (${min} - ${max} meses)`;
                else if (min != null) edadTexto = ` (${min}+ meses)`;
                else if (max != null) edadTexto = ` (Hasta ${max} meses)`;

                return {
                    label: `${c.categoria}${edadTexto}`,
                    value: Number(c.categoria_vacuno_id),
                    edad_min_meses: min != null ? Number(min) : null,
                    edad_max_meses: max != null ? Number(max) : null,
                };
            });

            const existe = categoriasOptions.value.some((c) => c.value === formObj.value.categoria_vacuno_id);
            if (!existe) formObj.value.categoria_vacuno_id = null;
        } catch (error) {
            console.error('Error cargando categorías filtradas:', error);
        }
    };

    const onEmpresaChange = () => {
        if (empresaSeleccionadaId.value) {
            sucursalesFiltradasOptions.value = sucursalesOptions.value.filter(
                (s) => s.empresa_id === empresaSeleccionadaId.value
            );
            const sucursalValida = sucursalesFiltradasOptions.value.some(
                (s) => s.value === formObj.value.sucursal_id
            );
            if (!sucursalValida) formObj.value.sucursal_id = null;
        } else {
            sucursalesFiltradasOptions.value = sucursalesOptions.value;
        }
    };

    // ============ BÚSQUEDA DE PROGENITORES (server-side) ============
    const buscarProgenitor = async (
        q: string,
        sexoId: number,
        excluirId: number | string | null,
        target: typeof padresOptions | typeof madresOptions,
        loadingRef: typeof cargandoPadres
    ) => {
        loadingRef.value = true;
        try {
            const sucursalFiltro = formObj.value.sucursal_id || authStore.user?.sucursal_id;

            const params: Record<string, any> = {
                limit: 30,
                estado_id: Estado.ACTIVO,
                sexo_biologico_id: sexoId,
                exactMatch: 0,
            };

            if (sucursalFiltro) {
                params.sucursal_id = Number(sucursalFiltro);
            }

            if (q?.trim()) params.q = q.trim();
            if (excluirId) params.excluir_id = excluirId;

            const res = await $api('/vacunos', { params });
            target.value = (res.data || []).map((v: any) => ({
                label: `${v.arete} — ${v.nombre}`,
                value: Number(v.vacuno_id),
                arete: v.arete,
            }));
        } catch (err) {
            console.error('Error buscando progenitores:', err);
        } finally {
            loadingRef.value = false;
        }
    };

    const buscarPadres = (event: { value: string }) => {
        const excluir = isUpdate.value ? Number(resolvePK(formObj.value)) : null;
        buscarProgenitor(event.value, SexoBiologico.MACHO, excluir, padresOptions, cargandoPadres);
    };

    const buscarMadres = (event: { value: string }) => {
        const excluir = isUpdate.value ? Number(resolvePK(formObj.value)) : null;
        buscarProgenitor(event.value, SexoBiologico.HEMBRA, excluir, madresOptions, cargandoMadres);
    };

    // ============ FORMATEADORES ============
    const formatEdad = (anios: number | null | undefined, mesesTotales: number | null | undefined): string => {
        if (mesesTotales == null) return '—';
        if (mesesTotales < 12) return `${mesesTotales} ${mesesTotales === 1 ? 'mes' : 'meses'}`;

        const y = anios ?? Math.floor(mesesTotales / 12);
        const m = mesesTotales % 12;

        let result = `${y} ${y === 1 ? 'año' : 'años'}`;
        if (m > 0) result += ` y ${m} ${m === 1 ? 'mes' : 'meses'}`;
        return result;
    };

    const formatEdadDetallada = (anios: number | null | undefined, mesesTotales: number | null | undefined): string => {
        if (mesesTotales == null) return '—';
        return `${mesesTotales} meses (${formatEdad(anios, mesesTotales)})`;
    };

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog,
        confirmDelete, deleteItem,
        resolvePK,
    } = useCrudTable<any>({
        tabla: 'vacunos',
        sortFieldDefault: 'vacuno_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: ['arete', 'raza_id', 'categoria_vacuno_id', 'fecha_nacimiento', 'sexo_biologico_id', 'tipo_semoviente_id'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            arete: null,
            empresa_id: null,
            sucursal_id: null,
            sexo_biologico_id: null,
            es_productor_leche: null,
            estado_vacuno_id: EstadoVacuno.ACTIVO,
            estado_id: null,
            fecha_ingreso_desde: null,
            fecha_ingreso_hasta: null,
            fecha_nacimiento_desde: null,
            fecha_nacimiento_hasta: null,
            gestion_ingreso: null,
            gestion_nacimiento: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.arete) extra.arete = String(f.arete).trim().toUpperCase();
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.sexo_biologico_id) extra.sexo_biologico_id = Number(f.sexo_biologico_id);
            if (f.es_productor_leche != null && f.es_productor_leche !== '') {
                extra.es_productor_leche = Number(f.es_productor_leche);
            }
            if (f.estado_vacuno_id) extra.estado_vacuno_id = Number(f.estado_vacuno_id);
            if (f.estado_id) extra.estado_id = Number(f.estado_id);
            if (f.fecha_ingreso_desde) extra.fecha_ingreso_desde = f.fecha_ingreso_desde;
            if (f.fecha_ingreso_hasta) extra.fecha_ingreso_hasta = f.fecha_ingreso_hasta;
            if (f.fecha_nacimiento_desde) extra.fecha_nacimiento_desde = f.fecha_nacimiento_desde;
            if (f.fecha_nacimiento_hasta) extra.fecha_nacimiento_hasta = f.fecha_nacimiento_hasta;
            if (f.gestion_ingreso) extra.gestion_ingreso = Number(f.gestion_ingreso);
            if (f.gestion_nacimiento) extra.gestion_nacimiento = Number(f.gestion_nacimiento);
            return extra;
        },

        getPrimaryKey: (item: any) => item.vacuno_id,
        buildPayload: (form: any) => form,

        getCleanForm: () => ({
            vacuno_id: null,
            sucursal_id: null,
            raza_id: null,
            categoria_vacuno_id: null,
            tipo_semoviente_id: null,
            nombre: '',
            fecha_nacimiento: '',
            fecha_ingreso: '',
            sexo_biologico_id: SexoBiologico.HEMBRA,
            peso_nacimiento: null,
            peso_actual: null,
            color: '',
            padre_id: null,
            madre_id: null,
            valor_adquisicion: null,
            valor_residual: null,
            valor_adquisicion_ufv: null,
            valor_residual_ufv: null,
            vida_util_anios: null,
            tasa_amortizacion: null,
            fecha_inicio_amortizacion: '',
            es_productor_leche: CondicionProductorLeche.NO_PRODUCTOR,
            estado_vacuno_id: EstadoVacuno.ACTIVO,
            observaciones: '',
            foto: null,
        }),

        validate: () => true,
    });

    // ============ TÍTULOS ============
    const tituloDialog = computed(() => (isUpdate.value ? 'EDITAR VACUNO' : 'NUEVO VACUNO'));
    const subtituloDialog = computed(() =>
        isUpdate.value ? 'Actualización de datos del hato' : 'Registro de nuevo vacuno'
    );

    // ============ ESTADO ADICIONAL (FOTO) ============
    const fotoInput = ref<HTMLInputElement | null>(null);
    const fotoFile = ref<File | null>(null);
    const fotoPreview = ref<string | null>(null);
    const fotoConfig = ref<ImageConfigDisplay | null>(null);
    const fotoEliminada = ref<boolean>(false);

    const abrirSelectorFoto = () => fotoInput.value?.click();

    const onFotoChange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const result = await validateImage(file, 'foto_vacuno_config');
        if (!result.valid) {
            notify('warn', 'Imagen no válida', result.error || 'Archivo no permitido');
            target.value = '';
            return;
        }

        fotoFile.value = file;
        fotoEliminada.value = false;
        const reader = new FileReader();
        reader.onload = () => { fotoPreview.value = reader.result as string; };
        reader.readAsDataURL(file);
    };

    const quitarFoto = () => {
        fotoFile.value = null;
        fotoPreview.value = null;
        fotoEliminada.value = true;
        if (fotoInput.value) fotoInput.value.value = '';
    };

    const nombreArchivoFoto = computed<string | null>(() => {
        if (fotoFile.value) return fotoFile.value.name;
        if (formObj.value.foto) {
            const partes = String(formObj.value.foto).split('/');
            return partes[partes.length - 1] || formObj.value.foto;
        }
        return null;
    });

    const acceptFoto = computed(() => fotoConfig.value?.mimeTypes?.join(',') || undefined);
    const puedeSubirFoto = computed(() => Boolean(fotoConfig.value));

    // ============ FOCUS ============
    const focusFirstInput = async () => {
        await nextTick();
        setTimeout(() => {
            const input = document.querySelector('input[placeholder="Ej: La Vaca Lola"]') as HTMLInputElement | null;
            input?.focus();
        }, 350);
    };

    // ============ OVERRIDES ============
    const openNew = () => {
        openNewBase();
        formObj.value.fecha_ingreso = getTodayLocal();

        if (authStore.user?.empresa_id) {
            empresaSeleccionadaId.value = Number(authStore.user.empresa_id);
            onEmpresaChange();
        }
        if (authStore.user?.sucursal_id) {
            formObj.value.sucursal_id = Number(authStore.user.sucursal_id);
        }

        fotoFile.value = null;
        fotoPreview.value = null;
        fotoEliminada.value = false;
        if (fotoInput.value) fotoInput.value.value = '';

        padresOptions.value = [];
        madresOptions.value = [];

        cargarCategoriasFiltradas();
    };

    const edit = async (data: any) => {
        // Forzamos un GET al backend para obtener los campos protegidos exactos
        const detalle = await $api(`/vacunos/${data.vacuno_id}`);
        await editBase(detalle);

        // Forzamos formateo ISO para los inputs date
        formObj.value.fecha_ingreso = formatearFechaISO(formObj.value.fecha_ingreso);
        formObj.value.fecha_nacimiento = formatearFechaISO(formObj.value.fecha_nacimiento);

        empresaSeleccionadaId.value = data.empresa_id ? Number(data.empresa_id) : null;
        onEmpresaChange();

        if (!formObj.value.tipo_semoviente_id && formObj.value.raza_id) {
            const raza = razasOptions.value.find((r) => r.value === Number(formObj.value.raza_id));
            if (raza) formObj.value.tipo_semoviente_id = raza.tipo_semoviente_id;
        }

        fotoPreview.value = formObj.value.foto || null;
        fotoFile.value = null;
        fotoEliminada.value = false;
        if (fotoInput.value) fotoInput.value.value = '';

        // Cargar opciones iniciales de progenitores, omitiendo el ID 1
        padresOptions.value = (formObj.value.padre_id && Number(formObj.value.padre_id) > 1)
            ? [{ label: detalle.padre_arete ? `${detalle.padre_arete} — ${detalle.padre_nombre || ''}`.trim() : `ID ${formObj.value.padre_id}`, value: Number(formObj.value.padre_id), arete: detalle.padre_arete || '' }]
            : [];

        madresOptions.value = (formObj.value.madre_id && Number(formObj.value.madre_id) > 1)
            ? [{ label: detalle.madre_arete ? `${detalle.madre_arete} — ${detalle.madre_nombre || ''}`.trim() : `ID ${formObj.value.madre_id}`, value: Number(formObj.value.madre_id), arete: detalle.madre_arete || '' }]
            : [];

        await cargarCategoriasFiltradas();
    };

    // ============ SAVE (FormData) ============
    const saveWithFoto = async (
        payload: Record<string, any>,
        file: File | null,
        id?: number | string | null,
        eliminarFoto = false
    ) => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value === undefined) return;
            if (value === null) {
                formData.append(key, '');
                return;
            }
            if (value === '') {
                formData.append(key, '');
                return;
            }
            if (value === false) {
                formData.append(key, '0');
                return;
            }
            formData.append(key, value as any);
        });

        if (file) {
            formData.append('foto', file);
        } else if (eliminarFoto) {
            formData.append('foto', '');
        }

        const url = id ? `/vacunos/${id}` : '/vacunos';
        const method = id ? 'PATCH' : 'POST';

        return $api(url, { method, body: formData });
    };

    const formatearFechaISO = (fechaStr: string | null | undefined): string | null => {
        if (!fechaStr) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) return fechaStr;
        const partes = fechaStr.split(/[/-]/);
        if (partes.length === 3) {
            const dia = partes[0] as string;
            const mes = partes[1] as string;
            const anio = partes[2] as string;
            if (anio.length === 4) return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
            else if (dia.length === 4) return `${dia}-${mes.padStart(2, '0')}-${anio.padStart(2, '0')}`;
        }
        const dateObj = new Date(fechaStr);
        return !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] ?? null : null;
    };

    const saveVacuno = async () => {
        submitted.value = true;

        // Validaciones frontend espejo del backend
        if (!formObj.value.nombre || !String(formObj.value.nombre).trim()) {
            return notify('warn', 'Campos incompletos', 'El nombre es obligatorio.');
        }
        if (String(formObj.value.nombre).trim().length < 2) {
            return notify('warn', 'Nombre inválido', 'El nombre debe tener al menos 2 caracteres.');
        }
        if (!formObj.value.sucursal_id) {
            return notify('warn', 'Campos incompletos', 'La sucursal es obligatoria.');
        }
        if (!formObj.value.raza_id) {
            return notify('warn', 'Campos incompletos', 'La raza es obligatoria.');
        }
        if (!formObj.value.fecha_ingreso) {
            return notify('warn', 'Campos incompletos', 'La fecha de ingreso es obligatoria.');
        }
        if (!formObj.value.fecha_nacimiento && !isUpdate.value) {
            return notify('warn', 'Campos incompletos', 'La fecha de nacimiento es obligatoria.');
        }
        if (formObj.value.valor_adquisicion == null && !isUpdate.value) {
            return notify('warn', 'Campos incompletos', 'El Valor de Adquisición es obligatorio.');
        }
        if (formObj.value.valor_residual == null && !isUpdate.value) {
            return notify('warn', 'Campos incompletos', 'El Valor Residual es obligatorio.');
        }

        if (Number(formObj.value.valor_residual) > Number(formObj.value.valor_adquisicion)) {
            return notify('warn', 'Valores incorrectos', 'El Valor Residual no puede ser mayor al Valor de Adquisición.');
        }

        const fechaIngresoLimpia = formatearFechaISO(formObj.value.fecha_ingreso);
        const fechaNacimientoLimpia = formatearFechaISO(formObj.value.fecha_nacimiento);

        // Coherencia de fechas (espejo backend)
        if (fechaIngresoLimpia && fechaNacimientoLimpia && fechaIngresoLimpia < fechaNacimientoLimpia) {
            return notify('warn', 'Fechas incorrectas', 'La fecha de ingreso no puede ser anterior a la de nacimiento.');
        }

        // Coherencia de pesos
        if (
            formObj.value.peso_nacimiento != null &&
            formObj.value.peso_actual != null &&
            Number(formObj.value.peso_actual) < Number(formObj.value.peso_nacimiento)
        ) {
            return notify('warn', 'Pesos incorrectos', 'El peso actual no puede ser menor que el peso de nacimiento.');
        }

        const razaSel = razasOptions.value.find((r) => r.value === Number(formObj.value.raza_id));
        if (!razaSel) {
            return notify('warn', 'Raza inválida', 'Seleccione una raza válida.');
        }
        formObj.value.tipo_semoviente_id = razaSel.tipo_semoviente_id;

        try {
            loading.value = true;

            // Limpiamos el payload de campos calculados por el backend
            const payload: Record<string, any> = {
                raza_id: formObj.value.raza_id,
                tipo_semoviente_id: formObj.value.tipo_semoviente_id,
                nombre: String(formObj.value.nombre).trim().toUpperCase(),
                fecha_ingreso: fechaIngresoLimpia,
                sexo_biologico_id: formObj.value.sexo_biologico_id,
                peso_nacimiento: formObj.value.peso_nacimiento,
                peso_actual: formObj.value.peso_actual,
                color: formObj.value.color ? String(formObj.value.color).trim().toUpperCase() : null,
                padre_id: formObj.value.padre_id ? Number(formObj.value.padre_id) : null,
                madre_id: formObj.value.madre_id ? Number(formObj.value.madre_id) : null,
                es_productor_leche: formObj.value.es_productor_leche,
                observaciones: formObj.value.observaciones,
            };

            if (!isUpdate.value) {
                payload.sucursal_id = formObj.value.sucursal_id;
                payload.fecha_nacimiento = fechaNacimientoLimpia;
                payload.valor_adquisicion = formObj.value.valor_adquisicion;
                payload.valor_residual = formObj.value.valor_residual;
            }

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;

            await saveWithFoto(payload, fotoFile.value, pk, fotoEliminada.value);

            notify('success', isUpdate.value ? 'Actualizado' : 'Creado', 'Registro guardado correctamente.');
            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? 'No se pudo guardar el vacuno.';
            let msg: string;
            if (Array.isArray(rawMsg)) msg = rawMsg[0] ?? 'Error al guardar.';
            else if (typeof rawMsg === 'object' && rawMsg !== null) msg = JSON.stringify(rawMsg);
            else msg = String(rawMsg);

            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear', msg);
            console.error('Error al guardar vacuno:', err);
        } finally {
            loading.value = false;
        }
    };

    // ============ CAMBIO DE ESTADO ============
    const showEstadoDialog = ref(false);
    const loadingEstado = ref(false);
    const vacunoEstado = ref<any>({});
    const formEstado = ref({
        estado_vacuno_id: null as number | null,
        fecha_salida: '',
        motivo_salida: '',
        peso_salida: null as number | null,
        precio_venta: null as number | null,
        causa_muerte: '',
    });

    // Solo transiciones válidas desde el estado actual
    const estadosFiltradosOptions = computed<OptionItem[]>(() => {
        const actual = Number(vacunoEstado.value.estado_vacuno_id);
        const permitidos = transicionesDisponibles(actual);
        return estadoVacunoOptions.value.filter((e) => permitidos.includes(Number(e.value)));
    });

    const abrirDialogoEstado = (data: any) => {
        vacunoEstado.value = data;
        formEstado.value = {
            estado_vacuno_id: null,
            fecha_salida: '',
            motivo_salida: '',
            peso_salida: null,
            precio_venta: null,
            causa_muerte: '',
        };
        showEstadoDialog.value = true;
    };

    const ejecutarCambioEstado = async () => {
        if (!formEstado.value.estado_vacuno_id) {
            return notify('warn', 'Faltan datos', 'Debe seleccionar un nuevo estado.');
        }

        const estado = Number(formEstado.value.estado_vacuno_id);

        // Validaciones espejo del backend
        if (esEstadoFinal(estado)) {
            if (!formEstado.value.fecha_salida) {
                return notify('warn', 'Faltan datos', 'La fecha de salida es obligatoria.');
            }
            if (!formEstado.value.motivo_salida || !String(formEstado.value.motivo_salida).trim()) {
                return notify('warn', 'Faltan datos', 'El motivo de salida es obligatorio.');
            }
            if (formEstado.value.peso_salida == null) {
                return notify('warn', 'Faltan datos', 'El peso de salida es obligatorio.');
            }
        }
        if (estado === EstadoVacuno.VENDIDO || estado === EstadoVacuno.FAENADO) {
            if (formEstado.value.precio_venta == null) {
                return notify('warn', 'Faltan datos', 'El precio de venta es obligatorio.');
            }
        }
        if (estado === EstadoVacuno.MUERTO) {
            if (!formEstado.value.causa_muerte || !String(formEstado.value.causa_muerte).trim()) {
                return notify('warn', 'Faltan datos', 'La causa de muerte es obligatoria.');
            }
        }

        // Fecha salida >= fecha ingreso
        const fechaSalida = formatearFechaISO(formEstado.value.fecha_salida);
        if (fechaSalida && vacunoEstado.value.fecha_ingreso && fechaSalida < vacunoEstado.value.fecha_ingreso) {
            return notify('warn', 'Fecha incorrecta', 'La fecha de salida no puede ser anterior a la de ingreso.');
        }

        try {
            loadingEstado.value = true;
            await $api(`/vacunos/${vacunoEstado.value.vacuno_id}/estado`, {
                method: 'PATCH',
                body: {
                    estado_vacuno_id: estado,
                    fecha_salida: fechaSalida,
                    motivo_salida: formEstado.value.motivo_salida
                        ? String(formEstado.value.motivo_salida).trim().toUpperCase()
                        : null,
                    peso_salida: formEstado.value.peso_salida != null ? Number(formEstado.value.peso_salida) : null,
                    precio_venta: formEstado.value.precio_venta != null ? Number(formEstado.value.precio_venta) : null,
                    causa_muerte: formEstado.value.causa_muerte
                        ? String(formEstado.value.causa_muerte).trim().toUpperCase()
                        : null,
                },
            });

            notify('success', 'Éxito', 'Estado actualizado correctamente.');
            showEstadoDialog.value = false;
            onSearch();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? err?.message ?? 'No se pudo cambiar el estado.';
            const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg;
            notify('error', 'Error al cambiar estado', msg);
        } finally {
            loadingEstado.value = false;
        }
    };

    // ============ TRANSFERENCIA ============
    const transferDialog = ref(false);
    const loadingTransfer = ref(false);
    const transferSucursalId = ref<number | null>(null);
    const transferMotivo = ref('');

    const sucursalesDestinoOptions = computed(() => {
        const sucursalActualId = Number(formObj.value.sucursal_id);
        const empresaId = empresaSeleccionadaId.value
            ? Number(empresaSeleccionadaId.value)
            : (authStore.user?.empresa_id ? Number(authStore.user.empresa_id) : null);

        return sucursalesOptions.value.filter((s) => {
            if (s.value === sucursalActualId) return false;
            if (empresaId && s.empresa_id !== empresaId) return false;
            return true;
        });
    });

    const openTransfer = (data: any) => {
        Object.assign(formObj.value, data);
        empresaSeleccionadaId.value = data.empresa_id ? Number(data.empresa_id) : empresaSeleccionadaId.value;
        transferSucursalId.value = null;
        transferMotivo.value = '';
        transferDialog.value = true;
    };

    const ejecutarTransferencia = async () => {
        if (!transferSucursalId.value) {
            return notify('warn', 'Faltan datos', 'Debe seleccionar una sucursal de destino.');
        }

        try {
            loadingTransfer.value = true;
            const pk = resolvePK(formObj.value);

            await $api(`/vacunos/${pk}/transferir`, {
                method: 'PATCH',
                body: {
                    sucursal_destino_id: Number(transferSucursalId.value),
                    motivo: transferMotivo.value?.trim() || null,
                },
            });

            notify('success', 'Transferencia Exitosa', `El vacuno ${formObj.value.arete} ha sido transferido correctamente.`);
            transferDialog.value = false;
            lazyParams.value.first = 0;
            onSearch();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? err?.message ?? 'No se pudo transferir el vacuno.';
            const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg;
            notify('error', 'Error al transferir', msg);
            console.error('Error en transferencia:', err);
        } finally {
            loadingTransfer.value = false;
        }
    };

    const onImageError = (event: Event) => {
        (event.target as HTMLImageElement).style.display = 'none';
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-8', bodyClass: '!text-center' },
        { field: 'arete', header: 'ARETE', template: 'body-arete', sortable: true, class: 'w-40' },
        { field: 'sucursal_nombre', header: 'UBICACIÓN', template: 'body-ubicacion', sortable: true },
        { field: 'sexo_biologico_id', header: 'SEXO', template: 'body-sexo', sortable: true, class: 'w-16', bodyClass: '!text-center' },
        { field: 'categoria_vacuno_id', header: 'CATEGORÍA', template: 'body-categoria', sortable: true, class: 'w-40', bodyClass: '!text-center' },
        { field: 'edad_meses', header: 'EDAD', template: 'body-edad', sortable: true, class: 'w-32', bodyClass: '!text-center' },
        { field: 'peso_actual', header: 'PESO ACT.', template: 'body-peso_actual', sortable: true, class: 'w-20', bodyClass: '!text-center' },
        { field: 'es_productor_leche', header: 'LECHE', template: 'body-productor_leche', sortable: true, class: 'w-16', bodyClass: '!text-center' },
        { field: 'estado_vacuno_id', header: 'ESTADO ANIMAL', template: 'body-estado-vacuno', sortable: true, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center w-28' },
    ];

    // ============ FILTROS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.arete) count++;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.sexo_biologico_id) count++;
        if (filters.value.es_productor_leche != null && filters.value.es_productor_leche !== '') count++;
        if (filters.value.estado_vacuno_id) count++;
        if (filters.value.estado_id) count++;
        if (filters.value.fecha_ingreso_desde) count++;
        if (filters.value.fecha_ingreso_hasta) count++;
        if (filters.value.fecha_nacimiento_desde) count++;
        if (filters.value.fecha_nacimiento_hasta) count++;
        if (filters.value.gestion_ingreso) count++;
        if (filters.value.gestion_nacimiento) count++;
        return count;
    });

    const aplicarFiltros = () => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = () => {
        filters.value.arete = null;
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.sexo_biologico_id = null;
        filters.value.es_productor_leche = null;
        filters.value.estado_vacuno_id = null;
        filters.value.estado_id = null;
        filters.value.fecha_ingreso_desde = null;
        filters.value.fecha_ingreso_hasta = null;
        filters.value.fecha_nacimiento_desde = null;
        filters.value.fecha_nacimiento_hasta = null;
        filters.value.gestion_ingreso = null;
        filters.value.gestion_nacimiento = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ WATCH: coherencia sexo ↔ productor de leche ============
    watch(
        () => [formObj.value.sexo_biologico_id, formObj.value.es_productor_leche],
        ([newSexo, newProductor]) => {
            if (
                Number(newSexo) === SexoBiologico.MACHO &&
                Number(newProductor) === CondicionProductorLeche.PRODUCTOR
            ) {
                formObj.value.es_productor_leche = CondicionProductorLeche.NO_PRODUCTOR;
                return;
            }

            if (dialog.value) {
                cargarCategoriasFiltradas().then(() => {
                    if (
                        Number(newProductor) === CondicionProductorLeche.PRODUCTOR &&
                        !formObj.value.categoria_vacuno_id
                    ) {
                        const categorias = categoriasOptions.value;
                        if (categorias?.length) {
                            const catLechera = categorias.find((c: CategoriaOption) =>
                                c.label.includes('LECHERA') || c.label.includes('LECHE')
                            );
                            formObj.value.categoria_vacuno_id = catLechera?.value ?? categorias[0]?.value ?? null;
                        }
                    }
                });
            }
        }
    );

    // ============ INIT ============
    onMounted(async () => {
        await cargarCombos();
        sucursalesFiltradasOptions.value = sucursalesOptions.value;

        fotoConfig.value = await getConfigDisplay('foto_vacuno_config');

        if (authStore.user?.empresa_id) filters.value.empresa_id = Number(authStore.user.empresa_id);
        if (authStore.user?.sucursal_id) filters.value.sucursal_id = Number(authStore.user.sucursal_id);

        cargarGestiones();

        lazyParams.value.sortField = 'vacuno_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;

        onSearch();
    });
</script>
