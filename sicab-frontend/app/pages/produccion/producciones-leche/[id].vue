<!-- C:\sistemas\sicab\sicab-frontend\app\pages\produccion\producciones-leche\[id].vue -->
<template>
    <div class="max-w-6xl mx-auto space-y-3 pb-6">
        <!-- Header Fijo con Botones -->
        <div
            class="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-10">
            <div class="flex items-center gap-2">
                <div class="bg-sky-600 p-1.5 rounded-lg shadow">
                    <i class="pi pi-pencil text-white text-base"></i>
                </div>
                <div>
                    <h1 class="text-base font-black text-sky-900 uppercase leading-none">Editar Producción</h1>
                    <p class="text-[10px] text-sky-700 mt-0.5">Modificar registro de ordeño</p>
                </div>
            </div>
            <div class="flex gap-2">
                <BaseButton label="Cancelar" icon="pi pi-times" variant="danger" size="sm" @click="volverALista" />
                <BaseButton label="Guardar Cambios" icon="pi pi-save" variant="primary" size="sm" :loading="saving"
                    @click="saveProduccion" />
            </div>
        </div>

        <!-- Formulario Todo en Uno (12 columnas) -->
        <div class="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <!-- Fila 1: Empresa, Sucursal, Fecha, Turno, Total Descartado -->
                <div class="md:col-span-3">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Empresa *</label>
                    <BaseSelect v-model="empresaId" :options="empresasOptions" option-label="label" option-value="value"
                        size="sm" filter disabled class="opacity-70 cursor-not-allowed" />
                </div>
                <div class="md:col-span-3">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Sucursal *</label>
                    <BaseSelect v-model="sucursalId" :options="sucursalesFiltradas" option-label="label"
                        option-value="value" size="sm" filter disabled class="opacity-70 cursor-not-allowed" />
                </div>
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Fecha *</label>
                    <BaseInput v-model="fechaProduccion" type="date" size="sm" disabled
                        class="opacity-70 cursor-not-allowed" />
                </div>
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Turno *</label>
                    <BaseSelect v-model="turnoId" :options="turnosOptions" option-label="label" option-value="value"
                        size="sm" filter disabled class="opacity-70 cursor-not-allowed" />
                </div>
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Total Descartado
                        (L)</label>
                    <BaseInput v-model="totalDescartado" type="number" step="0.01" min="0" size="sm" />
                </div>

                <!-- Fila 2: Observaciones -->
                <div class="md:col-span-12">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Observaciones</label>
                    <input v-model="observaciones" type="text" maxlength="1000"
                        class="w-full bg-white border border-slate-300 rounded text-[11px] h-[32px] px-2 focus:outline-none focus:ring-1 focus:ring-blue-100"
                        placeholder="Notas adicionales..." />
                </div>
            </div>
        </div>

        <!-- Grilla de Vacunos -->
        <div class="bg-slate-50 rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div
                class="flex justify-between items-center p-2 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
                <span class="text-[11px] font-black text-sky-900 uppercase tracking-wider">Detalle de Vacas
                    Lecheras</span>
                <div class="flex gap-2 items-center">
                    <span class="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Total Litros: {{
                        formatNumber(totalLitros) }} L</span>
                </div>
            </div>

            <div v-if="loadingVacunos" class="text-center py-6 text-slate-500 text-[11px] bg-white">
                <i class="pi pi-spin pi-spinner mr-1"></i> Cargando datos...
            </div>
            <div v-else-if="vacunos.length === 0" class="text-center py-6 text-slate-400 text-[11px] bg-white">
                No hay vacas lecheras activas registradas.
            </div>

            <div v-else class="max-h-[45vh] overflow-y-auto overflow-x-hidden p-2">
                <table class="w-full text-[11px] border-collapse relative bg-white rounded-lg shadow-sm">
                    <thead class="sticky top-0 bg-sky-50 text-sky-900 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <tr>
                            <th
                                class="text-center px-2 py-1.5 font-bold uppercase text-[9px] w-32 border-b border-slate-200">
                                Arete</th>
                            <th
                                class="text-center px-2 py-1.5 font-bold uppercase text-[9px] border-b border-slate-200">
                                Nombre</th>
                            <th
                                class="text-center px-2 py-1.5 font-bold uppercase text-[9px] w-40 border-b border-slate-200">
                                Litros Producidos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(v, idx) in vacunos" :key="v.vacuno_id ?? idx"
                            class="border-b border-slate-100 hover:bg-sky-50/50 transition-colors last:border-b-0">
                            <td class="px-2 py-1.5 font-bold text-center text-slate-700">{{ v.arete }}</td>
                            <td class="px-2 py-1.5 text-center text-slate-600">{{ v.nombre }}</td>
                            <td class="px-2 py-1.5 flex justify-center">
                                <!-- Si el vacuno ya estaba registrado, se puede editar. Si es nuevo, también. -->
                                <BaseInput v-model="v.litros" type="number" step="0.01" min="0" size="sm"
                                    class="!h-[26px] !text-[11px] !py-0 w-24" placeholder="0.00" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SexoBiologico, CondicionProductorLeche, EstadoVacuno, ESTADO_ACTIVO, ESTADOS_VACUNO_FINALES } from '~/constants/estados.constant';

