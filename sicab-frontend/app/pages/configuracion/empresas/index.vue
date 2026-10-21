<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\empresas\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-building" title="Datos de la Empresa"
        subtitle="Gestión de datos fiscales y organizacionales" :show-action="permisos.crear"
        action-label="NUEVA EMPRESA" action-icon="pi pi-plus" @action="openNew">
        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: empresa, código..." @search="onSearch" />
                </div>
            </template>

            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo }}</span>
            </template>

            <template #body-empresa="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.empresa }}</span>
                    <span v-if="data.eslogan" class="cell-secondary">
                        <span class="font-bold">ESLOGAN:</span> {{ data.eslogan }}
                    </span>
                </div>
            </template>

            <template #body-contacto="{ data }">
                <div class="cell-stack">
                    <span v-if="data.telefono" class="cell-primary">
                        <i class="pi pi-phone text-[10px] mr-1"></i>{{ data.telefono }}
                    </span>
                    <span v-if="data.email" class="cell-secondary">
                        <i class="pi pi-envelope text-[10px] mr-1"></i>{{ data.email }}
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

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-with-photo">
                        <!-- Logo (columna izquierda, fija) -->
                        <div class="expansion-photo">
                            <img v-if="data.logo" :src="data.logo" :alt="data.empresa" @error="onImageError($event)" />
                            <div v-else
                                class="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center border border-blue-500">
                                <i class="pi pi-building text-blue-400 text-3xl"></i>
                            </div>
                        </div>

                        <!-- Grid de 2 columnas estrictas -->
                        <div class="expansion-grid">
                            <div class="expansion-item">
                                <span class="expansion-label">Representante Legal:</span>
                                <span class="expansion-value" :title="data.representante || '—'">{{ data.representante
                                    || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Lugar / Ciudad:</span>
                                <span class="expansion-value" :title="data.lugar || '—'">{{ data.lugar || '—' }}</span>
                            </div>

                            <div class="expansion-item">
                                <span class="expansion-label">Dirección:</span>
                                <span class="expansion-value" :title="data.direccion || '—'">{{ data.direccion || '—'
                                    }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Matrícula Comercio:</span>
                                <span class="expansion-value" :title="data.matricula_comercio || '—'">{{
                                    data.matricula_comercio || '—' }}</span>
                            </div>

                            <div class="expansion-item">
                                <span class="expansion-label">Descripción:</span>
                                <span class="expansion-value" :title="data.descripcion || '—'">{{ data.descripcion ||
                                    '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Licencia Frecuencia ATT:</span>
                                <span class="expansion-value" :title="data.licencia_frecuencia_att || '—'">{{
                                    data.licencia_frecuencia_att || '—' }}</span>
                            </div>

                            <div class="expansion-item">
                                <span class="expansion-label">Emisión Licencia ATT:</span>
                                <span class="expansion-value">{{ data.fecha_emision_licencia_att || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Vencimiento Licencia ATT:</span>
                                <span class="expansion-value">{{ data.fecha_vencimiento_licencia_att || '—' }}</span>
                            </div>

                            <div class="expansion-item">
                                <span class="expansion-label">Resolución Municipal:</span>
                                <span class="expansion-value" :title="data.resolucion_municipal_operacion || '—'">{{
                                    data.resolucion_municipal_operacion || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Emisión Resolución:</span>
                                <span class="expansion-value">{{ data.fecha_emision_resolucion || '—' }}</span>
                            </div>

                            <div class="expansion-item">
                                <span class="expansion-label">Vencimiento Resolución:</span>
                                <span class="expansion-value">{{ data.fecha_vencimiento_resolucion || '—' }}</span>
                            </div>
                            <div class="expansion-item">
                                <span class="expansion-label">Frecuencia Asignada:</span>
                                <span class="expansion-value" :title="data.frecuencia_asignada_mhz || '—'">{{
                                    data.frecuencia_asignada_mhz || '—' }}</span>
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

    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[880px] lg:w-[900px]"
        maxHeight="92vh" :modal="true" :closable="!loading" @show="focusRazonSocial">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-building text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div class="panel-contrast">
                    <div
                        class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                        <span>Información Fiscal e Identidad</span>
                        <span class="text-slate-600 normal-case font-bold text-[10px]">
                            Campos obligatorios <span class="text-red-500">*</span>
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Razón Social <span class="text-red-500">*</span>
                            </label>
                            <BaseInput ref="razonSocialRef" v-model="formObj.empresa" :maxlength="200" size="sm"
                                :disabled="estaProtegido('empresa') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('empresa') && !authStore.isAdmin }"
                                @blur="touched.empresa = true" />
                            <small v-if="estaProtegido('empresa') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.empresa) && !formObj.empresa"
                                class="text-red-500 font-semibold text-[10px]">
                                La razón social es obligatoria
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Código Interno <span class="text-red-500">*</span>
                            </label>
                            <BaseInput v-model="formObj.codigo" :maxlength="30" size="sm"
                                :disabled="estaProtegido('codigo') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo') && !authStore.isAdmin }"
                                @blur="touched.codigo = true" />
                            <small v-if="estaProtegido('codigo') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.codigo) && !formObj.codigo?.trim()"
                                class="text-red-500 font-semibold text-[10px]">
                                Requerido
                            </small>
                            <small
                                v-else-if="(submitted || touched.codigo) && formObj.codigo && $rules.codigoMayusculas(3)(formObj.codigo) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.codigoMayusculas(3)(formObj.codigo) }}
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Matrícula Comercio <span class="text-red-500">*</span>
                            </label>
                            <BaseInput v-model="formObj.matricula_comercio" :maxlength="50" size="sm"
                                :disabled="estaProtegido('matricula_comercio') && !authStore.isAdmin"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('matricula_comercio') && !authStore.isAdmin }"
                                @blur="touched.matricula_comercio = true" />
                            <small v-if="estaProtegido('matricula_comercio') && !authStore.isAdmin"
                                class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small v-else-if="(submitted || touched.matricula_comercio) && !formObj.matricula_comercio"
                                class="text-red-500 font-semibold text-[10px]">
                                Requerido
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Representante
                                Legal</label>
                            <BaseInput v-model="formObj.representante" :maxlength="100" size="sm" />
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Eslogan</label>
                            <BaseInput v-model="formObj.eslogan" :maxlength="150" size="sm" />
                        </div>
                    </div>
                </div>

                <div class="panel-contrast">
                    <span class="block text-xs font-black text-blue-700 uppercase tracking-wider mb-4">Contacto y
                        Ubicación</span>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Teléfono</label>
                            <BaseInput v-model="formObj.telefono" :maxlength="100" size="sm" />
                        </div>

                        <div>
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Correo</label>
                            <BaseInput v-model="formObj.email" :maxlength="100" size="sm"
                                @blur="touched.email = true" />
                            <small
                                v-if="(submitted || touched.email) && formObj.email && $rules.formatoCorreo()(formObj.email) !== true"
                                class="text-red-500 font-semibold text-[10px]">
                                {{ $rules.formatoCorreo()(formObj.email) }}
                            </small>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Dirección
                                Exacta</label>
                            <BaseInput v-model="formObj.direccion" :maxlength="500" size="sm" />
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Lugar /
                                Ciudad</label>
                            <BaseInput v-model="formObj.lugar" :maxlength="60" size="sm" placeholder="" />
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Descripción</label>
                            <BaseInput v-model="formObj.descripcion" :maxlength="500" size="sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-4 panel-contrast">
                <span class="block text-xs font-black text-blue-700 uppercase tracking-wider mb-5">
                    Datos Legales y Regulatorios
                </span>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Licencia Frecuencia ATT
                        </label>
                        <BaseInput v-model="formObj.licencia_frecuencia_att" :maxlength="50" size="sm" placeholder="" />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Emisión Licencia ATT
                        </label>
                        <BaseInput v-model="formObj.fecha_emision_licencia_att" type="date" size="sm" />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Vencimiento Licencia ATT
                        </label>
                        <BaseInput v-model="formObj.fecha_vencimiento_licencia_att" type="date" size="sm" />
                        <small v-if="formObj.fecha_emision_licencia_att && formObj.fecha_vencimiento_licencia_att
                            && formObj.fecha_emision_licencia_att > formObj.fecha_vencimiento_licencia_att"
                            class="text-red-500 font-semibold text-[10px]">
                            No puede ser anterior a la fecha de emisión
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Resolución Municipal de Operación
                        </label>
                        <BaseInput v-model="formObj.resolucion_municipal_operacion" :maxlength="50" size="sm"
                            placeholder="" />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Emisión Resolución
                        </label>
                        <BaseInput v-model="formObj.fecha_emision_resolucion" type="date" size="sm" />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Vencimiento Resolución
                        </label>
                        <BaseInput v-model="formObj.fecha_vencimiento_resolucion" type="date" size="sm" />
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Frecuencia Asignada
                        </label>
                        <BaseInput v-model="formObj.frecuencia_asignada_mhz" :maxlength="30" size="sm"
                            placeholder="Ej: 98.5 MHz, 100 kHz, 10.75 GHz" />
                        <small class="text-slate-500 text-[10px] mt-1 block">
                            Formato: número con decimales opcionales y unidad opcional.
                            Ejemplos: <b>98</b>, <b>98.5</b>, <b>98.5 MHz</b>, <b>100 kHz</b>.
                        </small>
                    </div>
                </div>
            </div>

            <div class="mt-4 panel-contrast">
                <span class="block text-xs font-black text-blue-700 uppercase tracking-wider mb-3">
                    Logo Institucional
                </span>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div class="flex items-center justify-center">
                        <div class="dropzone">
                            <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-contain" />
                            <div v-else class="dropzone-empty">
                                <i class="pi pi-image"></i>
                                <span class="dropzone-hint">Sin logo</span>
                                <span class="dropzone-subhint">Click en "Cargar Logo"</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <div class="info-panel">
                            <span class="info-panel-title">Requisitos del logo</span>
                            <ul class="info-panel-list">
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Peso máximo: <b>{{ logoConfig?.maxSizeKB ?? '—' }} KB</b></span>
                                </li>
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Formatos: <b>{{ logoConfig?.formats ?? '—' }}</b></span>
                                </li>
                                <li class="info-panel-item">
                                    <i class="pi pi-check-circle"></i>
                                    <span>Dimensiones máximas: <b>{{ logoConfig?.maxWidth ?? '—' }} × {{
                                            logoConfig?.maxHeight ?? '—' }} px</b></span>
                                </li>
                                <li class="info-panel-item info-panel-item-file">
                                    <i class="pi pi-file"></i>
                                    <span class="truncate">
                                        Archivo:
                                        <b class="truncate">{{ nombreArchivoLogo }}</b>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <input ref="logoInput" type="file" class="hidden" :accept="acceptLogo"
                            :disabled="!puedeSubirLogo" @change="onLogoChange" />

                        <div class="flex gap-2 justify-center">
                            <BaseButton :label="logoPreview ? 'Cambiar Logo' : 'Cargar Logo'" icon="pi pi-upload"
                                variant="foto-subir" size="sm" @click="abrirSelectorLogo" />
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
                    variant="primary" @click="saveEmpresa" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Empresa"
        :item-name="formObj.empresa || 'esta empresa'" @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, onMounted } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import type { ImageConfigDisplay } from '~/composables/useImageValidator';

    useHead({ title: 'Empresas' });

    // ============ DEPENDENCIAS ============
    const authStore = useAuthStore();
    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { validate: validateImage, getConfigDisplay } = useImageValidator();

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
        tabla: 'empresas',
        sortFieldDefault: 'empresa_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: ['empresa', 'codigo', 'matricula_comercio'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
        },

        getExtraFilters: (f: Record<string, any>) => ({
            exactMatch: f.exactMatch ?? 0,
        }),

        getPrimaryKey: (item: any) => item.empresa_id,

        getCleanForm: () => ({
            empresa_id: null,
            empresa: '',
            codigo: '',
            logo: '',
            eslogan: '',
            descripcion: '',
            lugar: '',
            representante: '',
            direccion: '',
            telefono: '',
            email: '',
            matricula_comercio: '',
            licencia_frecuencia_att: '',
            fecha_emision_licencia_att: '',
            fecha_vencimiento_licencia_att: '',
            resolucion_municipal_operacion: '',
            fecha_emision_resolucion: '',
            fecha_vencimiento_resolucion: '',
            frecuencia_asignada_mhz: ''
        }),

        buildPayload: (form: any) => form,

        validate: () => true,
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR EMPRESA' : 'NUEVA EMPRESA'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos institucionales y fiscales'
            : 'Registro de datos institucionales y fiscales'
    );

    // ============ ESTADO ADICIONAL (LOGO) ============
    const logoInput = ref<HTMLInputElement | null>(null);
    const logoFile = ref<File | null>(null);
    const logoPreview = ref<string | null>(null);
    const logoConfig = ref<ImageConfigDisplay | null>(null);

    const abrirSelectorLogo = (): void => {
        logoInput.value?.click();
    };

    const onLogoChange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const result = await validateImage(file, 'logo_config');

        if (!result.valid) {
            notify('warn', 'Imagen no válida', result.error || 'Archivo no permitido');
            target.value = '';
            return;
        }

        logoFile.value = file;
        const reader = new FileReader();
        reader.onload = () => {
            logoPreview.value = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const nombreArchivoLogo = computed<string | null>(() => {
        if (logoFile.value) return logoFile.value.name;
        if (formObj.value.logo) return formObj.value.logo;
        return null;
    });

    const acceptLogo = computed<string | undefined>(() => {
        const mimes = logoConfig.value?.mimeTypes;
        return mimes?.length ? mimes.join(',') : undefined;
    });

    const puedeSubirLogo = computed(() => Boolean(logoConfig.value));

    // ============ FOCUS INICIAL ============
    const razonSocialRef = ref<any>(null);

    const focusRazonSocial = async () => {
        await nextTick();
        setTimeout(() => {
            const input = razonSocialRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ OVERRIDE openNew / edit ============
    const openNew = (): void => {
        openNewBase();
        logoFile.value = null;
        logoPreview.value = null;
        if (logoInput.value) { logoInput.value.value = ''; }
    };

    const edit = async (data: any): Promise<void> => {
        await editBase(data);
        logoPreview.value = formObj.value.logo || null;
        logoFile.value = null;
        if (logoInput.value) { logoInput.value.value = ''; }
    };

    // ============ SAVE ============
    const saveWithLogo = async (
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
            formData.append('logo', file);
        }

        const url = id ? `/empresas/${id}` : '/empresas';
        const method = id ? 'PATCH' : 'POST';

        return $api(url, { method, body: formData });
    };

    const saveEmpresa = async (): Promise<void> => {
        submitted.value = true;

        if (!formObj.value.empresa?.trim()) {
            notify('warn', 'Campos incompletos', 'La razón social es obligatoria.');
            return;
        }
        if (!formObj.value.codigo?.trim()) {
            notify('warn', 'Campos incompletos', 'El código interno es obligatorio.');
            return;
        }
        if (!formObj.value.matricula_comercio?.trim()) {
            notify('warn', 'Campos incompletos', 'La matrícula de comercio es obligatoria.');
            return;
        }
        if (formObj.value.email && $rules.formatoCorreo()(formObj.value.email) !== true) {
            notify('warn', 'Correo inválido', $rules.formatoCorreo()(formObj.value.email));
            return;
        }
        if (!logoFile.value && !formObj.value.logo) {
            notify(
                'warn',
                'Logo requerido',
                'Debe cargar un logo para la empresa. El logo es obligatorio.'
            );
            return;
        }
        if (formObj.value.frecuencia_asignada_mhz?.trim()) {
            const regex = /^[0-9]+(\.[0-9]+)?(\s*(MHz|kHz|GHz))?$/;
            if (!regex.test(formObj.value.frecuencia_asignada_mhz.trim())) {
                notify(
                    'warn',
                    'Frecuencia inválida',
                    'Formato esperado: número (98, 98.5) y unidad opcional (MHz, kHz, GHz). Ej: 98.5 MHz.'
                );
                return;
            }
        }

        if (
            formObj.value.fecha_emision_licencia_att &&
            formObj.value.fecha_vencimiento_licencia_att &&
            formObj.value.fecha_emision_licencia_att > formObj.value.fecha_vencimiento_licencia_att
        ) {
            notify('warn', 'Fechas inválidas', 'La fecha de emisión de la licencia ATT no puede ser posterior a la de vencimiento.');
            return;
        }

        if (
            formObj.value.fecha_emision_resolucion &&
            formObj.value.fecha_vencimiento_resolucion &&
            formObj.value.fecha_emision_resolucion > formObj.value.fecha_vencimiento_resolucion
        ) {
            notify('warn', 'Fechas inválidas', 'La fecha de emisión de la resolución no puede ser posterior a la de vencimiento.');
            return;
        }

        try {
            loading.value = true;

            const payload: Record<string, any> = {
                empresa: formObj.value.empresa?.trim().toUpperCase(),
                codigo: formObj.value.codigo?.trim().toUpperCase(),
                matricula_comercio: formObj.value.matricula_comercio?.trim().toUpperCase(),
            };

            const opcionales = [
                'eslogan', 'descripcion', 'lugar', 'representante', 'direccion', 'telefono', 'email',
                'licencia_frecuencia_att',
                'fecha_emision_licencia_att',
                'fecha_vencimiento_licencia_att',
                'resolucion_municipal_operacion',
                'fecha_emision_resolucion',
                'fecha_vencimiento_resolucion',
                'frecuencia_asignada_mhz',
            ];

            opcionales.forEach((key) => {
                const val = (formObj.value as any)[key];
                if (val !== null && val !== undefined && val !== '') {
                    payload[key] = typeof val === 'string' ? val.trim() : val;
                }
            });

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;
            await saveWithLogo(payload, logoFile.value, pk);

            notify(
                'success',
                isUpdate.value ? 'Actualizado' : 'Creado',
                'Registro guardado correctamente.'
            );

            lazyParams.value.first = 0;
            onSearch();

            hideDialog();
            logoFile.value = null;
            logoPreview.value = null;
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar la empresa.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;

            notify(
                'error',
                isUpdate.value ? 'Error al actualizar' : 'Error al crear',
                firstError
            );
            console.error('Error al guardar empresa:', err);
        } finally {
            loading.value = false;
        }
    };

    const onImageError = (event: Event): void => {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'codigo', header: 'CÓDIGO', template: 'body-codigo', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'empresa', header: 'RAZÓN SOCIAL', template: 'body-empresa', sortable: true },
        { field: 'telefono', header: 'CONTACTO', template: 'body-contacto', sortable: false },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ INIT ============
    onMounted(async () => {
        logoConfig.value = await getConfigDisplay('logo_config');
        lazyParams.value.sortField = 'empresa_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
