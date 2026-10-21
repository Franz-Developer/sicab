<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\bancos\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-building-columns"
        title="Bancos"
        subtitle="Catálogo de entidades financieras"
        :show-action="permisos.crear"
        action-label="NUEVO BANCO"
        action-icon="pi pi-plus"
        @action="openNew"
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
                    <FilterBar :filters="filters"
                        search-placeholder="Buscar: banco, abreviatura, codigo asfi y descripción" @search="onSearch" />
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo_asfi }}</span>
            </template>

            <template #body-abreviatura="{ data }">
                <span class="cell-primary-normal">{{ data.abreviatura }}</span>
            </template>

            <template #body-banco="{ data }">
                <span class="cell-primary-normal">{{ data.banco }}</span>
            </template>

            <template #body-descripcion="{ data }">
                <span class="cell-primary-normal">{{ data.descripcion }}</span>
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
                    @edit="edit(data)"
                    @toggle="toggleEstado(data)"
                    @delete="confirmDelete(data)"
                />
            </template>

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Descripción</span>
                            <span class="expansion-value" :title="data.descripcion || '—'">
                                {{ data.descripcion || '—' }}
                            </span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Usuario Operación</span>
                            <span class="expansion-value" :title="data.usuario_operacion || '—'">
                                {{ data.usuario_operacion || '—' }}
                            </span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Registro</span>
                            <span class="expansion-value" :title="data.fecha_registro || '—'">
                                {{ data.fecha_registro || '—' }}
                            </span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Actualización</span>
                            <span class="expansion-value" :title="data.fecha_actualizacion || '—'">
                                {{ data.fecha_actualizacion || '—' }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG PRINCIPAL (CRUD) ═══════════ -->
    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[780px] lg:w-[820px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusFirstInput"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-building-columns text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">{{ tituloDialog }}</h3>
                    <p class="text-xs text-sky-700">{{ subtituloDialog }}</p>
                </div>
            </div>
        </template>

        <div>
            <div class="panel-contrast">
                <div class="flex justify-between items-center mb-3 text-blue-700 uppercase tracking-wider font-black text-xs">
                    <span>Información del Banco</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código ASFI <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            ref="codigoAsfiRef"
                            v-model="formObj.codigo_asfi"
                            :maxlength="2"
                            size="sm"
                            :disabled="estaProtegido('codigo_asfi') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('codigo_asfi') && !authStore.isAdmin }"
                            @blur="touched.codigo_asfi = true"
                        />
                        <small v-if="estaProtegido('codigo_asfi') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo_asfi) && $rules.obligatoria()(formObj.codigo_asfi) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                        <small
                            v-else-if="(submitted || touched.codigo_asfi) && formObj.codigo_asfi && !/^\d{2}$/.test(formObj.codigo_asfi)"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe ser 2 dígitos
                        </small>
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Abreviatura <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.abreviatura"
                            :maxlength="20"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('abreviatura') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('abreviatura') && !authStore.isAdmin }"
                            @blur="touched.abreviatura = true"
                        />
                        <small v-if="estaProtegido('abreviatura') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.abreviatura) && $rules.obligatoria()(formObj.abreviatura) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nombre del Banco <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.banco"
                            :maxlength="60"
                            size="sm"
                            placeholder=""
                            :disabled="estaProtegido('banco') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('banco') && !authStore.isAdmin }"
                            @blur="touched.banco = true"
                        />
                        <small v-if="estaProtegido('banco') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.banco) && $rules.obligatoria()(formObj.banco) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Requerido
                        </small>
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <BaseInput
                            v-model="formObj.descripcion"
                            :maxlength="255"
                            size="sm"
                            placeholder="Observaciones o notas adicionales"
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
        title="Eliminar Banco"
        :item-name="formObj.banco"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/auth';

    useHead({ title: 'Bancos' });

    // ============ DEPENDENCIAS ============
    const authStore = useAuthStore();
    const { $rules } = useNuxtApp() as any;

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew, edit, hideDialog, save,
        toggleEstado, confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'bancos',
        sortFieldDefault: 'banco_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        camposProtegidosPorDependencia: ['banco', 'codigo_asfi', 'abreviatura'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
        },

        getExtraFilters: (f: Record<string, any>) => ({
            exactMatch: f.exactMatch ?? 0,
        }),

        getPrimaryKey: (item: any) => item.banco_id,

        getCleanForm: () => ({
            banco_id: null,
            banco: '',
            codigo_asfi: '',
            abreviatura: '',
            descripcion: '',
        }),

        buildPayload: (form: any) => ({
            banco: form.banco?.trim().toUpperCase(),
            codigo_asfi: form.codigo_asfi?.trim(),
            abreviatura: form.abreviatura?.trim().toUpperCase(),
            descripcion: form.descripcion?.trim() || null,
        }),

        validate: (form: any, rules: any, notify: any) => {
            if (rules.obligatoria()(form.codigo_asfi) !== true) {
                notify('warn', 'Campos incompletos', 'El código ASFI es obligatorio');
                return false;
            }
            if (!/^\d{2}$/.test(form.codigo_asfi?.trim() ?? '')) {
                notify('warn', 'Formato inválido', 'El código ASFI debe ser 2 dígitos.');
                return false;
            }
            if ($rules.textoSeguro()(form.banco) !== true) {
                notify('warn', 'Texto inválido', 'El nombre contiene caracteres no permitidos.');
                return false;
            }
            if (form.banco?.trim().length < 3) {
                notify('warn', 'Formato inválido', 'El nombre del banco debe tener al menos 3 caracteres.');
                return false;
            }
            if (rules.obligatoria()(form.abreviatura) !== true) {
                notify('warn', 'Campos incompletos', 'La abreviatura es obligatoria');
                return false;
            }
            if (!/^[A-Z0-9_-]+$/.test(form.abreviatura?.trim() ?? '')) {
                notify('warn', 'Formato inválido', 'La abreviatura solo permite letras, números, guiones y guiones bajos.');
                return false;
            }
            if (rules.obligatoria()(form.banco) !== true) {
                notify('warn', 'Campos incompletos', 'El nombre del banco es obligatorio');
                return false;
            }
            return true;
        },
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR BANCO' : 'NUEVO BANCO'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de la entidad bancaria'
            : 'Registro de la entidad bancaria'
    );

    // ============ FOCUS INICIAL ============
    const codigoAsfiRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const input = codigoAsfiRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-6', style: 'width: 28px; max-width: 28px;', bodyClass: '!text-center' },
        { field: 'codigo_asfi', header: 'CÓDIGO', sortable: true, template: 'body-codigo', bodyClass: '!text-center', headerClass: '!text-center', class: 'w-16' },
        { field: 'abreviatura', header: 'ABREV.', sortable: true, template: 'body-abreviatura', class: 'w-20', bodyClass: '!text-center' },
        { field: 'banco', header: 'BANCO', sortable: true, template: 'body-banco', class: 'w-56', bodyClass: '!text-left' },
        { field: 'descripcion', header: 'DESCRIPCIÓN', sortable: true, template: 'body-descripcion', class: 'w-64', bodyClass: '!text-left' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-20' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center acciones-col', style: 'width: 70px; min-width: 70px; max-width: 70px;', headerClass: '!text-center', bodyClass: '!text-center !px-0' },
    ];

    // ============ INIT ============
    onMounted(() => {
        lazyParams.value.sortField = 'banco_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
