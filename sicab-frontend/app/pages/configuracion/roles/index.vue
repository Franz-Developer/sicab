<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\roles\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-shield"
        title="Roles"
        subtitle="Catálogo de roles del sistema"
        :show-action="permisos.crear"
        action-label="NUEVO ROL"
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
                    <FilterBar :filters="filters" search-placeholder="Buscar: rol, código, descripción..."
                        @search="onSearch" />
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-codigo="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.codigo }}</span>

                    <span v-if="Number(data.es_admin) === 1" class="tag-principal">
                        ADMIN
                    </span>
                </div>
            </template>

            <template #body-rol="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.rol }}</span>
                    <span v-if="data.descripcion" class="cell-secondary" :title="data.descripcion">
                        <span class="font-bold">DESCRIPCIÓN:</span> {{ data.descripcion }}
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
                    @edit="edit(data)"
                    @toggle="toggleEstado(data)"
                    @delete="confirmDelete(data)"
                />
            </template>

            <!-- ═══════════ EXPANSIÓN ═══════════ -->
            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
                        <div class="expansion-item">
                            <span class="expansion-label">Es Administrador</span>
                            <span class="expansion-value">
                                {{ Number(data.es_admin) === 1 ? 'Sí' : 'No' }}
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

    <!-- ═══════════ DIALOG CREAR / EDITAR ═══════════ -->
    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[720px] lg:w-[780px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusFirstInput"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-shield text-white text-lg"></i>
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
                    <span>Información del Rol</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Nombre del Rol -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nombre del Rol <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            ref="rolRef"
                            v-model="formObj.rol"
                            :maxlength="60"
                            size="sm"
                            placeholder="Ej: ADMINISTRADOR"
                            :disabled="estaProtegido('rol') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('rol') && !authStore.isAdmin }"
                            @blur="touched.rol = true"
                        />
                        <small v-if="estaProtegido('rol') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.rol) && !formObj.rol?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El nombre del rol es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.rol) && $rules.longitudMinima(3)(formObj.rol) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.longitudMinima(3)(formObj.rol) }}
                        </small>
                    </div>

                    <!-- Código -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            v-model="formObj.codigo"
                            :maxlength="60"
                            size="sm"
                            placeholder="Ej: ADMIN"
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

                    <!-- Descripción -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <textarea
                            v-model="formObj.descripcion"
                            :maxlength="500"
                            rows="3"
                            placeholder="Describe el propósito del rol (opcional)"
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
                    @click="save"
                />
            </div>
        </template>
    </BaseDialog>

    <!-- ═══════════ DIALOG ELIMINAR ═══════════ -->
    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Rol"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, nextTick } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import { useNotify } from '~/composables/useNotify';

    useHead({ title: 'Roles' });

    // ============ DEPENDENCIAS ============
    const authStore = useAuthStore();
    const { $rules } = useNuxtApp() as any;
    const { notify } = useNotify();

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew, edit, hideDialog,
        save: saveBase,
        toggleEstado: toggleEstadoBase,
        confirmDelete,
        deleteItem: deleteItemBase,
    } = useCrudTable<any>({
        tabla: 'roles',
        sortFieldDefault: 'rol_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        // Coincide con FindRolesQueryDto.getCamposProtegidosConDependencias()
        camposProtegidosPorDependencia: ['rol', 'codigo'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            rol_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.rol_id) extra.rol_id = Number(f.rol_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.rol_id,

        getCleanForm: () => ({
            rol_id: null,
            rol: '',
            codigo: '',
            descripcion: '',
        }),

        // Construye el payload como CreateRolDto
        buildPayload: (form: any) => {
            const payload: Record<string, any> = {
                rol: form.rol?.trim().toUpperCase(),
                codigo: form.codigo?.trim().toUpperCase(),
            };

            if (form.descripcion?.trim()) {
                payload.descripcion = form.descripcion.trim();
            }

            return payload;
        },

        // Validaciones que replican CreateRolDto del backend
        validate: (form: any, rules: any, notify: any) => {
            // ── Rol ──
            if (!form.rol?.trim()) {
                touched.value.rol = true;
                notify('warn', 'Rol requerido', 'El nombre del rol es obligatorio.');
                return false;
            }
            if (rules.longitudMinima(3)(form.rol) !== true) {
                touched.value.rol = true;
                notify('warn', 'Rol inválido', rules.longitudMinima(3)(form.rol));
                return false;
            }
            if (form.rol.trim().length > 60) {
                touched.value.rol = true;
                notify('warn', 'Rol inválido', 'Máximo 60 caracteres.');
                return false;
            }

            // ── Código ──
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
            if (form.codigo.trim().length > 60) {
                touched.value.codigo = true;
                notify('warn', 'Código inválido', 'Máximo 60 caracteres.');
                return false;
            }

            return true;
        },
    });

    // ============ INVALIDACIÓN DE CACHÉ / AVISO DE RE-LOGIN ============
    const manejarCambioDeRol = (): void => {
        const rolAfectado = formObj.value?.rol_id != null
            ? Number(formObj.value.rol_id)
            : Number(filters.value?.rol_id ?? NaN);

        const rolActual = authStore.user?.rol_id != null
            ? Number(authStore.user.rol_id)
            : NaN;

        // Solo notificar si el rol editado es el del usuario actual (caso especial).
        // Para el resto de casos, el toast genérico de useCrudTable ya informa al usuario.
        if (!Number.isNaN(rolAfectado) && rolAfectado === rolActual) {
            notify(
                'warn',
                'Tu sesión cambiará',
                'Modificaste tu propio rol. Serás redirigido al login en 2 segundos para aplicar los cambios.'
            );
            setTimeout(() => authStore.logout(), 2000);
        }
    };

    const save = async (): Promise<void> => {
        const dialogAntes = dialog.value;
        await saveBase();
        // Solo actuar si el guardado fue exitoso (useCrudTable cierra el diálogo en el happy path)
        if (dialogAntes && !dialog.value) manejarCambioDeRol();
    };

    const toggleEstado = async (item: any): Promise<void> => {
        await toggleEstadoBase(item);
        manejarCambioDeRol();
    };

    const deleteItem = async (): Promise<void> => {
        const deleteAntes = deleteDialog.value;
        await deleteItemBase();
        if (deleteAntes && !deleteDialog.value) manejarCambioDeRol();
    };

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR ROL' : 'NUEVO ROL'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos del rol'
            : 'Registro de un nuevo rol'
    );

    // ============ FOCUS INICIAL ============
    const rolRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            const input = rolRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const codigo = formObj.value.codigo ?? '';
        const rol = formObj.value.rol ?? '';
        return `${codigo} — ${rol}`;
    });

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'codigo',          header: 'CÓDIGO',  sortable: true,  template: 'body-codigo', class: 'w-40' },
        { field: 'rol',             header: 'ROL',     sortable: true,  template: 'body-rol' },
        { field: 'estado_registro', header: 'ESTADO',  sortable: false, template: 'body-estado',   bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES',       template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ INIT ============
    onMounted(() => {
        lazyParams.value.sortField = 'rol_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
