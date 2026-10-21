<!-- C:\sistemas\sicab\sicab-frontend\app\pages\personal\trabajadores\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-users" title="Trabajadores" subtitle="Gestión de personal de la empresa"
        :show-action="permisos.crear" action-label="NUEVO TRABAJADOR" action-icon="pi pi-plus" @action="openNew">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: Nombre, DNI, apodo, celular..."
                        :active-filters-count="filtrosActivosCount" modal-title="Filtrar Trabajadores"
                        modal-subtitle="Refina la búsqueda de personal" @search="onSearch" @clear="limpiarFiltros"
                        @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- ═══ FILA 1: Cargo + Género ═══ -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Cargo
                                </label>
                                <BaseSelect v-model="filters.cargo_id" :options="cargoOptions" option-label="label"
                                    option-value="value" placeholder="Todos los cargos" size="sm" filter show-clear
                                    appendTo="body"
                                    :loading="loadingCargos"
                                    v-tooltip.top="'Filtra los trabajadores por su cargo activo actual.'"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Género
                                </label>
                                <BaseSelect v-model="filters.genero_id" :options="generoOptions" option-label="label"
                                    option-value="value" placeholder="Todos los géneros" size="sm" show-clear
                                    appendTo="body"
                                    v-tooltip.top="'Filtra por género del trabajador (Masculino/Femenino).'"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <!-- ═══ FILA 2: Empresa + Sucursal ═══ -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Empresa
                                </label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear
                                    appendTo="body"
                                    :loading="loadingEmpresas"
                                    v-tooltip.top="'Al seleccionar una empresa se filtran las sucursales disponibles.'"
                                    @update:model-value="onEmpresaChange" class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Sucursal
                                </label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingSucursales"
                                    v-tooltip.top="'Sucursales disponibles según la empresa seleccionada.'"
                                    @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-nombre_completo="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary uppercase">
                        {{ data.trabajador_nombre_completo }}
                    </span>
                    <span v-if="data.apodo" class="cell-secondary">
                        <span class="font-bold">ALIAS:</span> {{ data.apodo }}
                    </span>
                </div>
            </template>

            <template #body-dni="{ data }">
                <div class="flex items-center justify-end gap-2">
                    <span class="cell-code">{{ data.dni }}</span>
                    <BaseButton icon="pi pi-ellipsis-v" variant="ghost-purple" size="sm" v-tooltip.top="'Más opciones'"
                        @click="openOptionsMenu($event, data)" />
                </div>
            </template>

            <template #body-telefono="{ data }">
                <div class="cell-stack">
                    <span v-if="data.telefono" class="cell-primary">
                        <i class="pi pi-phone text-[9px] mr-1"></i>{{ data.telefono }}
                    </span>
                    <span v-if="data.celular" class="cell-secondary">
                        <i class="pi pi-mobile text-[9px] mr-1"></i>{{ data.celular }}
                    </span>
                </div>
            </template>

            <template #body-cargo="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.cargo || '—' }}</span>
                    <span v-if="data.cargo_codigo" class="cell-secondary">
                        <span class="font-bold">CÓDIGO:</span> {{ data.cargo_codigo }}
                    </span>
                </div>
            </template>

            <template #body-categoria_licencia="{ data }">
                <span class="cell-primary">
                    {{ data.categoria_licencia_label || data.categoria_licencia }}
                </span>
            </template>

            <template #body-sucursal="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal }}</span>
                    <span v-if="data.empresa" class="cell-secondary">
                        {{ data.empresa }}
                    </span>
                </div>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" @edit="edit(data)"
                    @toggle="toggleEstado(data)" @delete="confirmDelete(data)" />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-with-photo">
                        <!-- Foto -->
                        <div class="expansion-photo">
                            <img v-if="data.foto" :src="data.foto" :alt="data.trabajador_nombre_completo"
                                @error="onImageError($event)" />
                            <div v-else
                                class="w-24 h-28 rounded-xl bg-slate-100 flex items-center justify-center border border-blue-500">
                                <i class="pi pi-user text-blue-400 text-3xl"></i>
                            </div>
                        </div>

                        <!-- Grid de datos -->
                        <div class="expansion-grid">
                            <div class="expansion-item">
                                <span class="expansion-label">Correo:</span>
                                <span class="expansion-value">{{ data.email || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Dirección:</span>
                                <span class="expansion-value">{{ data.direccion || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Género:</span>
                                <span class="expansion-value">{{ data.genero_label || data.genero }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Estado Civil:</span>
                                <span class="expansion-value">{{ data.estado_civil }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Fecha Nacimiento:</span>
                                <span class="expansion-value">{{ data.fecha_nacimiento || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Fecha Contratación:</span>
                                <span class="expansion-value">{{ data.fecha_contratacion || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Garante:</span>
                                <span class="expansion-value" :title="data.garante">{{ data.garante || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Puntaje Acumulado:</span>
                                <span class="expansion-value">{{ data.puntaje_acumulado ?? 0 }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Último Cálculo:</span>
                                <span class="expansion-value">{{ data.fecha_ultimo_calculo_puntaje || '—' }}</span>
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
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CREAR / EDITAR ═══════════ -->
    <Dialog v-model:visible="dialog" :modal="true" :closable="!loading"
        class="custom-modal crud-celeste-dialog w-[95vw] sm:w-[90vw] md:w-[1100px] lg:w-[1150px]"
        :style="{ maxHeight: '92vh' }" @show="focusNombres">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-user text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
                <div class="panel-contrast">
                    <div
                        class="flex justify-between items-center mb-3 text-blue-700 uppercase tracking-wider font-black text-xs">
                        <span>Datos Personales</span>
                        <span class="text-slate-600 normal-case font-bold text-[10px]">
                            Campos obligatorios <span class="text-red-500">*</span>
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                        <!-- Género -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Género <span class="text-red-500">*</span>
                            </label>
                            <BaseSelect ref="generoSelectRef" v-model="formObj.genero_id" :options="generoOptions"
                                option-label="label" option-value="value" placeholder="Seleccionar..." size="sm"
                                :disabled="estaProtegido('genero_id') && !authStore.isAdmin"
                                @update:model-value="onGeneroChange" />
                            <small v-if="estaProtegido('genero_id') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.genero_id) && $rules.seleccionObligatoria()(formObj.genero_id) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                Requerido
                            </small>
                        </div>

                        <!-- Estado Civil -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Estado Civil <span class="text-red-500">*</span>
                            </label>
                            <BaseSelect v-model="formObj.estado_civil_id" :options="estadoCivilOptions"
                                option-label="label" option-value="value" placeholder="Seleccionar..." size="sm"
                                :disabled="estaProtegido('estado_civil_id') && !authStore.isAdmin"
                                @update:model-value="touched.estado_civil_id = true" />
                            <small v-if="estaProtegido('estado_civil_id') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.estado_civil_id) && $rules.seleccionObligatoria()(formObj.estado_civil_id) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                Requerido
                            </small>
                        </div>

                        <!-- Apodo -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Apodo <span class="text-red-500">*</span>
                            </label>
                            <BaseInput v-model="formObj.apodo" :maxlength="80" size="sm" placeholder=""
                                :disabled="estaProtegido('apodo') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('apodo') && !authStore.isAdmin }"
                                @blur="touched.apodo = true" />
                            <small v-if="estaProtegido('apodo') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.apodo) && !formObj.apodo?.trim()"
                                class="text-red-500 font-semibold text-[10px]">
                                El apodo es obligatorio
                            </small>
                            <small
                                v-else-if="(submitted || touched.apodo) && formObj.apodo?.trim() && $rules.longitudMinima(3)(formObj.apodo) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.longitudMinima(3)(formObj.apodo) }}
                            </small>
                        </div>

                        <!-- Nombres -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Nombres <span class="text-red-500">*</span>
                            </label>
                            <BaseInput ref="nombresRef" v-model="formObj.nombres" :maxlength="150" size="sm"
                                placeholder="" :disabled="estaProtegido('nombres') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('nombres') && !authStore.isAdmin }"
                                @blur="touched.nombres = true" />
                            <small v-if="estaProtegido('nombres') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.nombres) && !formObj.nombres?.trim()"
                                class="text-red-500 font-semibold text-[10px]">
                                Los nombres son obligatorios
                            </small>
                            <small
                                v-else-if="(submitted || touched.nombres) && formObj.nombres?.trim() && $rules.longitudMinima(3)(formObj.nombres) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.longitudMinima(3)(formObj.nombres) }}
                            </small>
                        </div>

                        <!-- Apellido Paterno -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Apellido Paterno <span class="text-red-500">*</span>
                            </label>
                            <BaseInput v-model="formObj.paterno" :maxlength="80" size="sm" placeholder=""
                                :disabled="estaProtegido('paterno') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('paterno') && !authStore.isAdmin }"
                                @blur="touched.paterno = true" />
                            <small v-if="estaProtegido('paterno') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.paterno) && !formObj.paterno?.trim()"
                                class="text-red-500 font-semibold text-[10px]">
                                El apellido paterno es obligatorio
                            </small>
                            <small
                                v-else-if="(submitted || touched.paterno) && formObj.paterno?.trim() && $rules.longitudMinima(3)(formObj.paterno) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.longitudMinima(3)(formObj.paterno) }}
                            </small>
                        </div>

                        <!-- Apellido Materno -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Apellido Materno
                            </label>
                            <BaseInput v-model="formObj.materno" :maxlength="80" size="sm" placeholder=""
                                :disabled="estaProtegido('materno') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('materno') && !authStore.isAdmin }"
                                @blur="touched.materno = true" />
                            <small v-if="estaProtegido('materno') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.materno) && formObj.materno && $rules.longitudMinima(3)(formObj.materno) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.longitudMinima(3)(formObj.materno) }}
                            </small>
                        </div>

                        <!-- Categoría Licencia -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Categoría Licencia <span class="text-red-500">*</span>
                            </label>
                            <BaseSelect v-model="formObj.categoria_licencia_id" :options="categoriaLicenciaOptions"
                                option-label="label" option-value="value" placeholder="Seleccionar..." size="sm"
                                :disabled="estaProtegido('categoria_licencia_id') && !authStore.isAdmin"
                                @update:model-value="touched.categoria_licencia_id = true" />
                            <small v-if="estaProtegido('categoria_licencia_id') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.categoria_licencia_id) && $rules.seleccionObligatoria()(formObj.categoria_licencia_id) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                Requerido
                            </small>
                        </div>

                        <!-- DNI -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                DNI <span class="text-red-500">*</span>
                            </label>
                            <BaseInput v-model="formObj.dni" :maxlength="20" size="sm" placeholder=""
                                :disabled="estaProtegido('dni') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('dni') && !authStore.isAdmin }"
                                @blur="touched.dni = true" />
                            <small v-if="estaProtegido('dni') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.dni) && $rules.dni()(formObj.dni) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.dni()(formObj.dni) }}
                            </small>
                        </div>

                        <!-- Email -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Correo Electrónico
                            </label>
                            <BaseInput v-model="formObj.email" :maxlength="100" size="sm" placeholder=""
                                @blur="touched.email = true" />
                            <small
                                v-if="(submitted || touched.email) && formObj.email && $rules.formatoCorreo()(formObj.email) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.formatoCorreo()(formObj.email) }}
                            </small>
                        </div>

                        <!-- Fecha Nacimiento -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Fecha Nacimiento
                            </label>
                            <BaseInput v-model="formObj.fecha_nacimiento" type="date" size="sm" :max="today" />
                        </div>

                        <!-- Fecha Contratación -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Fecha Contratación
                            </label>
                            <BaseInput v-model="formObj.fecha_contratacion" type="date" size="sm" :max="today" />
                        </div>

                        <!-- Garante -->
                        <div class="md:col-span-4">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Garante
                            </label>
                            <BaseInput v-model="formObj.garante" :maxlength="3000" size="sm"
                                placeholder="Nombre, teléfono, dirección y relación del garante" />
                        </div>

                        <!-- Dirección -->
                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Dirección
                            </label>
                            <BaseInput v-model="formObj.direccion" :maxlength="255" size="sm" placeholder="" />
                        </div>

                        <!-- Sucursal -->
                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Sucursal <span class="text-red-500">*</span>
                            </label>
                            <BaseSelect ref="sucursalSelectRef" v-model="formObj.sucursal_id" :options="sucursalOptions"
                                option-label="label" option-value="value" placeholder="Seleccionar sucursal..."
                                size="sm" filter :loading="loadingSucursales"
                                :disabled="estaProtegido('sucursal_id') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('sucursal_id') && !authStore.isAdmin }"
                                @update:model-value="touched.sucursal_id = true" />
                            <small v-if="estaProtegido('sucursal_id') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.sucursal_id) && $rules.obligatoria()(formObj.sucursal_id) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                Requerido
                            </small>
                        </div>

                        <!-- Teléfono -->
                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Teléfono
                            </label>
                            <BaseInput v-model="formObj.telefono" :maxlength="100" size="sm" placeholder=""
                                @blur="touched.telefono = true" />
                        </div>

                        <!-- Celular -->
                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Celular
                            </label>
                            <BaseInput v-model="formObj.celular" :maxlength="100" size="sm" placeholder=""
                                @blur="touched.celular = true" />
                        </div>
                    </div>
                </div>

                <!-- Panel de foto -->
                <div class="panel-contrast flex flex-col gap-5">
                    <span class="block text-xs font-black text-blue-700 uppercase tracking-wider">
                        Fotografía del Trabajador
                    </span>

                    <div class="flex flex-col items-center gap-3">
                        <div
                            class="relative !h-44 !w-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                            <img v-if="fotoPreview" :src="fotoPreview" class="w-full h-full object-cover" />
                            <div v-else class="flex flex-col items-center justify-center gap-1 text-slate-400">
                                <i class="pi pi-user text-2xl"></i>
                                <span class="text-[10px] font-semibold">Sin foto</span>
                            </div>
                        </div>

                        <input ref="fotoInput" type="file" class="hidden" :accept="acceptFoto" @change="onFotoChange" />

                        <div class="flex gap-2 justify-center">
                            <BaseButton :label="fotoPreview ? 'Cambiar' : 'Cargar Foto'" icon="pi pi-upload"
                                variant="success" size="sm" @click="abrirSelectorFoto" />
                        </div>

                        <div class="info-panel !p-2 w-full">
                            <span class="info-panel-title">Requisitos</span>
                            <ul class="info-panel-list !text-[9px]">
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Peso máx: <b>{{ fotoConfig?.maxSizeKB ?? '—' }} KB</b></span>
                                </li>
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Formatos: <b>{{ fotoConfig?.formats ?? '—' }}</b></span>
                                </li>
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Dimensiones: <b>{{ fotoConfig?.maxWidth ?? '—' }} × {{ fotoConfig?.maxHeight
                                            ??
                                            '—' }} px</b></span>
                                </li>
                                <li class="info-panel-item info-panel-item-file">
                                    <i class="pi pi-file"></i>
                                    <span class="truncate">
                                        Archivo:
                                        <b class="truncate">{{ nombreArchivoFoto || '—' }}</b>
                                    </span>
                                </li>
                            </ul>
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
                    variant="primary" @click="saveTrabajador" />
            </div>
        </template>
    </Dialog>

    <!-- ═══════════ DIALOG ELIMINAR ═══════════ -->
    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Trabajador" :item-name="deleteItemName"
        @confirm="deleteItem" />

    <!-- ═══════════ MENÚ DE OPCIONES ═══════════ -->
    <RowOptionsMenu ref="optionsMenuRef" :model="menuItems" />

    <!-- ═══════════ DIALOG CAMBIO DE CARGO ═══════════ -->
    <Dialog v-model:visible="cambioCargoDialog" :modal="true" :closable="!cambioCargoSaving"
        class="custom-modal crud-celeste-dialog w-[95vw] sm:w-[90vw] md:w-[560px] lg:w-[560px]"
        :style="{ maxHeight: '90vh' }" @hide="cerrarDialogCambioCargo">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-briefcase text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">Cambio de Cargo</h3>
                    <p class="text-xs text-sky-700">
                        {{ cambioCargoTrabajador?.trabajador_nombre_completo }}
                        · DNI {{ cambioCargoTrabajador?.dni }}
                    </p>
                </div>
            </div>
        </template>

        <div class="flex flex-col gap-4">
            <!-- Panel: Cargo actual -->
            <div class="panel-contrast flex items-center justify-between gap-4 py-2.5">
                <span class="text-[11px] font-black text-blue-700 uppercase tracking-wider whitespace-nowrap">
                    Cargo Actual
                </span>
                <span class="text-sm font-bold text-slate-700 truncate text-right">
                    {{ cargoActualLabel }}
                </span>
            </div>

            <!-- Panel: Nuevo cargo -->
            <div class="panel-contrast">
                <div
                    class="flex justify-between items-center mb-3 text-blue-700 uppercase tracking-wider font-black text-xs">
                    <span>Nuevo Cargo</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Cargo nuevo <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="cambioCargoForm.cargo_id" :options="cargoOptionsFiltradas"
                            option-label="label" option-value="value" placeholder="Seleccionar cargo..." size="sm"
                            filter show-clear @update:model-value="onCargoCambioChange" />
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sueldo base
                            <span class="text-slate-400 font-normal normal-case">(opcional)</span>
                        </label>
                        <BaseInput v-model.number="cambioCargoForm.sueldo_base" type="number" :min="0" size="sm"
                            placeholder="Heredar del cargo" />
                        <small class="text-slate-400 text-[10px] leading-tight block mt-0.5">
                            Déjalo vacío para heredar el sueldo del cargo seleccionado.
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo moneda <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="cambioCargoForm.tipo_moneda_id" :options="tipoMonedaOptions"
                            option-label="label" option-value="value" placeholder="Seleccionar..." size="sm" />
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Fecha desde <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="cambioCargoForm.fecha_desde" type="date" size="sm" />
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Observaciones
                        </label>
                        <textarea v-model="cambioCargoForm.observaciones" :maxlength="500" rows="3"
                            placeholder="Motivo del cambio: ascenso, reasignación, etc."
                            class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] px-3 py-2 text-xs transition-all focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100 resize-none"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" variant="danger" :disabled="cambioCargoSaving"
                    @click="cerrarDialogCambioCargo" />
                <BaseButton label="Guardar Cambio" icon="pi pi-save" variant="primary" :loading="cambioCargoSaving"
                    :disabled="cambioCargoSaving || cambioCargoLoading" @click="guardarCambioCargo" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, onMounted, nextTick } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import { Genero, GENERO_METADATA, EstadoCivilMasculino, ESTADO_CIVIL_MASCULINO_METADATA, EstadoCivilFemenino, ESTADO_CIVIL_FEMENINO_METADATA, CategoriaLicencia, CATEGORIA_LICENCIA_METADATA, TipoMoneda, TIPO_MONEDA_METADATA, ESTADO_ACTIVO } from '~/constants/estados.constant';
    import type { RowOptionItem } from '~/components/crud/RowOptionsMenu.vue';

    useHead({ title: 'Trabajadores' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    interface CargoOptionItem extends OptionItem {
        sueldo_base: number;
        tipo_moneda_id: number;
    }

    // ============ DEPENDENCIAS ============
    const authStore = useAuthStore();
    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { validate: validateImage, getConfigDisplay } = useImageValidator();

    // ============ CONSTANTES ============
    const today = new Date().toISOString().slice(0, 10);
    const empresaIdInicial: number | null = Number(authStore.user?.empresa_id) || null;
    const sucursalIdInicial: number | null = Number(authStore.user?.sucursal_id) || null;

    // ============ OPCIONES DERIVADAS DE CONSTANTES ============
    const generoOptions: OptionItem[] = Object.values(Genero)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = GENERO_METADATA[id as Genero];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const estadoCivilMasculinoOptions: OptionItem[] = Object.values(EstadoCivilMasculino)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = ESTADO_CIVIL_MASCULINO_METADATA[id as EstadoCivilMasculino];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const estadoCivilFemeninoOptions: OptionItem[] = Object.values(EstadoCivilFemenino)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = ESTADO_CIVIL_FEMENINO_METADATA[id as EstadoCivilFemenino];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const categoriaLicenciaOptions: OptionItem[] = Object.values(CategoriaLicencia)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = CATEGORIA_LICENCIA_METADATA[id as CategoriaLicencia];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const tipoMonedaOptions: OptionItem[] = Object.values(TipoMoneda)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_MONEDA_METADATA[id as TipoMoneda];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    // ============ ESTADO DE CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const sucursalOptions = shallowRef<OptionItem[]>([]);
    const cargoOptions = shallowRef<CargoOptionItem[]>([]);
    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingCargos = ref(false);

    // ============ CARGA DE EMPRESAS ============
    const cargarEmpresas = async (): Promise<void> => {
        loadingEmpresas.value = true;
        try {
            const res: any = await $api('/empresas', {
                method: 'GET',
                params: { limit: 1000, sortField: 'empresa', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            empresaOptions.value = lista.map((e: any): OptionItem => ({
                label: `${e.empresa}`,
                value: Number(e.empresa_id),
            }));
        } catch (err) {
            console.error('Error al cargar empresas:', err);
            empresaOptions.value = [];
        } finally {
            loadingEmpresas.value = false;
        }
    };

    // ============ CARGA DE SUCURSALES ============
    const cargarSucursales = async (empresaId?: number | null): Promise<void> => {
        loadingSucursales.value = true;
        try {
            const idEmpresa = empresaId ?? empresaIdInicial;
            const res: any = await $api('/sucursales', {
                method: 'GET',
                params: {
                    limit: 100,
                    sortField: 'sucursal',
                    sortOrder: 1,
                    estado_id: ESTADO_ACTIVO,
                    ...(idEmpresa ? { empresa_id: idEmpresa } : {}),
                },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            sucursalOptions.value = lista.map((s: any): OptionItem => ({
                label: `${s.sucursal}`,
                value: Number(s.sucursal_id),
            }));
        } catch (err) {
            console.error('Error al cargar sucursales:', err);
            sucursalOptions.value = [];
        } finally {
            loadingSucursales.value = false;
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
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog,
        toggleEstado, confirmDelete, deleteItem,
        resolvePK,
    } = useCrudTable<any>({
        tabla: 'trabajadores',
        sortFieldDefault: 'trabajador_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        // Coincide con FindTrabajadoresQueryDto.getCamposProtegidosConDependencias()
        camposProtegidosPorDependencia: [
            'dni', 'nombres', 'paterno', 'materno', 'apodo', 'sucursal_id',
        ],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: empresaIdInicial,
            sucursal_id: sucursalIdInicial,
            cargo_id: null,
            genero_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.cargo_id) extra.cargo_id = Number(f.cargo_id);
            if (f.genero_id) extra.genero_id = Number(f.genero_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.trabajador_id,

        getCleanForm: () => ({
            trabajador_id: null,
            sucursal_id: sucursalIdInicial,
            genero_id: Genero.MASCULINO,
            estado_civil_id: EstadoCivilMasculino.SOLTERO,
            categoria_licencia_id: CategoriaLicencia.NINGUNO,
            nombres: '',
            paterno: '',
            materno: '',
            apodo: '',
            dni: '',
            telefono: '',
            celular: '',
            direccion: '',
            email: '',
            fecha_nacimiento: '',
            fecha_contratacion: '',
            foto: '',
            qr: '',
            garante: '',
        }),

        // Construye el payload como en los ejemplos (AntecedentesCrud, Sucursales, etc.)
        buildPayload: (form: any) => {
            const payload: Record<string, any> = {
                sucursal_id: Number(form.sucursal_id),
                genero_id: Number(form.genero_id),
                estado_civil_id: Number(form.estado_civil_id),
                categoria_licencia_id: Number(form.categoria_licencia_id),
                nombres: form.nombres?.trim().toUpperCase(),
                paterno: form.paterno?.trim().toUpperCase(),
                apodo: form.apodo?.trim().toUpperCase(),
                dni: form.dni?.trim(),
            };

            if (form.materno?.trim()) payload.materno = form.materno.trim().toUpperCase();
            if (form.telefono?.trim()) payload.telefono = form.telefono.trim();
            if (form.celular?.trim()) payload.celular = form.celular.trim();
            if (form.direccion?.trim()) payload.direccion = form.direccion.trim();
            if (form.email?.trim()) payload.email = form.email.trim().toLowerCase();
            if (form.fecha_nacimiento) payload.fecha_nacimiento = form.fecha_nacimiento;
            if (form.fecha_contratacion) payload.fecha_contratacion = form.fecha_contratacion;
            if (form.garante?.trim()) payload.garante = form.garante.trim();

            return payload;
        },

        // Validaciones que replican CreateTrabajadorDto del backend
        validate: (form: any, rules: any, notify: any) => {
            // ── Género ──
            if (rules.seleccionObligatoria()(form.genero_id) !== true) {
                touched.value.genero_id = true;
                notify('warn', 'Género requerido', 'El género es obligatorio.');
                return false;
            }

            // ── Estado civil ──
            if (rules.seleccionObligatoria()(form.estado_civil_id) !== true) {
                touched.value.estado_civil_id = true;
                notify('warn', 'Estado civil requerido', 'El estado civil es obligatorio.');
                return false;
            }

            // ── Categoría licencia ──
            if (rules.seleccionObligatoria()(form.categoria_licencia_id) !== true) {
                touched.value.categoria_licencia_id = true;
                notify('warn', 'Licencia requerida', 'La categoría de licencia es obligatoria.');
                return false;
            }

            // ── Nombres ──
            if (!form.nombres?.trim()) {
                touched.value.nombres = true;
                notify('warn', 'Nombres requeridos', 'Los nombres son obligatorios.');
                return false;
            }
            if (rules.longitudMinima(3)(form.nombres) !== true) {
                touched.value.nombres = true;
                notify('warn', 'Nombres inválidos', rules.longitudMinima(3)(form.nombres));
                return false;
            }
            if (form.nombres.trim().length > 150) {
                touched.value.nombres = true;
                notify('warn', 'Nombres inválidos', 'Máximo 150 caracteres.');
                return false;
            }

            // ── Paterno ──
            if (!form.paterno?.trim()) {
                touched.value.paterno = true;
                notify('warn', 'Apellido paterno requerido', 'El apellido paterno es obligatorio.');
                return false;
            }
            if (rules.longitudMinima(3)(form.paterno) !== true) {
                touched.value.paterno = true;
                notify('warn', 'Paterno inválido', rules.longitudMinima(3)(form.paterno));
                return false;
            }
            if (form.paterno.trim().length > 80) {
                touched.value.paterno = true;
                notify('warn', 'Paterno inválido', 'Máximo 80 caracteres.');
                return false;
            }

            // ── Materno (opcional) ──
            if (form.materno?.trim()) {
                if (rules.longitudMinima(3)(form.materno) !== true) {
                    touched.value.materno = true;
                    notify('warn', 'Materno inválido', rules.longitudMinima(3)(form.materno));
                    return false;
                }
                if (form.materno.trim().length > 80) {
                    touched.value.materno = true;
                    notify('warn', 'Materno inválido', 'Máximo 80 caracteres.');
                    return false;
                }
            }

            // ── Apodo ──
            if (!form.apodo?.trim()) {
                touched.value.apodo = true;
                notify('warn', 'Apodo requerido', 'El apodo es obligatorio.');
                return false;
            }
            if (rules.longitudMinima(3)(form.apodo) !== true) {
                touched.value.apodo = true;
                notify('warn', 'Apodo inválido', rules.longitudMinima(3)(form.apodo));
                return false;
            }
            if (form.apodo.trim().length > 80) {
                touched.value.apodo = true;
                notify('warn', 'Apodo inválido', 'Máximo 80 caracteres.');
                return false;
            }

            // ── DNI ──
            if (!form.dni?.trim()) {
                touched.value.dni = true;
                notify('warn', 'DNI requerido', 'El DNI es obligatorio.');
                return false;
            }
            if (rules.dni()(form.dni) !== true) {
                touched.value.dni = true;
                notify('warn', 'DNI inválido', rules.dni()(form.dni));
                return false;
            }

            // ── Email (opcional) ──
            if (form.email?.trim() && rules.formatoCorreo()(form.email) !== true) {
                touched.value.email = true;
                notify('warn', 'Correo inválido', rules.formatoCorreo()(form.email));
                return false;
            }

            // ── Sucursal ──
            if (rules.obligatoria()(form.sucursal_id) !== true) {
                touched.value.sucursal_id = true;
                notify('warn', 'Sucursal requerida', 'Debe seleccionar una sucursal.');
                return false;
            }

            return true;
        },
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR TRABAJADOR' : 'NUEVO TRABAJADOR'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos personales y laborales'
            : 'Registro de datos personales y laborales'
    );

    // ============ ESTADO CIVIL REACTIVO ============
    const estadoCivilOptions = computed<OptionItem[]>(() => {
        if (Number(formObj.value?.genero_id) === Genero.FEMENINO) {
            return estadoCivilFemeninoOptions;
        }
        return estadoCivilMasculinoOptions;
    });

    // ============ FOTO ============
    const fotoInput = ref<HTMLInputElement | null>(null);
    const fotoFile = ref<File | null>(null);
    const fotoPreview = ref<string | null>(null);
    const fotoOriginal = ref<string | null>(null);
    const fotoConfig = ref<{
        maxSizeKB: number;
        maxWidth: number;
        maxHeight: number;
        formats: string;
        mimeTypes?: string[];
    } | null>(null);

    const nombreArchivoFoto = computed<string | null>(() => {
        if (fotoFile.value) return fotoFile.value.name;
        if (formObj.value.foto) {
            const partes = String(formObj.value.foto).split('/');
            return partes[partes.length - 1] || null;
        }
        return null;
    });

    const acceptFoto = computed<string | undefined>(() => {
        const mimes = fotoConfig.value?.mimeTypes;
        return mimes?.length ? mimes.join(',') : 'image/jpeg,image/jpg,image/png';
    });

    const abrirSelectorFoto = (): void => {
        fotoInput.value?.click();
    };

    const onFotoChange = async (event: Event): Promise<void> => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const result = await validateImage(file, 'foto_trabajador_config');
        if (!result.valid) {
            notify('warn', 'Imagen no válida', result.error || 'Archivo no permitido');
            target.value = '';
            return;
        }

        fotoFile.value = file;
        const reader = new FileReader();
        reader.onload = () => { fotoPreview.value = reader.result as string; };
        reader.readAsDataURL(file);
    };

    // ============ REACTIVIDAD GÉNERO ↔ ESTADO CIVIL ============
    const onGeneroChange = (): void => {
        const generoId = Number(formObj.value.genero_id);
        const estadoCivilId = Number(formObj.value.estado_civil_id);

        const esValidoParaGenero = generoId === Genero.MASCULINO
            ? estadoCivilMasculinoOptions.some(o => o.value === estadoCivilId)
            : estadoCivilFemeninoOptions.some(o => o.value === estadoCivilId);

        if (!esValidoParaGenero) {
            formObj.value.estado_civil_id = generoId === Genero.MASCULINO
                ? EstadoCivilMasculino.SOLTERO
                : EstadoCivilFemenino.SOLTERA;
        }
        touched.value.genero_id = true;
    };

    // ============ FOCUS INICIAL ============
    const nombresRef = ref<any>(null);
    const focusNombres = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const input = nombresRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ OVERRIDE openNew / edit ============
    const openNew = (): void => {
        openNewBase();
        fotoFile.value = null;
        fotoPreview.value = null;
        fotoOriginal.value = null;
        formObj.value.sucursal_id = sucursalIdInicial;
    };

    const edit = async (data: any): Promise<void> => {
        await editBase(data);

        // Normalizar tipos numéricos después del fetch del detalle
        formObj.value.sucursal_id = data.sucursal_id != null ? Number(data.sucursal_id) : null;
        formObj.value.genero_id = Number(data.genero_id);
        formObj.value.estado_civil_id = Number(data.estado_civil_id);
        formObj.value.categoria_licencia_id = Number(data.categoria_licencia_id);

        fotoOriginal.value = formObj.value.foto || null;
        fotoPreview.value = formObj.value.foto || null;
        fotoFile.value = null;
        if (fotoInput.value) fotoInput.value.value = '';

        // Asegurar que la sucursal esté en las opciones
        const sucursalId = formObj.value.sucursal_id;
        if (sucursalId && !sucursalOptions.value.some(o => o.value === sucursalId)) {
            sucursalOptions.value = [
                ...sucursalOptions.value,
                {
                    label: data.sucursal
                        ? `${data.sucursal_codigo ?? ''} — ${data.sucursal}`.trim()
                        : `Sucursal ${sucursalId}`,
                    value: Number(sucursalId),
                },
            ];
        }
    };

    // ============ SAVE CON FOTO (FormData) ============
    const saveConFoto = async (
        payload: Record<string, any>,
        file: File | null,
        id?: number | string | null,
    ): Promise<any> => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value as any);
            }
        });

        if (file) {
            formData.append('foto', file);
        }

        const url = id ? `/trabajadores/${id}` : '/trabajadores';
        const method = id ? 'PATCH' : 'POST';

        return $api(url, { method, body: formData });
    };

    const saveTrabajador = async (): Promise<void> => {
        submitted.value = true;

        // Ejecutar validaciones del composable (replican el DTO del backend)
        if (!validarTrabajador(formObj.value, $rules, notify)) return;

        // Validación adicional: foto obligatoria en creación
        if (!isUpdate.value && !fotoFile.value && !formObj.value.foto) {
            notify('warn', 'Foto requerida', 'Debe cargar una foto del trabajador.');
            return;
        }

        try {
            loading.value = true;

            // Construir payload (mismo que buildPayload del composable)
            const payload: Record<string, any> = {
                sucursal_id: Number(formObj.value.sucursal_id),
                genero_id: Number(formObj.value.genero_id),
                estado_civil_id: Number(formObj.value.estado_civil_id),
                categoria_licencia_id: Number(formObj.value.categoria_licencia_id),
                nombres: formObj.value.nombres?.trim().toUpperCase(),
                paterno: formObj.value.paterno?.trim().toUpperCase(),
                apodo: formObj.value.apodo?.trim().toUpperCase(),
                dni: formObj.value.dni?.trim(),
            };

            if (formObj.value.materno?.trim()) {
                payload.materno = formObj.value.materno.trim().toUpperCase();
            }
            if (formObj.value.telefono?.trim()) {
                payload.telefono = formObj.value.telefono.trim();
            }
            if (formObj.value.celular?.trim()) {
                payload.celular = formObj.value.celular.trim();
            }
            if (formObj.value.direccion?.trim()) {
                payload.direccion = formObj.value.direccion.trim();
            }
            if (formObj.value.email?.trim()) {
                payload.email = formObj.value.email.trim().toLowerCase();
            }
            if (formObj.value.fecha_nacimiento) {
                payload.fecha_nacimiento = formObj.value.fecha_nacimiento;
            }
            if (formObj.value.fecha_contratacion) {
                payload.fecha_contratacion = formObj.value.fecha_contratacion;
            }
            if (formObj.value.garante?.trim()) {
                payload.garante = formObj.value.garante.trim();
            }

            await saveConFoto(
                payload,
                fotoFile.value,
                isUpdate.value ? resolvePK(formObj.value) : null,
            );

            notify(
                'success',
                isUpdate.value ? 'Actualizado' : 'Creado',
                'El trabajador se guardó correctamente.',
            );

            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
            fotoFile.value = null;
            fotoPreview.value = null;
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo guardar el trabajador.';
            const mensajeFinal = Array.isArray(msg) ? msg[0] : msg;
            notify(
                'error',
                isUpdate.value ? 'Error al actualizar' : 'Error al crear',
                mensajeFinal,
            );
            console.error('Error al guardar trabajador:', err);
        } finally {
            loading.value = false;
        }
    };

    // Helper de validación para reutilizar en saveTrabajador
    const validarTrabajador = (form: any, rules: any, notify: any): boolean => {
        if (rules.seleccionObligatoria()(form.genero_id) !== true) {
            touched.value.genero_id = true;
            notify('warn', 'Género requerido', 'El género es obligatorio.');
            return false;
        }
        if (rules.seleccionObligatoria()(form.estado_civil_id) !== true) {
            touched.value.estado_civil_id = true;
            notify('warn', 'Estado civil requerido', 'El estado civil es obligatorio.');
            return false;
        }
        if (rules.seleccionObligatoria()(form.categoria_licencia_id) !== true) {
            touched.value.categoria_licencia_id = true;
            notify('warn', 'Licencia requerida', 'La categoría de licencia es obligatoria.');
            return false;
        }
        if (!form.nombres?.trim()) {
            touched.value.nombres = true;
            notify('warn', 'Nombres requeridos', 'Los nombres son obligatorios.');
            return false;
        }
        if (rules.longitudMinima(3)(form.nombres) !== true) {
            touched.value.nombres = true;
            notify('warn', 'Nombres inválidos', rules.longitudMinima(3)(form.nombres));
            return false;
        }
        if (!form.paterno?.trim()) {
            touched.value.paterno = true;
            notify('warn', 'Apellido paterno requerido', 'El apellido paterno es obligatorio.');
            return false;
        }
        if (rules.longitudMinima(3)(form.paterno) !== true) {
            touched.value.paterno = true;
            notify('warn', 'Paterno inválido', rules.longitudMinima(3)(form.paterno));
            return false;
        }
        if (form.materno?.trim() && rules.longitudMinima(3)(form.materno) !== true) {
            touched.value.materno = true;
            notify('warn', 'Materno inválido', rules.longitudMinima(3)(form.materno));
            return false;
        }
        if (!form.apodo?.trim()) {
            touched.value.apodo = true;
            notify('warn', 'Apodo requerido', 'El apodo es obligatorio.');
            return false;
        }
        if (rules.longitudMinima(3)(form.apodo) !== true) {
            touched.value.apodo = true;
            notify('warn', 'Apodo inválido', rules.longitudMinima(3)(form.apodo));
            return false;
        }
        if (!form.dni?.trim()) {
            touched.value.dni = true;
            notify('warn', 'DNI requerido', 'El DNI es obligatorio.');
            return false;
        }
        if (rules.dni()(form.dni) !== true) {
            touched.value.dni = true;
            notify('warn', 'DNI inválido', rules.dni()(form.dni));
            return false;
        }
        if (form.email?.trim() && rules.formatoCorreo()(form.email) !== true) {
            touched.value.email = true;
            notify('warn', 'Correo inválido', rules.formatoCorreo()(form.email));
            return false;
        }
        if (rules.obligatoria()(form.sucursal_id) !== true) {
            touched.value.sucursal_id = true;
            notify('warn', 'Sucursal requerida', 'Debe seleccionar una sucursal.');
            return false;
        }
        return true;
    };

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.cargo_id) count++;
        if (filters.value.genero_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.global = '';
        filters.value.exactMatch = 0;
        filters.value.empresa_id = empresaIdInicial;
        filters.value.sucursal_id = sucursalIdInicial;
        filters.value.cargo_id = null;
        filters.value.genero_id = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    const onEmpresaChange = async (): Promise<void> => {
        filters.value.sucursal_id = null;
        await cargarSucursales(filters.value.empresa_id ?? null);
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'trabajador_nombre_completo', header: 'TRABAJADOR', sortable: true, template: 'body-nombre_completo' },
        { field: 'dni', header: 'DNI', sortable: true, template: 'body-dni', bodyClass: '!text-center', class: 'w-28' },
        { field: 'telefono', header: 'TELÉFONO', sortable: true, template: 'body-telefono', class: 'w-32' },
        { field: 'cargo', header: 'CARGO', sortable: true, template: 'body-cargo', class: 'w-40' },
        { field: 'categoria_licencia_id', header: 'LICENCIA', sortable: true, template: 'body-categoria_licencia', bodyClass: '!text-center', class: 'w-32' },
        { field: 'sucursal', header: 'SUCURSAL', sortable: true, template: 'body-sucursal', class: 'w-48' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const nombre = formObj.value?.trabajador_nombre_completo
            ?? formObj.value?.nombre_completo
            ?? '';
        const dni = formObj.value?.dni ?? '';
        return nombre ? `${nombre} — DNI ${dni}` : `DNI ${dni}`;
    });

    const onImageError = (event: Event): void => {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
    };

    // ============ MENÚ DE OPCIONES ============
    const optionsMenuRef = ref<any>(null);
    const trabajadorSeleccionado = ref<any>(null);

    const menuItems = computed<RowOptionItem[]>(() => [
        {
            label: 'Hoja de Vida',
            icon: 'pi pi-id-card',
            iconColor: '#0ea5e9',
            command: () => irAHojaDeVida(),
        },
        {
            label: 'Antecedentes',
            icon: 'pi pi-list',
            iconColor: '#a855f7',
            command: () => irAAntecedentes(),
        },
        {
            label: 'Cambio de Cargo',
            icon: 'pi pi-briefcase',
            iconColor: '#f59e0b',
            command: () => abrirDialogCambioCargo(),
        },
    ]);

    const openOptionsMenu = (event: Event, trabajador: any) => {
        trabajadorSeleccionado.value = trabajador;
        optionsMenuRef.value?.toggle(event);
    };

    const cerrarOptionsMenu = () => {
        optionsMenuRef.value?.hide();
    };

    const irAHojaDeVida = () => {
        const id = trabajadorSeleccionado.value?.trabajador_id;
        cerrarOptionsMenu();
        if (!id) return;
        navigateTo(`/personal/trabajadores/${id}/hoja-de-vida`);
    };

    const irAAntecedentes = () => {
        const id = trabajadorSeleccionado.value?.trabajador_id;
        cerrarOptionsMenu();
        if (!id) return;
        navigateTo(`/personal/trabajadores/${id}/antecedentes`);
    };

    // ============ CAMBIO DE CARGO ============
    interface CambioCargoForm {
        cargo_id: number | null;
        sueldo_base: number;
        tipo_moneda_id: number;
        fecha_desde: string;
        observaciones: string;
    }

    const cambioCargoDialog = ref(false);
    const cambioCargoLoading = ref(false);
    const cambioCargoSaving = ref(false);
    const cambioCargoTrabajador = ref<any>(null);
    const cambioCargoActual = ref<any>(null);
    const cambioCargoForm = ref<CambioCargoForm>({
        cargo_id: null,
        sueldo_base: 0,
        tipo_moneda_id: TipoMoneda.BOLIVIANO,
        fecha_desde: new Date().toISOString().slice(0, 10),
        observaciones: '',
    });

    const cargoActualLabel = computed(() => {
        const c = cambioCargoActual.value;
        if (!c) return 'Sin cargo activo';
        const codigo = c.cargo_codigo ?? '';
        const nombre = c.cargo_nombre ?? '';
        return codigo ? `${nombre}` : nombre || 'Sin cargo activo';
    });

    // Excluye el cargo actual de las opciones para evitar el 409 del backend.
    const cargoOptionsFiltradas = computed<OptionItem[]>(() =>
        cargoOptions.value.filter(o => o.value !== Number(cambioCargoActual.value?.cargo_id))
    );

    const onCargoCambioChange = (): void => {
        const cargoId = cambioCargoForm.value.cargo_id;
        if (!cargoId) return;

        const cargo = cargoOptions.value.find(o => o.value === Number(cargoId));
        if (!cargo) return;

        // Auto-completar con los valores del cargo seleccionado
        cambioCargoForm.value.sueldo_base = cargo.sueldo_base;
        cambioCargoForm.value.tipo_moneda_id = cargo.tipo_moneda_id;
    };

    const cerrarDialogCambioCargo = () => {
        if (cambioCargoSaving.value) return;
        cambioCargoDialog.value = false;
        cambioCargoActual.value = null;
        cambioCargoTrabajador.value = null;
    };

    const guardarCambioCargo = async () => {
        if (!cambioCargoTrabajador.value?.trabajador_id) return;

        if (!cambioCargoForm.value.cargo_id) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar un cargo.');
            return;
        }
        if (!cambioCargoForm.value.tipo_moneda_id) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar un tipo de moneda.');
            return;
        }

        cambioCargoSaving.value = true;

        try {
            const payload: Record<string, any> = {
                trabajador_id: Number(cambioCargoTrabajador.value.trabajador_id),
                cargo_id: Number(cambioCargoForm.value.cargo_id),
                tipo_moneda_id: Number(cambioCargoForm.value.tipo_moneda_id),
            };

            const cargoSeleccionado = cargoOptions.value.find(
                o => o.value === Number(cambioCargoForm.value.cargo_id)
            );
            const sueldoForm = Number(cambioCargoForm.value.sueldo_base);
            const sueldoCargo = Number(cargoSeleccionado?.sueldo_base ?? 0);

            if (Number.isFinite(sueldoForm) && sueldoForm > 0 && sueldoForm !== sueldoCargo) {

                payload.sueldo_base = sueldoForm;
            }

            if (cambioCargoForm.value.fecha_desde) {
                payload.fecha_desde = cambioCargoForm.value.fecha_desde;
            }

            const obs = cambioCargoForm.value.observaciones?.trim();
            if (obs) payload.observaciones = obs;

            await $api('/trabajadores-cargos/cambiar-cargo', {
                method: 'POST',
                body: payload,
            });

            notify('success', 'Cargo actualizado', 'El cambio de cargo se registró correctamente.');

            cambioCargoDialog.value = false;
            cambioCargoActual.value = null;
            cambioCargoTrabajador.value = null;
            lazyParams.value.first = 0;
            onSearch();
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo cambiar el cargo.';
            notify('error', 'Error al cambiar cargo', Array.isArray(msg) ? msg.join(', ') : msg);
            console.error('Error al cambiar cargo:', err);
        } finally {
            cambioCargoSaving.value = false;
        }
    };

    const abrirDialogCambioCargo = async () => {
        const trabajador = trabajadorSeleccionado.value;
        cerrarOptionsMenu();
        if (!trabajador?.trabajador_id) return;

        cambioCargoTrabajador.value = trabajador;
        cambioCargoLoading.value = true;
        cambioCargoDialog.value = true;

        try {
            const res: any = await $api('/trabajadores-cargos', {
                method: 'GET',
                params: {
                    trabajador_id: Number(trabajador.trabajador_id),
                    estado_id: ESTADO_ACTIVO,
                    limit: 10,
                    sortField: 'trabajador_cargo_id',
                    sortOrder: -1,
                },
            });

            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            const actual = lista.find((c: any) => Number(c.estado_id) === ESTADO_ACTIVO) ?? null;

            cambioCargoActual.value = actual;
            cambioCargoForm.value = {
                cargo_id: null,
                sueldo_base: actual?.sueldo_base ?? 0,
                tipo_moneda_id: Number(actual?.tipo_moneda_id) || TipoMoneda.BOLIVIANO,
                fecha_desde: new Date().toISOString().slice(0, 10),
                observaciones: '',
            };
        } catch (err) {
            console.error('Error al cargar el cargo actual:', err);
            notify('error', 'Error', 'No se pudo cargar el cargo actual del trabajador.');
            cambioCargoDialog.value = false;
        } finally {
            cambioCargoLoading.value = false;
        }
    };

    // ============ INIT ============
    onMounted(async () => {
        fotoConfig.value = await getConfigDisplay('foto_trabajador_config');
        await Promise.all([
            cargarEmpresas(),
            cargarCargos(),
            cargarSucursales(),
        ]);

        lazyParams.value.sortField = 'trabajador_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
