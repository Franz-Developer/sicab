<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\produccion\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-bar" title="Reporte de Producción"
        subtitle="Análisis histórico de ordeño por sucursal, turno y vacuno" :show-action="false">

        <!-- ═══════════ FILTROS ═══════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Desde</label>
                    <BaseInput v-model="filters.desde" type="date" size="sm" @update:model-value="loadData" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Hasta</label>
                    <BaseInput v-model="filters.hasta" type="date" size="sm" @update:model-value="loadData" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" @update:model-value="loadData" class="w-full" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Turno</label>
                    <BaseSelect v-model="filters.turno_ordeno_id" :options="turnoOptions" option-label="label"
                        option-value="value" placeholder="Todos" size="sm" filter show-clear :loading="loadingTurnos"
                        @update:model-value="loadData" class="w-full" />
                </div>

                <!-- Botón PDF -->
                <div class="md:col-span-12 flex justify-end mt-2">
                    <BaseButton label="Exportar a PDF" icon="pi pi-file-pdf" variant="danger" size="sm"
                        :loading="loadingPdf" :disabled="!data || loading" @click="exportToPdf" />
                </div>
            </div>
        </div>

        <!-- ═══════════ CONTENIDO (CON SCROLL) ═══════════ -->
        <div class="flex-1 min-h-0 overflow-y-auto pr-1 pb-4 space-y-4">

            <!-- Loader Global -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <template v-else-if="data">
                <!-- 1. TARJETAS DE RESUMEN (KPIs) -->
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-sky-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Litros</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">{{
                            formatNumber(data.resumen.total_litros) }} L</span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-red-400">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Descartado</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">{{
                            formatNumber(data.resumen.total_descartado) }} L</span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Neto</span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">{{
                            formatNumber(data.resumen.total_neto) }} L</span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Promedio Diario</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">{{
                            formatNumber(data.resumen.promedio_diario) }} L</span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Temp. Promedio</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ data.resumen.temperatura_promedio != null ?
                                `${formatNumber(data.resumen.temperatura_promedio)} °C` : '—' }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Densidad Promedio</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ data.resumen.densidad_promedio != null ? `${formatNumber(data.resumen.densidad_promedio,
                                3)} g/mL` : '—' }}
                        </span>
                    </BaseCard>
                </div>

                <!-- 2. GRÁFICO DE EVOLUCIÓN (POR FECHA) -->
                <BaseCard class="p-4">
                    <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Evolución Diaria de
                        Producción</h3>
                    <div v-if="data.por_fecha.length > 0">
                        <ChartCanvas type="line" :data="chartData" :options="chartOptions" :height="260" />
                    </div>
                    <div v-else class="text-center text-slate-400 py-8 text-xs font-semibold">
                        No hay datos en el rango seleccionado.
                    </div>
                </BaseCard>

                <!-- 3. TABLAS DE DETALLE -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    <!-- Por Turno -->
                    <BaseCard class="overflow-hidden flex flex-col">
                        <div class="bg-slate-100 p-3 border-b border-slate-200">
                            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">Resumen por Turno
                            </h3>
                        </div>
                        <div class="flex-1 overflow-auto">
                            <table class="w-full text-left text-[11px]">
                                <thead class="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 shadow-sm">
                                    <tr>
                                        <th class="p-2 pl-4">Turno</th>
                                        <th class="p-2 text-right">Litros Tot.</th>
                                        <th class="p-2 text-right">Descartado</th>
                                        <th class="p-2 pr-4 text-right">Neto</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="t in data.por_turno" :key="t.turno_ordeno_id" class="hover:bg-slate-50">
                                        <td class="p-2 pl-4 font-bold text-slate-700">{{ t.turno }}</td>
                                        <td class="p-2 text-right font-medium text-slate-600">{{
                                            formatNumber(t.total_litros) }}</td>
                                        <td class="p-2 text-right font-medium text-red-500">{{
                                            formatNumber(t.total_descartado) }}</td>
                                        <td class="p-2 pr-4 text-right font-bold text-emerald-600">{{
                                            formatNumber(t.total_neto) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </BaseCard>

                    <!-- Top Vacas -->
                    <BaseCard class="overflow-hidden flex flex-col">
                        <div class="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">Top Vacunos (Mayor
                                Producción)</h3>
                        </div>
                        <div class="flex-1 overflow-auto max-h-[300px]">
                            <table class="w-full text-left text-[11px]">
                                <thead class="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 shadow-sm">
                                    <tr>
                                        <th class="p-2 pl-4">Arete</th>
                                        <th class="p-2">Nombre</th>
                                        <th class="p-2 text-right">Total L.</th>
                                        <th class="p-2 pr-4 text-right">Prom. Diario</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="v in data.por_vaca" :key="v.vacuno_id" class="hover:bg-slate-50">
                                        <td class="p-2 pl-4 font-mono font-bold text-sky-700">{{ v.arete }}</td>
                                        <td class="p-2 text-slate-600 truncate max-w-[100px]">{{ v.nombre || '—' }}</td>
                                        <td class="p-2 text-right font-bold text-slate-700">{{
                                            formatNumber(v.total_litros) }}</td>
                                        <td class="p-2 pr-4 text-right font-medium text-slate-500">{{
                                            formatNumber(v.promedio_diario) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </BaseCard>
                </div>

            </template>
        </div>
    </CrudPageLayout>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { getTodayLocal, toLocalDateInput, formatFecha } from '~/utils/date';
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';

    useHead({ title: 'Reporte de Producción' });

    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();
    const { getJson } = useParametroGlobal();

    // ============ ESTADO ============
    const loading = ref(false);
    const loadingPdf = ref(false);
    const data = ref<any>(null);

    // Catálogos para filtros
    const sucursalOptions = ref<any[]>([]);
    const turnoOptions = ref<any[]>([]);
    const loadingSucursales = ref(false);
    const loadingTurnos = ref(false);

    // Filtros por defecto (mes actual)
    const fechaHoy = new Date();
    const primerDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);

    const filters = ref({
        desde: toLocalDateInput(primerDiaMes),
        hasta: getTodayLocal(),
        sucursal_id: authStore.user?.sucursal_id || null,
        turno_ordeno_id: null,
    });

    // ============ CARGA DE CATÁLOGOS ============
    const cargarFiltros = async () => {
        loadingSucursales.value = true;
        loadingTurnos.value = true;
        try {
            const [resSuc, resTur] = await Promise.all([
                $api('/sucursales', { method: 'GET', params: { limit: 1000, estado_id: ESTADO_ACTIVO } }),
                $api('/turnos-ordeno', { method: 'GET', params: { limit: 1000, estado_id: ESTADO_ACTIVO } })
            ]);

            sucursalOptions.value = (resSuc.data || resSuc || []).map((s: any) => ({
                label: `${s.codigo ?? ''} — ${s.sucursal}`.trim(),
                value: Number(s.sucursal_id)
            }));

            turnoOptions.value = (resTur.data || resTur || []).map((t: any) => ({
                label: t.turno,
                value: Number(t.turno_ordeno_id)
            }));
        } catch (err) {
            console.error('Error cargando filtros:', err);
            notify('error', 'Error', 'No se pudieron cargar los filtros auxiliares.');
        } finally {
            loadingSucursales.value = false;
            loadingTurnos.value = false;
        }
    };

    // ============ CARGA DEL REPORTE ============
    const loadData = async () => {
        // Validaciones básicas
        if (filters.value.desde && filters.value.hasta && filters.value.desde > filters.value.hasta) {
            return notify('warn', 'Rango inválido', 'La fecha "desde" no puede ser mayor que "hasta".');
        }

        loading.value = true;
        try {
            const params: any = {
                desde: filters.value.desde || undefined,
                hasta: filters.value.hasta || undefined,
                sucursal_id: filters.value.sucursal_id || undefined,
                turno_ordeno_id: filters.value.turno_ordeno_id || undefined,
            };

            const res = await $api('/reportes/produccion', { method: 'GET', params });
            data.value = res;
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo generar el reporte.';
            notify('error', 'Error al cargar', Array.isArray(msg) ? msg.join(', ') : msg);
            data.value = null;
        } finally {
            loading.value = false;
        }
    };

    // ============ GRÁFICO ============
    const chartData = computed(() => {
        if (!data.value?.por_fecha) return { labels: [], datasets: [] };

        return {
            labels: data.value.por_fecha.map((f: any) => f.fecha),
            datasets: [
                {
                    label: 'Litros Producidos',
                    data: data.value.por_fecha.map((f: any) => f.total_litros),
                    borderColor: '#0ea5e9', // sky-500
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#0284c7'
                }
            ]
        };
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => ` ${context.parsed.y} Litros`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 10, family: 'sans-serif' } }
            },
            x: {
                ticks: { font: { size: 10, family: 'sans-serif' }, maxRotation: 45 }
            }
        }
    };

    // ============ EXPORTAR A PDF ============
    const exportToPdf = async () => {
        if (!data.value) return;
        loadingPdf.value = true;

        try {
            // 1. Obtener configuración del backend
            const config = await getJson<{
                titulo: string;
                orientacion: 'portrait' | 'landscape';
                tamano_pagina: string;
                bordes: boolean;
                mostrar_resumen: boolean;
                columnas: string[];
            }>('pdf_reporte_produccion');

            const defaultConfig = {
                titulo: 'REPORTE DE PRODUCCIÓN DE LECHE',
                orientacion: 'landscape' as const,
                tamano_pagina: 'a4',
                bordes: true,
                mostrar_resumen: true,
                columnas: ["Fecha", "Turno", "Litros", "Descartado", "Neto", "Temp. (°C)", "Densidad (g/mL)"],
            };
            const cfg = config || defaultConfig;

            // 2. Inicializar jsPDF
            const doc = new jsPDF({
                orientation: cfg.orientacion,
                unit: 'mm',
                format: cfg.tamano_pagina,
            });

            // 3. Datos del Encabezado
            const empresa = authStore.user?.empresa_nombre || 'SIN EMPRESA';
            const sucursal = authStore.user?.sucursal_nombre || 'SIN SUCURSAL';
            const usuario = authStore.user?.login || 'SISTEMA';
            const fechaImpresion = new Date().toLocaleString('es-BO', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });

            // 4. Armar la tabla de Detalle (usando `por_fecha` que es lo que devuelve el backend actualmente)
            const tableBody = data.value.por_fecha.map((row: any) => [
                formatFecha(row.fecha, true),
                'TODOS',
                formatNumber(row.total_litros),
                '—',
                formatNumber(row.total_neto),
                '—',
                '—'
            ]);

            // 5. Renderizar con autoTable
            autoTable(doc, {
                head: [cfg.columnas],
                body: tableBody,
                startY: 35, // Margen superior para el header
                theme: cfg.bordes ? 'grid' : 'plain',
                styles: { fontSize: 8, cellPadding: 2 },
                headStyles: { fillColor: [23, 37, 84], textColor: 255 }, // Azul oscuro
                didDrawPage: (_dataTable) => {
                    // ─── ENCABEZADO ───
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(cfg.titulo, 14, 15);

                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Empresa: ${empresa}`, 14, 22);
                    doc.text(`Sucursal: ${sucursal}`, 14, 26);

                    const pageWidth = doc.internal.pageSize.width;
                    doc.text(`Usuario: ${usuario}`, pageWidth - 14, 22, { align: 'right' });
                    doc.text(`Impreso: ${fechaImpresion}`, pageWidth - 14, 26, { align: 'right' });

                    // ─── PIE DE PÁGINA ───
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

                    doc.setFontSize(8);
                    doc.text(
                        `Página ${currentPage} de ${pageCount}`,
                        pageWidth / 2,
                        doc.internal.pageSize.height - 10,
                        { align: 'center' }
                    );
                }
            });

            // 6. Agregar el resumen al final del PDF
            if (cfg.mostrar_resumen) {
                const finalY = (doc as any).lastAutoTable.finalY + 10;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN GENERAL', 14, finalY);

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`Total Litros: ${formatNumber(data.value.resumen.total_litros)} L`, 14, finalY + 6);
                doc.text(`Total Neto: ${formatNumber(data.value.resumen.total_neto)} L`, 14, finalY + 12);
                doc.text(`Promedio Diario: ${formatNumber(data.value.resumen.promedio_diario)} L`, 14, finalY + 18);
            }

            // 7. Guardar
            doc.save(`Reporte_Produccion_${getTodayLocal()}.pdf`);

        } catch (err) {
            console.error('Error al exportar PDF:', err);
            notify('error', 'Error PDF', 'No se pudo generar el documento PDF.');
        } finally {
            loadingPdf.value = false;
        }
    };

    // ============ HELPERS ============
    const formatNumber = (v: any, decimals = 2): string => {
        if (v == null || v === '') return '0.00';
        const n = Number(v);
        if (!Number.isFinite(n)) return '0.00';
        return n.toLocaleString('es-BO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    // ============ INIT ============
    onMounted(async () => {
        await cargarFiltros();
        await loadData();
    });
</script>
