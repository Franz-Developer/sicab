<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\sucursales\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-map-marker"
        title="Sucursales"
        subtitle="Gestión de sucursales por empresa"
        :show-action="permisos.crear && !!filters.empresa_id"
        action-label="NUEVA SUCURSAL"
        action-icon="pi pi-plus"
        @action="openNewConEmpresa"
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
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: Sucursal, código, teléfono..."
                        :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de sucursales"
                        @search="onSearch" @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Empresa -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Empresa
                                </label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear
                                    appendTo="body"
                                    :loading="loadingEmpresas" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo }}</span>
            </template>

            <template #body-codigo_sin="{ data }">
                <span class="cell-code">{{ data.codigo_sin }}</span>
            </template>

            <template #body-sucursal="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal }}</span>
                    <span v-if="data.sucursal_largo" class="cell-secondary">
                        <span class="font-bold">LARGO:</span> {{ data.sucursal_largo }}
                    </span>
                </div>
            </template>

            <template #body-empresa="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.empresa_nombre }}</span>
                    <span v-if="data.empresa_codigo" class="cell-secondary">
                        <span class="font-bold">CÓDIGO:</span> {{ data.empresa_codigo }}
                    </span>
                </div>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge
                    :estado="data.estado_registro"
                    :estado-id="Number(data.estado_id)"
                />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions
                    :estado-id="Number(data.estado_id)"
                    :puede="permisos"
                    @edit="handleEdit(data)"
                    @toggle="toggleEstado(data)"
                    @delete="confirmDelete(data)"
                />
            </template>

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <!-- Contacto y ubicación -->
                        <div class="expansion-item">
                            <span class="expansion-label">Teléfono</span>
                            <span class="expansion-value">
                                <template v-if="data.telefono">
                                    <i class="pi pi-phone text-[10px] mr-1"></i>{{ data.telefono || '—' }}
                                </template>
                                <template v-else>—</template>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Ubicación</span>
                            <span class="expansion-value">{{ data.ubicacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Horario de Atención</span>
                            <span class="expansion-value">{{ data.horario_atencion || '—' }}</span>
                        </div>

                        <!-- Auditoría -->
                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value">{{ data.usuario_operacion || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value">{{ data.fecha_registro || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Actualización</span>
                            <span class="expansion-value">{{ data.fecha_actualizacion || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[680px] lg:w-[720px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusEmpresa"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-map-marker text-white text-lg"></i>
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
                    <span>Información de la Sucursal</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Empresa -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Empresa <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            ref="empresaSelectRef"
                            v-model="formObj.empresa_id"
                            :options="empresaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar empresa..."
                            size="sm"
                            filter
                            :loading="loadingEmpresas"
                            :disabled="estaProtegido('empresa_id') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('empresa_id') && !authStore.isAdmin }"
                            @update:model-value="touched.empresa_id = true"
                        />
                        <small v-if="estaProtegido('empresa_id') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.empresa_id) && !formObj.empresa_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar una empresa
                        </small>
                    </div>

                    <!-- Sucursal -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sucursal <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            ref="sucursalRef"
                            v-model="formObj.sucursal"
                            :maxlength="150"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('sucursal') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('sucursal') && !authStore.isAdmin }"
                            @blur="touched.sucursal = true"
                        />
                        <small v-if="estaProtegido('sucursal') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.sucursal) && !formObj.sucursal?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El nombre de la sucursal es obligatorio
                        </small>
                    </div>

                    <!-- Sucursal Largo -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Sucursal (Nombre Largo) <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.sucursal_largo"
                            :maxlength="300"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('sucursal_largo') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('sucursal_largo') && !authStore.isAdmin }"
                            @blur="touched.sucursal_largo = true"
                        />
                        <small v-if="estaProtegido('sucursal_largo') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.sucursal_largo) && !formObj.sucursal_largo?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El nombre largo es obligatorio
                        </small>
                    </div>

                    <!-- Código -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.codigo"
                            :maxlength="30"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('codigo') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo') && !authStore.isAdmin }"
                            @blur="touched.codigo = true"
                        />
                        <small v-if="estaProtegido('codigo') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo) && !formObj.codigo?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El código es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo) && $rules.codigoMayusculas(3)(formObj.codigo) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.codigoMayusculas(3)(formObj.codigo) }}
                        </small>
                    </div>

                    <!-- Código SIN -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código SIN <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model.number="formObj.codigo_sin"
                            type="number"
                            :min="0"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('codigo_sin') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo_sin') && !authStore.isAdmin }"
                            @blur="touched.codigo_sin = true"
                        />
                        <small v-if="estaProtegido('codigo_sin') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo_sin) && (formObj.codigo_sin === null || formObj.codigo_sin === undefined || formObj.codigo_sin === '')"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El código SIN es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo_sin) && Number(formObj.codigo_sin) < 0"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe ser mayor o igual a 0
                        </small>
                    </div>

                    <!-- Teléfono -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Teléfono</label>
                        <BaseInput
                            v-model="formObj.telefono"
                            :maxlength="100"
                            size="sm"
                            placeholder=""
                        />
                    </div>

                    <!-- Horario Atención -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Horario de Atención</label>
                        <BaseInput
                            v-model="formObj.horario_atencion"
                            :maxlength="200"
                            size="sm"
                            placeholder=""
                        />
                    </div>

                    <!-- Ubicación -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Ubicación</label>
                        <BaseInput
                            v-model="formObj.ubicacion"
                            :maxlength="500"
                            size="sm"
                            placeholder=""
                        />
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
                    @click="save"
                />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Sucursal"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'Sucursales' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ DEPENDENCIAS ============
    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any;
    const authStore = useAuthStore();

    // ============ CONSTANTES ============
    const empresaIdInicial: number | null = Number(authStore.user?.empresa_id) || null;

    // ============ FLAG: distinguir crear vs editar ============
    let esEdicion = false;

    // ============ ESTADO DE CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const loadingEmpresas = ref(false);

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

    // ============ SUGERIR CÓDIGO SIN ============
    const sugerirCodigoSin = async (empresaId: number | null | undefined): Promise<void> => {
        if (!empresaId) {
            formObj.value.codigo_sin = 0;
            return;
        }

        try {
            const res: any = await $api('/sucursales/siguiente-codigo-sin', {
                method: 'GET',
                params: { empresa_id: Number(empresaId) },
            });

            const siguiente = Number(res?.codigo_sin);
            formObj.value.codigo_sin = Number.isFinite(siguiente) && siguiente >= 0 ? siguiente : 0;
        } catch (err) {
            console.warn('No se pudo obtener el siguiente codigo_sin:', err);
            formObj.value.codigo_sin = 0;
        }
    };

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew, edit, hideDialog, save,
        toggleEstado, confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'sucursales',
        sortFieldDefault: 'sucursal_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: ['empresa_id', 'sucursal', 'sucursal_largo', 'codigo', 'codigo_sin'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: empresaIdInicial,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.sucursal_id,

        getCleanForm: () => ({
            sucursal_id: null,
            empresa_id: empresaIdInicial ? Number(empresaIdInicial) : null,
            sucursal: '',
            sucursal_largo: '',
            codigo: '',
            codigo_sin: 0,
            telefono: '',
            ubicacion: '',
            horario_atencion: '',
        }),

        buildPayload: (form: any) => {
            const payload: Record<string, any> = {
                empresa_id: Number(form.empresa_id),
                sucursal: form.sucursal?.trim().toUpperCase(),
                sucursal_largo: form.sucursal_largo?.trim().toUpperCase(),
                codigo: form.codigo?.trim().toUpperCase(),
                codigo_sin: Number(form.codigo_sin),
            };

            if (form.telefono?.trim()) payload.telefono = form.telefono.trim();
            if (form.ubicacion?.trim()) payload.ubicacion = form.ubicacion.trim();
            if (form.horario_atencion?.trim()) payload.horario_atencion = form.horario_atencion.trim();

            return payload;
        },

        validate: (form: any, rules: any, notify: any) => {
            if (!form.empresa_id) {
                touched.value.empresa_id = true;
                notify('warn', 'Empresa requerida', 'Debe seleccionar una empresa.');
                return false;
            }
            if (!form.sucursal?.trim()) {
                touched.value.sucursal = true;
                notify('warn', 'Sucursal requerida', 'El nombre de la sucursal es obligatorio.');
                return false;
            }
            if (!form.sucursal_largo?.trim()) {
                touched.value.sucursal_largo = true;
                notify('warn', 'Nombre largo requerido', 'El nombre largo de la sucursal es obligatorio.');
                return false;
            }
            if (!form.codigo?.trim()) {
                touched.value.codigo = true;
                notify('warn', 'Código requerido', 'El código es obligatorio.');
                return false;
            }
            if (rules.codigoMayusculas(3)(form.codigo) !== true) {
                touched.value.codigo = true;
                notify('warn', 'Código inválido', rules.codigoMayusculas(3)(form.codigo));
                return false;
            }
            if (form.codigo_sin === null || form.codigo_sin === undefined || form.codigo_sin === '') {
                touched.value.codigo_sin = true;
                notify('warn', 'Código SIN requerido', 'El código SIN es obligatorio.');
                return false;
            }
            if (Number(form.codigo_sin) < 0) {
                touched.value.codigo_sin = true;
                notify('warn', 'Código SIN inválido', 'El código SIN debe ser mayor o igual a 0.');
                return false;
            }
            return true;
        },
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR SUCURSAL' : 'NUEVA SUCURSAL'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de la sucursal'
            : 'Registro de la sucursal'
    );

    // ============ ESTADO ADICIONAL ============
    const empresaSelectRef = ref<any>(null);

    // ============ FOCUS INICIAL ============
    const focusEmpresa = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = empresaSelectRef.value?.getSelectEl?.() as HTMLElement | null;
            if (!el) return;
            const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
            if (trigger) {
                trigger.focus();
                trigger.click();
            } else {
                el.click();
            }
        }, 350);
    };

    // ============ OVERRIDE openNew / edit ============
    const openNewConEmpresa = async (): Promise<void> => {
        esEdicion = false;
        openNew();
        const empresaId = filters.value.empresa_id ? Number(filters.value.empresa_id) : null;

        if (empresaId) {
            formObj.value.empresa_id = empresaId;
            await sugerirCodigoSin(empresaId);
        } else {
            formObj.value.codigo_sin = 0;
        }
    };

    const handleEdit = async (item: any): Promise<void> => {
        esEdicion = true;

        if (empresaOptions.value.length === 0) {
            await cargarEmpresas();
        }

        const empresaId = item.empresa_id != null ? Number(item.empresa_id) : null;
        const existe = empresaOptions.value.some(o => o.value === empresaId);

        if (empresaId && !existe) {
            empresaOptions.value = [
                ...empresaOptions.value,
                {
                    label: item.empresa_nombre
                        ? `${item.empresa_codigo ?? ''} — ${item.empresa_nombre}`.trim()
                        : `Empresa ${empresaId}`,
                    value: empresaId,
                },
            ];
        }

        await edit(item);   // ← CON await (fix timing)
        formObj.value.empresa_id = empresaId;
        formObj.value.codigo_sin = item.codigo_sin != null ? Number(item.codigo_sin) : 0;
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'codigo',          header: 'CÓDIGO',    sortable: true,  template: 'body-codigo',     bodyClass: '!text-center', class: 'w-40' },
        { field: 'codigo_sin',      header: 'CÓD. SIN',  sortable: true,  template: 'body-codigo_sin', bodyClass: '!text-center', class: 'w-24' },
        { field: 'sucursal',        header: 'SUCURSAL',  sortable: true,  template: 'body-sucursal' },
        { field: 'empresa_nombre',  header: 'EMPRESA',   sortable: true,  template: 'body-empresa',    class: 'w-48' },
        { field: 'estado_registro', header: 'ESTADO',    sortable: false, template: 'body-estado',     bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES',       template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const codigo = formObj.value.codigo ?? '';
        const sucursal = formObj.value.sucursal ?? '';
        return `${codigo} — ${sucursal}`;
    });

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed<number>(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.empresa_id = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ WATCH: Auto-sugerir codigo_sin al cambiar empresa (solo creación) ============
    watch(
        () => formObj.value.empresa_id,
        async (newId, oldId) => {
            if (esEdicion) { return; }
            if (!newId || newId === oldId) { return; }
            if (!dialog.value) { return; }
            await sugerirCodigoSin(Number(newId));
        }
    );

    // ============ WATCH: Normalizar tipos al abrir el diálogo ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.empresa_id != null) {
                formObj.value.empresa_id = Number(formObj.value.empresa_id);
            }
            if (formObj.value.codigo_sin != null) {
                formObj.value.codigo_sin = Number(formObj.value.codigo_sin);
            }

            const empresaId = formObj.value.empresa_id;
            if (empresaId && !empresaOptions.value.some(o => o.value === empresaId)) {
                const item = items.value.find((i: any) => Number(i.empresa_id) === empresaId);
                empresaOptions.value = [
                    ...empresaOptions.value,
                    {
                        label: item
                            ? `${item.empresa_codigo ?? ''} — ${item.empresa_nombre}`.trim()
                            : `Empresa ${empresaId}`,
                        value: empresaId,
                    },
                ];
            }
        }, 150);
    });

    // ============ INIT ============
    onMounted(async () => {
        await cargarEmpresas();
        lazyParams.value.sortField = 'sucursal_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        if (filters.value.empresa_id) {
            onSearch();
        }
    });
</script>
