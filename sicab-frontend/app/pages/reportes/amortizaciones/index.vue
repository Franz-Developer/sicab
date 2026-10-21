<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\amortizaciones\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-line" title="Reporte de Amortizaciones"
        subtitle="Análisis contable de depreciación de vacunos" :show-action="false">

        <!-- ═══════════ FILTROS ═══════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Periodo Desde</label>
                    <BaseInput v-model="filters.desde" type="date" size="sm" @update:model-value="loadData" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Periodo Hasta</label>
                    <BaseInput v-model="filters.hasta" type="date" size="sm" @update:model-value="loadData" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" @update:model-value="loadData" class="w-full" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Estado</label>
                    <BaseSelect v-model="filters.estado_id" :options="estadoOptions" option-label="label"
                        option-value="value" placeholder="Todos" size="sm" show-clear @update:model-value="loadData"
                        class="w-full" />
                </div>

                <!-- Botón PDF -->
                <div class="md:col-span-12 flex justify-end mt-2">
                    <BaseButton label="Exportar a PDF" icon="pi pi-file-pdf" variant="danger" size="sm"
                        :loading="loadingPdf" :disabled="!data || loading || (data.detalle?.length ?? 0) === 0"
                        @click="exportToPdf" />
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
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-slate-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Valor Inicial
                            (Bs)</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            Bs. {{ formatNumber(data.resumen?.total_valor_inicial) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-red-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Amortizado en Rango
                            (Bs)</span>
                        <span class="block text-lg font-black text-red-700 mt-1">
                            Bs. {{ formatNumber(data.resumen?.total_amortizado_rango) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-amber-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Amort. Acumulada (Bs)</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            Bs. {{ formatNumber(data.resumen?.total_amort_acumulada) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Valor Libro (Bs)</span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">
                            Bs. {{ formatNumber(data.resumen?.total_valor_libro) }}
                        </span>
                    </BaseCard>

                    <!-- Valores UFV -->
                    <BaseCard class="p-3 col-span-2 md:col-span-4 bg-blue-50 border border-blue-100">
                        <div class="flex flex-wrap gap-6 justify-between items-center text-[10px]">
                            <div>
                                <span class="block font-bold text-blue-500 uppercase">Val. Inicial UFV</span>
                                <span class="block font-black text-blue-800 mt-1">
                                    {{ formatNumber(data.resumen?.total_valor_inicial_ufv, 4) }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-bold text-blue-500 uppercase">Amort. Rango UFV</span>
                                <span class="block font-black text-blue-800 mt-1">
                                    {{ formatNumber(data.resumen?.total_amortizado_rango_ufv, 4) }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-bold text-blue-500 uppercase">Acumulada UFV</span>
                                <span class="block font-black text-blue-800 mt-1">
                                    {{ formatNumber(data.resumen?.total_amort_acumulada_ufv, 4) }}
                                </span>
                            </div>
                            <div>
                                <span class="block font-bold text-blue-500 uppercase">Valor Libro UFV</span>
                                <span class="block font-black text-blue-800 mt-1">
                                    {{ formatNumber(data.resumen?.total_valor_libro_ufv, 4) }}
                                </span>
                            </div>
                        </div>
                    </BaseCard>
                </div>
            </template>

            <!-- Estado vacío (sin data) -->
            <div v-else class="text-center py-12 text-xs font-semibold text-slate-400">
                No hay datos en el rango seleccionado.
            </div>
        </div>
    </CrudPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTodayLocal, toLocalDateInput, formatFecha } from '~/utils/date';
import { ESTADO_ACTIVO, ESTADO_METADATA } from '~/constants/estados.constant';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

useHead({ title: 'Reporte de Amortizaciones' });

const { $api } = useNuxtApp() as any;
const { notify } = useNotify();
const authStore = useAuthStore();
const { getJson } = useParametroGlobal();

// ============ ESTADO ============
const loading = ref(false);
const loadingPdf = ref(false);
const data = ref<any>(null);
const sucursalOptions = ref<any[]>([]);
const loadingSucursales = ref(false);

let loadSeq = 0;

const estadoOptions = Object.values(ESTADO_METADATA)
    .filter((meta) => meta && typeof meta.id === 'number')
    .map((meta) => ({ label: meta.label, value: meta.id }));

const filters = ref({
    desde: '',
    hasta: '',
    sucursal_id: null as number | null,
    estado_id: null as number | null,
});

// ============ CARGA DE CATÁLOGOS ============
const cargarFiltros = async () => {
    loadingSucursales.value = true;
    try {
        const resSuc = await $api('/sucursales', {
            method: 'GET',
            params: { limit: 1000, estado_id: ESTADO_ACTIVO },
        });
        sucursalOptions.value = (resSuc.data || resSuc || []).map((s: any) => ({
            label: `${s.codigo ?? ''} — ${s.sucursal}`.trim(),
            value: Number(s.sucursal_id),
        }));
    } catch (err) {
        console.error('Error cargando sucursales:', err);
        notify('error', 'Error', 'No se pudieron cargar las sucursales.');
    } finally {
        loadingSucursales.value = false;
    }
};

// ============ CARGA DEL REPORTE ============
const loadData = async () => {
    if (filters.value.desde && filters.value.hasta && filters.value.desde > filters.value.hasta) {
        return notify('warn', 'Rango inválido', 'La fecha "desde" no puede ser mayor que "hasta".');
    }

    const seq = ++loadSeq;
    loading.value = true;
    try {
        const params: any = {
            desde: filters.value.desde || undefined,
            hasta: filters.value.hasta || undefined,
            sucursal_id: filters.value.sucursal_id || undefined,
            estado_id: filters.value.estado_id || undefined,
        };

        const res = await $api('/reportes/amortizaciones', { method: 'GET', params });

        if (seq !== loadSeq) return; // respuesta obsoleta

        // Normalizar para que el template nunca reciba nulls
        data.value = {
            resumen: res?.resumen ?? {},
            detalle: Array.isArray(res?.detalle) ? res.detalle : [],
        };
    } catch (err: any) {
        if (seq !== loadSeq) return;
        const msg = err?.data?.message || 'No se pudo generar el reporte.';
        notify('error', 'Error al cargar', Array.isArray(msg) ? msg.join(', ') : msg);
        data.value = null;
    } finally {
        if (seq === loadSeq) loading.value = false;
    }
};

// ============ EXPORTAR A PDF ============
const exportToPdf = async () => {
    const detalle = data.value?.detalle;
    if (!Array.isArray(detalle) || detalle.length === 0) {
        notify('warn', 'Sin datos', 'No hay datos para exportar en el rango seleccionado.');
        return;
    }

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
        }>('pdf_reporte_amortizaciones');

        const defaultConfig = {
            titulo: 'REPORTE DE AMORTIZACIONES',
            orientacion: 'portrait' as const,
            tamano_pagina: 'a4',
            bordes: true,
            mostrar_resumen: true,
            columnas: [
                'Arete',
                'Nombre',
                'Periodo',
                'V. Inicial (Bs)',
                'Amort. (Bs)',
                'Acum. (Bs)',
                'V. Libro (Bs)',
                'V. Libro (UFV)',
                'Cotización UFV',
            ],
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

        // 4. Armar la tabla de Detalle
        const tableBody = detalle.map((row: any) => [
            row.arete ?? '—',
            row.nombre || '—',
            formatFecha(row.periodo, true),
            formatNumber(row.valor_inicial),
            formatNumber(row.amortizacion_periodo),
            formatNumber(row.amortizacion_acumulada),
            formatNumber(row.valor_libro),
            formatNumber(row.valor_libro_ufv, 4),
            formatNumber(row.cotizacion_ufv_aplicada, 6),
        ]);

        // 5. Renderizar con autoTable
        autoTable(doc, {
            head: [cfg.columnas],
            body: tableBody,
            startY: 42,
            theme: cfg.bordes ? 'grid' : 'plain',
            styles: {
                fontSize: 6,
                cellPadding: 1,
                overflow: 'linebreak',
                halign: 'center',
            },
            headStyles: {
                fillColor: [23, 37, 84],
                textColor: 255,
                fontSize: 7,
                halign: 'center',
            },
            didDrawPage: (_dataTable) => {
                // ─── ENCABEZADO ───
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(cfg.titulo, 14, 15);

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`Empresa: ${empresa}`, 14, 22);
                doc.text(`Sucursal: ${sucursalTexto}`, 14, 26);
                doc.text(`Rango: ${rangoFechas}`, 14, 30);

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
                    { align: 'center' },
                );
            },
        });

        // 6. Agregar el resumen al final del PDF
        const resumen = data.value?.resumen;
        if (cfg.mostrar_resumen && resumen) {
            const finalY = (doc as any).lastAutoTable.finalY + 5;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN GENERAL', 14, finalY);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Valor Inicial: Bs. ${formatNumber(resumen.total_valor_inicial)}`, 14, finalY + 4);
            doc.text(`Total Amortizado Rango: Bs. ${formatNumber(resumen.total_amortizado_rango)}`, 14, finalY + 8);
            doc.text(`Total Valor Libro: Bs. ${formatNumber(resumen.total_valor_libro)}`, 14, finalY + 12);
        }

        // 7. Guardar
        doc.save(`Reporte_Amortizaciones_${getTodayLocal()}.pdf`);
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
    return n.toLocaleString('es-BO', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

// ============ INIT ============
onMounted(async () => {
    // 🔧 Esperar hidratación del authStore (máx 2s)
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

    // Sincronizar sucursal del usuario (si está disponible)
    if (authStore.user?.sucursal_id) {
        filters.value.sucursal_id = Number(authStore.user.sucursal_id);
    }

    // Fechas por defecto: primer día del mes → hoy
    const fechaHoy = new Date();
    const primerDiaMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), 1);
    filters.value.desde = toLocalDateInput(primerDiaMes);
    filters.value.hasta = getTodayLocal();

    await cargarFiltros();
    await loadData();
});
</script>