useHead({ title: 'Editar Producción de Leche' });

const router = useRouter();
const route = useRoute();
const { $api } = useNuxtApp() as any;
const { notify } = useNotify();

const produccionId = Number(route.params.id);

const empresaId = ref<number | null>(null);
const sucursalId = ref<number | null>(null);
const turnoId = ref<number | null>(null);
const fechaProduccion = ref('');
const totalDescartado = ref<number | string>(0);
const observaciones = ref('');
const saving = ref(false);
const loadingData = ref(true);

const empresasOptions = ref<any[]>([]);
const todasSucursales = ref<any[]>([]);
const turnosOptions = ref<any[]>([]);
const vacunos = ref<any[]>([]);
const loadingVacunos = ref(false);
const detallesOriginales = ref<any[]>([]);

const sucursalesFiltradas = computed(() => {
    if (!empresaId.value) return [];
    return todasSucursales.value.filter(s => s.empresa_id === empresaId.value);
});

const totalLitros = computed(() => vacunos.value.reduce((sum, v) => sum + (Number(v.litros) || 0), 0));
const formatNumber = (v: any) => Number(v || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 });

onMounted(async () => {
    // 1. Cargar catálogos y el registro en paralelo
    try {
        const [resEmp, resSuc, resTur, resProd] = await Promise.all([
            $api('/empresas', { params: { limit: 500, estado_id: ESTADO_ACTIVO } }),
            $api('/sucursales', { params: { limit: 500, estado_id: ESTADO_ACTIVO } }),
            $api('/turnos-ordeno', { params: { limit: 500, estado_id: ESTADO_ACTIVO } }),
            $api(`/producciones-leche/${produccionId}`, { method: 'GET' })
        ]);

        empresasOptions.value = (resEmp.data || []).map((e: any) => ({ label: e.empresa, value: e.empresa_id }));
        todasSucursales.value = (resSuc.data || []).map((s: any) => ({ label: s.sucursal, value: s.sucursal_id, empresa_id: s.empresa_id }));
        turnosOptions.value = (resTur.data || []).map((t: any) => ({ label: t.turno, value: t.turno_ordeno_id }));

        // 2. Asignar datos básicos
        empresaId.value = resProd.empresa_id;
        fechaProduccion.value = resProd.fecha_produccion;
        totalDescartado.value = resProd.total_descartado;
        observaciones.value = resProd.observaciones || '';
        turnoId.value = resProd.turno_ordeno_id;

        // 3. Extraer detalles (Probando diferentes nombres que puede devolver el backend)
        let detallesRaw = resProd.detalles || resProd.detalles_produccion || resProd.produccion_leche_detalle || [];

        if (detallesRaw.length === 0) {
            try {
                const resDet: any = await $api(`/producciones-leche/${produccionId}/detalles`, { method: 'GET' });
                detallesRaw = resDet.data || resDet || [];
            } catch (e) {
                console.warn('Endpoint secundario de detalles no disponible');
            }
        }
        detallesOriginales.value = detallesRaw;

        // 4. Cargar vacunos de la sucursal
        await cargarVacunos(resProd.sucursal_id, detallesRaw);

        // 🆕 5. TRUCO DE RENDERIZADO: Asignar la sucursal al final
        await nextTick();
        setTimeout(() => {
            sucursalId.value = resProd.sucursal_id;
        }, 100);

    } catch (e: any) {
        console.error(e);
        notify('error', 'Error', 'No se pudo cargar la producción.');
        router.push('/produccion/producciones-leche');
    } finally {
        loadingData.value = false;
    }
});

