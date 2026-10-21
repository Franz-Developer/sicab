<!-- C:\sistemas\sicab\sicab-frontend\app\pages\configuracion\empresas-nits\index.vue -->
<template>
    <CrudPageLayout
        icon="pi pi-id-card"
        title="NITs Fiscales"
        subtitle="Registro de NITs, dosificaciones y datos fiscales por empresa"
        :show-action="permisos.crear && !!filters.empresa_id"
        action-label="NUEVO NIT"
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
                    <FilterBar :filters="filters" search-placeholder="Buscar: NIT, razón social, etiqueta..."
                        :active-filters-count="filtrosActivosCount" modal-subtitle="Refina la búsqueda de NITs fiscales"
                        @search="onSearch" @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <!-- Empresa -->
                            <div class="md:col-span-12">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Empresa
                                </label>
                                <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                                    option-value="value" placeholder="Todas las empresas" size="sm" filter show-clear appendTo="body"
                                    :loading="loadingEmpresas" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <!-- Ambiente -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Ambiente
                                </label>
                                <BaseSelect v-model="filters.ambiente_id" :options="ambienteOptions"
                                    option-label="label" option-value="value" placeholder="Todos los ambientes"
                                    size="sm" show-clear appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>

                            <!-- Modalidad -->
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Modalidad Facturación
                                </label>
                                <BaseSelect v-model="filters.modalidad_facturacion_id" :options="modalidadOptions"
                                    option-label="label" option-value="value" placeholder="Todas las modalidades"
                                    size="sm" show-clear appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <template #body-razon_social="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary truncate" :title="data.razon_social">
                        {{ data.razon_social }}
                    </span>
                    <span class="cell-secondary" :title="data.nit">
                        <span class="font-bold">NIT:</span> {{ data.nit }}
                    </span>
                </div>
            </template>

            <template #body-empresa="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">{{ data.empresa_nombre }}</span>
                    <span class="cell-secondary">
                        <span class="font-bold">CÓDIGO:</span> {{ data.empresa_codigo }}
                    </span>
                </div>
            </template>

            <template #body-ambiente="{ data }">
                <span class="cell-primary">{{ data.ambiente?.abreviatura }}</span>
            </template>

            <template #body-modalidad="{ data }">
                <span class="cell-primary">{{ data.modalidad_facturacion?.abreviatura }}</span>
            </template>

            <template #body-vigencia="{ data }">
                <div class="flex flex-col text-[10px] leading-tight items-end w-full lg:items-center">
                    <span class="text-emerald-700 font-semibold">
                        <i class="pi pi-calendar-plus text-[9px] mr-1"></i>{{ data.fecha_inicio_vigencia }}
                    </span>
                    <span class="text-red-700 font-semibold">
                        <i class="pi pi-calendar-minus text-[9px] mr-1"></i>{{ data.fecha_fin_vigencia }}
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
                        <div class="expansion-item">
                            <span class="expansion-label">Etiqueta</span>
                            <span class="expansion-value">{{ data.etiqueta || '—' }}</span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Actividad Económica Principal</span>
                            <span class="expansion-value">{{ data.actividad_economica_principal || '—' }}</span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Código Actividad CAEB</span>
                            <span class="expansion-value">{{ data.codigo_actividad_caeb || '—' }}</span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Teléfono Fiscal</span>
                            <span class="expansion-value">
                                <template v-if="data.telefono">
                                    <i class="pi pi-phone text-[10px] mr-1"></i>{{ data.telefono_fiscal || '—' }}
                                </template>
                                <template v-else>—</template>
                            </span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Municipio Fiscal</span>
                            <span class="expansion-value">{{ data.municipio_fiscal || '—' }}</span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Dirección Fiscal</span>
                            <span class="expansion-value">{{ data.direccion_fiscal || '—' }}</span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Correo Fiscal:</span>
                            <span class="expansion-value">
                                <i class="pi pi-envelope text-[10px] mr-1"></i>{{ data.email_fiscal || '—' }}
                            </span>
                        </div>

                        <div class="expansion-item">
                            <span class="expansion-label">Certificado Digital</span>
                            <span class="expansion-value">
                                <template v-if="data.certificado_digital">
                                    •••••••• <span class="text-[9px] text-slate-400">({{ data.certificado_digital.length }} chars)</span>
                                </template>
                                <template v-else>—</template>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Password Certificado</span>
                            <span class="expansion-value">
                                <template v-if="data.certificado_password">••••••••</template>
                                <template v-else>—</template>
                            </span>
                        </div>
                        <div class="expansion-item">
                            <span class="expansion-label">Token SIAT</span>
                            <span class="expansion-value">
                                <template v-if="data.token_siat">
                                    •••••••• <span class="text-[9px] text-slate-400">({{ data.token_siat.length }} chars)</span>
                                </template>
                                <template v-else>—</template>
                            </span>
                        </div>

                        <!-- ── Auditoría ── -->
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
        width="w-[95vw] sm:w-[80vw] md:w-[720px] lg:w-[780px]"
        maxHeight="92vh"
        :modal="true"
        :closable="!loading"
        @show="focusEmpresa"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-id-card text-white text-lg"></i>
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
                    <div class="flex justify-between items-center mb-3 text-sky-800 uppercase tracking-wider font-black text-xs">
                        <span>Identificación Fiscal</span>
                        <span class="text-slate-600 normal-case font-bold text-[10px]">
                            Campos obligatorios <span class="text-red-500">*</span>
                        </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
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
                                v-else-if="(submitted || touched.empresa_id) && !formObj.empresa_id"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                Debe seleccionar una empresa
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                NIT <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.nit"
                                :maxlength="20"
                                size="sm"
                                placeholder=""
                                :disabled="estaProtegido('nit')"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('nit') }"
                                @blur="touched.nit = true"
                            />
                            <small v-if="estaProtegido('nit')" class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.nit) && !formObj.nit?.trim()"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                El NIT es obligatorio
                            </small>
                            <small
                                v-else-if="(submitted || touched.nit) && $rules.nit()(formObj.nit) !== true"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                {{ $rules.nit()(formObj.nit) }}
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Etiqueta <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.etiqueta"
                                :maxlength="30"
                                size="sm"
                                placeholder="Ej: CASA_MATRIZ"
                                :disabled="estaProtegido('etiqueta')"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('etiqueta') }"
                                @blur="touched.etiqueta = true"
                            />
                            <small v-if="estaProtegido('etiqueta')" class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.etiqueta) && !formObj.etiqueta?.trim()"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                La etiqueta es obligatoria
                            </small>
                            <small
                                v-else-if="(submitted || touched.etiqueta) && $rules.textoMayusculasGuionBajo()(formObj.etiqueta) !== true"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                {{ $rules.textoMayusculasGuionBajo()(formObj.etiqueta) }}
                            </small>
                        </div>

                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Razón Social <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.razon_social"
                                :maxlength="500"
                                size="sm"
                                :disabled="estaProtegido('razon_social')"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('razon_social') }"
                                @blur="touched.razon_social = true"
                            />
                            <small v-if="estaProtegido('razon_social')" class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.razon_social) && !formObj.razon_social?.trim()"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                La razón social es obligatoria
                            </small>
                            <small
                                v-else-if="(submitted || touched.razon_social) && $rules.longitudMinima(3)(formObj.razon_social) !== true"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                {{ $rules.longitudMinima(3)(formObj.razon_social) }}
                            </small>
                        </div>

                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Actividad Económica Principal <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.actividad_economica_principal"
                                :maxlength="2000"
                                size="sm"
                                :disabled="estaProtegido('actividad_economica_principal')"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('actividad_economica_principal') }"
                                @blur="touched.actividad_economica_principal = true"
                            />
                            <small
                                v-if="estaProtegido('actividad_economica_principal')"
                                class="text-amber-500 font-semibold text-[10px]"
                            >
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.actividad_economica_principal) && !formObj.actividad_economica_principal?.trim()"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                La actividad económica es obligatoria
                            </small>
                            <small
                                v-else-if="(submitted || touched.actividad_economica_principal) && $rules.longitudMinima(3)(formObj.actividad_economica_principal) !== true"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                {{ $rules.longitudMinima(3)(formObj.actividad_economica_principal) }}
                            </small>
                        </div>

                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Email Fiscal <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.email_fiscal"
                                :maxlength="100"
                                size="sm"
                                placeholder=""
                                :disabled="estaProtegido('email_fiscal')"
                                :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('email_fiscal') }"
                                @blur="touched.email_fiscal = true"
                            />
                            <small v-if="estaProtegido('email_fiscal')" class="text-amber-500 font-semibold text-[10px]">
                                <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                            </small>
                            <small
                                v-else-if="(submitted || touched.email_fiscal) && !formObj.email_fiscal?.trim()"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                El email fiscal es obligatorio
                            </small>
                            <small
                                v-else-if="(submitted || touched.email_fiscal) && $rules.formatoCorreo()(formObj.email_fiscal) !== true"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                {{ $rules.formatoCorreo()(formObj.email_fiscal) }}
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Teléfono Fiscal
                            </label>
                            <BaseInput
                                v-model="formObj.telefono_fiscal"
                                :maxlength="100"
                                size="sm"
                            />
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Municipio Fiscal
                            </label>
                            <BaseInput
                                v-model="formObj.municipio_fiscal"
                                :maxlength="100"
                                size="sm"
                            />
                        </div>
                    </div>
                </div>

                <div class="panel-contrast">
                    <span class="block text-xs font-black text-blue-700 uppercase tracking-wider mb-3">
                        Configuración Fiscal
                    </span>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Ambiente <span class="text-red-500">*</span>
                            </label>
                            <BaseSelect
                                v-model="formObj.ambiente_id"
                                :options="ambienteOptions"
                                option-label="label"
                                option-value="value"
                                placeholder="Seleccionar..."
                                size="sm"
                                @update:model-value="touched.ambiente_id = true"
                            />
                            <small
                                v-if="(submitted || touched.ambiente_id) && !formObj.ambiente_id"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                Debe seleccionar un ambiente
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Modalidad Facturación <span class="text-red-500">*</span>
                            </label>
                            <BaseSelect
                                v-model="formObj.modalidad_facturacion_id"
                                :options="modalidadOptions"
                                option-label="label"
                                option-value="value"
                                placeholder="Seleccionar..."
                                size="sm"
                                @update:model-value="touched.modalidad_facturacion_id = true"
                            />
                            <small
                                v-if="(submitted || touched.modalidad_facturacion_id) && !formObj.modalidad_facturacion_id"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                Debe seleccionar una modalidad
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Inicio Vigencia <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.fecha_inicio_vigencia"
                                type="date"
                                size="sm"
                                @blur="touched.fecha_inicio_vigencia = true"
                            />
                            <small
                                v-if="(submitted || touched.fecha_inicio_vigencia) && !formObj.fecha_inicio_vigencia"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                La fecha de inicio es obligatoria
                            </small>
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Fin Vigencia <span class="text-red-500">*</span>
                            </label>
                            <BaseInput
                                v-model="formObj.fecha_fin_vigencia"
                                type="date"
                                size="sm"
                                @blur="touched.fecha_fin_vigencia = true"
                            />
                            <small
                                v-if="(submitted || touched.fecha_fin_vigencia) && !formObj.fecha_fin_vigencia"
                                class="text-red-500 font-semibold text-[10px]"
                            >
                                La fecha de fin es obligatoria
                            </small>
                        </div>

                        <div v-if="rangoFechasInvalido" class="md:col-span-12">
                            <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-lg">
                                <i class="pi pi-exclamation-triangle mt-0.5 text-xs"></i>
                                <span class="text-[10px] font-semibold">
                                    La fecha de inicio no puede ser mayor a la fecha de fin de vigencia.
                                </span>
                            </div>
                        </div>

                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Dirección Fiscal
                            </label>
                            <BaseInput
                                v-model="formObj.direccion_fiscal"
                                :maxlength="500"
                                size="sm"
                            />
                        </div>

                        <div class="md:col-span-12 border-t border-dashed border-slate-200 my-2"></div>

                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Código Actividad CAEB
                            </label>
                            <BaseInput
                                v-model="formObj.codigo_actividad_caeb"
                                :maxlength="20"
                                size="sm"
                            />
                        </div>

                        <div class="md:col-span-12">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Certificado Digital
                            </label>
                            <BaseInput
                                v-model="formObj.certificado_digital"
                                :maxlength="2000"
                                size="sm"
                                placeholder="Contenido o ruta del certificado"
                            />
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Password Certificado
                            </label>
                            <BaseInput
                                v-model="formObj.certificado_password"
                                type="password"
                                :maxlength="500"
                                size="sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <div class="md:col-span-6">
                            <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                Token SIAT
                            </label>
                            <BaseInput
                                v-model="formObj.token_siat"
                                :maxlength="4000"
                                size="sm"
                                placeholder="Token de dosificación"
                            />
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
                    @click="save"
                />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog
        v-model:visible="deleteDialog"
        title="Eliminar NIT Fiscal"
        :item-name="deleteItemName"
        @confirm="deleteItem"
    />
