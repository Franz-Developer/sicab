<!-- C:\sistemas\sicab\sicab-frontend\app\pages\reportes\amortizaciones\index.vue -->
<template>
    <CrudPageLayout icon="pi pi-chart-line" title="Reporte de Amortizaciones"
        subtitle="Análisis contable de depreciación de vacunos" :show-action="false">

        <!-- ═══════════ FILTROS ═══════════ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                <!-- Empresa -->
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Empresa</label>
                    <BaseSelect v-model="filters.empresa_id" :options="empresaOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear :loading="loadingEmpresas"
                        class="w-full" @update:model-value="onEmpresaChange" />
                </div>

                <!-- Sucursal -->
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Sucursal</label>
                    <BaseSelect v-model="filters.sucursal_id" :options="sucursalOptions" option-label="label"
                        option-value="value" placeholder="Todas" size="sm" filter show-clear
                        :loading="loadingSucursales" class="w-full" @update:model-value="loadData" />
                </div>

                <!-- Gestión -->
                <div class="md:col-span-4">
                    <label class="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Gestión</label>
                    <BaseSelect v-model="filters.gestion" :options="gestionOptions" option-label="label"
                        option-value="value" placeholder="Todas las gestiones" size="sm" filter show-clear
                        class="w-full" :loading="loadingGestiones" @update:model-value="loadData" />
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
            <!-- Loader Global -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <template v-else-if="data">
                <!-- ─── 1. KPIs FINANCIEROS (Bs) ─── -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-slate-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Valor Inicial
                            (Bs)</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            Bs. {{ formatNumber(data.resumen.total_valor_inicial) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-red-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Amortizado en Rango
                            (Bs)</span>
                        <span class="block text-lg font-black text-red-700 mt-1">
                            Bs. {{ formatNumber(data.resumen.total_amortizado_rango) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-amber-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Amort. Acumulada (Bs)</span>
                        <span class="block text-lg font-black text-slate-800 mt-1">
                            Bs. {{ formatNumber(data.resumen.total_amort_acumulada) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-emerald-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Total Valor Libro (Bs)</span>
                        <span class="block text-lg font-black text-emerald-700 mt-1">
                            Bs. {{ formatNumber(data.resumen.total_valor_libro) }}
                        </span>
                    </BaseCard>
                </div>

                <!-- ─── 2. KPIs UFV (moneda indexada) ─── -->
                <BaseCard class="p-3 bg-blue-50 border border-blue-100">
                    <h3 class="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                        Valores expresados en UFV (Unidad de Fomento de Vivienda)
                    </h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <span class="block text-[9px] font-bold text-blue-500 uppercase">Val. Inicial UFV</span>
                            <span class="block text-sm font-black text-blue-900 mt-0.5">
                                {{ formatNumber(data.resumen.total_valor_inicial_ufv, 4) }}
                            </span>
                        </div>
                        <div>
                            <span class="block text-[9px] font-bold text-blue-500 uppercase">Amort. Rango UFV</span>
                            <span class="block text-sm font-black text-blue-900 mt-0.5">
                                {{ formatNumber(data.resumen.total_amortizado_rango_ufv, 4) }}
                            </span>
                        </div>
                        <div>
                            <span class="block text-[9px] font-bold text-blue-500 uppercase">Acumulada UFV</span>
                            <span class="block text-sm font-black text-blue-900 mt-0.5">
                                {{ formatNumber(data.resumen.total_amort_acumulada_ufv, 4) }}
                            </span>
                        </div>
                        <div>
                            <span class="block text-[9px] font-bold text-blue-500 uppercase">Valor Libro UFV</span>
                            <span class="block text-sm font-black text-blue-900 mt-0.5">
                                {{ formatNumber(data.resumen.total_valor_libro_ufv, 4) }}
                            </span>
                        </div>
                    </div>
                </BaseCard>

                <!-- ─── 3. CONTADORES OPERATIVOS ─── -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <BaseCard class="p-3 border-l-4 border-l-violet-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Registros</span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.cantidad_registros, 0) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-teal-500">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Vacunos únicos</span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            {{ formatNumber(data.resumen.cantidad_vacunos, 0) }}
                        </span>
                    </BaseCard>
                    <BaseCard class="p-3 border-l-4 border-l-sky-500 col-span-2">
                        <span class="block text-[10px] font-bold text-slate-500 uppercase">Ratio Amort./Valor
                            Inicial</span>
                        <span class="block text-base font-black text-slate-800 mt-1">
                            {{ ratioAmortizacion }}
                        </span>
                    </BaseCard>
                </div>

                <!-- ─── 4. TABLA DE DETALLE ─── -->
                <BaseCard class="overflow-hidden">
                    <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h3 class="text-xs font-black text-[var(--primary-dark)] uppercase tracking-wider">
                            Detalle de Amortizaciones ({{ formatNumber(data.detalle.length, 0) }} registros)
                        </h3>
                    </div>

                    <BaseTable :value="data.detalle" :loading="false" :paginator="true" :rows="15"
                        :total-records="data.detalle.length" :first="lazyFirst" row-key="amortizacion_vacuno_id"
                        :columns="columns" :rows-per-page-options="[10, 15, 25, 50]" @page="onPage">
                        <template #body-arete="{ data: row }">
                            <span class="font-bold text-sky-700">{{ row.arete }}</span>
                        </template>
                        <template #body-nombre="{ data: row }">
                            <span class="text-slate-800">{{ row.nombre || '—' }}</span>
                        </template>
                        <template #body-gestion="{ data: row }">
                            <span class="font-semibold text-slate-800">{{ row.gestion }}</span>
                        </template>
                        <template #body-valor_inicial="{ data: row }">
                            <span class="text-right block text-slate-700">
                                {{ formatNumber(row.valor_inicial) }}
                            </span>
                        </template>
                        <template #body-amortizacion_periodo="{ data: row }">
                            <span class="text-right block font-semibold text-red-600">
                                {{ formatNumber(row.amortizacion_periodo) }}
                            </span>
                        </template>
                        <template #body-amortizacion_acumulada="{ data: row }">
                            <span class="text-right block text-amber-700">
                                {{ formatNumber(row.amortizacion_acumulada) }}
                            </span>
                        </template>
                        <template #body-valor_libro="{ data: row }">
                            <span class="text-right block font-bold text-emerald-700">
                                {{ formatNumber(row.valor_libro) }}
                            </span>
                        </template>
                        <template #body-estado_registro="{ data: row }">
                            <CrudEstadoBadge :estado="row.estado_registro" :estado-id="row.estado_id" />
                        </template>

                        <template #empty>
                            <p class="text-xs font-semibold text-slate-500">
                                No hay amortizaciones para los filtros seleccionados.
                            </p>
                        </template>
                    </BaseTable>
                </BaseCard>
            </template>

            <!-- Estado vacío -->
            <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
                <i class="pi pi-chart-line text-4xl text-slate-300 mb-3"></i>
                <p class="text-xs font-semibold text-slate-500">
                    No hay datos en el rango seleccionado.
                </p>
            </div>
        </div>
    </CrudPageLayout>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';
    import { getTodayLocal } from '~/utils/date';
    import { ESTADO_ACTIVO, ESTADO_METADATA, ESTADOS_CONSULTA } from '~/constants/estados.constant';

    useHead({ title: 'Reporte de Amortizaciones' });

    interface AmortizacionesResumen {
        total_valor_inicial: number;
        total_amortizado_rango: number;
        total_amort_acumulada: number;
        total_valor_libro: number;
        total_valor_inicial_ufv: number;
        total_amortizado_rango_ufv: number;
        total_amort_acumulada_ufv: number;
        total_valor_libro_ufv: number;
        cantidad_vacunos: number;
        cantidad_registros: number;
    }

    interface AmortizacionDetalle {
        amortizacion_vacuno_id: number;
        vacuno_id: number;
        arete: string;
        nombre: string | null;
        periodo: string;
        gestion: number;
        empresa_id: number;
        empresa: string;
        sucursal_id: number;
        sucursal: string;
        raza: string;
        categoria: string;
        valor_inicial: number;
        amortizacion_periodo: number;
        amortizacion_acumulada: number;
        valor_libro: number;
        valor_inicial_ufv: number | null;
        amortizacion_periodo_ufv: number | null;
        amortizacion_acumulada_ufv: number | null;
        valor_libro_ufv: number | null;
        cotizacion_ufv_aplicada: number | null;
        fecha_cotizacion_ufv: string | null;
        vida_util_anios: number | null;
        tasa_amortizacion: number | null;
        estado_id: number;
        estado_registro: string;
        usuario_operacion: string | null;
        fecha_registro: string;
        fecha_actualizacion: string | null;
    }

    interface AmortizacionesResponse {
        resumen: AmortizacionesResumen;
        detalle: AmortizacionDetalle[];
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
    const data = ref<AmortizacionesResponse | null>(null);

    const empresaOptions = ref<{ label: string; value: number }[]>([]);
    const sucursalOptions = ref<{ label: string; value: number }[]>([]);
    const gestionOptions = ref<{ label: string; value: number }[]>([]);

    const loadingEmpresas = ref(false);
    const loadingSucursales = ref(false);
    const loadingGestiones = ref(false);
    const lazyFirst = ref(0);

    let loadSeq = 0;

    // Estados válidos para este reporte: solo ESTADOS_CONSULTA (ACTIVO, HISTORICO, ANULADO)
    const estadoOptions = ESTADOS_CONSULTA.map((id) => {
        const meta = ESTADO_METADATA[id];
        return {
            label: meta?.label ?? meta?.abreviatura ?? `Estado ${id}`,
            value: id,
        };
    });

    // Filtros
    const filters = ref<{
        empresa_id: number | null;
        sucursal_id: number | null;
        gestion: number | null;
        estado_id: number | null;
    }>({
        empresa_id: authStore.user?.empresa_id ?? null,
        sucursal_id: null,
        gestion: null,
        estado_id: null,
    });

    // ══════════════════════════════════════════════════════════
    // COLUMNAS DE LA TABLA
    // ══════════════════════════════════════════════════════════
    const columns = [
        { field: 'arete', header: 'Arete', sortable: true, template: 'body-arete' },
        { field: 'nombre', header: 'Nombre', template: 'body-nombre' },
        { field: 'raza', header: 'Raza' },
        { field: 'categoria', header: 'Categoría' },
        { field: 'gestion', header: 'Gestión', template: 'body-gestion' },
        { field: 'valor_inicial', header: 'V. Inicial (Bs)', template: 'body-valor_inicial' },
        { field: 'amortizacion_periodo', header: 'Amort. (Bs)', template: 'body-amortizacion_periodo' },
        { field: 'amortizacion_acumulada', header: 'Acum. (Bs)', template: 'body-amortizacion_acumulada' },
        { field: 'valor_libro', header: 'V. Libro (Bs)', template: 'body-valor_libro' },
        { field: 'estado_registro', header: 'Estado', template: 'body-estado_registro' },
    ];

    // ══════════════════════════════════════════════════════════
    // COMPUTED
    // ══════════════════════════════════════════════════════════
    const ratioAmortizacion = computed<string>(() => {
        const r = data.value?.resumen;
        if (!r || r.total_valor_inicial <= 0) return '—';
        const pct = (r.total_amortizado_rango / r.total_valor_inicial) * 100;
        return `${pct.toFixed(2)} %`;
    });

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

    const onPage = (event: any) => {
        lazyFirst.value = event.first;
    };

    // ══════════════════════════════════════════════════════════
    // CARGA DE CATÁLOGOS Y GESTIONES
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

    const cargarGestiones = async () => {
        loadingGestiones.value = true;
        try {
            const res = await $api('/amortizaciones-vacunos/gestiones-amortizadas', {
                method: 'GET',
                params: { empresa_id: filters.value.empresa_id || undefined }
            });

            const anios = res?.anios || [];
            gestionOptions.value = anios.map((anio: number) => ({
                label: String(anio),
                value: anio
            }));

            // Si la gestión seleccionada ya no existe en la nueva lista, la limpiamos
            if (filters.value.gestion && !anios.includes(filters.value.gestion)) {
                filters.value.gestion = null;
            }

        } catch (err) {
            console.error('Error cargando gestiones:', err);
            // Fallback
            const anioActual = new Date().getFullYear();
            gestionOptions.value = [anioActual, anioActual - 1, anioActual - 2].map(a => ({ label: String(a), value: a }));
        } finally {
            loadingGestiones.value = false;
        }
    };

    const onEmpresaChange = () => {
        cargarGestiones();
        loadData();
    };

    // ══════════════════════════════════════════════════════════
    // CARGA DEL REPORTE
    // ══════════════════════════════════════════════════════════
    const loadData = async () => {
        const seq = ++loadSeq;
        loading.value = true;
        try {
            // Nota: El DTO ahora solo recibe "gestion", no "gestion_desde/hasta"
            const params: Record<string, any> = {
                empresa_id: filters.value.empresa_id || undefined,
                sucursal_id: filters.value.sucursal_id || undefined,
                gestion: filters.value.gestion || undefined,
                estado_id: filters.value.estado_id || undefined,
            };

            const res = await $api('/reportes/amortizaciones', { method: 'GET', params });

            if (seq !== loadSeq) return; // respuesta obsoleta

            // Normalizar para que el template nunca reciba nulls
            data.value = {
                resumen: res?.resumen ?? {
                    total_valor_inicial: 0,
                    total_amortizado_rango: 0,
                    total_amort_acumulada: 0,
                    total_valor_libro: 0,
                    total_valor_inicial_ufv: 0,
                    total_amortizado_rango_ufv: 0,
                    total_amort_acumulada_ufv: 0,
                    total_valor_libro_ufv: 0,
                    cantidad_vacunos: 0,
                    cantidad_registros: 0,
                },
                detalle: Array.isArray(res?.detalle) ? res.detalle : [],
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
            const config = await getJson<PdfConfig>('pdf_reporte_amortizaciones');

            const defaultConfig: PdfConfig = {
                titulo: 'REPORTE DE AMORTIZACIONES',
                orientacion: 'portrait',
                tamano_pagina: 'a4',
                bordes: true,
                mostrar_resumen: true,
                columnas: [
                    'Arete', 'Nombre', 'Raza', 'Categoría', 'Gestión',
                    'V. Inicial (Bs)', 'Amort. (Bs)', 'Acum. (Bs)',
                    'V. Libro (Bs)', 'Estado',
                ],
            };
            const cfg = config ?? defaultConfig;

            const doc = new jsPDF({
                orientation: cfg.orientacion,
                unit: 'mm',
                format: cfg.tamano_pagina,
            });

            const empresa = authStore.user?.empresa_nombre || 'SIN EMPRESA';
            const usuario = authStore.user?.login || 'SISTEMA';
            const fechaImpresion = new Date().toLocaleString('es-BO', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
            });

            const sucursalTexto = filters.value.sucursal_id
                ? sucursalOptions.value.find((s) => s.value === filters.value.sucursal_id)?.label ?? 'TODAS'
                : 'TODAS';

            const estadoTexto = filters.value.estado_id
                ? estadoOptions.find((e) => e.value === filters.value.estado_id)?.label ?? 'TODOS'
                : 'TODOS (ACTIVO + HISTÓRICO + ANULADO)';

            const gestionTexto = filters.value.gestion ? String(filters.value.gestion) : 'TODAS';

            const tableBody = detalle.map((row) => [
                row.arete ?? '—',
                row.nombre || '—',
                row.raza ?? '—',
                row.categoria ?? '—',
                String(row.gestion),
                formatNumber(row.valor_inicial),
                formatNumber(row.amortizacion_periodo),
                formatNumber(row.amortizacion_acumulada),
                formatNumber(row.valor_libro),
                row.estado_registro ?? '—',
            ]);

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
                    4: { halign: 'center' }, // Gestión
                    5: { halign: 'right' },  // V. Inicial
                    6: { halign: 'right' },  // Amort. período
                    7: { halign: 'right' },  // Acumulada
                    8: { halign: 'right' },  // V. Libro
                },
                didDrawPage: () => {
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
                    doc.text(`Gestión: ${gestionTexto}`, 14, 32);
                    doc.text(`Estado: ${estadoTexto}`, 14, 36);

                    const pageWidth = doc.internal.pageSize.width;
                    doc.text(`Usuario: ${usuario}`, pageWidth - 14, 23, { align: 'right' });
                    doc.text(`Impreso: ${fechaImpresion}`, pageWidth - 14, 28, { align: 'right' });
                    doc.text(`Registros: ${detalle.length}`, pageWidth - 14, 32, { align: 'right' });

                    doc.setTextColor(0, 0, 0);
                },
            });

            const resumen = data.value?.resumen;
            if (cfg.mostrar_resumen && resumen) {
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const finalY = (doc as any).lastAutoTable.finalY + 6;
                const needsNewPage = finalY > pageHeight - 45;
                if (needsNewPage) doc.addPage();
                const y = needsNewPage ? 20 : finalY;

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN GENERAL', 14, y);

                doc.setFontSize(7.5);
                doc.setFont('helvetica', 'normal');

                const left = [
                    `Registros: ${formatNumber(resumen.cantidad_registros, 0)}  |  Vacunos únicos: ${formatNumber(resumen.cantidad_vacunos, 0)}`,
                    `Total Valor Inicial: Bs. ${formatNumber(resumen.total_valor_inicial)}`,
                    `Amortizado en Rango: Bs. ${formatNumber(resumen.total_amortizado_rango)}`,
                ];
                const right = [
                    `Amortización Acumulada: Bs. ${formatNumber(resumen.total_amort_acumulada)}`,
                    `Total Valor Libro: Bs. ${formatNumber(resumen.total_valor_libro)}`,
                    `Valor Libro UFV: ${formatNumber(resumen.total_valor_libro_ufv, 4)}`,
                ];

                left.forEach((line, i) => doc.text(line, 14, y + 5 + i * 4));
                right.forEach((line, i) =>
                    doc.text(line, pageWidth - 14, y + 5 + i * 4, { align: 'right' }),
                );
            }

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

            doc.save(`Reporte_Amortizaciones_${getTodayLocal()}.pdf`);
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

        await cargarFiltros();
        await cargarGestiones();
        await loadData();
    });
</script>