<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\hato\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-box" title="Reporte de Hato" subtitle="Análisis general del inventario de vacunos"
        :show-action="false">
        <!-- ═══════════════════════════════════════════════════════
             FILTROS
             ═══════════════════════════════════════════════════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                <!-- Empresa -->
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                    <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear :loading="loadingEmpresas"
                        class="w-full" @update:model-value="loadData" />
                </div>

                <!-- Sucursal -->
                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" class="w-full" @update:model-value="loadData" />
                </div>

                <!-- Raza -->
                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Raza</label>
                    <BaseSelect v-model="filters.raza_id" :options="razaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear class="w-full"
                        @update:model-value="loadData" />
                </div>

                <!-- Categoría -->
                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Categoría</label>
                    <BaseSelect v-model="filters.categoria_vacuno_id" :options="categoriaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear class="w-full"
                        @update:model-value="loadData" />
                </div>

                <!-- Estado Vacuno -->
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Estado Vacuno</label>
                    <BaseSelect v-model="filters.estado_vacuno_id" :options="estadoVacunoOptions" option-label="label"
                        option-value="value" placeholder="Todos" size="sm" show-clear class="w-full"
                        @update:model-value="loadData" />
                </div>

                <div class="md:col-span-12 flex flex-wrap justify-end gap-2 mt-2">
                    <BaseButton label="Limpiar filtros" icon="pi pi-filter-slash" variant="cancel" size="sm"
                        @click="limpiarFiltros" />
                    <BaseButton label="Exportar a PDF" icon="pi pi-file-pdf" variant="primary" size="sm"
                        :loading="loadingPdf" :disabled="!data || loading || data.detalle.length === 0"
                        @click="exportToPdf" />
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════
             CONTENIDO (con scroll)
             ═══════════════════════════════════════════════════════ -->
        <div class="flex-1 min-h-0 overflow-y-auto h-full pr-1 pb-4 space-y-4">
            <!-- Loader -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <template v-else-if="data">
                <!-- ─── 1. KPIs FINANCIEROS ─── -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-slate-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Vacunos</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.total, 0) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-sky-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">
                            Valor Adquisición (Bs)
                        </span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            Bs. {{ formatNumber(data.resumen.valor_adquisicion_total) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-amber-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">
                            Amortización Acum. (Bs)
                        </span>
                        <span class="block text-lg font-black text-amber-700 mt-1">
                            Bs. {{ formatNumber(data.resumen.amortizacion_acumulada_total) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">
                            Valor Libro Actual (Bs)
                        </span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">
                            Bs. {{ formatNumber(data.resumen.valor_libro_total) }}
                        </span>
                    </BaseCard>
                </div>

                <!-- ─── 2. KPIs OPERATIVOS (promedios) ─── -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-sky-400">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Peso Promedio</span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            {{ data.resumen.peso_promedio !== null
                                ? `${formatNumber(data.resumen.peso_promedio)} kg`
                                : '—' }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-violet-400">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Edad Promedio</span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            {{ data.resumen.edad_promedio_meses !== null
                                ? `${Math.round(data.resumen.edad_promedio_meses)} meses`
                                : '—' }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-rose-400">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">
                            Valor Residual Total
                        </span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            Bs. {{ formatNumber(data.resumen.valor_residual_total) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-teal-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">
                            Productores de Leche
                        </span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.por_es_productor_leche['PRODUCTOR'] ?? 0, 0) }}
                            <span class="text-[10px] font-semibold text-slate-500 ml-1">
                                / {{ formatNumber(data.resumen.total, 0) }}
                            </span>
                        </span>
                    </BaseCard>
                </div>

                <!-- ─── 3. DISTRIBUCIONES (charts + tablas) ─── -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Por Categoría -->
                    <BaseCard class="p-4">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider mb-3">
                            Distribución por Categoría
                        </h3>
                        <div class="space-y-2">
                            <div v-for="(total, label) in data.resumen.por_categoria" :key="`cat-${label}`"
                                class="flex items-center gap-2">
                                <span class="w-32 text-[11px] font-semibold text-slate-700 truncate">
                                    {{ label }}
                                </span>
                                <div class="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                                    <div class="h-full bg-sky-500 transition-all"
                                        :style="{ width: barWidth(total, data.resumen.total) }"></div>
                                </div>
                                <span class="w-14 text-right text-[11px] font-bold text-slate-800">
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
                            Distribución por Raza
                        </h3>
                        <div class="space-y-2">
                            <div v-for="(total, label) in data.resumen.por_raza" :key="`raza-${label}`"
                                class="flex items-center gap-2">
                                <span class="w-32 text-[11px] font-semibold text-slate-700 truncate">
                                    {{ label }}
                                </span>
                                <div class="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                                    <div class="h-full bg-emerald-500 transition-all"
                                        :style="{ width: barWidth(total, data.resumen.total) }"></div>
                                </div>
                                <span class="w-14 text-right text-[11px] font-bold text-slate-800">
                                    {{ total }}
                                </span>
                            </div>
                            <p v-if="!Object.keys(data.resumen.por_raza).length"
                                class="text-[11px] text-slate-400 italic">
                                Sin datos
                            </p>
                        </div>
                    </BaseCard>

                    <!-- Por Estado Vacuno -->
                    <BaseCard class="p-4">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider mb-3">
                            Distribución por Estado
                        </h3>
                        <div class="space-y-2">
                            <div v-for="(total, label) in data.resumen.por_estado_vacuno" :key="`est-${label}`"
                                class="flex items-center gap-2">
                                <span class="w-32 text-[11px] font-semibold text-slate-700 truncate">
                                    {{ label }}
                                </span>
                                <div class="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
                                    <div class="h-full bg-amber-500 transition-all"
                                        :style="{ width: barWidth(total, data.resumen.total) }"></div>
                                </div>
                                <span class="w-14 text-right text-[11px] font-bold text-slate-800">
                                    {{ total }}
                                </span>
                            </div>
                            <p v-if="!Object.keys(data.resumen.por_estado_vacuno).length"
                                class="text-[11px] text-slate-400 italic">
                                Sin datos
                            </p>
                        </div>
                    </BaseCard>

                    <!-- Por Sucursal + Sexo -->
                    <BaseCard class="p-4">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider mb-3">
                            Por Sucursal y Sexo
                        </h3>

                        <div class="mb-3">
                            <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Sucursal</p>
                            <div class="space-y-1.5">
                                <div v-for="(total, label) in data.resumen.por_sucursal" :key="`suc-${label}`"
                                    class="flex items-center gap-2">
                                    <span class="w-28 text-[10px] font-semibold text-slate-700 truncate">
                                        {{ label }}
                                    </span>
                                    <div class="flex-1 h-4 bg-slate-100 rounded overflow-hidden">
                                        <div class="h-full bg-violet-500 transition-all"
                                            :style="{ width: barWidth(total, data.resumen.total) }"></div>
                                    </div>
                                    <span class="w-10 text-right text-[10px] font-bold text-slate-800">
                                        {{ total }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="border-t border-dashed border-slate-200 pt-3">
                            <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Sexo</p>
                            <div class="flex gap-2 flex-wrap">
                                <div v-for="(total, label) in data.resumen.por_sexo" :key="`sexo-${label}`"
                                    class="flex-1 min-w-[100px] bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                                    <span class="block text-[9px] font-bold text-slate-500 uppercase">
                                        {{ label === 'M' ? 'Macho' : label === 'H' ? 'Hembra' : label }}
                                    </span>
                                    <span class="block text-sm font-black text-slate-800">
                                        {{ total }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </BaseCard>
                </div>

                <!-- ─── 4. TABLA DE DETALLE ─── -->
                <BaseCard class="overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider">
                            Detalle del Hato ({{ formatNumber(data.detalle.length, 0) }} registros)
                        </h3>
                    </div>

                    <BaseTable :value="data.detalle" :loading="false" :paginator="true" :rows="15"
                        :total-records="data.detalle.length" :first="lazyFirst" row-key="vacuno_id" :columns="columns"
                        :rows-per-page-options="[10, 15, 25, 50]" @page="onPage">
                        <template #body-arete="{ data: row }">
                            <span class="font-bold text-sky-700">{{ row.arete }}</span>
                        </template>
                        <template #body-nombre="{ data: row }">
                            <span class="text-slate-800">{{ row.nombre || '—' }}</span>
                        </template>
                        <template #body-edad_meses="{ data: row }">
                            <span class="text-slate-700">
                                {{ row.edad_meses !== null ? row.edad_meses : '—' }}
                            </span>
                        </template>
                        <template #body-peso_actual="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ row.peso_actual !== null ? formatNumber(row.peso_actual) : '—' }}
                            </span>
                        </template>
                        <template #body-valor_adquisicion="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.valor_adquisicion) }}
                            </span>
                        </template>
                        <template #body-valor_libro_actual="{ data: row }">
                            <span class="text-right block font-semibold text-emerald-700">
                                {{ row.valor_libro_actual !== null
                                    ? formatNumber(row.valor_libro_actual)
                                    : '—' }}
                            </span>
                        </template>
                        <template #body-estado_vacuno="{ data: row }">
                            <CrudEstadoBadge :estado="row.estado_vacuno" :estado-id="row.estado_vacuno_id" />
                        </template>
                        <template #body-fecha_ingreso="{ data: row }">
                            <span class="text-slate-600">
                                {{ row.fecha_ingreso ? formatDate(row.fecha_ingreso) : '—' }}
                            </span>
                        </template>

                        <template #empty>
                            <p class="text-xs font-semibold text-slate-500">
                                No hay vacunos para los filtros seleccionados.
                            </p>
                        </template>
                    </BaseTable>
                </BaseCard>
            </template>

            <!-- Sin datos -->
            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                <i class="pi pi-inbox text-4xl text-slate-300 mb-3"></i>
                <p class="text-xs font-semibold text-slate-500">
                    No se pudo generar el reporte.
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
    import { ESTADO_ACTIVO, ESTADO_VACUNO_METADATA } from '~/constants/estados.constant';

    useHead({ title: 'Reporte de Hato' });

    // ══════════════════════════════════════════════════════════
    // TIPOS (espejo de hato-response.interface.ts del backend)
    // ══════════════════════════════════════════════════════════
    interface HatoResumen {
        total: number;
        por_categoria: Record<string, number>;
        por_raza: Record<string, number>;
        por_estado_vacuno: Record<string, number>;
        por_sexo: Record<string, number>;
        por_sucursal: Record<string, number>;
        por_es_productor_leche: Record<string, number>;
        valor_adquisicion_total: number;
        valor_residual_total: number;
        amortizacion_acumulada_total: number;
        valor_libro_total: number;
        peso_promedio: number | null;
        edad_promedio_meses: number | null;
    }

    interface HatoDetalle {
        vacuno_id: number;
        arete: string;
        nombre: string | null;
        empresa_id: number;
        empresa: string;
        sucursal_id: number;
        sucursal: string;
        raza_id: number;
        raza: string;
        categoria_vacuno_id: number;
        categoria: string;
        tipo_semoviente_id: number;
        tipo_semoviente: string;
        sexo_biologico_id: number;
        sexo: string;
        color: string | null;
        fecha_nacimiento: string | null;
        edad_meses: number | null;
        peso_nacimiento: number | null;
        peso_actual: number | null;
        valor_adquisicion: number;
        valor_residual: number;
        valor_libro_actual: number | null;
        amortizacion_acumulada: number;
        meses_amortizados: number;
        es_productor_leche: number;
        estado_vacuno_id: number;
        estado_vacuno: string;
        fecha_ingreso: string;
        estado_id: number;
        estado_registro: string;
        usuario_operacion: string | null;
        fecha_registro: string;
        fecha_actualizacion: string | null;
    }

    interface HatoResponse {
        resumen: HatoResumen;
        detalle: HatoDetalle[];
    }

    // ══════════════════════════════════════════════════════════
    // ESTADO
    // ══════════════════════════════════════════════════════════
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();
    const { getJson } = useParametroGlobal();

    const loading = ref(false);
    const loadingPdf = ref(false);
    const data = ref<HatoResponse | null>(null);

    // Catálogos
    const empresaOptions = ref<{ label: string; value: number }[]>([]);
    const sucursalOptions = ref<{ label: string; value: number }[]>([]);
    const razaOptions = ref<{ label: string; value: number }[]>([]);
    const categoriaOptions = ref<{ label: string; value: number }[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);

    // Estados de vacuno
    const estadoVacunoOptions = Object.values(ESTADO_VACUNO_METADATA).map((m) => ({
        label: m.label,
        value: m.id,
    }));

    // Filtros
    const filters = ref<{
        empresa_id: number | null;
        sucursal_id: number | null;
        raza_id: number | null;
        categoria_vacuno_id: number | null;
        estado_vacuno_id: number | null;
    }>({
        empresa_id: authStore.user?.empresa_id ?? null,
        sucursal_id: authStore.user?.sucursal_id ?? null,
        raza_id: null,
        categoria_vacuno_id: null,
        estado_vacuno_id: null,
    });

    // Columnas del detalle
    const columns = [
        { field: 'arete', header: 'Arete', sortable: true, template: 'body-arete' },
        { field: 'nombre', header: 'Nombre', template: 'body-nombre' },
        { field: 'raza', header: 'Raza' },
        { field: 'categoria', header: 'Categoría' },
        { field: 'sexo', header: 'Sexo' },
        { field: 'edad_meses', header: 'Edad (m)', template: 'body-edad_meses' },
        { field: 'peso_actual', header: 'Peso (kg)', template: 'body-peso_actual' },
        { field: 'valor_adquisicion', header: 'V. Adq. (Bs)', template: 'body-valor_adquisicion' },
        { field: 'valor_libro_actual', header: 'V. Libro (Bs)', template: 'body-valor_libro_actual' },
        { field: 'estado_vacuno', header: 'Estado', template: 'body-estado_vacuno' },
        { field: 'sucursal', header: 'Sucursal' },
        { field: 'fecha_ingreso', header: 'F. Ingreso', template: 'body-fecha_ingreso' },
    ];

    // Paginación local del detalle (BaseTable es lazy pero aquí ya tenemos todo)
    const lazyFirst = ref(0);
    const onPage = (event: any) => {
        lazyFirst.value = event.first;
    };

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

    // ══════════════════════════════════════════════════════════
    // CARGA DE CATÁLOGOS
    // ══════════════════════════════════════════════════════════
    const cargarFiltros = async () => {
        loadingEmpresas.value = true;
        loadingSucursales.value = true;
        try {
            const [resEmp, resSuc, resRaza, resCat] = await Promise.all([
                $api('/empresas', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
                $api('/sucursales', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
                $api('/razas', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
                $api('/categorias-vacuno', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
            ]);

            empresaOptions.value = (resEmp.data || resEmp || []).map((e: any) => ({
                label: e.empresa,
                value: Number(e.empresa_id),
            }));

            sucursalOptions.value = (resSuc.data || resSuc || []).map((s: any) => ({
                label: `${s.sucursal}`.trim(),
                value: Number(s.sucursal_id),
            }));

            razaOptions.value = (resRaza.data || resRaza || []).map((r: any) => ({
                label: r.raza,
                value: Number(r.raza_id),
            }));

            categoriaOptions.value = (resCat.data || resCat || []).map((c: any) => ({
                label: c.categoria,
                value: Number(c.categoria_vacuno_id),
            }));
        } catch (err) {
            console.error('Error cargando catálogos:', err);
            notify('error', 'Error', 'No se pudieron cargar los filtros.');
        } finally {
            loadingEmpresas.value = false;
            loadingSucursales.value = false;
        }
    };

    // ══════════════════════════════════════════════════════════
    // CARGA DEL REPORTE
    // ══════════════════════════════════════════════════════════
    const loadData = async () => {
        loading.value = true;
        try {
            const params: Record<string, any> = {
                empresa_id: filters.value.empresa_id || undefined,
                sucursal_id: filters.value.sucursal_id || undefined,
                raza_id: filters.value.raza_id || undefined,
                categoria_vacuno_id: filters.value.categoria_vacuno_id || undefined,
                estado_vacuno_id: filters.value.estado_vacuno_id || undefined,
            };

            const res = await $api('/reportes/hato', { method: 'GET', params });
            data.value = res as HatoResponse;
            lazyFirst.value = 0;
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo generar el reporte.';
            notify('error', 'Error al cargar', Array.isArray(msg) ? msg.join(', ') : msg);
            data.value = null;
        } finally {
            loading.value = false;
        }
    };

    const limpiarFiltros = () => {
        filters.value = {
            empresa_id: null,
            sucursal_id: null,
            raza_id: null,
            categoria_vacuno_id: null,
            estado_vacuno_id: null,
        };
        loadData();
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
        if (!data.value || !data.value.detalle.length) return;
        loadingPdf.value = true;

        try {
            // 1. Configuración (con fallback)
            const config = await getJson<PdfConfig>('pdf_reporte_hato');

            const defaultConfig: PdfConfig = {
                titulo: 'REPORTE DE HATO DE VACUNOS',
                orientacion: 'landscape',
                tamano_pagina: 'a4',
                bordes: true,
                mostrar_resumen: true,
                columnas: [
                    'Arete', 'Nombre', 'Raza', 'Categoría', 'Sexo',
                    'Edad (mes)', 'Peso (kg)', 'V. Adq.', 'V. Libro',
                    'Estado', 'Sucursal', 'F. Ingreso',
                ],
            };
            const cfg = config ?? defaultConfig;

            // 2. Documento
            const doc = new jsPDF({
                orientation: cfg.orientacion,
                unit: 'mm',
                format: cfg.tamano_pagina,
            });

            // 3. Contexto del encabezado
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

            const razaTexto = filters.value.raza_id
                ? razaOptions.value.find((r) => r.value === filters.value.raza_id)?.label ?? 'TODAS'
                : 'TODAS';

            const categoriaTexto = filters.value.categoria_vacuno_id
                ? categoriaOptions.value.find((c) => c.value === filters.value.categoria_vacuno_id)?.label ?? 'TODAS'
                : 'TODAS';

            // 4. Cuerpo de la tabla
            const tableBody = data.value.detalle.map((row) => [
                row.arete ?? '—',
                row.nombre || '—',
                row.raza ?? '—',
                row.categoria ?? '—',
                row.sexo ?? '—',
                row.edad_meses !== null ? String(row.edad_meses) : '—',
                row.peso_actual !== null ? formatNumber(row.peso_actual) : '—',
                formatNumber(row.valor_adquisicion),
                row.valor_libro_actual !== null ? formatNumber(row.valor_libro_actual) : '—',
                row.estado_vacuno ?? '—',
                row.sucursal ?? '—',
                row.fecha_ingreso ? formatDate(row.fecha_ingreso) : '—',
            ]);

            // 5. autoTable
            autoTable(doc, {
                head: [cfg.columnas],
                body: tableBody,
                startY: 36, // Ajustado por el nuevo encabezado más grande
                theme: cfg.bordes ? 'grid' : 'plain',
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5,
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
                    5: { halign: 'center' },
                    6: { halign: 'right' },
                    7: { halign: 'right' },
                    8: { halign: 'right' },
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
                    doc.text(`Raza: ${razaTexto}  |  Categoría: ${categoriaTexto}`, 14, 32);

                    const pageWidth = doc.internal.pageSize.width;
                    doc.text(`Usuario: ${usuario}`, pageWidth - 14, 23, { align: 'right' });
                    doc.text(`Impreso: ${fechaImpresion}`, pageWidth - 14, 28, { align: 'right' });
                    doc.text(
                        `Registros: ${data.value!.detalle.length}`,
                        pageWidth - 14,
                        32,
                        { align: 'right' },
                    );

                    doc.setTextColor(0, 0, 0);
                },
            });

            // 6. Resumen (después de la tabla)
            if (cfg.mostrar_resumen && data.value) {
                const r = data.value.resumen;
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const finalY = (doc as any).lastAutoTable.finalY + 6;

                // Si no cabe, nueva página
                const needsNewPage = finalY > pageHeight - 45;
                if (needsNewPage) doc.addPage();

                const y = needsNewPage ? 20 : finalY;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN GENERAL', 14, y);

                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');

                const left = [
                    `Total Vacunos: ${formatNumber(r.total, 0)}`,
                    `Valor Adquisición Total: Bs. ${formatNumber(r.valor_adquisicion_total)}`,
                    `Valor Residual Total: Bs. ${formatNumber(r.valor_residual_total)}`,
                ];
                const right = [
                    `Valor Libro Actual: Bs. ${formatNumber(r.valor_libro_total)}`,
                    `Amortización Acumulada: Bs. ${formatNumber(r.amortizacion_acumulada_total)}`,
                    `Peso Promedio: ${r.peso_promedio !== null ? `${formatNumber(r.peso_promedio)} kg` : '—'}  |  Edad Promedio: ${r.edad_promedio_meses !== null ? `${Math.round(r.edad_promedio_meses)} meses` : '—'}`,
                ];

                left.forEach((line, i) => doc.text(line, 14, y + 5 + i * 4));
                right.forEach((line, i) =>
                    doc.text(line, pageWidth - 14, y + 5 + i * 4, { align: 'right' }),
                );
            }

            // 7. Parchear total de páginas en el pie
            const totalPages = (doc as any).internal.getNumberOfPages();
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                // Limpiar la línea anterior dibujando un rectángulo blanco
                doc.setFillColor(255, 255, 255);
                doc.rect(pageWidth / 2 - 20, pageHeight - 13, 40, 6, 'F');
                doc.setTextColor(0, 0, 0);
                doc.text(
                    `Página ${i} de ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' },
                );
            }

            // 8. Guardar
            doc.save(`Reporte_Hato_${getTodayLocal()}.pdf`);
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
        await cargarFiltros();
        await loadData();
    });
</script>