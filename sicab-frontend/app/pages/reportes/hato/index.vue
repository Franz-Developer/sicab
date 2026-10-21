<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\hato\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-box" title="Reporte de Hato" subtitle="Análisis general del inventario de vacunos"
        :show-action="false">

        <!-- ═══════════ FILTROS ═══════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" @update:model-value="loadData" class="w-full" />
                </div>
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Raza</label>
                    <BaseSelect v-model="filters.raza_id" :options="razaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        @update:model-value="loadData" class="w-full" />
                </div>
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Categoría</label>
                    <BaseSelect v-model="filters.categoria_vacuno_id" :options="categoriaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        @update:model-value="loadData" class="w-full" />
                </div>

                <!-- Botón PDF -->
                <div class="md:col-span-12 flex justify-end mt-2">
                    <BaseButton label="Exportar a PDF" icon="pi pi-file-pdf" variant="danger" size="sm"
                        :loading="loadingPdf" :disabled="!data || loading || data.detalle.length === 0"
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
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Vacunos</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">{{
                            formatNumber(data.resumen.total, 0) }}</span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-sky-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Valor Adquisición (Bs)</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">Bs. {{
                            formatNumber(data.resumen.valor_adquisicion_total) }}</span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500 col-span-2">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Valor Libro Actual
                            (Bs)</span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">Bs. {{
                            formatNumber(data.resumen.valor_libro_total) }}</span>
                    </BaseCard>
                </div>
            </template>
        </div>
    </CrudPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTodayLocal, formatFecha } from '~/utils/date';
import { ESTADO_ACTIVO } from '~/constants/estados.constant';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

useHead({ title: 'Reporte de Hato' });

const { $api } = useNuxtApp() as any;
const { notify } = useNotify();
const authStore = useAuthStore();
const { getJson } = useParametroGlobal();

// ============ ESTADO ============
const loading = ref(false);
const loadingPdf = ref(false);
const data = ref<any>(null);

// Catálogos
const sucursalOptions = ref<any[]>([]);
const loadingSucursales = ref(false);
const razaOptions = ref<any[]>([]);
const categoriaOptions = ref<any[]>([]);

// Filtros
const filters = ref({
    sucursal_id: authStore.user?.sucursal_id || null,
    raza_id: null,
    categoria_vacuno_id: null,
});

// ============ CARGA DE CATÁLOGOS ============
const cargarFiltros = async () => {
    loadingSucursales.value = true;
    try {
        // Cargar Sucursales
        const resSuc = await $api('/sucursales', { method: 'GET', params: { limit: 1000, estado_id: ESTADO_ACTIVO } });
        sucursalOptions.value = (resSuc.data || resSuc || []).map((s: any) => ({
            label: `${s.codigo ?? ''} — ${s.sucursal}`.trim(),
            value: Number(s.sucursal_id)
        }));

        // Cargar Razas
        const resRaza = await $api('/razas', { method: 'GET', params: { limit: 1000, estado_id: ESTADO_ACTIVO } });
        razaOptions.value = (resRaza.data || resRaza || []).map((r: any) => ({
            label: r.raza,
            value: Number(r.raza_id)
        }));

        // Cargar Categorías
        const resCat = await $api('/categorias-vacuno', { method: 'GET', params: { limit: 1000, estado_id: ESTADO_ACTIVO } });
        categoriaOptions.value = (resCat.data || resCat || []).map((c: any) => ({
            label: c.categoria,
            value: Number(c.categoria_vacuno_id)
        }));

    } catch (err) {
        console.error('Error cargando catálogos:', err);
        notify('error', 'Error', 'No se pudieron cargar los filtros.');
    } finally {
        loadingSucursales.value = false;
    }
};

// ============ CARGA DEL REPORTE ============
const loadData = async () => {
    loading.value = true;
    try {
        const params: any = {
            sucursal_id: filters.value.sucursal_id || undefined,
            raza_id: filters.value.raza_id || undefined,
            categoria_vacuno_id: filters.value.categoria_vacuno_id || undefined,
        };

        const res = await $api('/reportes/hato', { method: 'GET', params });
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
    if (!data.value || !data.value.detalle.length) return;
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
        }>('pdf_reporte_hato');

        // Default config en caso de fallo
        const defaultConfig = {
            titulo: 'REPORTE DE HATO DE VACUNOS',
            orientacion: 'landscape' as const,
            tamano_pagina: 'a4',
            bordes: true,
            mostrar_resumen: true,
            columnas: ["Arete", "Nombre", "Raza", "Categoría", "Sexo", "Edad (mes)", "Peso (kg)", "V. Adq.", "V. Libro", "Estado", "Sucursal", "F. Ingreso"],
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
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        const sucursalTexto = filters.value.sucursal_id
            ? sucursalOptions.value.find(s => s.value === filters.value.sucursal_id)?.label ?? 'TODAS'
            : 'TODAS';

        // 4. Armar la tabla de Detalle
        const tableBody = data.value.detalle.map((row: any) => [
            row.arete,
            row.nombre || '—',
            row.raza,
            row.categoria,
            row.sexo,
            row.edad_meses !== null ? row.edad_meses : '—',
            row.peso_actual !== null ? formatNumber(row.peso_actual) : '—',
            formatNumber(row.valor_adquisicion),
            formatNumber(row.valor_libro),
            row.estado_vacuno,
            row.sucursal,
            formatFecha(row.fecha_ingreso, true)
        ]);

        // 5. Renderizar con autoTable
        autoTable(doc, {
            head: [cfg.columnas],
            body: tableBody,
            startY: 32, // Margen superior
            theme: cfg.bordes ? 'grid' : 'plain',
            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                overflow: 'linebreak',
                halign: 'center', // Centrado por defecto
            },
            headStyles: {
                fillColor: [23, 37, 84],
                textColor: 255,
                fontSize: 8,
                halign: 'center',
            },
            // Alinear a la derecha las columnas de números (Peso, V. Adq, V. Libro)
            columnStyles: {
                5: { halign: 'center' }, // Edad
                6: { halign: 'right' },  // Peso
                7: { halign: 'right' },  // V. Adq
                8: { halign: 'right' },  // V. Libro
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
            const finalY = (doc as any).lastAutoTable.finalY + 5;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMEN GENERAL', 14, finalY);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');

            doc.text(`Total Vacunos: ${formatNumber(data.value.resumen.total, 0)}`, 14, finalY + 4);
            doc.text(`Valor Adquisición Total: Bs. ${formatNumber(data.value.resumen.valor_adquisicion_total)}`, 14, finalY + 8);
            doc.text(`Valor Libro Total: Bs. ${formatNumber(data.value.resumen.valor_libro_total)}`, 14, finalY + 12);
        }

        // 7. Guardar
        doc.save(`Reporte_Hato_${getTodayLocal()}.pdf`);

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