</template>

<script setup lang="ts">
    import { ref, computed, shallowRef, watch, nextTick, onMounted } from 'vue';
    import { Ambiente, AMBIENTE_METADATA, ModalidadFacturacion, MODALIDAD_FACTURACION_METADATA, ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'NITs Fiscales' });

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
    const loadingEmpresas = ref(false);

    const ambienteOptions: OptionItem[] = Object.values(Ambiente)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = AMBIENTE_METADATA[id as Ambiente];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

    const modalidadOptions: OptionItem[] = Object.values(ModalidadFacturacion)
        .filter((v): v is number => typeof v === 'number')
        .map((id) => {
            const meta = MODALIDAD_FACTURACION_METADATA[id as ModalidadFacturacion];
            return meta ? { label: meta.label, value: id } : null;
        })
        .filter((o): o is OptionItem => o !== null);

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

    // ============ CRUD PRINCIPAL (useCrudTable) ============
    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        openNew, edit, hideDialog, save,
        toggleEstado, confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'empresas-nits',
        sortFieldDefault: 'empresa_nit_id',
        tablaPermisos: 'empresas_nits',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,
        camposProtegidosPorDependencia: [],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            empresa_id: empresaIdInicial,
            ambiente_id: null,
            modalidad_facturacion_id: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.empresa_id) extra.empresa_id = Number(f.empresa_id);
            if (f.ambiente_id) extra.ambiente_id = f.ambiente_id;
            if (f.modalidad_facturacion_id) extra.modalidad_facturacion_id = f.modalidad_facturacion_id;
            return extra;
        },

        getPrimaryKey: (item: any) => item.empresa_nit_id,

        getCleanForm: () => ({
            empresa_nit_id: null,
            empresa_id: empresaIdInicial ? Number(empresaIdInicial) : null,
            ambiente_id: Ambiente.PILOTO_PRUEBAS,
            nit: '',
            razon_social: '',
            actividad_economica_principal: '',
            etiqueta: '',
            modalidad_facturacion_id: ModalidadFacturacion.NINGUNO,
            certificado_digital: '',
            certificado_password: '',
            token_siat: '',
            fecha_inicio_vigencia: new Date().toISOString().slice(0, 10),
            fecha_fin_vigencia: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .slice(0, 10),
            email_fiscal: '',
            codigo_actividad_caeb: '',
            telefono_fiscal: '',
            municipio_fiscal: '',
            direccion_fiscal: '',
        }),

        buildPayload: (form: any) => ({
            empresa_id: Number(form.empresa_id),
            ambiente_id: Number(form.ambiente_id),
            nit: form.nit?.trim(),
            razon_social: form.razon_social?.trim().toUpperCase(),
            actividad_economica_principal: form.actividad_economica_principal?.trim().toUpperCase(),
            etiqueta: form.etiqueta?.trim().toUpperCase(),
            modalidad_facturacion_id: Number(form.modalidad_facturacion_id),
            certificado_digital: form.certificado_digital?.trim() || undefined,
            certificado_password: form.certificado_password?.trim() || undefined,
            token_siat: form.token_siat?.trim() || undefined,
            fecha_inicio_vigencia: form.fecha_inicio_vigencia,
            fecha_fin_vigencia: form.fecha_fin_vigencia,
            email_fiscal: form.email_fiscal?.trim(),
            codigo_actividad_caeb: form.codigo_actividad_caeb?.trim().toUpperCase() || undefined,
            telefono_fiscal: form.telefono_fiscal?.trim() || undefined,
            municipio_fiscal: form.municipio_fiscal?.trim().toUpperCase() || undefined,
            direccion_fiscal: form.direccion_fiscal?.trim().toUpperCase() || undefined,
        }),

        validate: (form: any, rules: any, notify: any) => {
            if (rules.obligatoria()(form.empresa_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar una empresa.');
                return false;
            }
            if (!form.nit?.trim()) {
                notify('warn', 'NIT requerido', 'El NIT es obligatorio.');
                return false;
            }
            if (rules.nit()(form.nit) !== true) {
                notify('warn', 'NIT inválido', rules.nit()(form.nit));
                return false;
            }
            if (!form.etiqueta?.trim()) {
                notify('warn', 'Etiqueta requerida', 'La etiqueta es obligatoria.');
                return false;
            }
            if (rules.textoMayusculasGuionBajo()(form.etiqueta) !== true) {
                notify('warn', 'Etiqueta inválida', rules.textoMayusculasGuionBajo()(form.etiqueta));
                return false;
            }
            if (rules.longitudMinima(3)(form.razon_social) !== true) {
                notify('warn', 'Razón social inválida', 'La razón social es obligatoria (mín. 3 caracteres).');
                return false;
            }
            if (rules.longitudMinima(3)(form.actividad_economica_principal) !== true) {
                notify('warn', 'Actividad económica inválida', 'La actividad económica es obligatoria (mín. 3 caracteres).');
                return false;
            }
            if (!form.email_fiscal?.trim()) {
                notify('warn', 'Email requerido', 'El email fiscal es obligatorio.');
                return false;
            }
            if (rules.formatoCorreo()(form.email_fiscal) !== true) {
                notify('warn', 'Correo inválido', rules.formatoCorreo()(form.email_fiscal));
                return false;
            }
            if (rules.seleccionObligatoria()(form.ambiente_id) !== true) {
                notify('warn', 'Ambiente requerido', 'Debe seleccionar un ambiente.');
                return false;
            }
            if (rules.seleccionObligatoria()(form.modalidad_facturacion_id) !== true) {
                notify('warn', 'Modalidad requerida', 'Debe seleccionar una modalidad de facturación.');
                return false;
            }
            if (rules.obligatoria()(form.fecha_inicio_vigencia) !== true) {
                notify('warn', 'Fecha inválida', 'La fecha de inicio de vigencia es obligatoria.');
                return false;
            }
            if (rules.obligatoria()(form.fecha_fin_vigencia) !== true) {
                notify('warn', 'Fecha inválida', 'La fecha de fin de vigencia es obligatoria.');
                return false;
            }
            if (form.fecha_inicio_vigencia > form.fecha_fin_vigencia) {
                notify('warn', 'Fechas inválidas', 'La fecha de inicio no puede ser mayor a la fecha de fin de vigencia.');
                return false;
            }
            return true;
        },
    });

    // ============ TÍTULOS DINÁMICOS ============
    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR NIT' : 'NUEVO NIT'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización de datos fiscales y de dosificación'
            : 'Registro de datos fiscales y de dosificación'
    );

    // ============ ESTADO ADICIONAL ============
    const rangoFechasInvalido = computed(() => {
        const ini = formObj.value.fecha_inicio_vigencia;
        const fin = formObj.value.fecha_fin_vigencia;
        return ini && fin && ini > fin;
    });

    // ============ FOCUS INICIAL ============
    const empresaSelectRef = ref<any>(null);

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
        openNew();
        if (filters.value.empresa_id) {
            formObj.value.empresa_id = Number(filters.value.empresa_id);
        }
    };

    const handleEdit = async (item: any): Promise<void> => {
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
        formObj.value.ambiente_id = Number(item.ambiente_id);
        formObj.value.modalidad_facturacion_id = Number(item.modalidad_facturacion_id);
        formObj.value.codigo_actividad_caeb = item.codigo_actividad_caeb ?? '';
        formObj.value.telefono_fiscal = item.telefono_fiscal ?? '';
        formObj.value.municipio_fiscal = item.municipio_fiscal ?? '';
        formObj.value.direccion_fiscal = item.direccion_fiscal ?? '';
    };

    // ============ COLUMNAS DE LA TABLA ============
    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'razon_social',             header: 'RAZÓN SOCIAL',  sortable: true,  template: 'body-razon_social' },
        { field: 'empresa_nombre',           header: 'EMPRESA',       sortable: true,  template: 'body-empresa',        class: 'w-48' },
        { field: 'ambiente_id',              header: 'AMBIENTE',      sortable: true,  template: 'body-ambiente',       bodyClass: '!text-center', class: 'w-32' },
        { field: 'modalidad_facturacion_id', header: 'MODALIDAD',     sortable: true,  template: 'body-modalidad',      bodyClass: '!text-center', class: 'w-32' },
        { field: 'fecha_inicio_vigencia',    header: 'VIGENCIA',      sortable: true,  template: 'body-vigencia',       bodyClass: '!text-center', class: 'w-32' },
        { field: 'estado_registro',          header: 'ESTADO',        sortable: false, template: 'body-estado',         bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES',                template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    // ============ HELPERS ============
    const deleteItemName = computed(() => {
        const nit = formObj.value.nit ?? '';
        const razon = formObj.value.razon_social ?? '';
        return `NIT ${nit} — ${razon}`;
    });

    // ============ FILTROS AVANZADOS ============
    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.empresa_id) count++;
        if (filters.value.ambiente_id) count++;
        if (filters.value.modalidad_facturacion_id) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        onSearch();
    };

    const limpiarFiltros = (): void => {
        filters.value.empresa_id = null;
        filters.value.ambiente_id = null;
        filters.value.modalidad_facturacion_id = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    // ============ WATCH: Normalizar tipos al abrir el diálogo ============
    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.empresa_id != null) {
                formObj.value.empresa_id = Number(formObj.value.empresa_id);
            }
            if (formObj.value.ambiente_id != null) {
                formObj.value.ambiente_id = Number(formObj.value.ambiente_id);
            }
            if (formObj.value.modalidad_facturacion_id != null) {
                formObj.value.modalidad_facturacion_id = Number(formObj.value.modalidad_facturacion_id);
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
        lazyParams.value.sortField = 'empresa_nit_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        if (filters.value.empresa_id) {
            onSearch();
        }
    });
</script>
