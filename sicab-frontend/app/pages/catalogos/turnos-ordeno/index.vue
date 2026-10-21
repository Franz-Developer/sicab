<!-- C:\sistemas\sicab\sicab-frontend\app\pages\catalogos\turnos-ordeno\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-clock" title="Turnos de Ordeño"
        subtitle="Catálogo de horarios para el control de producción" :show-action="permisos.crear"
        action-label="NUEVO TURNO" action-icon="pi pi-plus" @action="openNew">

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">

            <!-- ═══════════ FILTROS ═══════════ -->
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters" search-placeholder="Buscar: turno, código, descripción..."
                        @search="onSearch" />
                </div>
            </template>

            <!-- ═══════════ COLUMNAS ═══════════ -->
            <template #body-codigo="{ data }">
                <span class="cell-code">{{ data.codigo }}</span>
            </template>

            <template #body-turno="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.turno }}</span>
                    <span v-if="data.descripcion" class="cell-secondary text-[10px]">
                        <span class="font-bold">DESC:</span> {{ data.descripcion }}
                    </span>
                </div>
            </template>

            <template #body-horario="{ data }">
                <div class="flex flex-col text-[11px] leading-tight items-center w-full gap-0.5">
                    <span class="text-emerald-600 font-bold flex items-center w-full justify-center">
                        <i class="pi pi-sign-in text-[10px] mr-1.5"></i>
                        <span class="mr-1">INICIO:</span>
                        <span class="font-black">{{ data.hora_inicio }}</span>
                    </span>
                    <span class="text-purple-600 font-bold flex items-center w-full justify-center">
                        <i class="pi pi-sign-out text-[10px] mr-1.5"></i>
                        <span class="mr-1">FIN:</span>
                        <span class="font-black">{{ data.hora_fin }}</span>
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
                    <div class="expansion-grid">
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
            </template>
        </BaseTable>
    </CrudPageLayout>

    <!-- ═══════════ DIALOG CRUD ═══════════ -->
    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[80vw] md:w-[600px]" maxHeight="88vh"
        :modal="true" :closable="!loading" @show="focusFirstInput">

        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-clock text-white text-lg"></i>
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
                    <span>Información del Turno</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <!-- Turno -->
                    <div class="md:col-span-8">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Nombre del Turno <span class="text-red-500">*</span>
                        </label>
                        <BaseInput ref="turnoRef" v-model="formObj.turno" :maxlength="50" size="sm"
                            :disabled="estaProtegido('turno')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('turno') }"
                            @blur="touched.turno = true" />
                        <small v-if="estaProtegido('turno')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small v-else-if="(submitted || touched.turno) && !formObj.turno?.trim()"
                            class="text-red-500 font-semibold text-[10px]">
                            El nombre es obligatorio
                        </small>
                        <small
                            v-else-if="(submitted || touched.turno) && $rules.longitudMinima(3)(formObj.turno) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            {{ $rules.longitudMinima(3)(formObj.turno) }}
                        </small>
                    </div>

                    <!-- Código -->
                    <div class="md:col-span-4">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Código <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.codigo" :maxlength="20" size="sm"
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

                    <!-- Hora Inicio -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Hora Inicio <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.hora_inicio" type="time" size="sm"
                            :disabled="estaProtegido('hora_inicio')" @blur="touched.hora_inicio = true" />
                        <small v-if="(submitted || touched.hora_inicio) && !formObj.hora_inicio"
                            class="text-red-500 font-semibold text-[10px]">
                            Requerido
                        </small>
                    </div>

                    <!-- Hora Fin -->
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Hora Fin <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model="formObj.hora_fin" type="time" size="sm"
                            :disabled="estaProtegido('hora_fin')" @blur="touched.hora_fin = true" />
                        <small v-if="(submitted || touched.hora_fin) && !formObj.hora_fin"
                            class="text-red-500 font-semibold text-[10px]">
                            Requerido
                        </small>
                    </div>

                    <!-- Rango inválido -->
                    <div v-if="rangoHorasInvalido" class="md:col-span-12">
                        <div
                            class="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
                            <i class="pi pi-exclamation-triangle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                La hora de fin debe ser estrictamente mayor que la hora de inicio.
                            </span>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Descripción
                        </label>
                        <BaseInput v-model="formObj.descripcion" :maxlength="500" size="sm"
                            placeholder="Observaciones o notas adicionales" />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="loading" variant="danger"
                    @click="hideDialog" />
                <BaseButton :label="isUpdate ? 'Actualizar' : 'Guardar Registro'" icon="pi pi-save" :loading="loading"
                    variant="primary" @click="saveTurno" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Turno de Ordeño"
        :item-name="formObj.turno || 'este turno'" @confirm="deleteItem" />
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, onMounted } from 'vue';

    useHead({ title: 'Turnos de Ordeño' });

    // ============ DEPENDENCIAS ============
    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any; // 👈 ESTA ES LA LÍNEA QUE FALTABA
    const { notify } = useNotify();

    // ============ CRUD PRINCIPAL ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew: openNewBase, edit: editBase, hideDialog,
        toggleEstado, confirmDelete, deleteItem,
        resolvePK,
    } = useCrudTable<any>({
        tabla: 'turnos-ordeno',
        tablaPermisos: 'turnos_ordeno',
        sortFieldDefault: 'turno_ordeno_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: ['turno', 'codigo', 'hora_inicio', 'hora_fin'],

        defaultFilters: {
            global: '',
            exactMatch: 0,
        },

        getExtraFilters: (f: Record<string, any>) => ({
            exactMatch: f.exactMatch ?? 0,
        }),

        getPrimaryKey: (item: any) => item.turno_ordeno_id,

        getCleanForm: () => ({
            turno_ordeno_id: null,
            turno: '',
            codigo: '',
            hora_inicio: '',
            hora_fin: '',
            descripcion: '',
        }),

        buildPayload: (form: any) => ({
            turno: form.turno?.trim().toUpperCase(),
            codigo: form.codigo?.trim().toUpperCase(),
            hora_inicio: form.hora_inicio,
            hora_fin: form.hora_fin,
            descripcion: form.descripcion?.trim() || undefined,
        }),

        validate: () => true, // Validación manual en saveTurno
    });

    // ============ TÍTULOS ============
    const tituloDialog = computed(() => isUpdate.value ? 'EDITAR TURNO' : 'NUEVO TURNO');
    const subtituloDialog = computed(() => isUpdate.value ? 'Actualización del horario' : 'Registro de nuevo horario');

    // ============ VALIDACIÓN VISUAL DE HORAS ============
    const rangoHorasInvalido = computed(() => {
        const ini = formObj.value.hora_inicio;
        const fin = formObj.value.hora_fin;
        if (!ini || !fin) return false;
        return fin <= ini;
    });

    // ============ FOCUS ============
    const turnoRef = ref<any>(null);

    const focusFirstInput = async () => {
        await nextTick();
        setTimeout(() => {
            const input = turnoRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
            input?.focus();
            input?.select();
        }, 350);
    };

    // ============ OVERRIDES ============
    const openNew = () => {
        openNewBase();
    };

    const edit = async (data: any) => {
        await editBase(data);
    };

    // ============ SAVE ============
    const saveTurno = async () => {
        submitted.value = true;

        if (!formObj.value.turno?.trim()) return notify('warn', 'Campos incompletos', 'El nombre del turno es obligatorio.');
        if ($rules.longitudMinima(3)(formObj.value.turno) !== true) {
            return notify('warn', 'Nombre inválido', $rules.longitudMinima(3)(formObj.value.turno));
        }
        if (!formObj.value.codigo?.trim()) return notify('warn', 'Campos incompletos', 'El código es obligatorio.');
        if ($rules.codigoAlfanumerico(2)(formObj.value.codigo) !== true) {
            return notify('warn', 'Código inválido', $rules.codigoAlfanumerico(2)(formObj.value.codigo));
        }
        if (!formObj.value.hora_inicio) return notify('warn', 'Campos incompletos', 'La hora de inicio es obligatoria.');
        if (!formObj.value.hora_fin) return notify('warn', 'Campos incompletos', 'La hora de fin es obligatoria.');
        if (rangoHorasInvalido.value) {
            return notify('warn', 'Horario inválido', 'La hora de fin debe ser mayor a la hora de inicio.');
        }

        try {
            loading.value = true;

            const payload = {
                turno: formObj.value.turno?.trim().toUpperCase(),
                codigo: formObj.value.codigo?.trim().toUpperCase(),
                hora_inicio: formObj.value.hora_inicio,
                hora_fin: formObj.value.hora_fin,
                descripcion: formObj.value.descripcion?.trim() || undefined,
            };

            const pk = isUpdate.value ? resolvePK(formObj.value) : null;

            if (pk) {
                await $api(`/turnos-ordeno/${pk}`, { method: 'PATCH', body: payload });
            } else {
                await $api('/turnos-ordeno', { method: 'POST', body: payload });
            }

            notify('success', isUpdate.value ? 'Actualizado' : 'Creado', 'Registro guardado correctamente.');
            lazyParams.value.first = 0;
            onSearch();
            hideDialog();
        } catch (err: any) {
            const rawMsg = err?.data?.message ?? 'No se pudo guardar el turno.';
            const firstError = Array.isArray(rawMsg) ? (rawMsg[0] ?? 'Error al guardar.') : rawMsg;
            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear', firstError);
            console.error('Error al guardar turno:', err);
        } finally {
            loading.value = false;
        }
    };

    // ============ COLUMNAS ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'codigo', header: 'CÓDIGO', template: 'body-codigo', sortable: true, class: 'w-28', bodyClass: '!text-center' },
        { field: 'turno', header: 'TURNO', template: 'body-turno', sortable: true },
        { field: 'hora_inicio', header: 'HORARIO', template: 'body-horario', sortable: true, bodyClass: '!text-center' },
        { field: 'estado_registro', header: 'ESTADO', template: 'body-estado', sortable: false, class: 'w-24', bodyClass: '!text-center' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ INIT ============
    onMounted(() => {
        lazyParams.value.sortField = 'turno_ordeno_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
