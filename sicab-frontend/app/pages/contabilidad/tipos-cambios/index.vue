i<!-- C:\sistemas\sicab\sicab-frontend\app\pages\contabilidad\tipos-cambios\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-dollar" title="Tipos de Cambio"
        subtitle="Factores de conversión entre monedas (compra / venta)">

        <template #actions>
            <BaseButton label="Importar Excel" icon="pi pi-file-excel" variant="success" size="sm"
                class="whitespace-nowrap" v-if="permisos.crear" @click="openImportarExcel" />
            <BaseButton label="Borrar Gestión" icon="pi pi-trash" variant="danger" size="sm" class="whitespace-nowrap"
                v-if="permisos.eliminar" @click="openBorrarGestion" />
            <BaseButton label="NUEVO TIPO DE CAMBIO" icon="pi pi-plus" variant="primary" size="sm" v-if="permisos.crear"
                class="whitespace-nowrap" @click="openNuevoTipoCambio" />
        </template>

        <BaseTable :value="items" :loading="loading" :columns="columns" :totalRecords="totalRecords"
            :rows="lazyParams.rows" :first="lazyParams.first" :sortField="lazyParams.sortField"
            :sortOrder="lazyParams.sortOrder" @page="onPage" @sort="onSort">
            <template #header>
                <div class="px-3 py-1.5 bg-white">
                    <FilterBar :filters="filters"
                        search-placeholder="Sin búsqueda por texto — use los filtros avanzados"
                        :active-filters-count="filtrosActivosCount" modal-title="Filtros de Tipos de Cambio"
                        modal-subtitle="Filtra por moneda o rango de fechas de cotización" @search="onSearch"
                        @clear="limpiarFiltros" @apply="aplicarFiltros">
                        <template #advanced>
                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Moneda Origen
                                </label>
                                <BaseSelect v-model="filters.origen_moneda_id" :options="origenOptions"
                                    option-label="label" option-value="value" placeholder="Todas las monedas" size="sm"
                                    filter show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Moneda Destino
                                </label>
                                <BaseSelect v-model="filters.destino_moneda_id" :options="destinoOptions"
                                    option-label="label" option-value="value" placeholder="Todas las monedas" size="sm"
                                    filter show-clear appendTo="body" @update:model-value="aplicarFiltros"
                                    class="w-full" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Cotización Desde
                                </label>
                                <BaseInput v-model="filters.fecha_desde" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Cotización Hasta
                                </label>
                                <BaseInput v-model="filters.fecha_hasta" type="date" size="sm"
                                    @update:model-value="aplicarFiltros" />
                            </div>

                            <div class="md:col-span-6">
                                <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                                    Gestión (Año)
                                </label>
                                <BaseSelect v-model="filters.gestion" :options="gestionesOptions" option-label="label"
                                    option-value="value" placeholder="Todas las gestiones" size="sm" filter show-clear
                                    appendTo="body" @update:model-value="aplicarFiltros" class="w-full" />

                                <!-- NUEVO INDICADOR DE ESTADO -->
                                <div v-if="cargandoEstadoGestion"
                                    class="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                                    <i class="pi pi-spin pi-spinner"></i> Verificando estado...
                                </div>

                                <div v-else-if="estadoGestion"
                                    class="mt-1 p-1.5 rounded-md text-[10px] font-bold flex flex-col gap-0.5"
                                    :class="estadoMonedaSeleccionada
                                        ? (estadoMonedaSeleccionada.esta_completa ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200')
                                        : (estadoGestion.esta_completa_global ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200')">

                                    <div class="flex items-center gap-1">
                                        <i :class="estadoMonedaSeleccionada
                                            ? (estadoMonedaSeleccionada.esta_completa ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle')
                                            : (estadoGestion.esta_completa_global ? 'pi pi-check-circle' : 'pi pi-info-circle')"></i>

                                        <span v-if="estadoMonedaSeleccionada">
                                            {{ estadoMonedaSeleccionada.esta_completa
                                                ? `La gestión ${estadoGestion.gestion} está completa para
                                            ${estadoMonedaSeleccionada.destino_moneda_label}.`
                                                : `Faltan ${estadoMonedaSeleccionada.dias_faltantes} días de
                                            ${estadoMonedaSeleccionada.total_dias_esperados} para
                                            ${estadoMonedaSeleccionada.destino_moneda_label}.`
                                            }}
                                        </span>
                                        <span v-else>
                                            {{ estadoGestion.mensaje }}
                                        </span>
                                    </div>

                                    <!-- Detalle de monedas incompletas si no hay filtro específico -->
                                    <div v-if="!estadoMonedaSeleccionada && !estadoGestion.esta_completa_global"
                                        class="text-[9px] font-normal opacity-80 pl-4 space-y-0.5">
                                        <div v-for="m in estadoGestion.monedas.filter((m: any) => !m.esta_completa)"
                                            :key="m.destino_moneda_id">
                                            {{ m.destino_moneda_label }}: faltan {{ m.dias_faltantes }} días
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </FilterBar>
                </div>
            </template>

            <template #body-tipo_cambio_id="{ data }">
                <span class="cell-code text-slate-500">#{{ data.tipo_cambio_id }}</span>
            </template>

            <template #body-conversion="{ data }">
                <div class="cell-stack">
                    <span class="cell-primary">
                        {{ data.origen_moneda?.abreviatura || '—' }}
                        <i class="pi pi-arrow-right text-[9px] text-slate-400 mx-1"></i>
                        {{ data.destino_moneda?.abreviatura || '—' }}
                    </span>
                    <span class="cell-secondary">
                        <span class="font-bold">ORIGEN:</span> {{ data.origen_moneda?.label || '—' }}
                    </span>
                </div>
            </template>

            <template #body-factor_compra="{ data }">
                <span class="cell-code">{{ formatFactor(data.factor_compra) }}</span>
            </template>

            <template #body-factor_venta="{ data }">
                <span class="cell-code">{{ formatFactor(data.factor_venta) }}</span>
            </template>

            <template #body-fecha_cotizacion="{ data }">
                <span class="cell-primary-normal">{{ data.fecha_cotizacion }}</span>
            </template>

            <template #body-estado="{ data }">
                <CrudEstadoBadge :estado="data.estado_registro" :estado-id="Number(data.estado_id)" />
            </template>

            <template #body-acciones="{ data }">
                <CrudRowActions :estado-id="Number(data.estado_id)" :puede="permisos" :mostrar-archivar="false"
                    @edit="edit(data)" @delete="confirmDelete(data)" />
            </template>

            <template #expansion="{ data }">
                <div class="expansion-panel">
                    <div class="expansion-grid">
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
                        <div class="expansion-item">
                            <span class="expansion-label">Fecha Baja</span>
                            <span class="expansion-value">{{ data.fecha_baja || '—' }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </BaseTable>
    </CrudPageLayout>

    <BaseDialog v-model:visible="dialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[600px]" maxHeight="92vh"
        :modal="true" :closable="!loading" @show="focusFirstInput">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-dollar text-white text-lg"></i>
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
                    <span>Conversión de Monedas</span>
                    <span class="text-slate-600 normal-case font-bold text-[10px]">
                        Campos obligatorios <span class="text-red-500">*</span>
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Moneda Origen <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect ref="origenSelectRef" v-model="formObj.origen_moneda_id" :options="origenOptions"
                            option-label="label" option-value="value" placeholder="Boliviano (BOB)" size="sm"
                            :disabled="true" class="opacity-60 cursor-not-allowed" />
                        <small class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>El Boliviano es la moneda base del sistema (fijo)
                        </small>
                        <small v-if="isUpdate" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La moneda no se puede modificar en edición
                        </small>
                        <small v-else-if="estaProtegido('origen_moneda_id')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.origen_moneda_id) && $rules.seleccionObligatoria()(formObj.origen_moneda_id) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Requerido
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Moneda Destino <span class="text-red-500">*</span>
                        </label>
                        <BaseSelect v-model="formObj.destino_moneda_id" :options="destinoOptions" option-label="label"
                            option-value="value" placeholder="Seleccionar moneda..." size="sm" filter
                            :disabled="isUpdate || estaProtegido('destino_moneda_id')"
                            :class="{ 'opacity-60 cursor-not-allowed': isUpdate || estaProtegido('destino_moneda_id') }"
                            @update:model-value="touched.destino_moneda_id = true" />
                        <small v-if="isUpdate" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>La moneda no se puede modificar en edición
                        </small>
                        <small v-else-if="estaProtegido('destino_moneda_id')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.destino_moneda_id) && $rules.seleccionObligatoria()(formObj.destino_moneda_id) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Requerido
                        </small>
                        <small v-else-if="mismasMonedas" class="text-red-500 font-semibold text-[10px]">
                            La moneda origen y destino no pueden ser iguales
                        </small>
                    </div>

                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Factor Compra
                            <span v-if="!esDestinoUfv" class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.factor_compra" type="number" step="0.00001" min="0.0001"
                            size="sm" placeholder="0.00000" :disabled="esDestinoUfv || estaProtegido('factor_compra')"
                            :class="{ 'opacity-60 cursor-not-allowed': esDestinoUfv || estaProtegido('factor_compra') }"
                            @blur="touched.factor_compra = true" />
                        <small v-if="esDestinoUfv" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-info-circle mr-1"></i>No aplica para UFV (solo factor de venta)
                        </small>
                        <small v-else-if="estaProtegido('factor_compra')"
                            class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.factor_compra) && $rules.dineroMayorACero()(formObj.factor_compra) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe ser mayor a 0 (máx. 5 decimales)
                        </small>
                    </div>
                    <div class="md:col-span-6">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Factor Venta <span class="text-red-500">*</span>
                        </label>
                        <BaseInput v-model.number="formObj.factor_venta" type="number" step="0.00001" min="0.0001"
                            size="sm" placeholder="0.00000" :disabled="estaProtegido('factor_venta')"
                            :class="{ 'opacity-60 cursor-not-allowed': estaProtegido('factor_venta') }"
                            @blur="touched.factor_venta = true" />
                        <small v-if="estaProtegido('factor_venta')" class="text-amber-500 font-semibold text-[10px]">
                            <i class="pi pi-lock mr-1"></i>Bloqueado por dependencias
                        </small>
                        <small
                            v-else-if="(submitted || touched.factor_venta) && $rules.dineroMayorACero()(formObj.factor_venta) !== true"
                            class="text-red-500 font-semibold text-[10px]">
                            Debe ser mayor a 0 (máx. 5 decimales)
                        </small>
                        <small v-else-if="factorInvalido" class="text-red-500 font-semibold text-[10px]">
                            El factor de compra no puede ser mayor al de venta
                        </small>
                    </div>

                    <div class="md:col-span-12">
                        <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">
                            Fecha Cotización
                        </label>
                        <BaseInput v-model="formObj.fecha_cotizacion" type="date" size="sm" :disabled="true"
                            class="opacity-60 cursor-not-allowed" />
                        <small class="text-sky-700 font-semibold text-[10px] flex items-center gap-1 mt-1">
                            <i class="pi pi-lock text-[10px]"></i>
                            <span v-if="isUpdate">La fecha no se puede modificar en edición</span>
                            <span v-else>Fecha calculada automáticamente a partir de la última cotización
                                registrada</span>
                        </small>
                    </div>

                    <div v-if="!isUpdate" class="md:col-span-12 mt-1">
                        <div
                            class="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-lg">
                            <i class="pi pi-info-circle mt-0.5 text-xs"></i>
                            <span class="text-[10px] font-semibold">
                                Al crear un nuevo tipo de cambio, la versión activa anterior
                                (mismo origen y destino) pasará automáticamente a estado
                                <b>HISTÓRICO</b>.
                            </span>
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
                    variant="primary" @click="save" />
            </div>
        </template>
    </BaseDialog>

    <CrudDeleteDialog v-model:visible="deleteDialog" title="Eliminar Tipo de Cambio" :item-name="deleteItemName"
        @confirm="deleteItem" />

    <BaseDialog v-model:visible="borrarGestionDialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[400px]"
        maxHeight="50vh" :modal="true" :closable="!loading">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-red-600 p-2 rounded-lg shadow">
                    <i class="pi pi-trash text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-red-900 uppercase">Borrar Gestión Completa</h3>
                    <p class="text-xs text-red-700">Esta acción es irreversible</p>
                </div>
            </div>
        </template>

        <div class="p-4">
            <p class="text-sm text-slate-700 mb-4">
                Ingrese el año de la gestión que desea borrar. Solo se puede borrar la última gestión registrada.
            </p>
            <BaseInput v-model.number="gestionSeleccionada" type="number" label="Año de Gestión" size="default"
                placeholder="Ej: 2026" :min="1900" />
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" variant="dialog-cancel"
                    @click="borrarGestionDialog = false" />
                <BaseButton label="Borrar Gestión" icon="pi pi-trash" variant="danger" :loading="loading"
                    :disabled="!gestionSeleccionada || !gestionesDisponibles.includes(Number(gestionSeleccionada))"
                    @click="confirmarBorrarGestion" />
            </div>
        </template>
    </BaseDialog>

    <BaseDialog v-model:visible="importarExcelDialog" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[750px]"
        maxHeight="85vh" :modal="true" :closable="!importandoExcel">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-emerald-600 p-2 rounded-lg shadow">
                    <i class="pi pi-file-excel text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-emerald-900 uppercase">Importar Tipos de Cambio</h3>
                    <p class="text-xs text-emerald-700">Carga masiva desde archivo Excel</p>
                </div>
            </div>
        </template>

        <div class="p-4">
            <div class="flex flex-col md:flex-row gap-4 mb-4">
                <div
                    class="flex-1 flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg">
                    <i class="pi pi-info-circle mt-0.5 text-xs"></i>
                    <div class="text-[10px] font-semibold leading-relaxed">
                        <p class="mb-1">El archivo debe contener una tabla con:</p>

                        <ul v-if="estructuraTexto" class="list-disc list-inside space-y-0.5">
                            <li>Año: <b>{{ estructuraTexto.anio }}</b></li>
                            <li>Días: <b>{{ estructuraTexto.dias }}</b></li>
                            <li>Meses: <b>{{ estructuraTexto.meses }}</b></li>
                            <li>Años válidos: <b>{{ estructuraTexto.rangoAnios }}</b></li>
                        </ul>
                        <p v-else-if="cargandoConfig" class="text-slate-500 italic">
                            Cargando estructura...
                        </p>

                        <p class="mt-2 text-amber-700">
                            <i class="pi pi-exclamation-triangle mr-1"></i>
                            Solo se puede importar si <b>no existen</b> tasas registradas.
                        </p>
                    </div>
                </div>

                <div class="flex-1 border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50/50 p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer flex flex-col items-center justify-center"
                    @click="fileInputRef?.click()" @dragover.prevent @drop.prevent="onFileDrop">

                    <input ref="fileInputRef" type="file" :accept="acceptAttr" class="hidden"
                        @change="onFileSelected" />

                    <i :class="archivoExcel ? 'pi pi-file-excel text-emerald-600' : 'pi pi-cloud-upload text-slate-400'"
                        class="text-4xl mb-2 block"></i>

                    <p v-if="archivoExcel" class="text-xs font-bold text-emerald-800 break-all">
                        {{ archivoExcel.name }}
                        <span class="text-slate-500 font-normal block mt-1">
                            ({{ formatFileSize(archivoExcel.size) }})
                        </span>
                    </p>
                    <p v-else class="text-xs font-bold text-slate-600">
                        Haz clic o arrastra un archivo <b>{{ extensionesTexto }}</b> aquí
                    </p>
                    <p class="text-[10px] text-slate-500 mt-2">
                        Tamaño máximo: <b>{{ maxSizeMB }} MB</b>
                    </p>
                </div>
            </div>

            <div v-if="resultadoImportacion" class="mt-3 p-3 rounded-xl border-2 flex flex-col gap-2"
                :class="resultadoImportacion.insertados > 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'">

                <div class="flex items-center gap-2">
                    <i :class="resultadoImportacion.insertados > 0 ? 'pi pi-check-circle text-emerald-600' : 'pi pi-exclamation-triangle text-amber-600'"
                        class="text-sm"></i>
                    <p class="text-xs font-bold uppercase"
                        :class="resultadoImportacion.insertados > 0 ? 'text-emerald-800' : 'text-amber-800'">
                        Importación Finalizada
                    </p>
                </div>

                <p class="text-[11px] text-slate-700 font-semibold leading-tight">
                    {{ resultadoImportacion.mensaje }}
                </p>

                <div class="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-slate-200/60">

                    <span
                        class="text-[10px] text-center bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold shadow-sm">
                        Leídos: <span class="text-slate-900">{{ resultadoImportacion.procesados }}</span>
                    </span>

                    <span
                        class="text-[10px] text-center bg-white border border-emerald-200 px-2 py-1 rounded-md text-emerald-700 font-bold shadow-sm">
                        Insertados: <span class="text-emerald-900">{{ resultadoImportacion.insertados }}</span>
                    </span>

                    <span v-if="resultadoImportacion.errores > 0"
                        class="text-[10px] text-center bg-white border border-red-200 px-2 py-1 rounded-md text-red-600 font-bold shadow-sm">
                        Omitidos: <span class="text-red-800">{{ resultadoImportacion.errores }}</span>
                    </span>
                    <span v-else class="w-full"></span>

                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cerrar" icon="pi pi-times" variant="dialog-cancel" :disabled="importandoExcel"
                    @click="cerrarImportarExcel" />
                <BaseButton label="Importar" icon="pi pi-upload" variant="success" :loading="importandoExcel"
                    :disabled="!archivoExcel || importandoExcel" @click="ejecutarImportacion" />
            </div>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick, onMounted } from 'vue';
    import { TipoMoneda, TIPO_MONEDA_METADATA } from '~/constants/estados.constant';

    useHead({ title: 'Tipos de Cambio' });

    interface UfvExcelValidacion {
        max_size_bytes: number;
        allowed_extensions: string[];
        allowed_mimetypes: string[];
        max_columnas: number;
        max_filas: number;
    }

    interface UfvExcelEstructura {
        anio_fila: number;
        anio_columna: number;
        fila_cabecera_meses: number;
        fila_inicio_dias: number;
        columna_dias: number;
        columnas_meses: number;
        meses_validos: string[];
        anio_minimo: number;
        anio_maximo: number;
    }

    interface OptionItem {
        label: string;
        value: number;
    }

    interface ValoresIniciales {
        fecha_cotizacion: string;
        factor_compra: number | null;
        factor_venta: number;
        origen_moneda_id: number;
        destino_moneda_id: number;
    }

    const { $rules } = useNuxtApp() as any;
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();

    const mensajeErrorHttp = (err: any, fallback: string): string => {
        const status = err?.status ?? err?.statusCode ?? err?.response?.status;
        if (status === 429) {
            return 'Demasiadas solicitudes. Espere unos segundos e intente nuevamente.';
        }
        const msg = err?.data?.message ?? err?.message ?? fallback;
        return Array.isArray(msg) ? msg.join(', ') : msg;
    };

    const origenOptions: OptionItem[] = (() => {
        const meta = TIPO_MONEDA_METADATA[TipoMoneda.BOLIVIANO]!;
        return [{ label: `${meta.label} (${meta.abreviatura})`, value: TipoMoneda.BOLIVIANO }];
    })();

    const destinoOptions: OptionItem[] = [
        TipoMoneda.DOLAR,
        TipoMoneda.EURO,
        TipoMoneda.UFV,
    ].map((id) => {
        const meta = TIPO_MONEDA_METADATA[id]!;
        return { label: `${meta.label} (${meta.abreviatura})`, value: id };
    });

    // === ESTADO PARA EL FILTRO DE GESTIÓN ===
    const gestionesDisponiblesFiltro = ref<number[]>([]);
    const estadoGestion = ref<any>(null);
    const cargandoEstadoGestion = ref(false);

    const gestionesOptions = computed(() =>
        gestionesDisponiblesFiltro.value.map(g => ({
            label: `Gestión ${g}`,
            value: g
        }))
    );

    const cargarGestionesFiltro = async () => {
        try {
            const res = await $api('/tipos-cambios/gestiones', { method: 'GET' });
            if (res?.gestiones && Array.isArray(res.gestiones)) {
                gestionesDisponiblesFiltro.value = res.gestiones;
            }
        } catch (error) {
            console.error('Error al cargar gestiones para filtros:', error);
        }
    };

    const consultarEstadoGestion = async (gestion: number | null) => {
        if (!gestion) {
            estadoGestion.value = null;
            return;
        }

        cargandoEstadoGestion.value = true;
        try {
            const res = await $api(`/tipos-cambios/gestiones/${gestion}/estado`, { method: 'GET' });
            estadoGestion.value = res;
        } catch (error) {
            console.error('Error al consultar estado de gestión:', error);
            estadoGestion.value = null;
        } finally {
            cargandoEstadoGestion.value = false;
        }
    };

    const estadoMonedaSeleccionada = computed(() => {
        if (!estadoGestion.value) return null;

        if (filters.value.destino_moneda_id) {
            return estadoGestion.value.monedas.find(
                (m: any) => m.destino_moneda_id === Number(filters.value.destino_moneda_id)
            ) ?? null;
        }

        return null;
    });

    const {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, permisos, estaProtegido,
        onPage, onSort, onSearch,
        edit, hideDialog, save,
        confirmDelete, deleteItem,
    } = useCrudTable<any>({
        tabla: 'tipos-cambios',
        tablaPermisos: 'tipos_cambios',
        sortFieldDefault: 'tipo_cambio_id',
        sortOrderDefault: -1,
        rowsDefault: 10,
        autoLoad: false,

        camposProtegidosPorDependencia: [
            'origen_moneda_id',
            'destino_moneda_id',
            'fecha_cotizacion',
        ],

        defaultFilters: {
            global: '',
            exactMatch: 0,
            origen_moneda_id: TipoMoneda.BOLIVIANO,
            destino_moneda_id: null,
            fecha_desde: null,
            fecha_hasta: null,
            gestion: null,
        },

        getExtraFilters: (f: Record<string, any>) => {
            const extra: Record<string, any> = {
                exactMatch: f.exactMatch ?? 0,
            };
            if (f.origen_moneda_id) extra.origen_moneda_id = Number(f.origen_moneda_id);
            if (f.destino_moneda_id) extra.destino_moneda_id = Number(f.destino_moneda_id);

            if (f.fecha_desde) extra.fecha_desde = f.fecha_desde;
            if (f.fecha_hasta) extra.fecha_hasta = f.fecha_hasta;

            if (f.gestion) extra.gestion = Number(f.gestion);

            return extra;
        },

        getPrimaryKey: (item: any) => item.tipo_cambio_id,

        getCleanForm: () => ({
            tipo_cambio_id: null,
            origen_moneda_id: TipoMoneda.BOLIVIANO,
            destino_moneda_id: TipoMoneda.DOLAR,
            factor_compra: null,
            factor_venta: null,
            fecha_cotizacion: '',
        }),

        buildPayload: (form: any) => {
            const esActualizacion = form.tipo_cambio_id != null && form.tipo_cambio_id !== 0;
            const esUfv = Number(form.destino_moneda_id) === TipoMoneda.UFV;

            const payload: Record<string, any> = {
                factor_venta: Number(form.factor_venta),
            };

            if (!esUfv) {
                payload.factor_compra = Number(form.factor_compra);
            }

            if (!esActualizacion) {
                payload.origen_moneda_id = Number(form.origen_moneda_id);
                payload.destino_moneda_id = Number(form.destino_moneda_id);
                payload.fecha_cotizacion = form.fecha_cotizacion;
            }

            return payload;
        },

        validate: (form: any, rules: any, notify: any) => {
            if (rules.seleccionObligatoria()(form.origen_moneda_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar la moneda de origen.');
                return false;
            }
            if (rules.seleccionObligatoria()(form.destino_moneda_id) !== true) {
                notify('warn', 'Campos incompletos', 'Debe seleccionar la moneda de destino.');
                return false;
            }
            if (Number(form.origen_moneda_id) === Number(form.destino_moneda_id)) {
                notify('warn', 'Monedas inválidas', 'La moneda de origen y destino no pueden ser iguales.');
                return false;
            }

            const esUfv = Number(form.destino_moneda_id) === TipoMoneda.UFV;

            if (!esUfv) {
                if (rules.dineroMayorACero()(form.factor_compra) !== true) {
                    notify('warn', 'Factor inválido', 'El factor de compra debe ser mayor a 0.');
                    return false;
                }
                if (Number(form.factor_compra) > Number(form.factor_venta)) {
                    notify('warn', 'Factores inválidos', 'El factor de compra no puede ser mayor al de venta.');
                    return false;
                }
            }

            if (rules.dineroMayorACero()(form.factor_venta) !== true) {
                notify('warn', 'Factor inválido', 'El factor de venta debe ser mayor a 0.');
                return false;
            }

            return true;
        },
    });

    const tituloDialog = computed(() =>
        isUpdate.value ? 'EDITAR TIPO DE CAMBIO' : 'NUEVO TIPO DE CAMBIO'
    );

    const subtituloDialog = computed(() =>
        isUpdate.value
            ? 'Actualización del factor de conversión'
            : 'Registro de nuevo factor de conversión'
    );

    const mismasMonedas = computed(() =>
        formObj.value.origen_moneda_id != null &&
        formObj.value.destino_moneda_id != null &&
        Number(formObj.value.origen_moneda_id) === Number(formObj.value.destino_moneda_id)
    );

    const factorInvalido = computed(() =>
        formObj.value.factor_compra != null &&
        formObj.value.factor_venta != null &&
        Number(formObj.value.factor_compra) > Number(formObj.value.factor_venta)
    );

    const esDestinoUfv = computed(() =>
        Number(formObj.value.destino_moneda_id) === TipoMoneda.UFV
    );

    const deleteItemName = computed(() => {
        const o = TIPO_MONEDA_METADATA[formObj.value.origen_moneda_id as TipoMoneda]?.abreviatura ?? '—';
        const d = TIPO_MONEDA_METADATA[formObj.value.destino_moneda_id as TipoMoneda]?.abreviatura ?? '—';
        return `Conversión ${o} → ${d} (${formObj.value.fecha_cotizacion || '—'})`;
    });

    const origenSelectRef = ref<any>(null);

    const focusFirstInput = async (): Promise<void> => {
        await nextTick();
        setTimeout(() => {
            if (isUpdate.value) return;
            const el = origenSelectRef.value?.getSelectEl?.() as HTMLElement | null;
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

    const formatFactor = (value: number | string | null | undefined): string => {
        if (value == null || value === '') return '—';
        const num = Number(value);
        if (!Number.isFinite(num)) return '—';
        return num.toLocaleString('es-BO', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 5,
        });
    };

    const filtrosActivosCount = computed(() => {
        let count = 0;
        if (filters.value.origen_moneda_id) count++;
        if (filters.value.destino_moneda_id) count++;
        if (filters.value.fecha_desde) count++;
        if (filters.value.fecha_hasta) count++;
        if (filters.value.gestion) count++;
        return count;
    });

    const aplicarFiltros = (): void => {
        lazyParams.value.first = 0;
        setTimeout(() => {
            onSearch();
        }, 50);
    };

    const limpiarFiltros = (): void => {
        filters.value.origen_moneda_id = TipoMoneda.BOLIVIANO;
        filters.value.destino_moneda_id = null;
        filters.value.fecha_desde = null;
        filters.value.fecha_hasta = null;
        filters.value.gestion = null;
        lazyParams.value.first = 0;
        onSearch();
    };

    watch([() => filters.value.gestion, () => filters.value.destino_moneda_id],
        ([nuevaGestion]) => {
            consultarEstadoGestion(nuevaGestion);
        }
    );

    watch(() => formObj.value.destino_moneda_id, async (nuevoDestino, viejoDestino) => {
        if (!dialog.value || isUpdate.value) return;
        if (!nuevoDestino || nuevoDestino === viejoDestino) return;

        const valores = await cargarValoresIniciales(Number(nuevoDestino));
        if (valores) {
            let fechaLimpia = valores.fecha_cotizacion;
            if (fechaLimpia && fechaLimpia.includes('T')) {
                fechaLimpia = fechaLimpia.split('T')[0] as string;
            }

            formObj.value = {
                ...formObj.value,
                factor_compra: valores.factor_compra,
                factor_venta: valores.factor_venta,
                fecha_cotizacion: fechaLimpia || '',
            };
        }
    });

    watch(dialog, async (isOpen) => {
        if (!isOpen) return;

        await nextTick();
        setTimeout(() => {
            if (formObj.value.origen_moneda_id != null) {
                formObj.value.origen_moneda_id = Number(formObj.value.origen_moneda_id);
            }
            if (formObj.value.destino_moneda_id != null) {
                formObj.value.destino_moneda_id = Number(formObj.value.destino_moneda_id);
            }
            if (formObj.value.factor_compra != null) {
                formObj.value.factor_compra = Number(formObj.value.factor_compra);
            }
            if (formObj.value.factor_venta != null) {
                formObj.value.factor_venta = Number(formObj.value.factor_venta);
            }
        }, 150);
    });

    const columns = [
        { expander: true, class: 'w-10', bodyClass: '!text-center' },
        { field: 'tipo_cambio_id', header: 'ID', sortable: true, template: 'body-tipo_cambio_id', class: 'w-16', bodyClass: '!text-center' },
        { field: 'origen_moneda_id', header: 'CONVERSIÓN', sortable: true, template: 'body-conversion', class: 'w-56' },
        { field: 'factor_compra', header: 'COMPRA', sortable: true, template: 'body-factor_compra', bodyClass: '!text-center', class: 'w-28' },
        { field: 'factor_venta', header: 'VENTA', sortable: true, template: 'body-factor_venta', bodyClass: '!text-center', class: 'w-28' },
        { field: 'fecha_cotizacion', header: 'COTIZACIÓN', sortable: true, template: 'body-fecha_cotizacion', bodyClass: '!text-center', class: 'w-32' },
        { field: 'estado_registro', header: 'ESTADO', sortable: false, template: 'body-estado', bodyClass: '!text-center', class: 'w-24' },
        { header: 'ACCIONES', template: 'body-acciones', sortable: false, class: '!text-center !w-28' },
    ];

    const cargarValoresIniciales = async (destinoMonedaId: number): Promise<ValoresIniciales | null> => {
        try {
            const res = await $api('/tipos-cambios/valores-iniciales', {
                method: 'GET',
                params: { destino_moneda_id: destinoMonedaId }
            });
            if (!res) return null;
            return {
                fecha_cotizacion: String(res.fecha_cotizacion ?? ''),
                factor_compra: res.factor_compra ? Number(res.factor_compra) : null,
                factor_venta: Number(res.factor_venta ?? 0),
                origen_moneda_id: Number(res.origen_moneda_id ?? TipoMoneda.BOLIVIANO),
                destino_moneda_id: Number(res.destino_moneda_id ?? destinoMonedaId),
            };
        } catch (error: any) {
            notify('error', 'Error al cargar valores iniciales',
                mensajeErrorHttp(error, 'No se pudieron cargar los valores iniciales.'));
            return null;
        }
    };

    const openNuevoTipoCambio = async (): Promise<void> => {
        formObj.value = {
            tipo_cambio_id: null,
            origen_moneda_id: TipoMoneda.BOLIVIANO,
            destino_moneda_id: TipoMoneda.DOLAR,
            factor_compra: null,
            factor_venta: null,
            fecha_cotizacion: '',
        };
        submitted.value = false;
        touched.value = {};

        const valores = await cargarValoresIniciales(Number(formObj.value.destino_moneda_id));

        if (valores) {
            let fechaLimpia = valores.fecha_cotizacion;
            if (fechaLimpia && fechaLimpia.includes('T')) {
                fechaLimpia = fechaLimpia.split('T')[0] as string;
            }

            formObj.value = {
                tipo_cambio_id: null,
                origen_moneda_id: valores.origen_moneda_id,
                destino_moneda_id: valores.destino_moneda_id,
                factor_compra: valores.factor_compra,
                factor_venta: valores.factor_venta,
                fecha_cotizacion: fechaLimpia || '',
            };
        }

        dialog.value = true;
    };

    const borrarGestionDialog = ref(false);
    const gestionSeleccionada = ref<number | null>(null);
    const gestionesDisponibles = ref<number[]>([]);

    const cargarGestiones = async () => {
        try {
            const res = await $api('/tipos-cambios/gestiones', { method: 'GET' });
            if (res?.gestiones && Array.isArray(res.gestiones)) {
                gestionesDisponibles.value = res.gestiones;
            }
        } catch (error) {
            console.error('No se pudo obtener las gestiones:', error);
        }
    };

    const openBorrarGestion = async () => {
        await cargarGestiones();

        gestionSeleccionada.value = gestionesDisponibles.value.length > 0
            ? gestionesDisponibles.value[0]!
            : null;

        borrarGestionDialog.value = true;
    };

    const confirmarBorrarGestion = async () => {
        const anio = Number(gestionSeleccionada.value);

        if (!anio || !gestionesDisponibles.value.includes(anio)) {
            notify('warn', 'Año inválido', `El año ${anio} no está registrado en el sistema. Gestión válida más reciente: ${gestionesDisponibles.value[0] || 'Ninguna'}`);
            return;
        }

        try {
            loading.value = true;
            const res = await $api(`/tipos-cambios/borrar-gestion/${anio}`, {
                method: 'DELETE',
            });
            notify('success', 'Gestión procesada',
                `Total: ${res.total}, Borradas: ${res.borradas}, Reactivadas: ${res.reactivadas}, Omitidas: ${res.omitidasPorUso}`
            );
            borrarGestionDialog.value = false;
            lazyParams.value.first = 0;
            onSearch();
        } catch (err: any) {
            notify('error', 'Error', mensajeErrorHttp(err, 'No se pudo borrar la gestión.'));
        } finally {
            loading.value = false;
        }
    };

    // ============ IMPORTAR EXCEL ============
    const importarExcelDialog = ref(false);
    const archivoExcel = ref<File | null>(null);
    const importandoExcel = ref(false);
    const fileInputRef = ref<HTMLInputElement | null>(null);

    const configValidacion = ref<UfvExcelValidacion | null>(null);
    const configEstructura = ref<UfvExcelEstructura | null>(null);
    const cargandoConfig = ref(false);

    interface ResultadoImportacion {
        procesados: number;
        insertados: number;
        errores: number;
        mensaje: string;
    }
    const resultadoImportacion = ref<ResultadoImportacion | null>(null);

    const { getJson } = useParametroGlobal();

    // -------- COMPUTED: valores dinámicos desde parametros_globales --------
    const maxSizeMB = computed(() =>
        configValidacion.value
            ? (configValidacion.value.max_size_bytes / 1024 / 1024).toFixed(1)
            : '—'
    );

    const acceptAttr = computed(() =>
        configValidacion.value
            ? configValidacion.value.allowed_extensions.map(e => `.${e}`).join(',')
            : '.xlsx,.xls'
    );

    const extensionesTexto = computed(() =>
        configValidacion.value
            ? configValidacion.value.allowed_extensions.map(e => e.toUpperCase()).join(', ')
            : 'XLS, XLSX'
    );

    const estructuraTexto = computed(() => {
        if (!configEstructura.value) return null;
        const e = configEstructura.value;
        return {
            anio: `Fila ${e.anio_fila}, columna ${e.anio_columna} (ej: "AÑO 2026")`,
            dias: `Columna ${e.columna_dias}`,
            meses: `Fila ${e.fila_cabecera_meses} (${e.meses_validos.slice(0, 3).join(', ')}…)`,
            rangoAnios: `${e.anio_minimo} – ${e.anio_maximo}`,
        };
    });

    // -------- CARGA DE CONFIG --------
    const cargarConfigImportacion = async (): Promise<void> => {
        cargandoConfig.value = true;
        try {
            const [validacion, estructura] = await Promise.all([
                getJson<UfvExcelValidacion>('ufv_excel_validacion'),
                getJson<UfvExcelEstructura>('ufv_excel_estructura'),
            ]);
            configValidacion.value = validacion;
            configEstructura.value = estructura;
        } catch (err) {
            console.error('[importar-excel] Error al cargar configuración:', err);
            notify('warn', 'Configuración no disponible',
                'No se pudieron cargar los límites de importación. Contacte al administrador.');
        } finally {
            cargandoConfig.value = false;
        }
    };

    // -------- APERTURA / CIERRE --------
    const openImportarExcel = async (): Promise<void> => {
        archivoExcel.value = null;
        resultadoImportacion.value = null;
        importarExcelDialog.value = true;
        if (!configValidacion.value || !configEstructura.value) {
            await cargarConfigImportacion();
        }
    };

    const cerrarImportarExcel = (): void => {
        if (importandoExcel.value) return;
        importarExcelDialog.value = false;
        archivoExcel.value = null;
        resultadoImportacion.value = null;
    };

    // -------- SELECCIÓN DE ARCHIVO (sin validación en cliente) --------
    const onFileSelected = (event: Event): void => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        archivoExcel.value = file;
        resultadoImportacion.value = null;
    };

    const onFileDrop = (event: DragEvent): void => {
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;
        archivoExcel.value = file;
        resultadoImportacion.value = null;
    };

    // -------- HELPERS --------
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // -------- EJECUCIÓN --------
    const ejecutarImportacion = async (): Promise<void> => {
        if (!archivoExcel.value) return;

        importandoExcel.value = true;
        resultadoImportacion.value = null;

        try {
            const formData = new FormData();
            formData.append('file', archivoExcel.value);

            const res: ResultadoImportacion = await $api('/tipos-cambios/importar-excel', {
                method: 'POST',
                body: formData,
            });

            resultadoImportacion.value = res;

            if (res.insertados > 0) {
                notify('success', 'Importación exitosa', res.mensaje);
                lazyParams.value.first = 0;
                onSearch();
            } else {
                notify('warn', 'Sin datos importados', res.mensaje);
            }
        } catch (err: any) {
            notify('error', 'Error al importar', mensajeErrorHttp(err, 'No se pudo importar el archivo.'));
        } finally {
            importandoExcel.value = false;
        }
    };

    onMounted(async () => {
        cargarGestionesFiltro();
        lazyParams.value.sortField = 'tipo_cambio_id';
        lazyParams.value.sortOrder = -1;
        lazyParams.value.first = 0;
        onSearch();
    });
</script>