const cargarVacunos = async (idSucursal: number, detallesGuardados: any[] = []) => {
    if (!idSucursal) return;

    loadingVacunos.value = true;
    try {
        const res = await $api('/vacunos', {
            params: {
                limit: 1000,
                estado_id: ESTADO_ACTIVO,
                sexo_biologico_id: SexoBiologico.HEMBRA,
                es_productor_leche: CondicionProductorLeche.PRODUCTOR,
                sucursal_id: idSucursal
            }
        });

        const vacasValidas = (res.data || []).filter((v: any) =>
            Number(v.estado_vacuno_id) === EstadoVacuno.ACTIVO &&
            !ESTADOS_VACUNO_FINALES.includes(Number(v.estado_vacuno_id))
        );

        vacunos.value = vacasValidas.map((v: any) => {
            const detalleGuardado = detallesGuardados.find(d => Number(d.vacuno_id) === Number(v.vacuno_id));
            return {
                ...v,
                litros: detalleGuardado ? Number(detalleGuardado.litros) : 0,
                _detalle_id: detalleGuardado ? detalleGuardado.produccion_leche_detalle_id : null
            };
        });

        // Añadir vacas históricas que estén en el detalle pero ya no en la lista activa
        detallesGuardados.forEach(dg => {
            if (!vacunos.value.some(v => Number(v.vacuno_id) === Number(dg.vacuno_id))) {
                vacunos.value.push({
                    vacuno_id: dg.vacuno_id,
                    arete: dg.vacuno_arete || 'S/N',
                    nombre: dg.vacuno_nombre || 'S/N',
                    litros: Number(dg.litros),
                    _detalle_id: dg.produccion_leche_detalle_id
                });
            }
        });

    } catch (e) {
        console.error(e);
        notify('error', 'Error', 'No se pudieron cargar las vacas.');
    } finally {
        loadingVacunos.value = false;
    }
};

const volverALista = () => {
    router.push({ path: '/produccion/producciones-leche', query: { fecha: fechaProduccion.value } });
};

const saveProduccion = async () => {
    const desc = Number(totalDescartado.value || 0);
    const litrosTotales = totalLitros.value;

    if (desc < 0) return notify('warn', 'Datos inválidos', 'El total descartado no puede ser negativo.');
    if (desc > litrosTotales) return notify('warn', 'Datos incoherentes', 'El total descartado no puede superar el total de litros.');

    saving.value = true;
    try {
        const detallesAProcesar = vacunos.value.filter(v => Number(v.litros) > 0 && v.vacuno_id);

        // 1. Borrar los que ya no están
        const originalesIds = detallesOriginales.value.map(d => d.produccion_leche_detalle_id);
        const procesadosIds = detallesAProcesar.map(d => d._detalle_id).filter(id => id != null);
        const idsAEliminar = originalesIds.filter(id => !procesadosIds.includes(id));

        for (const id of idsAEliminar) {
            await $api(`/producciones-leche/${produccionId}/detalles/${id}`, { method: 'DELETE' }).catch(() => null);
        }

        // 2. Actualizar o Insertar
        for (const d of detallesAProcesar) {
            if (d._detalle_id) {
                await $api(`/producciones-leche/${produccionId}/detalles/${d._detalle_id}`, {
                    method: 'PATCH',
                    body: { litros: Number(Number(d.litros).toFixed(2)) }
                });
            } else {
                await $api(`/producciones-leche/${produccionId}/detalles`, {
                    method: 'POST',
                    body: { vacuno_id: Number(d.vacuno_id), litros: Number(Number(d.litros).toFixed(2)) }
                });
            }
        }

        // 3. Actualizar cabecera
        await $api(`/producciones-leche/${produccionId}`, {
            method: 'PATCH',
            body: {
                total_descartado: desc,
                observaciones: observaciones.value?.trim() || undefined
            }
        });

        notify('success', 'Actualizado', 'Producción modificada correctamente.');
        volverALista();
    } catch (e: any) {
        const msg = e?.data?.message || 'No se pudo actualizar la producción';
        notify('error', 'Error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
        saving.value = false;
    }
};
</script>
