<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\empresas-cuentas\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-credit-card"
        title="Cuentas Bancarias"
        subtitle="Registro de cuentas bancarias por empresa"
        :show-action="permisos.crear && !!filters.empresa_id"
        action-label="NUEVA CUENTA"
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
                    <FilterBar :filters="filters" search-placeholder="Buscar: Nro. cuenta, titular, banco..."
                        :active-filters-count="filtrosActivosCount"
                        modal-subtitle="Refina la búsqueda de cuentas bancarias" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Empresa -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Empresa
                                </label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear appendTo="body"
                                    :loading="loadingEmpresas" @update:model-value="onEmpresaChange" class="w-full" />
                            </div>

                            <!-- Banco -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Banco
                                </label>
                                <BaseSelect v-model="filters.banco_id" :options="bancoOptions" option-label="label"
                                    option-value="value" placeholder="Todos los bancos" size="sm" filter show-clear
                                    appendTo="body"
                                    :loading="loadingBancos" @update:model-value="onFilterChange" class="w-full" />
                            </div>

                            <!-- Tipo Moneda -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Tipo Moneda
                                </label>
                                <BaseSelect v-model="filters.tipo_moneda_id" :options="tipoMonedaOptions"
                                    option-label="label" option-value="value" placeholder="Todas las monedas" size="sm"
                                    show-clear appendTo="body" @update:model-value="onFilterChange" class="w-full" />
                            </div>

                            <!-- Tipo Cuenta -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Tipo Cuenta
                                </label>
                                <BaseSelect v-model="filters.tipo_cuenta_id" :options="tipoCuentaOptions"
                                    option-label="label" option-value="value" placeholder="Todas las cuentas" size="sm"
                                    show-clear appendTo="body" @update:model-value="onFilterChange" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <template #body-nro_cuenta="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.nro_cuenta }}</span>
                    <span v-if="data.tipo_cuenta?.abreviatura" class="cell-secondary">
                        <span class="font-bold">TIPO:</span> {{ data.tipo_cuenta.abreviatura }}
                    </span>
                    <span v-if="Number(data.es_principal) === 1" class="tag-principal">
                        PRINCIPAL
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

            <template #body-banco="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.banco_nombre }}</span>
                    <span v-if="data.banco_abreviatura" class="cell-secondary">
                        <span class="font-bold">ABREV:</span> {{ data.banco_abreviatura }}
                    </span>
                    <span v-if="data.banco_codigo_asfi" class="cell-secondary">
                        <span class="font-bold">COD. ASFI:</span> {{ data.banco_codigo_asfi }}
                    </span>
                </div>
            </template>

            <template #body-tipo_moneda="{ data }">
                <span class="cell-primary">{{ data.tipo_moneda?.abreviatura }}</span>
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
                        <!-- Titular (no está en la tabla) -->
                        <div class="expansion-item">
                            <span class="expansion-label">Titular</span>
                            <span class="expansion-value">{{ data.titular || '—' }}</span>
                        </div>

                        <!-- Tipo de cuenta: label largo (en tabla solo va la abreviatura) -->
                        <div class="expansion-item">
                            <span class="expansion-label">Tipo Cuenta</span>
                            <span class="expansion-value">{{ data.tipo_cuenta?.label || '—' }}</span>
                        </div>

                        <!-- Es principal explícito -->
                        <div class="expansion-item">
                            <span class="expansion-label">Cuenta Principal</span>
                            <span class="expansion-value">
                                {{ Number(data.es_principal) === 1 ? 'Sí' : 'No' }}
                            </span>
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

    <Dialog
        v-model:visible="dialog"
        :modal="true"
        :closable="!loading"
        class="custom-modal crud-celeste-dialog w-[95vw] sm:w-[90vw] md:w-[820px] lg:w-[900px]"
        :style="{ maxHeight: '92vh' }"
        @show="focusEmpresa"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-credit-card text-white text-lg"></i>
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
                    <span>Información de la Cuenta</span>
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
                            :disabled="estaProtegido('empresa_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('empresa_id') }"
                            @update:model-value="touched.empresa_id = true"
                        />
                        <small v-if="estaProtegido('empresa_id')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.empresa_id) && $rules.obligatoria()(formObj.empresa_id) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <!-- Banco -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Banco <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.banco_id"
                            :options="bancoOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar banco..."
                            size="sm"
                            filter
                            :loading="loadingBancos"
                            :disabled="estaProtegido('banco_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('banco_id') }"
                            @update:model-value="touched.banco_id = true"
                        />
                        <small v-if="estaProtegido('banco_id')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.banco_id) && $rules.seleccionObligatoria()(formObj.banco_id) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <!-- Nro Cuenta -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nro. Cuenta <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.nro_cuenta"
                            :maxlength="50"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('nro_cuenta')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('nro_cuenta') }"
                            @blur="touched.nro_cuenta = true"
                        />
                        <small v-if="estaProtegido('nro_cuenta')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.nro_cuenta) && !formObj.nro_cuenta?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                        <small
                            v-else-if="(submitted || touched.nro_cuenta) && $rules.numeroCuenta()(formObj.nro_cuenta) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.numeroCuenta()(formObj.nro_cuenta) }}
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
                            v-if="(submitted || touched.tipo_moneda_id) && $rules.seleccionObligatoria()(formObj.tipo_moneda_id) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <!-- Tipo Cuenta -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Tipo Cuenta <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.tipo_cuenta_id"
                            :options="tipoCuentaOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar..."
                            size="sm"
                            @update:model-value="touched.tipo_cuenta_id = true"
                        />
                        <small
                            v-if="(submitted || touched.tipo_cuenta_id) && $rules.seleccionObligatoria()(formObj.tipo_cuenta_id) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <!-- Titular -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Titular <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.titular"
                            :maxlength="150"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('titular')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('titular') }"
                            @blur="touched.titular = true"
                        />
                        <small v-if="estaProtegido('titular')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.titular) && !formObj.titular?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                        <small
                            v-else-if="(submitted || touched.titular) && $rules.longitudMinima(3)(formObj.titular) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.longitudMinima(3)(formObj.titular) }}
                        </small>
                    </div>

                    <!-- Es Principal -->
                    <div class="md:col-span-12">
                        <div class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                id="es_principal"
                                v-model.number="formObj.es_principal"
                                type="checkbox"
                                :true-value="1"
                                :false-value="0"
                                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label for="es_principal" class="text-[11px] font-bold text-slate-700 uppercase cursor-pointer select-none">
                                Marcar como cuenta principal
                            </label>
                        </div>
                        <small class="text-slate-500 text-[10px] mt-1 block">
                            Solo puede existir una cuenta principal por empresa. Si marcas esta, se desmarcará automáticamente la anterior.
                        </small>
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
    </Dialog>

    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Cuenta Bancaria"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
    import { TipoMoneda, TIPO_MONEDA_METADATA, TipoCuenta, TIPO_CUENTA_METADATA, ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'Cuentas Bancarias' });

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

    // ============ ESTADO DE CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const bancoOptions = shallowRef<OptionItem[]>([]);
    const loadingEmpresas = ref(false);
    const loadingBancos = ref(false);

    // ============ OPCIONES DERIVADAS DE CONSTANTES ============
    const tipoMonedaOptions: OptionItem[] = Object.values(TipoMoneda)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_MONEDA_METADATA[id as TipoMoneda];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const tipoCuentaOptions: OptionItem[] = Object.values(TipoCuenta)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = TIPO_CUENTA_METADATA[id as TipoCuenta];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    // ============ FUNCIONES DE CARGA DE CATÁLOGOS ============
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

    const cargarBancos = async (): Promise<void> => {
        loadingBancos.value = true;
        try {
            const res: any = await $api('/bancos', {
                method: 'GET',
                params: { limit: 1000, sortField: 'banco', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            bancoOptions.value = lista.map((b: any): OptionItem => ({
                label: `${b.banco}`,
                value: Number(b.banco_id),
            }));
        } catch (err) {
            console.error('Error al cargar bancos:', err);
            bancoOptions.value = [];
        } finally {
            loadingBancos.value = false;
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
        tabla: 'empresas-cuentas',
        tablaPermisos: 'empresas_cuentas',
        sortFieldDefault: 'empresa_cuenta_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: empresaIdInicial,
            banco_id: null,
            tipo_moneda_id: null,
            tipo_cuenta_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.banco_id) extra.banco_id = Number(f.banco_id);
            if (f.tipo_moneda_id) extra.tipo_moneda_id = f.tipo_moneda_id;
            if (f.tipo_cuenta_id) extra.tipo_cuenta_id = f.tipo_cuenta_id;
            return extra;
        },

        getPrimaryKey: (item: any) => item.empresa_cuenta_id,

        getCleanForm: () => ({
            empresa_cuenta_id: null,
            empresa_id: empresaIdInicial ? Number(empresaIdInicial) : null,
            banco_id: null,
            tipo_moneda_id: TipoMoneda.BOLIVIANO,
            nro_cuenta: '',
            tipo_cuenta_id: TipoCuenta.NO_APLICA,
            titular: '',
            es_principal: 0
        }),

        buildPayload: (form: any) => ({
            empresa_id: Number(form.empresa_id),
            banco_id: Number(form.banco_id),
            tipo_moneda_id: Number(form.tipo_moneda_id),
            nro_cuenta: form.nro_cuenta?.trim(),
            tipo_cuenta_id: Number(form.tipo_cuenta_id),
            titular: form.titular?.trim().toUpperCase(),
            es_principal: Number(form.es_principal ?? 0),
        }),

        validate: (form: any, rules: any, notify: any) => {
            if (rules.obligatoria()(form.empresa_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar una empresa.');
                return false;
            }
            if (rules.seleccionObligatoria()(form.banco_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar un banco.');
                return false;
            }
            if (rules.numeroCuenta()(form.nro_cuenta) !== true) {
                notify('warn', 'Nro. cuenta inválido', rules.numeroCuenta()(form.nro_cuenta));
                return false;
            }
            if (rules.seleccionObligatoria()(form.tipo_moneda_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar un tipo de moneda.');
                return false;
            }
            if (rules.seleccionObligatoria()(form.tipo_cuenta_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar un tipo de cuenta.');
                return false;
            }
            if (rules.longitudMinima(3)(form.titular) !== true) {
                notify('warn', 'Campos incompletos', 'El titular es obligatorio (mín. 3 caracteres).');
                return false;
            }
            return true;
        },
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR CUENTA' : 'NUEVA CUENTA'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de la cuenta bancaria'
            : 'Registro de nueva cuenta bancaria'
    );

    // ============ ESTADO ADICIONAL ============
    const empresaSelectRef = ref<any>(null);

    // ============ FOCUS INICIAL ============
    const focusEmpresa = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const el = empresaSelectRef.value?.$el as HTMLElement | null;
            if (!el) return;
            const trigger = el.querySelector('.p-select-label') as HTMLElement | null;
            trigger?.click();
        }, 350);
    };

    // ============ OVERRIDE openNew / edit ============
    const openNewConEmpresa = (): void => {
        if (!filters.value.empresa_id) return;
        openNew();
        formObj.value.empresa_id = Number(filters.value.empresa_id);
    };

    const handleEdit = async (item: any): Promise<void> => {
        // Asegurar catálogos cargados
        if (empresaOptions.value.length === 0) await cargarEmpresas();
        if (bancoOptions.value.length === 0)   await cargarBancos();

        // Normalizar a number
        const empresaId = item.empresa_id != null ? Number(item.empresa_id) : null;
        const bancoId   = item.banco_id   != null ? Number(item.banco_id)   : null;

        // Agregar opciones temporales si no existen
        if (empresaId && !empresaOptions.value.some(o => o.value === empresaId)) {
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
        if (bancoId && !bancoOptions.value.some(o => o.value === bancoId)) {
            bancoOptions.value = [
                ...bancoOptions.value,
                {
                    label: item.banco_nombre
                        ? `${item.banco_abreviatura ?? ''} — ${item.banco_nombre}`.trim()
                        : `Banco ${bancoId}`,
                    value: bancoId,
                },
            ];
        }

        edit(item);
        formObj.value.empresa_id = empresaId;
        formObj.value.banco_id = bancoId;
        formObj.value.tipo_moneda_id = Number(item.tipo_moneda_id);
        formObj.value.tipo_cuenta_id = Number(item.tipo_cuenta_id);
        formObj.value.es_principal = Number(item.es_principal ?? 0);
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'nro_cuenta', header: 'NRO. CUENTA', sortable: true, template: 'body-nro_cuenta', bodyClass: '!text-left', class: 'w-44' },
        { field: 'empresa_nombre', header: 'EMPRESA', sortable: true, template: 'body-empresa', class: 'w-56' },
        { field: 'banco_nombre', header: 'BANCO', sortable: true, template: 'body-banco' },
        { field: 'tipo_moneda_id', header: 'MONEDA', sortable: true, template: 'body-tipo_moneda', bodyClass: '!text-center', class: 'w-20' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-20' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-24' },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const nro = formObj.value.nro_cuenta ?? '';
        const titular = formObj.value.titular ?? '';
        return `Cuenta ${nro} — ${titular}`;
    });

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.banco_id) count++;
        if (filters.value.tipo_moneda_id) count++;
        if (filters.value.tipo_cuenta_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.empresa_id = null;
        filters.value.banco_id = null;
        filters.value.tipo_moneda_id = null;
        filters.value.tipo_cuenta_id = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    const onFilterChange = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const onEmpresaChange = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ WATCHES: Normalización de tipos (existentes) ============
    watch(() => formObj.value.empresa_id, (val) => {
        if (val != null && val !== '' && typeof val === 'string') {
            formObj.value.empresa_id = Number(val);
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
    });

    watch(() => formObj.value.banco_id, (val) => {
        if (val != null && val !== '' && typeof val === 'string') {
            formObj.value.banco_id = Number(val);
        }
        const bancoId = formObj.value.banco_id;
        if (bancoId && !bancoOptions.value.some(o => o.value === bancoId)) {
            const item = items.value.find((i: any) => Number(i.banco_id) === bancoId);
            bancoOptions.value = [
                ...bancoOptions.value,
                {
                    label: item
                        ? `${item.banco_abreviatura ?? ''} — ${item.banco_nombre}`.trim()
                        : `Banco ${bancoId}`,
                    value: bancoId,
                },
            ];
        }
    });

    watch(() => formObj.value.tipo_moneda_id, (val) => {
        if (val != null && val !== '' && typeof val === 'string') {
            formObj.value.tipo_moneda_id = Number(val);
        }
    });

    watch(() => formObj.value.tipo_cuenta_id, (val) => {
        if (val != null && val !== '' && typeof val === 'string') {
            formObj.value.tipo_cuenta_id = Number(val);
        }
    });

    // ============ WATCH ADICIONAL: Normalización al abrir el diálogo ============
    // (Equivalente al de `nits/index.vue` para mantener consistencia de arquitectura.
    //  No reemplaza a los watch anteriores, es complementario.)
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.empresa_id != null) {
                formObj.value.empresa_id = Number(formObj.value.empresa_id);
            }
            if (formObj.value.banco_id != null) {
                formObj.value.banco_id = Number(formObj.value.banco_id);
            }
            if (formObj.value.tipo_moneda_id != null) {
                formObj.value.tipo_moneda_id = Number(formObj.value.tipo_moneda_id);
            }
            if (formObj.value.tipo_cuenta_id != null) {
                formObj.value.tipo_cuenta_id = Number(formObj.value.tipo_cuenta_id);
            }
            formObj.value.es_principal = Number(formObj.value.es_principal ?? 0);

            // Asegurar opciones temporales si no están
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

            const bancoId = formObj.value.banco_id;
            if (bancoId && !bancoOptions.value.some(o => o.value === bancoId)) {
                const item = items.value.find((i: any) => Number(i.banco_id) === bancoId);
                bancoOptions.value = [
                    ...bancoOptions.value,
                    {
                        label: item
                            ? `${item.banco_abreviatura ?? ''} — ${item.banco_nombre}`.trim()
                            : `Banco ${bancoId}`,
                        value: bancoId,
                    },
                ];
            }
        }, 150);
    });

    // ============ INIT ============
    onMounted(async () => {
        await Promise.all([cargarEmpresas(), cargarBancos()]);
        lazyParams.value.sortField = 'empresa_cuenta_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
