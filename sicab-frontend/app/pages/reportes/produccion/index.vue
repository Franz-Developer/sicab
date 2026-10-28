<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\produccion\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-bar" title="Reporte de Producción"
        subtitle="Análisis histórico de ordeño por sucursal, turno y vacuno" :show-action="false">

        <!-- ═══════════ FILTROS ═══════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                <!-- Filtro Empresa -->
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                    <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear :loading="loadingEmpresas"
                        @update:model-value="loadData" class="w-full" />
                </div>

                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" @update:model-value="loadData" class="w-full" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Desde</label>
                    <BaseInput v-model="filters.desde" type="date" size="sm" @change="loadData" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Hasta</label>
                    <BaseInput v-model="filters.hasta" type="date" size="sm" @change="loadData" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Turno</label>
                    <BaseSelect v-model="filters.turno_ordeno_id" :options="turnoOptions" option-label="label"
                        option-value="value" placeholder="Todos" size="sm" filter show-clear :loading="loadingTurnos"
                        @update:model-value="loadData" class="w-full" />
                </div>

                <!-- Botón PDF -->
                <div class="md:col-span-12 flex justify-end mt-2">
                    <BaseButton label="Exportar a PDF" icon="pi pi-file-pdf" variant="primary" size="sm"
                        :loading="loadingPdf" :disabled="!data || loading || data.por_vaca.length === 0"
                        @click="exportToPdf" />
                </div>
            </div>
        </div>

        <!-- ═══════════ CONTENIDO (CON SCROLL) ═══════════ -->
        <div class="flex-1 min-h-0 overflow-y-auto h-full pr-1 pb-4 space-y-4">

            <!-- Loader Global -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <template v-else-if="data">
                <!-- 1. TARJETAS DE RESUMEN (KPIs) -->
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-sky-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Litros</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.total_litros) }} L
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-red-400">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Descartado</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.total_descartado) }} L
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Neto</span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">
                            {{ formatNumber(data.resumen.total_neto) }} L
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Promedio Diario</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.promedio_diario) }} L
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Días c/ Producción</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ data.resumen.dias_con_produccion }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Turnos</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ data.resumen.cantidad_turnos }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Vacunos</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            {{ data.resumen.cantidad_vacunos }}
                        </span>
                    </BaseCard>
                </div>

                <!-- 2. GRÁFICO DE EVOLUCIÓN (POR FECHA) -->
                <BaseCard class="p-4">
                    <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                        Evolución Diaria de Producción
                    </h3>
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
                            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">
                                Resumen por Turno
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
                                        <td class="p-2 text-right font-medium text-slate-600">
                                            {{ formatNumber(t.total_litros) }}
                                        </td>
                                        <td class="p-2 text-right font-medium text-red-500">
                                            {{ formatNumber(t.total_descartado) }}
                                        </td>
                                        <td class="p-2 pr-4 text-right font-bold text-emerald-600">
                                            {{ formatNumber(t.total_neto) }}
                                        </td>
                                    </tr>
                                    <tr v-if="!data.por_turno.length">
                                        <td colspan="4" class="p-4 text-center text-slate-400 italic">
                                            Sin datos en el rango.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </BaseCard>

                    <!-- Top Vacas -->
                    <BaseCard class="overflow-hidden flex flex-col">
                        <div class="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">
                                Top Vacunos (Mayor Producción)
                            </h3>
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
                                    <tr v-for="v in topVacas" :key="v.vacuno_id" class="hover:bg-slate-50">
                                        <td class="p-2 pl-4 font-mono font-bold text-sky-700">{{ v.arete }}</td>
                                        <td class="p-2 text-slate-600 truncate max-w-[100px]">{{ v.nombre || '—' }}</td>
                                        <td class="p-2 text-right font-bold text-slate-700">
                                            {{ formatNumber(v.total_litros) }}
                                        </td>
                                        <td class="p-2 pr-4 text-right font-medium text-slate-500">
                                            {{ formatNumber(v.promedio_diario) }}
                                        </td>
                                    </tr>
                                    <tr v-if="!topVacas.length">
                                        <td colspan="4" class="p-4 text-center text-slate-400 italic">
                                            Sin datos en el rango.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </BaseCard>
                </div>

                <!-- 4. TABLA DE DETALLE POR FECHA -->
                <BaseCard class="overflow-hidden flex flex-col">
                    <div class="bg-slate-100 p-3 border-b border-slate-200">
                        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider">
                            Detalle por Fecha, Sucursal y Turno
                        </h3>
                    </div>
                    <div class="overflow-auto max-h-[360px]">
                        <table class="w-full text-left text-[11px]">
                            <thead class="bg-slate-50 text-slate-500 uppercase font-bold sticky top-0 shadow-sm">
                                <tr>
                                    <th class="p-2 pl-4">Fecha</th>
                                    <th class="p-2">Sucursal</th>
                                    <th class="p-2">Turno</th>
                                    <th class="p-2 text-right">Litros Tot.</th>
                                    <th class="p-2 text-right">Descartado</th>
                                    <th class="p-2 text-right">Neto</th>
                                    <th class="p-2 pr-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="(f, idx) in data.por_fecha"
                                    :key="`${f.fecha}-${f.sucursal_id}-${f.turno_ordeno_id}-${idx}`"
                                    class="hover:bg-slate-50">
                                    <td class="p-2 pl-4 font-mono font-bold text-slate-700">{{ f.fecha }}</td>
                                    <td class="p-2 text-slate-600 truncate max-w-[140px]">{{ f.sucursal }}</td>
                                    <td class="p-2 font-semibold text-slate-700">{{ f.turno }}</td>
                                    <td class="p-2 text-right font-medium text-slate-600">
                                        {{ formatNumber(f.total_litros) }}
                                    </td>
                                    <td class="p-2 text-right font-medium text-red-500">
                                        {{ formatNumber(f.total_descartado) }}
                                    </td>
                                    <td class="p-2 text-right font-bold text-emerald-600">
                                        {{ formatNumber(f.total_neto) }}
                                    </td>
                                    <td class="p-2 pr-4 text-center">
                                        <CrudEstadoBadge :estado="f.estado_registro" :estado-id="f.estado_id" />
                                    </td>
                                </tr>
                                <tr v-if="!data.por_fecha.length">
                                    <td colspan="7" class="p-4 text-center text-slate-400 italic">
                                        Sin datos en el rango.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </BaseCard>
            </template>

            <!-- Sin datos cargados -->
            <div v-else class="flex flex-col items-center justify-center py-16 text-slate-400">
                <i class="pi pi-chart-bar text-5xl mb-3 opacity-40"></i>
                <p class="text-sm font-semibold">No hay datos para mostrar.</p>
                <p class="text-xs mt-1">Ajusta los filtros y vuelve a generar el reporte.</p>
            </div>
        </div>
    </CrudPageLayout>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { getTodayLocal, toLocalDateInput } from '~/utils/date';
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
    const empresaOptions = ref<any[]>([]);
    const sucursalOptions = ref<any[]>([]);
    const turnoOptions = ref<any[]>([]);
    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingTurnos = ref(false);

    // Filtros por defecto (mes actual)
    const fechaHoy = new Date();
    const primerDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);

    const filters = ref({
        empresa_id: authStore.user?.empresa_id || null,
        sucursal_id: authStore.user?.sucursal_id || null,
        desde: toLocalDateInput(primerDiaMes),
        hasta: getTodayLocal(),
        turno_ordeno_id: null,
    });

    // ============ COMPUTED ============
    const topVacas = computed(() => {
        const lista = data.value?.por_vaca ?? [];
        return lista.slice(0, 10);
    });

    const chartData = computed(() => {
        if (!data.value?.por_fecha) return { labels: [], datasets: [] };

        return {
            labels: data.value.por_fecha.map((f: any) => f.fecha),
            datasets: [
                {
                    label: 'Litros Producidos',
                    data: data.value.por_fecha.map((f: any) => f.total_litros),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#0284c7',
                },
            ],
        };
    });

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => ` ${formatNumber(context.parsed.y)} Litros`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 10, family: 'sans-serif' } },
            },
            x: {
                ticks: {
                    font: { size: 10, family: 'sans-serif' },
                    maxRotation: 45,
                    autoSkip: true,
                    maxTicksLimit: 30,
                },
            },
        },
    };

    // ============ HELPERS ============
    const formatNumber = (v: any, decimals = 2): string => {
        if (v == null || v === '') return '0.00';
        const n = Number(v);
        if (!Number.isFinite(n)) return '0.00';
        return n.toLocaleString('es-BO', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    // ============ CARGA DE CATÁLOGOS ============
    const cargarFiltros = async () => {
        loadingEmpresas.value = true;
        loadingSucursales.value = true;
        loadingTurnos.value = true;
        try {
            const [resEmp, resSuc, resTur] = await Promise.all([
                $api('/empresas', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
                $api('/sucursales', {
                    method: 'GET',
                    params: { limit: 1000, estado_id: ESTADO_ACTIVO },
                }),
                $api('/turnos-ordeno', {
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

            turnoOptions.value = (resTur.data || resTur || []).map((t: any) => ({
                label: t.turno,
                value: Number(t.turno_ordeno_id),
            }));
        } catch (err) {
            console.error('Error cargando filtros:', err);
            notify('error', 'Error', 'No se pudieron cargar los filtros auxiliares.');
        } finally {
            loadingEmpresas.value = false;
            loadingSucursales.value = false;
            loadingTurnos.value = false;
        }
    };

    // ============ CARGA DEL REPORTE ============
    const loadData = async () => {
        if (filters.value.desde && filters.value.hasta && filters.value.desde > filters.value.hasta) {
            return notify('warn', 'Rango inválido', 'La fecha "desde" no puede ser mayor que "hasta".');
        }

        if (!authStore.can('producciones_leche', 'leer')) {
            return notify('warn', 'Acceso denegado', 'No tiene permiso para ver este reporte.');
        }

        loading.value = true;
        try {
            const params: any = {
                empresa_id: filters.value.empresa_id || undefined,
                sucursal_id: filters.value.sucursal_id || undefined,
                desde: filters.value.desde || undefined,
                hasta: filters.value.hasta || undefined,
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

    // ============ EXPORTAR A PDF ============
    const exportToPdf = async () => {
        if (!data.value) return;
        loadingPdf.value = true;

        try {
            // 1. Traer configuración de la BD
            const config = await getJson<{
                titulo: string;
                orientacion: 'portrait' | 'landscape';
                tamano_pagina: string;
                bordes: boolean;
                mostrar_resumen: boolean;
                columnas: string[];
            }>('pdf_reporte_produccion');

            // 2. Default config robusto
            const defaultColumnas = ['Arete', 'Nombre', 'Raza', 'Categoría', 'Sucursal', 'Litros Totales', 'Promedio Diario', 'Días'];

            const defaultConfig = {
                titulo: 'REPORTE DE PRODUCCIÓN POR VACUNO',
                orientacion: 'landscape' as const,
                tamano_pagina: 'a4',
                bordes: true,
                mostrar_resumen: true,
                columnas: defaultColumnas,
            };

            let cfg = config || defaultConfig;
            if (!cfg.columnas || cfg.columnas.length !== defaultColumnas.length) {
                console.warn('Configuración de PDF inválida o desactualizada. Usando default.');
                cfg = defaultConfig;
            }

            // 3. Inicializar documento
            const doc = new jsPDF({
                orientation: cfg.orientacion,
                unit: 'mm',
                format: cfg.tamano_pagina,
            });

            // 4. Contexto
            const empresa = authStore.user?.empresa_nombre || 'SIN EMPRESA';
            const sucursal = authStore.user?.sucursal_nombre || 'SIN SUCURSAL';
            const usuario = authStore.user?.login || 'SISTEMA';
            const fechaImpresion = new Date().toLocaleString('es-BO', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });

            // 5. Armar la tabla
            const tableBody = data.value.por_vaca.map((row: any) => [
                row.arete ?? '—',
                row.nombre || '—',
                row.raza ?? '—',
                row.categoria ?? '—',
                row.sucursal ?? '—',
                formatNumber(row.total_litros),
                formatNumber(row.promedio_diario),
                row.dias_con_produccion ?? '—',
            ]);

            // 6. Renderizar con autoTable
            autoTable(doc, {
                head: [cfg.columnas],
                body: tableBody,
                startY: 35,
                theme: cfg.bordes ? 'grid' : 'plain',
                styles: { fontSize: 7, cellPadding: 1.5, halign: 'center' },
                headStyles: { fillColor: [23, 37, 84], textColor: 255, fontSize: 8 },
                columnStyles: {
                    0: { halign: 'center' }, // Arete
                    5: { halign: 'right' },  // Litros
                    6: { halign: 'right' },  // Promedio
                    7: { halign: 'right' },  // Días
                },
                didDrawPage: () => {
                    // ─── ENCABEZADO ───

                    // Título (Azul Oscuro)
                    doc.setTextColor(23, 37, 84);
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(cfg.titulo, 14, 15);

                    // Empresa (Azul brillante, más grande)
                    doc.setTextColor(37, 99, 235);
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Empresa: ${empresa}`, 14, 23);

                    // Resto (Gris oscuro)
                    doc.setTextColor(51, 65, 85);
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Sucursal: ${sucursal}`, 14, 28);
                    doc.text(`Rango: ${filters.value.desde || 'INICIO'} — ${filters.value.hasta || 'FIN'}`, 14, 32);

                    const pageWidth = doc.internal.pageSize.width;
                    doc.text(`Usuario: ${usuario}`, pageWidth - 14, 23, { align: 'right' });
                    doc.text(`Impreso: ${fechaImpresion}`, pageWidth - 14, 28, { align: 'right' });
                    doc.text(`Registros: ${data.value.por_vaca.length}`, pageWidth - 14, 32, { align: 'right' });

                    doc.setTextColor(0, 0, 0); // Reset
                },
            });

            // 7. Agregar Resumen
            if (cfg.mostrar_resumen) {
                const pageHeight = doc.internal.pageSize.height;
                const finalY = (doc as any).lastAutoTable.finalY + 6;
                const needsNewPage = finalY > pageHeight - 40;
                if (needsNewPage) doc.addPage();
                const y = needsNewPage ? 20 : finalY;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN GENERAL', 14, y);

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Total Litros: ${formatNumber(data.value.resumen.total_litros)} L`, 14, y + 5);
                doc.text(`Total Descartado: ${formatNumber(data.value.resumen.total_descartado)} L`, 14, y + 10);
                doc.text(`Total Neto: ${formatNumber(data.value.resumen.total_neto)} L`, 14, y + 15);
                doc.text(`Promedio Diario: ${formatNumber(data.value.resumen.promedio_diario)} L`, 14, y + 20);
                doc.text(`Días con Producción: ${data.value.resumen.dias_con_produccion}`, 14, y + 25);
                doc.text(`Vacunos: ${data.value.resumen.cantidad_vacunos}`, 14, y + 30);
            }

            // 8. Numeración de páginas
            const totalPages = (doc as any).internal.getNumberOfPages();
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Página ${i} de ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' },
                );
            }

            // 9. Guardar
            doc.save(`Reporte_Produccion_${getTodayLocal()}.pdf`);
        } catch (err) {
            console.error('Error al exportar PDF:', err);
            notify('error', 'Error PDF', 'No se pudo generar el documento PDF.');
        } finally {
            loadingPdf.value = false;
        }
    };

    // ============ INIT ============
    onMounted(async () => {
        await cargarFiltros();
        await loadData();
    });
</script>
