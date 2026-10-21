<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\usuarios\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-users"
        title="Usuarios"
        subtitle="Gestión de usuarios, roles y credenciales de acceso"
        :show-action="permisos.crear && !!filters.empresa_id"
        action-label="NUEVO USUARIO"
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
            <!-- ═══════════ FILTROS ═══════════ -->
            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: login, trabajador, DNI, rol, empresa..."
                        :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de usuarios"
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
                                    :loading="loadingEmpresas" @update:model-value="onEmpresaChange" class="w-full" />
                            </div>

                            <!-- Sucursal -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Sucursal
                                </label>
                                <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions"
                                    option-label="label" option-value="value" placeholder="Todas las sucursales"
                                    size="sm" filter show-clear appendTo="body" :loading="loadingSucursales"
                                    @update:model-value="onFilterChange" class="w-full" />
                            </div>

                            <!-- Rol -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Rol
                                </label>
                                <BaseSelect v-model="filters.rol_id" :options="rolOptions" option-label="label"
                                    option-value="value" placeholder="Todos los roles" size="sm" show-clear
                                    :loading="loadingRoles" @update:model-value="onFilterChange" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-login="{ data }">
                <div class="cell-stack">
                    <span class="cell-code">{{ data.login }}</span>
                    <span v-if="data.es_admin === true" class="tag-principal">
                        ADMINISTRADOR
                    </span>
                </div>
            </template>

            <template #body-trabajador="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.trabajador_nombre_completo }}</span>
                    <span v-if="data.trabajador_apodo" class="cell-secondary">
                        <span class="font-bold">APODO:</span> {{ data.trabajador_apodo }}
                    </span>
                </div>
            </template>

            <template #body-rol="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.rol_nombre }}</span>
                    <span v-if="data.rol_codigo" class="cell-secondary">
                        <span class="font-bold">CÓDIGO:</span> {{ data.rol_codigo }}
                    </span>
                </div>
            </template>

            <template #body-sucursal="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.sucursal_nombre }}</span>
                    <span v-if="data.empresa_nombre" class="cell-secondary">
                        {{ data.empresa_nombre }}
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
                    :puede="{
                        editar: permisos.editar,
                        eliminar: false,
                        archivar: permisos.archivar,
                        anular: false
                    }"
                    @edit="handleEdit(data)"
                    @toggle="toggleEstado(data)"
                    @delete="confirmDelete(data)"
                />
            </template>

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-with-photo">
                        <!-- Avatar -->
                        <div class="expansion-photo">
                            <img
                                v-if="data.avatar"
                                :src="data.avatar"
                                :alt="data.login"
                                @error="onImageError($event)"
                            />
                            <div v-else class="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center border border-blue-500">
                                <i class="pi pi-user text-blue-400 text-3xl"></i>
                            </div>
                        </div>

                        <!-- Datos -->
                        <div class="expansion-grid">
                            <div class="expansion-item">
                                <span class="expansion-label">Es Administrador:</span>
                                <span class="expansion-value">{{ data.es_admin ? 'Sí' : 'No' }}</span>
                            </div>

                            <!-- Auditoría -->
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

    <!-- ═══════════ DIALOG PRINCIPAL (CRUD) ═══════════ -->
    <BaseDialog
        v-model:visible="dialog"
        dialogClass=""
        width="w-[95vw] sm:w-[90vw] md:w-[640px] lg:w-[700px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusFirstInput"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-user-edit text-white text-lg"></i>
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
                    <span>Datos del Usuario</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Trabajador -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Trabajador <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            ref="trabajadorSelectRef"
                            v-model="formObj.trabajador_id"
                            :options="trabajadorOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar trabajador..."
                            size="sm"
                            filter
                            :loading="loadingTrabajadores"
                            :disabled="estaProtegido('trabajador_id') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('trabajador_id') && !authStore.isAdmin }"
                            @update:model-value="touched.trabajador_id = true"
                        />
                        <small v-if="estaProtegido('trabajador_id') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.trabajador_id) && !formObj.trabajador_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un trabajador
                        </small>
                    </div>

                    <!-- Rol -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Rol <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect
                            v-model="formObj.rol_id"
                            :options="rolOptions"
                            option-label="label"
                            option-value="value"
                            placeholder="Seleccionar rol..."
                            size="sm"
                            filter
                            :loading="loadingRoles"
                            :disabled="
                                (estaProtegido('rol_id') && !authStore.isAdmin)
                                || Number(formObj.rol_id) === 2
                            "
                            :class="{
                                'opacity-60 cursor-not-allowed':
                                    (estaProtegido('rol_id') && !authStore.isAdmin)
                                    || Number(formObj.rol_id) === 2
                            }"
                            @update:model-value="touched.rol_id = true"
                        />
                        <small v-if="estaProtegido('rol_id') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.rol_id) && !formObj.rol_id"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            Debe seleccionar un rol
                        </small>
                        <small v-if="Number(formObj.rol_id) === 2" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Rol ADMINISTRADOR — no editable
                        </small>
                    </div>

                    <!-- Login -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Login <span class="text-red-500">*</span>
                        </label>
                        <BaseInput
                            ref="loginRef"
                            v-model="formObj.login"
                            :maxlength="10"
                            size="sm"
                            placeholder="Máx. 10 caracteres"
                            :disabled="estaProtegido('login') && !authStore.isAdmin"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('login') && !authStore.isAdmin }"
                            @blur="touched.login = true"
                        />
                        <small v-if="estaProtegido('login') && !authStore.isAdmin" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.login) && !formObj.login?.trim()"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            El login es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.login) && $rules.codigoMayusculas(4)(formObj.login) !== true"
                            class="text-red-500 font-semibold text-[10px]"
                        >
                            {{ $rules.codigoMayusculas(4)(formObj.login) }}
                        </small>
                    </div>

                    <!-- Contraseña (solo crear) -->
                    <template v-if="!isUpdate">
                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Contraseña <span class="text-red-500">*</span>
                            </label>
                            <Password
                                v-model="formObj.contrasena"
                                toggleMask
                                class="w-full"
                                inputClass="w-full p-2 border !rounded-lg text-xs"
                                placeholder="Mín. 8 caracteres"
                                @blur="touched.contrasena = true"
                            />
                            <small
                                v-if="(submitted || touched.contrasena) && !formObj.contrasena"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                La contraseña es obligatoria
                            </small>
                            <small
                                v-else-if="(submitted || touched.contrasena) && $rules.passwordFuerte()(formObj.contrasena) !== true"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                {{ $rules.passwordFuerte()(formObj.contrasena) }}
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Confirmar Contraseña <span class="text-red-500">*</span>
                            </label>
                            <Password
                                v-model="formObj.confirmarContrasena"
                                toggleMask
                                :feedback="false"
                                class="w-full"
                                inputClass="w-full p-2 border !rounded-lg text-xs"
                                placeholder="Repita la contraseña"
                                @blur="touched.confirmarContrasena = true"
                            />
                            <small
                                v-if="(submitted || touched.confirmarContrasena) && !formObj.confirmarContrasena"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                Debe confirmar la contraseña
                            </small>
                            <small
                                v-else-if="(submitted || touched.confirmarContrasena) && formObj.contrasena !== formObj.confirmarContrasena"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                Las contraseñas no coinciden
                            </small>
                        </div>
                    </template>

                    <!-- Aviso al editar (la contraseña se cambia aparte) -->
                    <div v-else class="md:col-span-12">
                        <div class="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg">
                            <i class="pi pi-info-circle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                Para cambiar la contraseña, usa la opción <b>Cambiar Contraseña</b> desde el menú de usuario.
                            </span>
                        </div>
                    </div>

                    <!-- Avatar -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Avatar <span class="text-red-500">*</span>
                        </label>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                            <div class="flex items-start justify-center">
                            <div class="dropzone dropzone-avatar">
                                <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
                                <div v-else class="dropzone-empty">
                                    <i class="pi pi-user"></i>
                                    <span class="dropzone-hint">Sin avatar</span>
                                </div>
                            </div>
                        </div>

                            <div class="flex flex-col gap-2">
                                <div class="info-panel">
                                    <span class="info-panel-title">Requisitos del avatar</span>
                                    <ul class="info-panel-list">
                                        <li class="info-panel-item">
                                            <i class="pi pi-check-circle"></i>
                                            <span>Peso máximo: <b>{{ avatarConfig?.maxSizeKB ?? '—' }} KB</b></span>
                                        </li>
                                        <li class="info-panel-item">
                                            <i class="pi pi-check-circle"></i>
                                            <span>Formatos: <b>{{ avatarConfig?.formats ?? '—' }}</b></span>
                                        </li>
                                        <li class="info-panel-item">
                                            <i class="pi pi-check-circle"></i>
                                            <span>Dimensiones: <b>{{ avatarConfig?.maxWidth ?? '—' }} × {{ avatarConfig?.maxHeight ?? '—' }} px</b></span>
                                        </li>
                                        <li class="info-panel-item info-panel-item-file">
                                            <i class="pi pi-file"></i>
                                            <span class="truncate">
                                                Archivo:
                                                <b class="truncate">{{ nombreArchivoAvatar }}</b>
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                <input
                                    ref="avatarInput"
                                    type="file"
                                    class="hidden"
                                    :accept="acceptAvatar"
                                    :disabled="!puedeSubirAvatar"
                                    @change="onAvatarChange"
                                />

                                <div class="flex gap-2 justify-center">
                                    <BaseButton
                                        :label="avatarPreview ? 'Cambiar Avatar' : 'Cargar Avatar'"
                                        icon="pi pi-upload"
                                        variant="foto-subir"
                                        size="sm"
                                        @click="abrirSelectorAvatar"
                                    />
                                </div>
                            </div>
                        </div>
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
                    @click="saveUsuario"
                />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar Usuario"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import type { ImageConfigDisplay } from '~/composables/useImageValidator';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'Usuarios' });

    // ============ TIPOS AUXILIARES ============
    interface OptionItem {
        label: string;
        value: number;
    }

    // ============ DEPENDENCIAS ============
    const authStore = useAuthStore();
    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const { validate: validateImage, getConfigDisplay } = useImageValidator();

    // ============ CONSTANTES ============
    const empresaIdInicial: number | null = Number(authStore.user?.empresa_id) || null;
    const sucursalIdInicial: number | null = Number(authStore.user?.sucursal_id) || null;

    // ============ ESTADO DE CATÁLOGOS ============
    const empresaOptions = shallowRef<OptionItem[]>([]);
    const sucursalOptions = shallowRef<OptionItem[]>([]);
    const rolOptions = shallowRef<OptionItem[]>([]);
    const trabajadorOptions = shallowRef<OptionItem[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingRoles = ref(false);
    const loadingTrabajadores = ref(false);

    // ============ CARGA DE CATÁLOGOS ============
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

    const cargarSucursales = async (): Promise<void> => {
        loadingSucursales.value = true;
        try {
            const res: any = await $api('/sucursales', {
                method: 'GET',
                params: { limit: 1000, sortField: 'sucursal', sortOrder: 1, estado_id: ESTADO_ACTIVO },
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

    const cargarRoles = async (): Promise<void> => {
        loadingRoles.value = true;
        try {
            const res: any = await $api('/roles', {
                method: 'GET',
                params: { limit: 1000, sortField: 'rol', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            rolOptions.value = lista
                .filter((r: any) => Number(r.rol_id) !== 2) // 🔒 Excluir ADMINISTRADOR
                .map((r: any): OptionItem => ({
                    label: `${r.rol}`,
                    value: Number(r.rol_id),
                }));
        } catch (err) {
            console.error('Error al cargar roles:', err);
            rolOptions.value = [];
        } finally {
            loadingRoles.value = false;
        }
    };

    const cargarTrabajadores = async (): Promise<void> => {
        loadingTrabajadores.value = true;
        try {
            const res: any = await $api('/trabajadores', {
                method: 'GET',
                params: { limit: 1000, sortField: 'trabajador_nombre_completo', sortOrder: 1, estado_id: ESTADO_ACTIVO },
            });
            const lista = Array.isArray(res) ? res : (res?.data ?? []);
            trabajadorOptions.value = lista.map((t: any): OptionItem => ({
                label: `${t.trabajador_nombre_completo ?? t.apodo} — ${t.apodo ?? ''}`.trim(),
                value: Number(t.trabajador_id),
            }));
        } catch (err) {
            console.error('Error al cargar trabajadores:', err);
            trabajadorOptions.value = [];
        } finally {
            loadingTrabajadores.value = false;
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
        tabla: 'usuarios',
        sortFieldDefault: 'usuario_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        camposProtegidosPorDependencia: ['login', 'trabajador_id', 'rol_id'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: empresaIdInicial,
            sucursal_id: sucursalIdInicial,
            rol_id: null,
            estado_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.empresa_id)  extra.empresa_id  = Number(f.empresa_id);
            if (f.sucursal_id) extra.sucursal_id = Number(f.sucursal_id);
            if (f.rol_id)      extra.rol_id      = Number(f.rol_id);
            if (f.estado_id)   extra.estado_id   = Number(f.estado_id);
            return extra;
        },

        getPrimaryKey: (item: any) => item.usuario_id,

        getCleanForm: () => ({
            usuario_id: null,
            trabajador_id: null,
            rol_id: null,
            login: '',
            contrasena: '',
            confirmarContrasena: '',
            avatar: '',
        }),

        buildPayload: (form: any) => form,

        validate: () => true,
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR USUARIO' : 'NUEVO USUARIO'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos del usuario'
            : 'Registro de un nuevo usuario del sistema'
    );

    // ============ ESTADO ADICIONAL (AVATAR) ============
    const avatarInput = ref<HTMLInputElement | null>(null);
    const avatarFile = ref<File | null>(null);
    const avatarPreview = ref<string | null>(null);
    const avatarConfig = ref<ImageConfigDisplay | null>(null);

    const abrirSelectorAvatar = (): void => {
        avatarInput.value?.click();
    };

    const onAvatarChange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const result = await validateImage(file, 'avatar_config');

        if (!result.valid) {
            notify('warn', 'Imagen no válida', result.error || 'Archivo no permitido');
            target.value = '';
            return;
        }

        avatarFile.value = file;
        const reader = new FileReader();
        reader.onload = () => {
            avatarPreview.value = reader.result as string;
        };
        reader.readAsDataURL(file);
    };

    const nombreArchivoAvatar = computed<string | null>(() => {
        if (avatarFile.value) return avatarFile.value.name;
        if (formObj.value.avatar) return formObj.value.avatar;
        return null;
    });

    const acceptAvatar = computed<string | undefined>(() => {
        const mimes = avatarConfig.value?.mimeTypes;
        return mimes?.length ? mimes.join(',') : undefined;
    });

    const puedeSubirAvatar = computed(() => Boolean(avatarConfig.value));

    // ============ FOCUS INICIAL ============
    const trabajadorSelectRef = ref<any>(null);
    const loginRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            if (isUpdate.value) {
                const input = loginRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
                input?.focus();
                input?.select();
                return;
            }
            const el = trabajadorSelectRef.value?.getSelectEl?.() as HTMLElement | null;
            const trigger = el?.querySelector('.p-select-label') as HTMLElement | null;
            if (trigger) {
                trigger.focus();
                trigger.click();
            }
        }, 350);
    };

    // ============ OVERRIDE openNew / edit ============
    const openNewConEmpresa = (): void => {
        openNewBase();
        avatarFile.value = null;
        avatarPreview.value = null;
        if (avatarInput.value) { avatarInput.value.value = ''; }
    };

    const handleEdit = async (item: any): Promise<void> => {
        // Asegurar catálogos
        if (trabajadorOptions.value.length === 0) await cargarTrabajadores();
        if (rolOptions.value.length === 0)        await cargarRoles();

        const trabajadorId = item.trabajador_id != null ? Number(item.trabajador_id) : null;
        const rolId        = item.rol_id        != null ? Number(item.rol_id)        : null;

        // Agregar opciones temporales si no existen
        if (trabajadorId && !trabajadorOptions.value.some(o => o.value === trabajadorId)) {
            trabajadorOptions.value = [
                ...trabajadorOptions.value,
                {
                    label: item.trabajador_nombre_completo
                        ? `${item.trabajador_nombre_completo} — ${item.trabajador_dni ?? ''}`.trim()
                        : `Trabajador ${trabajadorId}`,
                    value: trabajadorId,
                },
            ];
        }
        if (rolId && !rolOptions.value.some(o => o.value === rolId)) {
            rolOptions.value = [
                ...rolOptions.value,
                {
                    label: item.rol_nombre
                        ? `${item.rol_nombre}`.trim()
                        : `Rol ${rolId}`,
                    value: rolId,
                },
            ];
        }

        await editBase(item);
        formObj.value.trabajador_id = trabajadorId;
        formObj.value.rol_id = rolId;
        formObj.value.login = item.login ?? '';

        // Preview avatar
        avatarPreview.value = item.avatar || null;
        avatarFile.value = null;
        if (avatarInput.value) { avatarInput.value.value = ''; }
    };

    // ============ SAVE ============
    const saveWithAvatar = async (
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
            formData.append('avatar', file);
        }

        const url = id ? `/usuarios/${id}` : '/usuarios';
        const method = id ? 'PATCH' : 'POST';

        return $api(url, { method, body: formData });
    };

    const saveUsuario = async (): Promise<void> => {
        submitted.value = true;

        // ─── Validaciones ───
        if (!formObj.value.trabajador_id) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar un trabajador.');
            return;
        }
        if (!formObj.value.rol_id) {
            notify('warn', 'Campos incompletos', 'Debe seleccionar un rol.');
            return;
        }
        if (!formObj.value.login?.trim()) {
            notify('warn', 'Campos incompletos', 'El login es obligatorio.');
            return;
        }
        if ($rules.codigoMayusculas(4)(formObj.value.login) !== true) {
            notify('warn', 'Login inválido', $rules.codigoMayusculas(4)(formObj.value.login));
            return;
        }

        // Solo al crear: validar contraseña
        if (!isUpdate.value) {
            if (!formObj.value.contrasena) {
                notify('warn', 'Campos incompletos', 'La contraseña es obligatoria.');
                return;
            }
            if ($rules.passwordFuerte()(formObj.value.contrasena) !== true) {
                notify('warn', 'Contraseña débil', $rules.passwordFuerte()(formObj.value.contrasena));
                return;
            }
            if (formObj.value.contrasena !== formObj.value.confirmarContrasena) {
                notify('warn', 'Contraseñas no coinciden', 'La confirmación no coincide con la contraseña.');
                return;
            }
        }

        // Avatar obligatorio
        if (!avatarFile.value && !formObj.value.avatar) {
            notify('warn', 'Avatar requerido', 'Debe cargar un avatar para el usuario. El avatar es obligatorio.');
            return;
        }

        try {
            loading.value = true;

            const payload: Record<string, any> = {
                trabajador_id: Number(formObj.value.trabajador_id),
                rol_id: Number(formObj.value.rol_id),
                login: formObj.value.login?.trim().toUpperCase(),
            };

            if (!isUpdate.value) {
                payload.contrasena = formObj.value.contrasena;
            }

            // Si NO hay archivo nuevo pero ya existe avatar (edición), se manda el string
            if (!avatarFile.value && formObj.value.avatar) {
                payload.avatar = formObj.value.avatar;
            }

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;
            await saveWithAvatar(payload, avatarFile.value, pk);

            notify(
                'success',
                isUpdate.value ? 'Actualizado' : 'Creado',
                'El usuario se guardó correctamente.'
            );

            lazyParams.value.first = 0;
            onSearch();
            hideDialog();

            avatarFile.value = null;
            avatarPreview.value = null;
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar el usuario.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;

            notify(
                'error',
                isUpdate.value ? 'Error al actualizar' : 'Error al crear',
                firstError
            );
            console.error('Error al guardar usuario:', err);
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
        { expander: true, class: 'w-8', bodyClass: '!text-center' },
        { field: 'login', header: 'LOGIN', sortable: true, template: 'body-login', bodyClass: '!text-center', class: 'w-28' },
        { field: 'trabajador_id', header: 'TRABAJADOR', sortable: true, template: 'body-trabajador' },
        { field: 'rol_nombre', header: 'ROL', sortable: true, template: 'body-rol', class: 'w-32' },
        { field: 'sucursal_nombre', header: 'SUCURSAL', sortable: true, template: 'body-sucursal', class: 'w-72' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-20' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-20' },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const login = formObj.value.login ?? '';
        const trabajador = formObj.value.trabajador_nombre_completo ?? '';
        return trabajador ? `${login} — ${trabajador}` : login;
    });

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.sucursal_id) count++;
        if (filters.value.rol_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.empresa_id = null;
        filters.value.sucursal_id = null;
        filters.value.rol_id = null;
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

    // ============ WATCH: Normalización al abrir el diálogo ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.trabajador_id != null) {
                formObj.value.trabajador_id = Number(formObj.value.trabajador_id);
            }
            if (formObj.value.rol_id != null) {
                formObj.value.rol_id = Number(formObj.value.rol_id);
            }

            // Asegurar opciones temporales
            const trabajadorId = formObj.value.trabajador_id;
            if (trabajadorId && !trabajadorOptions.value.some(o => o.value === trabajadorId)) {
                const item = items.value.find((i: any) => Number(i.trabajador_id) === trabajadorId);
                trabajadorOptions.value = [
                    ...trabajadorOptions.value,
                    {
                        label: item
                            ? `${item.trabajador_nombre_completo ?? ''} — ${item.trabajador_dni ?? ''}`.trim()
                            : `Trabajador ${trabajadorId}`,
                        value: trabajadorId,
                    },
                ];
            }

            const rolId = formObj.value.rol_id;
            if (rolId && !rolOptions.value.some(o => o.value === rolId)) {
                const item = items.value.find((i: any) => Number(i.rol_id) === rolId);
                rolOptions.value = [
                    ...rolOptions.value,
                    {
                        label: item
                            ? `${item.rol_nombre ?? ''}`.trim()
                            : `Rol ${rolId}`,
                        value: rolId,
                    },
                ];
            }
        }, 150);
    });

    // ============ INIT ============
    onMounted(async () => {
        avatarConfig.value = await getConfigDisplay('avatar_config');
        await Promise.all([
            cargarEmpresas(),
            cargarSucursales(),
            cargarRoles(),
            cargarTrabajadores(),
        ]);
        lazyParams.value.sortField = 'usuario_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        if (filters.value.empresa_id) {
            onSearch();
        }
    });
</script>
