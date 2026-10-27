<!-- C:\sistemas\sicab\sicab-frontend\app\pages\catalogos\razas\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-tag" title="Razas" subtitle="Catálogo de razas de ganado" :show-action="permisos.crear"
        action-label="NUEVA RAZA" action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <template #header>
                <div class="px-3 py-1.5 bg-white">

                    <div class="filter-bar flex flex-wrap items-center gap-2 w-full">
                        <!-- 1. Tipo de Semoviente (Primero) -->
                        <div class="w-full md:w-56 lg:w-64">
                            <BaseSelect v-model="filters.tipo_semoviente_id" :options="tipoSemovienteFilterOptions"
                                option-label="label" option-value="value" placeholder="Todos los tipos" size="sm" filter
                                show-clear appendTo="body" :loading="loadingTipoSemovientes"
                                @update:model-value="aplicarFiltros" class="w-full"
                                v-tooltip.top="'Filtrar por tipo de semoviente (Vacuno, Porcino, etc.)'" />
                        </div>

                        <!-- 2. Buscador (Segundo) -->
                        <div class="w-full lg:flex-1 lg:min-w-[250px]">
                            <BaseSearch :model-value="filters.global"
                                placeholder="Buscar: raza, código, descripción, origen..."
                                @update:model-value="filters.global = $event" @search="onSearch" class="w-full" />
                        </div>

                        <!-- 3. Coincidencia (Tercero) -->
                        <div class="w-full sm:w-auto sm:flex-1 lg:flex-none lg:w-32">
                            <BaseExactMatch :model-value="filters.exactMatch"
                                @update:model-value="onExactMatchChange" />
                        </div>
                    </div>

                </div>
            </template>

            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo }}</span>
            </template>

            <template #body-raza="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.raza }}</span>
                    <span v-if="data.descripcion" class="cell-secondary">
                        <span class="font-bold">DESCRIPCIÓN:</span> {{ data.descripcion }}
                    </span>
                </div>
            </template>

            <template #body-tipo_semoviente="{ data }">
                <span class="cell-primary-normal">{{ data.tipo_semoviente_nombre || '—' }}</span>
            </template>

            <template #body-peso_promedio_adulto="{ data }">
                <span class="cell-primary-normal">
                    {{ data.peso_promedio_adulto != null ? `${data.peso_promedio_adulto} kg` : '—' }}
                </span>
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
                        <div class="expansion-photo">
                            <img v-if="data.foto" :src="data.foto" :alt="data.raza" @error="onImageError($event)" />
                            <div v-else
                                class="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center border border-blue-500">
                                <i class="pi pi-image text-blue-400 text-3xl"></i>
                            </div>
                        </div>

                        <div class="expansion-grid">
                            <div class="expansion-item">
                                <span class="expansion-label">Origen:</span>
                                <span class="expansion-value" :title="data.origen || '—'">
                                    {{ data.origen || '—' }}
                                </span>
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

    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[780px]" maxHeight="none"
        :modal="true" :closable="!loading" @show="focusFirstInput"
        :pt="{ content: { class: '!overflow-visible !max-h-none' } }">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-tag text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div
                    class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                    <span>Información de la Raza</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo de Semoviente <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="tipoSemovienteRef" v-model="formObj.tipo_semoviente_id"
                            :options="tipoSemovienteOptions" option-label="label" option-value="value"
                            placeholder="Seleccionar tipo..." size="sm" filter :loading="loadingTipoSemovientes"
                            :disabled="estaProtegido('tipo_semoviente_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('tipo_semoviente_id') }"
                            @update:model-value="touched.tipo_semoviente_id = true" />
                        <small v-if="estaProtegido('tipo_semoviente_id')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.tipo_semoviente_id) && !formObj.tipo_semoviente_id"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe seleccionar un tipo de semoviente
                        </small>
                    </div>

                    <div class="md:col-span-5">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Raza <span class="text-red-500">*</span>
                        </label>
                        <BaseInput ref="razaRef" v-model="formObj.raza" :maxlength="100" size="sm"
                            :disabled="estaProtegido('raza')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('raza') }"
                            @blur="touched.raza = true" />
                        <small v-if="estaProtegido('raza')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.raza) && !formObj.raza?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            La raza es obligatoria
                        </small>
                        <small
                            v-else-if="(submitted || touched.raza) && $rules.longitudMinima(3)(formObj.raza) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.longitudMinima(3)(formObj.raza) }}
                        </small>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.codigo" :maxlength="30" size="sm"
                            :disabled="estaProtegido('codigo')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo') }"
                            @blur="touched.codigo = true" />
                        <small v-if="estaProtegido('codigo')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.codigo) && !formObj.codigo?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El código es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo) && $rules.codigoAlfanumerico(2)(formObj.codigo) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.codigoAlfanumerico(2)(formObj.codigo) }}
                        </small>
                    </div>

                    <div class="md:col-span-5">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Origen
                        </label>
                        <BaseInput v-model="formObj.origen" :maxlength="100" size="sm"
                            placeholder="Ej: BOLIVIA, BRASIL, ARGENTINA" />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Peso Prom. Adulto (kg)
                        </label>
                        <BaseInput v-model="formObj.peso_promedio_adulto" :maxlength="10" size="sm"
                            placeholder="Ej: 450.50" @blur="touched.peso_promedio_adulto = true" />
                        <small
                            v-if="(submitted || touched.peso_promedio_adulto) && formObj.peso_promedio_adulto && $rules.soloDinero()(formObj.peso_promedio_adulto) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.soloDinero()(formObj.peso_promedio_adulto) }}
                        </small>
                    </div>

                    <div class="md:col-span-9">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <BaseInput v-model="formObj.descripcion" :maxlength="500" size="sm"
                            placeholder="Observaciones o notas adicionales" />
                    </div>
                </div>
            </div>

            <div class="mt-4 panel-contrast">
                <span class="block text-xs font-black text-blue-700 uppercase tracking-wider mb-3">
                    Fotografía de la Raza
                </span>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                    <div class="flex items-center justify-center h-full">
                        <div class="dropzone !h-32 !min-h-32 w-full max-w-[260px]">
                            <img v-if="fotoPreview" :src="fotoPreview" class="w-full h-full object-contain" />
                            <div v-else class="dropzone-empty">
                                <i class="pi pi-image text-3xl"></i>
                                <span class="dropzone-hint text-[10px]">Sin foto</span>
                                <span class="dropzone-subhint text-[9px]">Click en "Cargar Foto"</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <div class="info-panel !p-2">
                            <span class="info-panel-title !mb-1">Requisitos de la foto</span>
                            <ul class="info-panel-list !space-y-1 text-[10px]">
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
                                    <span>
                                        Dimensiones máximas:
                                        <b>{{ fotoConfig?.maxWidth ?? '—' }} × {{ fotoConfig?.maxHeight ?? '—' }} px</b>
                                    </span>
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

                        <input ref="fotoInput" type="file" class="hidden" :accept="acceptFoto"
                            :disabled="!puedeSubirFoto" @change="onFotoChange" />

                        <div class="flex gap-2 justify-center">
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
                    variant="primary" @click="saveRaza" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Raza" :item-name="formObj.raza || 'esta raza'"
        @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, onMounted, nextTick } from 'vue';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';
    import type { ImageConfigDisplay } from '~/composables/useImageValidator';

    useHead({ title: 'Razas' });

    interface OptionItem {
        label: string;
        value: number;
    }

    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { validate: validateImage, getConfigDisplay } = useImageValidator();

    const tipoSemovienteOptions = shallowRef<OptionItem[]>([]);
    const loadingTipoSemovientes = ref(false);

    const tipoSemovienteFilterOptions = computed(() => tipoSemovienteOptions.value);

    const cargarTiposSemovientes = async (): Promise<void> => {
        loadingTipoSemovientes.value = true;
        try {
            const res: any = await $api('/tipos-semovientes', {
                method: 'GET',
                params: { limit: 1000, sortField: 'semoviente', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            tipoSemovienteOptions.value = lista.map((ts: any): OptionItem => ({
                label: ts.semoviente,
                value: Number(ts.tipo_id),
            }));
        } catch (err) {
            console.error('Error al cargar tipos de semovientes:', err);
            tipoSemovienteOptions.value = [];
        } finally {
            loadingTipoSemovientes.value = false;
        }
    };

    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog,
        toggleEstado, confirmDelete, deleteItem,
        resolvePK,
    } = useCrudTable<any>({
        tabla: 'razas',
        sortFieldDefault: 'raza_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: ['tipo_semoviente_id', 'raza', 'codigo'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            tipo_semoviente_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.tipo_semoviente_id) {
                extra.tipo_semoviente_id = Number(f.tipo_semoviente_id);
            }
            return extra;
        },

        getPrimaryKey: (item: any) => item.raza_id,

        getCleanForm: () => ({
            raza_id: null,
            tipo_semoviente_id: null,
            raza: '',
            codigo: '',
            descripcion: '',
            origen: '',
            peso_promedio_adulto: null,
            foto: null,
        }),

        buildPayload: (form: any) => ({
            tipo_semoviente_id: Number(form.tipo_semoviente_id),
            raza: form.raza?.trim().toUpperCase(),
            codigo: form.codigo?.trim().toUpperCase(),
            descripcion: form.descripcion?.trim() || null,
            origen: form.origen?.trim() || null,
            peso_promedio_adulto: form.peso_promedio_adulto ? Number(form.peso_promedio_adulto) : null,
        }),

        validate: () => true,
    });

    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR RAZA' : 'NUEVA RAZA'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos de la raza'
            : 'Registro de nueva raza'
    );

    const fotoInput = ref<HTMLInputElement | null>(null);
    const fotoFile = ref<File | null>(null);
    const fotoPreview = ref<string | null>(null);
    const fotoConfig = ref<ImageConfigDisplay | null>(null);
    const fotoEliminada = ref<boolean>(false);

    const abrirSelectorFoto = (): void => {
        fotoInput.value?.click();
    };

    const onFotoChange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const result = await validateImage(file, 'foto_raza_config');

        if (!result.valid) {
            notify('warn', 'Imagen no válida', result.error || 'Archivo no permitido');
            target.value = '';
            return;
        }

        fotoFile.value = file;
        fotoEliminada.value = false;
        const reader = new FileReader();
        reader.onload = () => {
            fotoPreview.value = reader.result as string;
        };
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

    const acceptFoto = computed<string | undefined>(() => {
        const mimes = fotoConfig.value?.mimeTypes;
        return mimes?.length ? mimes.join(',') : undefined;
    });

    const puedeSubirFoto = computed(() => Boolean(fotoConfig.value));

    const tipoSemovienteRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = tipoSemovienteRef.value?.$el as HTMLElement | null;
            if (el) {
                const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
                trigger?.focus();
                trigger?.click();
            }
        }, 350);
    };

    const openNew = (): void => {
        openNewBase();
        fotoFile.value = null;
        fotoPreview.value = null;
        fotoEliminada.value = false;
        if (fotoInput.value) fotoInput.value.value = '';
    };

    const edit = async (data: any): Promise<void> => {
        await editBase(data);
        fotoPreview.value = formObj.value.foto || null;
        fotoFile.value = null;
        fotoEliminada.value = false;
        if (fotoInput.value) fotoInput.value.value = '';

        if (formObj.value.peso_promedio_adulto != null) {
            formObj.value.peso_promedio_adulto = Number(formObj.value.peso_promedio_adulto);
        }
        if (formObj.value.tipo_semoviente_id != null) {
            formObj.value.tipo_semoviente_id = Number(formObj.value.tipo_semoviente_id);
        }
    };

    const saveWithFoto = async (
        payload: Record<string, any>,
        file: File | null,
        id?: number | string | null,
        eliminarFoto: boolean = false,
    ): Promise<any> => {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                formData.append(key, value as any);
            }
        });

        if (file) {
            formData.append('foto', file);
        } else if (eliminarFoto) {
            formData.append('foto', '');
        }

        const url = id ? `/razas/${id}` : '/razas';
        const method = id ? 'PATCH' : 'POST';

        return $api(url, { method, body: formData });
    };

    const saveRaza = async (): Promise<void> => {
        submitted.value = true;

        if (!formObj.value.tipo_semoviente_id) {
            touched.value.tipo_semoviente_id = true;
            notify('warn', 'Campos incompletos', 'Debe seleccionar un tipo de semoviente.');
            return;
        }
        if (!formObj.value.raza?.trim()) {
            notify('warn', 'Campos incompletos', 'El nombre de la raza es obligatorio.');
            return;
        }
        if ($rules.longitudMinima(3)(formObj.value.raza) !== true) {
            notify('warn', 'Raza inválida', $rules.longitudMinima(3)(formObj.value.raza));
            return;
        }
        if (!formObj.value.codigo?.trim()) {
            notify('warn', 'Campos incompletos', 'El código es obligatorio.');
            return;
        }
        if ($rules.codigoAlfanumerico(2)(formObj.value.codigo) !== true) {
            notify('warn', 'Código inválido', $rules.codigoAlfanumerico(2)(formObj.value.codigo));
            return;
        }
        if (
            formObj.value.peso_promedio_adulto != null &&
            formObj.value.peso_promedio_adulto !== '' &&
            $rules.soloDinero()(formObj.value.peso_promedio_adulto) !== true
        ) {
            notify('warn', 'Peso inválido', $rules.soloDinero()(formObj.value.peso_promedio_adulto));
            return;
        }
        if (
            formObj.value.peso_promedio_adulto != null &&
            formObj.value.peso_promedio_adulto !== '' &&
            Number(formObj.value.peso_promedio_adulto) <= 0
        ) {
            notify('warn', 'Peso inválido', 'El peso promedio debe ser mayor a 0.');
            return;
        }

        try {
            loading.value = true;

            const payload: Record<string, any> = {
                tipo_semoviente_id: Number(formObj.value.tipo_semoviente_id),
                raza: formObj.value.raza?.trim().toUpperCase(),
                codigo: formObj.value.codigo?.trim().toUpperCase(),
            };

            const opcionales = ['descripcion', 'origen'];
            opcionales.forEach((key) => {
                const val = (formObj.value as any)[key];
                if (val !== null && val !== undefined && val !== '') {
                    payload[key] = typeof val === 'string' ? val.trim() : val;
                }
            });

            if (
                formObj.value.peso_promedio_adulto != null &&
                formObj.value.peso_promedio_adulto !== ''
            ) {
                payload.peso_promedio_adulto = Number(formObj.value.peso_promedio_adulto);
            }

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;
            await saveWithFoto(payload, fotoFile.value, pk, fotoEliminada.value);

            notify(
                'success',
                isUpdate.value ? 'Actualizado' : 'Creado',
                'Registro guardado correctamente.'
            );

            lazyParams.value.first = 0;
            onSearch();

            hideDialog();
            fotoFile.value = null;
            fotoPreview.value = null;
            fotoEliminada.value = false;
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar la raza.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;

            notify(
                'error',
                isUpdate.value ? 'Error al actualizar' : 'Error al crear',
                firstError
            );
            console.error('Error al guardar raza:', err);
        } finally {
            loading.value = false;
        }
    };

    const onExactMatchChange = (value: number): void => {
        filters.value.exactMatch = value;
        onSearch();
    };

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const onImageError = (event: Event): void => {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
    };

    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'codigo', header: 'CÓDIGO', template: 'body-codigo', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'raza', header: 'RAZA', template: 'body-raza', sortable: true },
        { field: 'tipo_semoviente_nombre', header: 'TIPO SEMOVIENTE', template: 'body-tipo_semoviente', sortable: true, class: 'w-40', bodyClass: '!text-center' },
        { field: 'peso_promedio_adulto', header: 'PESO PROM.', template: 'body-peso_promedio_adulto', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    onMounted(async () => {
        fotoConfig.value = await getConfigDisplay('foto_raza_config');
        await cargarTiposSemovientes();
        lazyParams.value.sortField = 'raza_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>