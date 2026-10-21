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
                        modal-width="w-[95vw] md:w-[450px]" @search="onSearch" @clear="limpiarFiltros"
                        @apply="aplicarFiltros">
                        <template #advanced>
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresasOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                            <div class="md:col-span-12">
                                <label
                                    class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
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
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Prod.
                                    Leche</label>
                                <BaseSelect v-model="filters.es_productor_leche" :options="productorLecheOptions"
                                    option-label="label" option-value="value" placeholder="Todos" size="sm" show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-arete="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.arete }}</span>
                    <span v-if="data.nombre" class="cell-secondary text-[10px]">{{ data.nombre }}</span>
                </div>
            </template>

            <template #body-ubicacion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre || '—' }}</span>
                    <span class="cell-secondary text-[9px]">{{ data.empresa_nombre || '—' }}</span>
                </div>
            </template>

            <template #body-sexo="{ data }">
                <Tag :value="data.sexo_label || (Number(data.sexo_biologico_id) === 6300 ? 'MACHO' : 'HEMBRA')"
                    :severity="Number(data.sexo_biologico_id) === 6300 ? 'info' : 'warning'"
                    class="text-[10px] font-bold uppercase px-2" />
            </template>

            <template #body-peso_actual="{ data }">
                <span class="cell-primary-normal">
                    {{ data.peso_actual != null ? `${data.peso_actual} kg` : '—' }}
                </span>
            </template>

            <template #body-productor_leche="{ data }">
                <Tag :value="Number(data.es_productor_leche) === 6351 ? 'SÍ' : 'NO'"
                    :severity="Number(data.es_productor_leche) === 6351 ? 'success' : 'secondary'"
                    class="text-[10px] font-bold uppercase px-2" />
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                    @edit="edit(data)" @delete="confirmDelete(data)" />
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
                            <div class="expansion-item">
                                <span class="expansion-label">Raza:</span>
                                <span class="expansion-value">{{ getNombreRaza(data.raza_id) }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Categoría:</span>
                                <span class="expansion-value">{{ getNombreCategoria(data.categoria_vacuno_id) }}</span>
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
                                <span class="expansion-label">Padre:</span>
                                <span class="expansion-value">{{ data.padre_arete || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Madre:</span>
                                <span class="expansion-value">{{ data.madre_arete || '—' }}</span>
                            </div>

                            <!-- OBSERVACIONES (Destacado en expansión) -->
                            <div class="expansion-item md:col-span-2">
                                <span class="expansion-label text-amber-600">Observaciones:</span>
                                <span class="expansion-value font-semibold text-slate-700"
                                    :title="data.observaciones || '—'">
                                    {{ data.observaciones || 'Sin observaciones registradas.' }}
                                </span>
                            </div>

                            <div class="expansion-item">
                                <span class="expansion-label">Usuario Operación:</span>
                                <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CRUD ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[85vw] md:w-[680px] lg:w-[720px]"
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
            <!-- SECCIÓN 1: IDENTIFICACIÓN DEL VACUNO -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>1. Identificación del Vacuno</span>
                    <span class="text-slate-600 normal-case font-bold text-[9px]">Campos obligatorios <span
                            class="text-red-500">*</span></span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Arete <span
                                class="text-red-500">*</span></label>
                        <BaseInput ref="areteRef" v-model="formObj.arete" :maxlength="50" size="sm"
                            :disabled="estaProtegido('arete')" @blur="touched.arete = true" />
                        <small v-if="(submitted || touched.arete) && !formObj.arete?.trim()"
                            class="text-red-500 font-semibold text-[9px]">Requerido</small>
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Nombre
                            (Opcional)</label>
                        <BaseInput v-model="formObj.nombre" :maxlength="150" size="sm" placeholder="Ej: La Vaca Lola" />
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Color</label>
                        <BaseInput v-model="formObj.color" :maxlength="50" size="sm" />
                    </div>

                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Fecha Ingreso <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.fecha_ingreso" type="date" size="sm" :max="getTodayLocal()" />
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Fecha
                            Nacimiento</label>
                        <BaseInput v-model="formObj.fecha_nacimiento" type="date" size="sm" :max="getTodayLocal()"
                            :disabled="estaProtegido('fecha_nacimiento')" />
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Sexo <span
                                class="text-red-500">*</span></label>
                        <BaseSelect v-model="formObj.sexo_biologico_id" :options="sexoOptions" option-label="label"
                            option-value="value" size="sm" :disabled="estaProtegido('sexo_biologico_id')" />
                    </div>

                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Raza <span
                                class="text-red-500">*</span></label>
                        <BaseSelect v-model="formObj.raza_id" :options="razasOptions" option-label="label"
                            option-value="value" size="sm" filter :disabled="estaProtegido('raza_id')" />
                    </div>
                    <div class="md:col-span-4">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Categoría <span
                                class="text-red-500">*</span></label>
                        <BaseSelect v-model="formObj.categoria_vacuno_id" :options="categoriasOptions"
                            option-label="label" option-value="value" size="sm" filter
                            :disabled="estaProtegido('categoria_vacuno_id')" />
                    </div>
                    <div class="md:col-span-4 flex items-end pb-1.5">
                        <div :class="[
                            'flex items-center gap-2 p-2 w-full border rounded-lg h-[32px] transition-colors duration-200',
                            formObj.sexo_biologico_id !== 6301
                                ? 'bg-slate-100 border-slate-300 opacity-60'
                                : 'bg-blue-50 border-blue-200'
                        ]">
                            <input id="es_productor_leche" v-model.number="formObj.es_productor_leche" type="checkbox"
                                :true-value="6351" :false-value="6350" :disabled="formObj.sexo_biologico_id !== 6301"
                                class="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                :class="formObj.sexo_biologico_id !== 6301 ? 'cursor-not-allowed' : 'cursor-pointer'" />
                            <label for="es_productor_leche" :class="[
                                'text-[10px] font-bold uppercase select-none',
                                formObj.sexo_biologico_id !== 6301 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-700 cursor-pointer'
                            ]">
                                Prod. Leche
                            </label>
                        </div>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Arete Padre</label>
                        <BaseInput v-model="formObj.padre_arete" :maxlength="50" size="sm" />
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Arete Madre</label>
                        <BaseInput v-model="formObj.madre_arete" :maxlength="50" size="sm" />
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 2: VALORES PRODUCTIVOS -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>2. Datos Productivos y Amortización</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-2">
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Peso Nac.
                            (kg)</label>
                        <BaseInput v-model="formObj.peso_nacimiento" type="number" step="0.01" min="0" size="sm" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Peso Act.
                            (kg)</label>
                        <BaseInput v-model="formObj.peso_actual" type="number" step="0.01" min="0" size="sm" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Valor Adq. (Bs) <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.valor_adquisicion" type="number" step="0.01" min="0" size="sm" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Valor Resid. (Bs)
                            <span class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.valor_residual" type="number" step="0.01" min="0" size="sm" />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Vida Útil (Años)
                            <span class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.vida_util_anios" type="number" min="1" size="sm" />
                    </div>
                    <div class="md:col-span-3">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Tasa Amort. (%) <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.tasa_amortizacion" type="number" step="0.01" min="0" max="100"
                            size="sm" />
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Inicio
                            Amortización</label>
                        <BaseInput v-model="formObj.fecha_inicio_amortizacion" type="date" size="sm"
                            :max="getTodayLocal()" />
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 3: ESTADO, SALIDA Y UBICACIÓN -->
            <div class="panel-contrast !p-3">
                <div
                    class="flex justify-between items-center mb-2 text-sky-800 uppercase tracking-wider font-black text-[10px]">
                    <span>3. Estado, Salida y Ubicación</span>
                </div>

                <div class="flex flex-wrap items-end gap-3 mb-2">
                    <div class="flex-1 min-w-[130px]">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Estado Vacuno <span
                                class="text-red-500">*</span></label>
                        <BaseSelect v-model="formObj.estado_vacuno_id" :options="estadoVacunoOptions"
                            option-label="label" option-value="value" size="sm" />
                    </div>

                    <div class="flex-1 min-w-[150px]">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Empresa <span
                                class="text-red-500">*</span></label>
                        <BaseSelect v-model="empresaSeleccionadaId" :options="empresasOptions" option-label="label"
                            option-value="value" size="sm" filter @update:model-value="onEmpresaChange" />
                    </div>

                    <div class="flex-1 min-w-[150px]">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Sucursal <span
                                class="text-red-500">*</span></label>
                        <BaseSelect v-model="formObj.sucursal_id" :options="sucursalesFiltradasOptions"
                            option-label="label" option-value="value" size="sm" filter />
                    </div>

                    <div v-if="[6404, 6405].includes(Number(formObj.estado_vacuno_id))" class="flex-1 min-w-[130px]">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Fecha Salida <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.fecha_salida" type="date" size="sm" :max="getTodayLocal()" />
                    </div>
                    <div v-if="[6404, 6405].includes(Number(formObj.estado_vacuno_id))" class="flex-[2] min-w-[180px]">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Motivo Salida <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.motivo_salida" :maxlength="500" size="sm" />
                    </div>

                    <template v-if="Number(formObj.estado_vacuno_id) === 6404">
                        <div class="flex-1 min-w-[100px]">
                            <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Peso
                                Salida</label>
                            <BaseInput v-model="formObj.peso_salida" type="number" step="0.01" min="0" size="sm" />
                        </div>
                        <div class="flex-1 min-w-[120px]">
                            <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Precio Venta
                                <span class="text-red-500">*</span></label>
                            <BaseInput v-model="formObj.precio_venta" type="number" step="0.01" min="0" size="sm" />
                        </div>
                    </template>

                    <div v-if="Number(formObj.estado_vacuno_id) === 6405" class="flex-[2] min-w-[200px]">
                        <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Causa Muerte <span
                                class="text-red-500">*</span></label>
                        <BaseInput v-model="formObj.causa_muerte" :maxlength="500" size="sm" />
                    </div>
                </div>

                <!-- OBSERVACIONES (Aumentado a 3 filas para mejor lectura) -->
                <div class="w-full mt-1">
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5 uppercase">Observaciones</label>
                    <textarea v-model="formObj.observaciones" rows="3" maxlength="1000"
                        class="w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] text-xs p-1.5 focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100"
                        placeholder="Notas adicionales, incidencias o comentarios sobre el vacuno..."></textarea>
                </div>
            </div>

            <!-- SECCIÓN 4: FOTO -->
            <div class="panel-contrast !p-3 mt-3">
                <span class="block text-[10px] font-black text-blue-700 uppercase tracking-wider mb-3">
                    Fotografía del Vacuno
                </span>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div class="flex items-center justify-center">
                        <div class="dropzone cursor-pointer relative" @click="abrirSelectorFoto">
                            <img v-if="fotoPreview" :src="fotoPreview" class="w-full h-full object-contain" />
                            <div v-else class="dropzone-empty">
                                <i class="pi pi-image"></i>
                                <span class="dropzone-hint">Sin foto</span>
                                <span class="dropzone-subhint">Click en "Cargar Foto"</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <div class="info-panel !bg-white">
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

                        <div class="flex justify-center">
                            <input ref="fotoInput" type="file" class="hidden" :accept="acceptFoto"
                                :disabled="!puedeSubirFoto" @change="onFotoChange" />
                            <BaseButton :label="fotoPreview ? 'Cambiar Foto' : 'Cargar Foto'" icon="pi pi-upload"
                                variant="foto-subir" size="sm" @click="abrirSelectorFoto" />
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

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Vacuno" :item-name="formObj.arete || 'este vacuno'"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, onMounted, watch } from 'vue';
    import type { ImageConfigDisplay } from '~/composables/useImageValidator';
    import { SexoBiologico, CondicionProductorLeche, EstadoVacuno } from '~/constants/estados.constant';
    import { getTodayLocal } from '~/utils/date';

    useHead({ title: 'Registro de Vacunos' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem { label: string; value: any; }

    // ============ DEPENDENCIAS ============
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { validate: validateImage, getConfigDisplay } = useImageValidator();
    const authStore = useAuthStore();

    // ============ OPCIONES ESTÁTICAS (Alineadas al Backend) ============
    const sexoOptions: OptionItem[] = [
        { label: 'Macho', value: SexoBiologico.MACHO },     // 6300
        { label: 'Hembra', value: SexoBiologico.HEMBRA },   // 6301
    ];

    const productorLecheOptions: OptionItem[] = [
        { label: 'Sí', value: CondicionProductorLeche.PRODUCTOR },    // 6351
        { label: 'No', value: CondicionProductorLeche.NO_PRODUCTOR }, // 6350
    ];

    const estadoVacunoOptions: OptionItem[] = [
        { label: 'Activo', value: EstadoVacuno.ACTIVO },                // 6400
        { label: 'En Tratamiento', value: EstadoVacuno.EN_TRATAMIENTO },// 6401
        { label: 'Seca', value: EstadoVacuno.SECA },                    // 6402
        { label: 'Descarte', value: EstadoVacuno.DESCARTE },            // 6403
        { label: 'Vendido', value: EstadoVacuno.VENDIDO },              // 6404
        { label: 'Muerto', value: EstadoVacuno.MUERTO },                // 6405
    ];

    // ============ OPCIONES DINÁMICAS ============
    const empresasOptions = ref<OptionItem[]>([]);
    const sucursalesOptions = ref<OptionItem[]>([]);
    const razasOptions = ref<OptionItem[]>([]);
    const categoriasOptions = ref<OptionItem[]>([]);

    const empresaSeleccionadaId = ref<number | null>(null);
    const sucursalesFiltradasOptions = ref<OptionItem[]>([]);

    const cargarCombos = async () => {
        try {
            const [resEmp, resSuc, resRazas] = await Promise.all([
                $api('/empresas', { params: { limit: 500 } }),
                $api('/sucursales', { params: { limit: 500 } }),
                $api('/razas', { params: { limit: 500 } })
            ]);

            empresasOptions.value = (resEmp.data || []).map((e: any) => ({ label: e.empresa, value: e.empresa_id }));
            sucursalesOptions.value = (resSuc.data || []).map((s: any) => ({
                label: s.sucursal,
                value: s.sucursal_id,
                empresa_id: s.empresa_id
            }));
            razasOptions.value = (resRazas.data || []).map((r: any) => ({ label: r.raza, value: r.raza_id }));

            await cargarCategoriasFiltradas();

        } catch (error) {
            console.error("Error cargando combos:", error);
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
                estado_id: 1000,
                sexo_biologico_permitido_id: Number(formObj.value.sexo_biologico_id)
            };

            if (formObj.value.es_productor_leche != null) {
                params.es_productor_leche = Number(formObj.value.es_productor_leche);
            }

            const resCategorias = await $api('/categorias-vacuno', { params });

            categoriasOptions.value = (resCategorias.data || []).map((c: any) => ({
                label: c.categoria,
                value: c.categoria_vacuno_id
            }));

            const existe = categoriasOptions.value.some(c => c.value === formObj.value.categoria_vacuno_id);
            if (!existe) {
                formObj.value.categoria_vacuno_id = null;
            }

        } catch (error) {
            console.error("Error cargando categorías filtradas:", error);
        }
    };

    const onEmpresaChange = () => {
        if (empresaSeleccionadaId.value) {
            sucursalesFiltradasOptions.value = sucursalesOptions.value.filter(
                s => (s as any).empresa_id === empresaSeleccionadaId.value
            );
            const sucursalValida = sucursalesFiltradasOptions.value.some(s => s.value === formObj.value.sucursal_id);
            if (!sucursalValida) formObj.value.sucursal_id = null;
        } else {
            sucursalesFiltradasOptions.value = sucursalesOptions.value;
        }
    };

    const getNombreRaza = (id: number) => razasOptions.value.find(r => r.value === id)?.label || id;
    const getNombreCategoria = (id: number) => categoriasOptions.value.find(c => c.value === id)?.label || id;

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
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

        camposProtegidosPorDependencia: ['arete', 'raza_id', 'categoria_vacuno_id', 'fecha_nacimiento', 'sexo_biologico_id'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: null,
            sucursal_id: null,
            sexo_biologico_id: null,
            es_productor_leche: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = { exactMatch: f.exactMatch ?? 0 };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.sexo_biologico_id) extra.sexo_biologico_id = Number(f.sexo_biologico_id);
            if (f.es_productor_leche != null && f.es_productor_leche !== '') extra.es_productor_leche = Number(f.es_productor_leche);
            return extra;
        },

        getPrimaryKey: (item: any) => item.vacuno_id,

        getCleanForm: () => ({
            vacuno_id: null,
            sucursal_id: null,
            raza_id: null,
            categoria_vacuno_id: null,
            arete: '',
            nombre: '',
            fecha_nacimiento: '',
            fecha_ingreso: '',
            sexo_biologico_id: SexoBiologico.HEMBRA,
            peso_nacimiento: null,
            peso_actual: null,
            color: '',
            padre_arete: '',
            madre_arete: '',
            valor_adquisicion: null,
            valor_residual: null,
            vida_util_anios: 5,
            tasa_amortizacion: 20,
            fecha_inicio_amortizacion: '',
            es_productor_leche: CondicionProductorLeche.NO_PRODUCTOR,
            estado_vacuno_id: EstadoVacuno.ACTIVO,
            fecha_salida: '',
            motivo_salida: '',
            peso_salida: null,
            precio_venta: null,
            causa_muerte: '',
            observaciones: '',
            foto: null,
        }),

        buildPayload: (form: any) => form,
        validate: () => true,
    });

    // ============ TÍTULOS ============
    const tituloDialog = computed(() => isUpdate.value ? 'EDITAR VACUNO' : 'NUEVO VACUNO');
    const subtituloDialog = computed(() => isUpdate.value ? 'Actualización de datos del hato' : 'Registro de nuevo vacuno');

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
    const areteRef = ref<any>(null);
    const focusFirstInput = async () => {
        await nextTick();
        setTimeout(() => {
            const input = areteRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ OVERRIDES ============
    const openNew = () => {
        openNewBase();
        formObj.value.fecha_ingreso = getTodayLocal();

        if (authStore.user?.empresa_id) {
            empresaSeleccionadaId.value = authStore.user.empresa_id;
            onEmpresaChange();
        }

        if (authStore.user?.sucursal_id) {
            formObj.value.sucursal_id = authStore.user.sucursal_id;
        }

        fotoFile.value = null;
        fotoPreview.value = null;
        fotoEliminada.value = false;
        if (fotoInput.value) fotoInput.value.value = '';

        cargarCategoriasFiltradas();
    };

    const edit = async (data: any) => {
        await editBase(data);

        empresaSeleccionadaId.value = data.empresa_id || null;
        onEmpresaChange();

        fotoPreview.value = formObj.value.foto || null;
        fotoFile.value = null;
        fotoEliminada.value = false;
        if (fotoInput.value) fotoInput.value.value = '';

        await cargarCategoriasFiltradas();
    };

    // ============ SAVE (FormData) ============
    const saveWithFoto = async (payload: Record<string, any>, file: File | null, id?: number | string | null, eliminarFoto = false) => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value as any);
            }
        });

        if (file) formData.append('foto', file);
        else if (eliminarFoto) formData.append('foto', '');

        const url = id ? `/vacunos/${id}` : '/vacunos';
        const method = id ? 'PATCH' : 'POST';

        return $api(url, { method, body: formData });
    };

    const saveVacuno = async () => {
        submitted.value = true;

        // 1. Campos básicos
        if (!formObj.value.arete?.trim()) return notify('warn', 'Campos incompletos', 'El arete es obligatorio.');
        if (!formObj.value.sucursal_id) return notify('warn', 'Campos incompletos', 'La sucursal es obligatoria.');
        if (!formObj.value.raza_id) return notify('warn', 'Campos incompletos', 'La raza es obligatoria.');
        if (!formObj.value.categoria_vacuno_id) return notify('warn', 'Campos incompletos', 'La categoría es obligatoria.');
        if (!formObj.value.fecha_ingreso) return notify('warn', 'Campos incompletos', 'La fecha de ingreso es obligatoria.');
        if (formObj.value.valor_adquisicion == null) return notify('warn', 'Campos incompletos', 'El Valor de Adquisición es obligatorio.');
        if (formObj.value.valor_residual == null) return notify('warn', 'Campos incompletos', 'El Valor Residual es obligatorio.');
        if (formObj.value.vida_util_anios == null) return notify('warn', 'Campos incompletos', 'La Vida Útil es obligatoria.');
        if (formObj.value.tasa_amortizacion == null) return notify('warn', 'Campos incompletos', 'La Tasa de Amortización es obligatoria.');

        // 2. Validación de valores contables
        if (Number(formObj.value.valor_residual) > Number(formObj.value.valor_adquisicion)) {
            return notify('warn', 'Valores incorrectos', 'El Valor Residual no puede ser mayor al Valor de Adquisición.');
        }

        // 3. Validación de fechas
        const hoy = getTodayLocal();
        if (formObj.value.fecha_ingreso > hoy) {
            return notify('warn', 'Fecha inválida', 'La fecha de ingreso no puede ser mayor al día de hoy.');
        }
        if (formObj.value.fecha_nacimiento && formObj.value.fecha_nacimiento > hoy) {
            return notify('warn', 'Fecha inválida', 'La fecha de nacimiento no puede ser mayor al día de hoy.');
        }
        if (formObj.value.fecha_salida && formObj.value.fecha_salida > hoy) {
            return notify('warn', 'Fecha inválida', 'La fecha de salida no puede ser mayor al día de hoy.');
        }
        if (formObj.value.fecha_salida && formObj.value.fecha_ingreso) {
            if (new Date(formObj.value.fecha_salida) < new Date(formObj.value.fecha_ingreso)) {
                return notify('warn', 'Fechas incorrectas', 'La fecha de salida no puede ser anterior a la fecha de ingreso.');
            }
        }

        // 4. Validación de Estados (Vendido / Muerto)
        const estado = Number(formObj.value.estado_vacuno_id);
        if (estado === EstadoVacuno.VENDIDO && (!formObj.value.fecha_salida || !formObj.value.motivo_salida || formObj.value.precio_venta == null)) {
            return notify('warn', 'Faltan datos', 'Para VENDIDO, complete fecha, motivo y precio de venta.');
        }
        if (estado === EstadoVacuno.MUERTO && (!formObj.value.fecha_salida || !formObj.value.motivo_salida || !formObj.value.causa_muerte)) {
            return notify('warn', 'Faltan datos', 'Para MUERTO, complete fecha, motivo y causa de muerte.');
        }

        try {
            loading.value = true;

            const payload: Record<string, any> = { ...formObj.value };

            // 5. Limpieza de campos según estado (Evita error de backend por checks condicionales)
            if (estado !== EstadoVacuno.VENDIDO) {
                payload.precio_venta = null;
            }
            if (estado !== EstadoVacuno.MUERTO) {
                payload.causa_muerte = null;
            }
            if (![EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO].includes(estado)) {
                payload.fecha_salida = null;
                payload.motivo_salida = null;
                payload.peso_salida = null;
            }

            // 6. Convertir strings vacíos a null
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') payload[key] = null;
            });

            // 7. Limpiar aretes de padres
            if (payload.padre_arete) payload.padre_arete = payload.padre_arete.trim();
            if (payload.madre_arete) payload.madre_arete = payload.madre_arete.trim();

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;
            await saveWithFoto(payload, fotoFile.value, pk, fotoEliminada.value);

            notify('success', isUpdate.value ? 'Actualizado' : 'Creado', 'Registro guardado correctamente.');
            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar el vacuno.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;
            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear', firstError);
            console.error('Error al guardar vacuno:', err);
        } finally {
            loading.value = false;
        }
    };

    const onImageError = (event: Event) => {
        (event.target as HTMLImageElement).style.display = 'none';
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'arete', header: 'ARETE / NOMBRE', template: 'body-arete', sortable: true, class: 'w-48' },
        { field: 'sucursal_nombre', header: 'UBICACIÓN', template: 'body-ubicacion', sortable: true, class: 'w-40' },
        { field: 'sexo_biologico_id', header: 'SEXO', template: 'body-sexo', sortable: true, class: 'w-20', bodyClass: '!text-center' },
        { field: 'peso_actual', header: 'PESO ACT.', template: 'body-peso_actual', sortable: true, class: 'w-24', bodyClass: '!text-center' },
        { field: 'es_productor_leche', header: 'LECHE', template: 'body-productor_leche', sortable: true, class: 'w-20', bodyClass: '!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center w-24' },
    ];

    // ============ FILTROS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.sexo_biologico_id) count++;
        if (filters.value.es_productor_leche != null && filters.value.es_productor_leche !== '') count++;
        return count;
    });

    const aplicarFiltros = () => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = () => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.sexo_biologico_id = null;
        filters.value.es_productor_leche = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // Escuchar cambios en Sexo y Productor de Leche
    watch(
        () => [formObj.value.sexo_biologico_id, formObj.value.es_productor_leche],
        ([newSexo]) => {
            if (Number(newSexo) === 6300 && Number(formObj.value.es_productor_leche) === 6351) {
                formObj.value.es_productor_leche = 6350;
            }

            if (dialog.value) {
                cargarCategoriasFiltradas();
            }
        }
    );

    // INIT
    onMounted(async () => {
        await cargarCombos();
        sucursalesFiltradasOptions.value = sucursalesOptions.value;

        fotoConfig.value = await getConfigDisplay('foto_vacuno_config');

        if (authStore.user?.empresa_id) {
            filters.value.empresa_id = authStore.user.empresa_id;
        }
        if (authStore.user?.sucursal_id) {
            filters.value.sucursal_id = authStore.user.sucursal_id;
        }

        lazyParams.value.sortField = 'vacuno_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;

        onSearch();
    });
</script>
