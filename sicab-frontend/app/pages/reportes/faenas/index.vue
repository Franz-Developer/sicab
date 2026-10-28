<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\faenas\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-bar" title="Reporte de Faenas"
        subtitle="Análisis de faenas, pesos y rendimiento de canal" :show-action="false">

        <!-- ═══════════ FILTROS ═══════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                <!-- Empresa -->
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                    <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear :loading="loadingEmpresas"
                        class="w-full" @update:model-value="loadData" />
                </div>

                <!-- Sucursal -->
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" class="w-full" @update:model-value="loadData" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Desde</label>
                    <BaseInput v-model="filters.desde" type="date" size="sm" @change="onDateChange" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Hasta</label>
                    <BaseInput v-model="filters.hasta" type="date" size="sm" @change="onDateChange" />
                </div>

                <!-- Botón PDF -->
                <div class="md:col-span-12 flex justify-end mt-2">
                    <BaseButton label="Exportar a PDF" icon="pi pi-file-pdf" variant="primary" size="sm"
                        :loading="loadingPdf" :disabled="!data || loading || data.detalle.length === 0"
                        @click="exportToPdf" />
                </div>
            </div>
        </div>

        <!-- ═══════════ CONTENIDO (CON SCROLL) ═══════════ -->
        <div class="flex-1 min-h-0 overflow-y-auto h-full pr-1 pb-4 space-y-4">
            <!-- Loader -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <template v-else-if="data">
                <!-- ─── 1. KPIs PRINCIPALES (pesos) ─── -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-slate-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Faenas</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.total_faenas, 0) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-sky-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Peso Vivo Total (kg)</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.total_peso_vivo) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Canal Caliente Total
                            (kg)</span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">
                            {{ formatNumber(data.resumen.total_peso_canal_caliente) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-teal-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Canal Fría Total (kg)</span>
                        <span class="block text-lg font-black text-teal-700 mt-1">
                            {{ data.resumen.total_peso_canal_fria !== null
                                ? formatNumber(data.resumen.total_peso_canal_fria)
                                : '—' }}
                        </span>
                    </BaseCard>
                </div>

                <!-- ─── 2. KPIs DE RENDIMIENTO (canal) ─── -->
                <BaseCard class="p-3 bg-amber-50 border border-amber-100">
                    <h3 class="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
                        Rendimiento de Canal (Peso Canal Caliente / Peso Vivo)
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <span class="block text-[9px] font-bold text-amber-500 uppercase">Promedio</span>
                            <span class="block text-base font-black text-amber-900 mt-0.5">
                                {{ rendimientoFmt(data.resumen.rendimiento_canal_promedio) }}
                            </span>
                        </div>
                        <div>
                            <span class="block text-[9px] font-bold text-amber-500 uppercase">Mínimo</span>
                            <span class="block text-base font-black text-amber-900 mt-0.5">
                                {{ rendimientoFmt(data.resumen.rendimiento_canal_minimo) }}
                            </span>
                        </div>
                        <div>
                            <span class="block text-[9px] font-bold text-amber-500 uppercase">Máximo</span>
                            <span class="block text-base font-black text-amber-900 mt-0.5">
                                {{ rendimientoFmt(data.resumen.rendimiento_canal_maximo) }}
                            </span>
                        </div>
                    </div>
                </BaseCard>

                <!-- ─── 3. DISTRIBUCIONES (categoría, raza, matadero, sucursal) ─── -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Por Categoría -->
                    <BaseCard class="p-4">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider mb-3">
                            Faenas por Categoría
                        </h3>
                        <div class="space-y-2">
                            <div v-for="(total, label) in data.resumen.por_categoria" :key="`cat-${label}`"
                                class="flex items-center gap-2">
                                <span class="w-32 text-[11px] font-semibold text-slate-700 truncate">
                                    {{ label }}
                                </span>
                                <div class="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                                    <div class="h-full bg-sky-500 transition-all"
                                        :style="{ width: barWidth(total, data.resumen.total_faenas) }"></div>
                                </div>
                                <span class="w-12 text-right text-[11px] font-bold text-slate-800">
                                    {{ total }}
                                </span>
                            </div>
                            <p v-if="!Object.keys(data.resumen.por_categoria).length"
                                class="text-[11px] text-slate-400 italic">
                                Sin datos
                            </p>
                        </div>
                    </BaseCard>

                    <!-- Por Raza -->
                    <BaseCard class="p-4">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider mb-3">
                            Faenas por Raza
                        </h3>
                        <div class="space-y-2">
                            <div v-for="(total, label) in data.resumen.por_raza" :key="`raza-${label}`"
                                class="flex items-center gap-2">
                                <span class="w-32 text-[11px] font-semibold text-slate-700 truncate">
                                    {{ label }}
                                </span>
                                <div class="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                                    <div class="h-full bg-emerald-500 transition-all"
                                        :style="{ width: barWidth(total, data.resumen.total_faenas) }"></div>
                                </div>
                                <span class="w-12 text-right text-[11px] font-bold text-slate-800">
                                    {{ total }}
                                </span>
                            </div>
                            <p v-if="!Object.keys(data.resumen.por_raza).length"
                                class="text-[11px] text-slate-400 italic">
                                Sin datos
                            </p>
                        </div>
                    </BaseCard>
                </div>

                <!-- ─── 4. TABLA POR MATADERO ─── -->
                <BaseCard class="overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider">
                            Resumen por Matadero
                        </h3>
                    </div>
                    <BaseTable :value="data.por_matadero" :loading="false" :paginator="data.por_matadero.length > 10"
                        :rows="10" :total-records="data.por_matadero.length" row-key="matadero"
                        :columns="columnsMatadero" :rows-per-page-options="[10, 15, 25, 50]">
                        <template #body-matadero="{ data: row }">
                            <span class="font-semibold text-slate-800">{{ row.matadero }}</span>
                        </template>
                        <template #body-total_peso_vivo="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.total_peso_vivo) }}
                            </span>
                        </template>
                        <template #body-total_peso_canal_caliente="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.total_peso_canal_caliente) }}
                            </span>
                        </template>
                        <template #body-rendimiento_canal_promedio="{ data: row }">
                            <span class="text-right block font-semibold text-amber-700">
                                {{ rendimientoFmt(row.rendimiento_canal_promedio) }}
                            </span>
                        </template>
                        <template #empty>
                            <p class="text-xs font-semibold text-slate-500">Sin datos por matadero.</p>
                        </template>
                    </BaseTable>
                </BaseCard>

                <!-- ─── 5. TABLA POR SUCURSAL ─── -->
                <BaseCard class="overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider">
                            Resumen por Sucursal
                        </h3>
                    </div>
                    <BaseTable :value="data.por_sucursal" :loading="false" :paginator="data.por_sucursal.length > 10"
                        :rows="10" :total-records="data.por_sucursal.length" row-key="sucursal_id"
                        :columns="columnsSucursal" :rows-per-page-options="[10, 15, 25, 50]">
                        <template #body-sucursal="{ data: row }">
                            <span class="font-semibold text-slate-800">{{ row.sucursal }}</span>
                        </template>
                        <template #body-total_peso_vivo="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.total_peso_vivo) }}
                            </span>
                        </template>
                        <template #body-total_peso_canal_caliente="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.total_peso_canal_caliente) }}
                            </span>
                        </template>
                        <template #body-rendimiento_canal_promedio="{ data: row }">
                            <span class="text-right block font-semibold text-amber-700">
                                {{ rendimientoFmt(row.rendimiento_canal_promedio) }}
                            </span>
                        </template>
                        <template #empty>
                            <p class="text-xs font-semibold text-slate-500">Sin datos por sucursal.</p>
                        </template>
                    </BaseTable>
                </BaseCard>

                <!-- ─── 6. TABLA POR FECHA ─── -->
                <BaseCard class="overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider">
                            Resumen por Fecha
                        </h3>
                    </div>
                    <BaseTable :value="data.por_fecha" :loading="false" :paginator="data.por_fecha.length > 10"
                        :rows="10" :total-records="data.por_fecha.length" row-key="fecha" :columns="columnsFecha"
                        :rows-per-page-options="[10, 15, 25, 50]">
                        <template #body-fecha="{ data: row }">
                            <span class="font-semibold text-slate-800">
                                {{ formatDate(row.fecha) }}
                            </span>
                        </template>
                        <template #body-total_peso_vivo="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.total_peso_vivo) }}
                            </span>
                        </template>
                        <template #body-total_peso_canal_caliente="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.total_peso_canal_caliente) }}
                            </span>
                        </template>
                        <template #body-total_peso_canal_fria="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ row.total_peso_canal_fria !== null
                                    ? formatNumber(row.total_peso_canal_fria)
                                    : '—' }}
                            </span>
                        </template>
                        <template #body-rendimiento_canal_promedio="{ data: row }">
                            <span class="text-right block font-semibold text-amber-700">
                                {{ rendimientoFmt(row.rendimiento_canal_promedio) }}
                            </span>
                        </template>
                        <template #empty>
                            <p class="text-xs font-semibold text-slate-500">Sin datos por fecha.</p>
                        </template>
                    </BaseTable>
                </BaseCard>

                <!-- ─── 7. TABLA DE DETALLE (con expansión) ─── -->
                <BaseCard class="overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider">
                            Detalle de Faenas ({{ formatNumber(data.detalle.length, 0) }} registros)
                        </h3>
                    </div>

                    <BaseTable :value="data.detalle" :loading="false" :paginator="true" :rows="15"
                        :total-records="data.detalle.length" :first="lazyFirst" row-key="faena_id"
                        :columns="columnsDetalle" :rows-per-page-options="[10, 15, 25, 50]" @page="onPage">
                        <template #body-arete="{ data: row }">
                            <span class="font-bold text-sky-700">{{ row.arete }}</span>
                        </template>
                        <template #body-nombre="{ data: row }">
                            <span class="text-slate-800">{{ row.nombre || '—' }}</span>
                        </template>
                        <template #body-fecha_faena="{ data: row }">
                            <span class="text-slate-700">{{ formatDate(row.fecha_faena) }}</span>
                        </template>
                        <template #body-peso_vivo_faena="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.peso_vivo_faena) }}
                            </span>
                        </template>
                        <template #body-peso_canal_caliente="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.peso_canal_caliente) }}
                            </span>
                        </template>
                        <template #body-peso_canal_fria="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ row.peso_canal_fria !== null
                                    ? formatNumber(row.peso_canal_fria)
                                    : '—' }}
                            </span>
                        </template>
                        <template #body-rendimiento_canal="{ data: row }">
                            <span class="text-right block font-semibold text-amber-700">
                                {{ rendimientoFmt(row.rendimiento_canal) }}
                            </span>
                        </template>

                        <!-- Expansión: datos completos de la faena -->
                        <template #expansion="{ data: row }">
                            <div class="expansion-panel">
                                <div class="expansion-grid">
                                    <div class="expansion-item">
                                        <span class="expansion-label">Matadero</span>
                                        <span class="expansion-value">{{ row.matadero ?? '—' }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">N° Guía</span>
                                        <span class="expansion-value">{{ row.numero_guia ?? '—' }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">Empresa</span>
                                        <span class="expansion-value">{{ row.empresa }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">Sucursal</span>
                                        <span class="expansion-value">{{ row.sucursal }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">Raza</span>
                                        <span class="expansion-value">{{ row.raza }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">Categoría</span>
                                        <span class="expansion-value">{{ row.categoria }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">Usuario Operación</span>
                                        <span class="expansion-value">{{ row.usuario_operacion ?? '—' }}</span>
                                    </div>
                                    <div class="expansion-item">
                                        <span class="expansion-label">Fecha Registro</span>
                                        <span class="expansion-value">{{ formatDate(row.fecha_registro) }}</span>
                                    </div>
                                    <div class="expansion-item col-span-2">
                                        <span class="expansion-label">Observaciones</span>
                                        <span class="expansion-value">{{ row.observaciones ?? '—' }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template #empty>
                            <p class="text-xs font-semibold text-slate-500">
                                No hay faenas para los filtros seleccionados.
                            </p>
                        </template>
                    </BaseTable>
                </BaseCard>
            </template>

            <!-- Estado vacío -->
            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                <i class="pi pi-chart-bar text-4xl text-slate-300 mb-3"></i>
                <p class="text-xs font-semibold text-slate-500">
                    No hay datos en el rango seleccionado.
                </p>
            </div>
        </div>
    </CrudPageLayout>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';
    import { getTodayLocal } from '~/utils/date';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';

    useHead({ title: 'Reporte de Faenas' });

    // ══════════════════════════════════════════════════════════
    // TIPOS (espejo de faenas-response.interface.ts)
    // ══════════════════════════════════════════════════════════
    interface FaenasResumen {
        total_faenas: number;
        total_peso_vivo: number;
        total_peso_canal_caliente: number;
        total_peso_canal_fria: number | null;
        rendimiento_canal_promedio: number | null;
        rendimiento_canal_minimo: number | null;
        rendimiento_canal_maximo: number | null;
        por_matadero: Record<string, number>;
        por_sucursal: Record<string, number>;
        por_categoria: Record<string, number>;
        por_raza: Record<string, number>;
    }

    interface FaenaDetalle {
        faena_id: number;
        vacuno_id: number;
        arete: string;
        nombre: string;
        empresa_id: number;
        empresa: string;
        sucursal_id: number;
        sucursal: string;
        raza_id: number;
        raza: string;
        categoria_vacuno_id: number;
        categoria: string;
        fecha_faena: string;
        peso_vivo_faena: number;
        peso_canal_caliente: number;
        peso_canal_fria: number | null;
        rendimiento_canal: number | null;
        matadero: string | null;
        numero_guia: string | null;
        observaciones: string | null;
        estado_id: number;
        estado_registro: string;
        usuario_operacion: string | null;
        fecha_registro: string;
        fecha_actualizacion: string | null;
    }

    interface FaenasPorMatadero {
        matadero: string;
        total_faenas: number;
        total_peso_vivo: number;
        total_peso_canal_caliente: number;
        rendimiento_canal_promedio: number | null;
    }

    interface FaenasPorFecha {
        fecha: string;
        total_faenas: number;
        total_peso_vivo: number;
        total_peso_canal_caliente: number;
        total_peso_canal_fria: number | null;
        rendimiento_canal_promedio: number | null;
    }

    interface FaenasPorSucursal {
        sucursal_id: number;
        sucursal: string;
        total_faenas: number;
        total_peso_vivo: number;
        total_peso_canal_caliente: number;
        rendimiento_canal_promedio: number | null;
    }

    interface FaenasResponse {
        resumen: FaenasResumen;
        detalle: FaenaDetalle[];
        por_matadero: FaenasPorMatadero[];
        por_fecha: FaenasPorFecha[];
        por_sucursal: FaenasPorSucursal[];
    }

    // ══════════════════════════════════════════════════════════
    // DEPENDENCIAS
    // ══════════════════════════════════════════════════════════
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();
    const { getJson } = useParametroGlobal();

    // ══════════════════════════════════════════════════════════
    // ESTADO
    // ══════════════════════════════════════════════════════════
    const loading = ref(false);
    const loadingPdf = ref(false);
    const data = ref<FaenasResponse | null>(null);

    const empresaOptions = ref<{ label: string; value: number }[]>([]);
    const sucursalOptions = ref<{ label: string; value: number }[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const lazyFirst = ref(0);

    let loadSeq = 0;

    const filters = ref<{
        empresa_id: number | null;
        sucursal_id: number | null;
        desde: string;
        hasta: string;
    }>({
        empresa_id: authStore.user?.empresa_id ?? null,
        sucursal_id: null,
        desde: '',
        hasta: '',
    });

    // ══════════════════════════════════════════════════════════
    // COLUMNAS
    // ══════════════════════════════════════════════════════════
    const columnsMatadero = [
        { field: 'matadero', header: 'Matadero', template: 'body-matadero' },
        { field: 'total_faenas', header: 'Faenas' },
        { field: 'total_peso_vivo', header: 'Peso Vivo (kg)', template: 'body-total_peso_vivo' },
        { field: 'total_peso_canal_caliente', header: 'Canal Cal. (kg)', template: 'body-total_peso_canal_caliente' },
        { field: 'rendimiento_canal_promedio', header: 'Rendim. (%)', template: 'body-rendimiento_canal_promedio' },
    ];

    const columnsSucursal = [
        { field: 'sucursal', header: 'Sucursal', template: 'body-sucursal' },
        { field: 'total_faenas', header: 'Faenas' },
        { field: 'total_peso_vivo', header: 'Peso Vivo (kg)', template: 'body-total_peso_vivo' },
        { field: 'total_peso_canal_caliente', header: 'Canal Cal. (kg)', template: 'body-total_peso_canal_caliente' },
        { field: 'rendimiento_canal_promedio', header: 'Rendim. (%)', template: 'body-rendimiento_canal_promedio' },
    ];

    const columnsFecha = [
        { field: 'fecha', header: 'Fecha', template: 'body-fecha' },
        { field: 'total_faenas', header: 'Faenas' },
        { field: 'total_peso_vivo', header: 'Peso Vivo (kg)', template: 'body-total_peso_vivo' },
        { field: 'total_peso_canal_caliente', header: 'Canal Cal. (kg)', template: 'body-total_peso_canal_caliente' },
        { field: 'total_peso_canal_fria', header: 'Canal Fría (kg)', template: 'body-total_peso_canal_fria' },
        { field: 'rendimiento_canal_promedio', header: 'Rendim. (%)', template: 'body-rendimiento_canal_promedio' },
    ];

    const columnsDetalle = [
        { field: 'arete', header: 'Arete', sortable: true, template: 'body-arete' },
        { field: 'nombre', header: 'Nombre', template: 'body-nombre' },
        { field: 'raza', header: 'Raza' },
        { field: 'categoria', header: 'Categoría' },
        { field: 'fecha_faena', header: 'Fecha', template: 'body-fecha_faena' },
        { field: 'peso_vivo_faena', header: 'Peso Vivo (kg)', template: 'body-peso_vivo_faena' },
        { field: 'peso_canal_caliente', header: 'Canal Cal. (kg)', template: 'body-peso_canal_caliente' },
        { field: 'peso_canal_fria', header: 'Canal Fría (kg)', template: 'body-peso_canal_fria' },
        { field: 'rendimiento_canal', header: 'Rendim. (%)', template: 'body-rendimiento_canal' },
    ];

    // ══════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════
    const formatNumber = (v: any, decimals = 2): string => {
        if (v == null || v === '') return (0).toFixed(decimals);
        const n = Number(v);
        if (!Number.isFinite(n)) return (0).toFixed(decimals);
        return n.toLocaleString('es-BO', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    /** Formatea rendimiento_canal: el backend lo devuelve como % (ej. 54.32). */
    const rendimientoFmt = (v: number | null | undefined): string => {
        if (v === null || v === undefined) return '—';
        const n = Number(v);
        if (!Number.isFinite(n)) return '—';
        return `${n.toFixed(2)} %`;
    };

    const formatDate = (v: string | null | undefined): string => {
        if (!v) return '—';
        const s = String(v).slice(0, 10);
        const [y, m, d] = s.split('-');
        if (!y || !m || !d) return '—';
        return `${d}/${m}/${y}`;
    };

    const barWidth = (value: number, total: number): string => {
        if (!total) return '0%';
        const pct = (value / total) * 100;
        return `${Math.min(100, Math.max(0, pct))}%`;
    };

    const onPage = (event: any) => {
        lazyFirst.value = event.first;
    };

    const onDateChange = () => {
        // Se dispara solo al confirmar el cambio (no por cada tecla)
        loadData();
    };

    // ══════════════════════════════════════════════════════════
    // CARGA DE CATÁLOGOS
    // ══════════════════════════════════════════════════════════
    const cargarFiltros = async () => {
        loadingEmpresas.value = true;
        loadingSucursales.value = true;
        try {
            const [resEmp, resSuc] = await Promise.all([
                $api('/empresas', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
                $api('/sucursales', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                })
            ]);

            empresaOptions.value = (resEmp.data || resEmp || []).map((e: any) => ({
                label: e.empresa,
                value: Number(e.empresa_id),
            }));

            sucursalOptions.value = (resSuc.data || resSuc || []).map((s: any) => ({
                label: `${s.sucursal}`.trim(),
                value: Number(s.sucursal_id),
            }));
        } catch (err) {
            console.error('Error cargando catálogos:', err);
            notify('error', 'Error', 'No se pudieron cargar los catálogos.');
        } finally {
            loadingEmpresas.value = false;
            loadingSucursales.value = false;
        }
    };

    // ══════════════════════════════════════════════════════════
    // CARGA DEL REPORTE
    // ══════════════════════════════════════════════════════════
    const loadData = async () => {
        if (filters.value.desde && filters.value.hasta && filters.value.desde > filters.value.hasta) {
            notify('warn', 'Rango inválido', 'La fecha "desde" no puede ser mayor que "hasta".');
            return;
        }

        const seq = ++loadSeq;
        loading.value = true;
        try {
            const params: Record<string, any> = {
                empresa_id: filters.value.empresa_id || undefined,
                sucursal_id: filters.value.sucursal_id || undefined,
                desde: filters.value.desde || undefined,
                hasta: filters.value.hasta || undefined,
            };

            const res = await $api('/reportes/faenas', { method: 'GET', params });

            if (seq !== loadSeq) return;

            data.value = {
                resumen: res?.resumen ?? {
                    total_faenas: 0,
                    total_peso_vivo: 0,
                    total_peso_canal_caliente: 0,
                    total_peso_canal_fria: null,
                    rendimiento_canal_promedio: null,
                    rendimiento_canal_minimo: null,
                    rendimiento_canal_maximo: null,
                    por_matadero: {},
                    por_sucursal: {},
                    por_categoria: {},
                    por_raza: {},
                },
                detalle: Array.isArray(res?.detalle) ? res.detalle : [],
                por_matadero: Array.isArray(res?.por_matadero) ? res.por_matadero : [],
                por_fecha: Array.isArray(res?.por_fecha) ? res.por_fecha : [],
                por_sucursal: Array.isArray(res?.por_sucursal) ? res.por_sucursal : [],
            };
            lazyFirst.value = 0;
        } catch (err: any) {
            if (seq !== loadSeq) return;
            const msg = err?.data?.message || 'No se pudo generar el reporte.';
            notify('error', 'Error al cargar', Array.isArray(msg) ? msg.join(', ') : msg);
            data.value = null;
        } finally {
            if (seq === loadSeq) loading.value = false;
        }
    };

    // ══════════════════════════════════════════════════════════
    // EXPORTAR A PDF
    // ══════════════════════════════════════════════════════════
    interface PdfConfig {
        titulo: string;
        orientacion: 'portrait' | 'landscape';
        tamano_pagina: string;
        bordes: boolean;
        mostrar_resumen: boolean;
        columnas: string[];
    }

    const exportToPdf = async () => {
        const detalle = data.value?.detalle;
        if (!Array.isArray(detalle) || detalle.length === 0) {
            notify('warn', 'Sin datos', 'No hay datos para exportar en el rango seleccionado.');
            return;
        }

        loadingPdf.value = true;

        try {
            // 1. Traer configuración de la BD
            const config = await getJson<PdfConfig>('pdf_reporte_faenas');

            // 2. Default config robusto
            const defaultColumnas = [
                'Arete', 'Nombre', 'Raza', 'Categoría', 'Fecha',
                'Peso Vivo (kg)', 'Canal Cal. (kg)', 'Canal Fría (kg)',
                'Rendim. (%)', 'Matadero',
            ];

            const defaultConfig: PdfConfig = {
                titulo: 'REPORTE DE FAENAS',
                orientacion: 'landscape',
                tamano_pagina: 'a4',
                bordes: true,
                mostrar_resumen: true,
                columnas: defaultColumnas,
            };

            // 🚨 FIX CRÍTICO: Si la config de la BD no coincide, forzamos default.
            let cfg = config || defaultConfig;
            if (!cfg.columnas || cfg.columnas.length !== defaultColumnas.length) {
                console.warn('Configuración de PDF inválida o desactualizada. Usando default.');
                cfg = defaultConfig;
            }

            // 3. Documento
            const doc = new jsPDF({
                orientation: cfg.orientacion,
                unit: 'mm',
                format: cfg.tamano_pagina,
            });

            // 4. Contexto del encabezado
            const empresa = authStore.user?.empresa_nombre || 'SIN EMPRESA';
            const usuario = authStore.user?.login || 'SISTEMA';
            const fechaImpresion = new Date().toLocaleString('es-BO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });

            const sucursalTexto = filters.value.sucursal_id
                ? sucursalOptions.value.find((s) => s.value === filters.value.sucursal_id)?.label ?? 'TODAS'
                : 'TODAS';

            const rangoFechas = `${filters.value.desde || 'INICIO'} — ${filters.value.hasta || 'FIN'}`;

            const tableBody = detalle.map((row) => [
                row.arete ?? '—',
                row.nombre || '—',
                row.raza ?? '—',
                row.categoria ?? '—',
                formatDate(row.fecha_faena),
                formatNumber(row.peso_vivo_faena),
                formatNumber(row.peso_canal_caliente),
                row.peso_canal_fria !== null ? formatNumber(row.peso_canal_fria) : '—',
                rendimientoFmt(row.rendimiento_canal),
                row.matadero ?? '—',
            ]);

            // 6. autoTable
            autoTable(doc, {
                head: [cfg.columnas],
                body: tableBody,
                startY: 42,
                theme: cfg.bordes ? 'grid' : 'plain',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.2,
                    overflow: 'linebreak',
                    halign: 'center',
                },
                headStyles: {
                    fillColor: [23, 37, 84],
                    textColor: 255,
                    fontSize: 8,
                    halign: 'center',
                },
                columnStyles: {
                    5: { halign: 'right' }, // Peso Vivo
                    6: { halign: 'right' }, // Canal Caliente
                    7: { halign: 'right' }, // Canal Fría
                    8: { halign: 'right' }, // Rendimiento
                },
                didDrawPage: () => {
                    // ─── ENCABEZADO ───
                    doc.setTextColor(23, 37, 84);
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(cfg.titulo, 14, 15);

                    doc.setTextColor(37, 99, 235);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Empresa: ${empresa}`, 14, 23);

                    doc.setTextColor(51, 65, 85);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Sucursal: ${sucursalTexto}`, 14, 28);
                    doc.text(`Rango: ${rangoFechas}`, 14, 32);

                    const pageWidth = doc.internal.pageSize.width;
                    doc.text(`Usuario: ${usuario}`, pageWidth - 14, 23, { align: 'right' });
                    doc.text(`Impreso: ${fechaImpresion}`, pageWidth - 14, 28, { align: 'right' });
                    doc.text(`Registros: ${detalle.length}`, pageWidth - 14, 32, { align: 'right' });

                    doc.setTextColor(0, 0, 0);
                },
            });

            // 7. Resumen al final (con salto si no cabe)
            const resumen = data.value?.resumen;
            if (cfg.mostrar_resumen && resumen) {
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const finalY = (doc as any).lastAutoTable.finalY + 6;
                const needsNewPage = finalY > pageHeight - 50;
                if (needsNewPage) doc.addPage();
                const y = needsNewPage ? 20 : finalY;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN GENERAL', 14, y);

                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');

                const left = [
                    `Total Faenas: ${formatNumber(resumen.total_faenas, 0)}`,
                    `Peso Vivo Total: ${formatNumber(resumen.total_peso_vivo)} kg`,
                    `Canal Caliente Total: ${formatNumber(resumen.total_peso_canal_caliente)} kg`,
                    `Canal Fría Total: ${resumen.total_peso_canal_fria !== null ? `${formatNumber(resumen.total_peso_canal_fria)} kg` : '—'}`,
                ];
                const right = [
                    `Rend. Canal Promedio: ${rendimientoFmt(resumen.rendimiento_canal_promedio)}`,
                    `Rend. Canal Mínimo: ${rendimientoFmt(resumen.rendimiento_canal_minimo)}`,
                    `Rend. Canal Máximo: ${rendimientoFmt(resumen.rendimiento_canal_maximo)}`,
                ];

                left.forEach((line, i) => doc.text(line, 14, y + 5 + i * 4));
                right.forEach((line, i) =>
                    doc.text(line, pageWidth - 14, y + 5 + i * 4, { align: 'right' }),
                );
            }

            // 8. Parchear numeración de páginas
            const totalPages = (doc as any).internal.getNumberOfPages();
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.text(
                    `Página ${i} de ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' },
                );
            }

            // 9. Guardar
            doc.save(`Reporte_Faenas_${getTodayLocal()}.pdf`);
        } catch (err) {
            console.error('Error al exportar PDF:', err);
            notify('error', 'Error PDF', 'No se pudo generar el documento PDF.');
        } finally {
            loadingPdf.value = false;
        }
    };

    // ══════════════════════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════════════════════
    onMounted(async () => {
        // Esperar hidratación del authStore (máx 2s)
        if (!authStore.user) {
            await new Promise<void>((resolve) => {
                const start = Date.now();
                const tick = () => {
                    if (authStore.user || Date.now() - start > 2000) return resolve();
                    setTimeout(tick, 50);
                };
                tick();
            });
        }

        if (authStore.user?.sucursal_id) {
            filters.value.sucursal_id = Number(authStore.user.sucursal_id);
        }

        // Fechas por defecto: primer día del mes → hoy
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const pad = (n: number) => String(n).padStart(2, '0');
        filters.value.desde = `${primerDia.getFullYear()}-${pad(primerDia.getMonth() + 1)}-${pad(primerDia.getDate())}`;
        filters.value.hasta = getTodayLocal();

        await cargarFiltros();
        await loadData();
    });
</script>
