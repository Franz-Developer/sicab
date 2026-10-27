<!-- C:\sistemas\sicab\sicab-frontend\app\pages\produccion\producciones-leche\nuevo.vue -->
<template>
    <div class="max-w-6xl mx-auto space-y-3 pb-6">
        <!-- Header Fijo con Botones -->
        <div
            class="flex items-center justify-between bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-10">
            <div class="flex items-center gap-2">
                <div class="bg-sky-600 p-1.5 rounded-lg shadow">
                    <i class="pi pi-inbox text-white text-base"></i>
                </div>
                <div>
                    <h1 class="text-base font-black text-sky-900 uppercase leading-none">Nueva Producción</h1>
                    <p class="text-[10px] text-sky-700 mt-0.5">Registro diario de ordeño</p>
                </div>
            </div>
            <div class="flex gap-2">
                <BaseButton label="Cancelar" icon="pi pi-times" variant="danger" size="sm" @click="volverALista" />
                <BaseButton label="Guardar Producción" icon="pi pi-save" variant="primary" size="sm" :loading="saving"
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
                        option-value="value" size="sm" filter disabled class="opacity-70 cursor-not-allowed"
                        @update:model-value="cargarVacunos" />
                </div>
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Fecha *</label>
                    <BaseInput v-model="fechaProduccion" type="date" size="sm" disabled
                        class="opacity-70 cursor-not-allowed" />
                </div>
                <div class="md:col-span-2">
                    <label class="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">Turno *</label>
                    <BaseSelect v-model="turnoId" :options="turnosOptions" option-label="label" option-value="value"
                        size="sm" filter />
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
                <span class="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Total Litros: {{ formatNumber(totalLitros) }} L
                </span>
            </div>

            <div v-if="!sucursalId" class="text-center py-6 text-slate-500 text-[11px] bg-white">
                Seleccione una sucursal para cargar las vacas.
            </div>
            <div v-else-if="loadingVacunos" class="text-center py-6 text-slate-500 text-[11px] bg-white">
                <i class="pi pi-spin pi-spinner mr-1"></i> Cargando...
            </div>
            <div v-else-if="vacunos.length === 0" class="text-center py-6 text-slate-400 text-[11px] bg-white">
                No hay vacas lecheras activas en esta sucursal.
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
    import { ref, computed, onMounted, watch } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { SexoBiologico, CondicionProductorLeche, EstadoVacuno, ESTADO_ACTIVO, ESTADOS_VACUNO_FINALES } from '~/constants/estados.constant';
    import { getTodayLocal } from '~/utils/date';

    useHead({ title: 'Nueva Producción de Leche' });

    const router = useRouter();
    const route = useRoute();
    const { $api } = useNuxtApp() as any;
    const { notify } = useNotify();
    const authStore = useAuthStore();

    const empresaId = ref<number | null>(null);
    const sucursalId = ref<number | null>(null);
    const turnoId = ref<number | null>(null);
    const fechaProduccion = ref((route.query.fecha as string) || getTodayLocal());
    const totalDescartado = ref<number | string>(0);
    const observaciones = ref('');
    const saving = ref(false);

    const empresasOptions = ref<any[]>([]);
    const todasSucursales = ref<any[]>([]);
    const turnosOptions = ref<any[]>([]);
    const vacunos = ref<any[]>([]);
    const loadingVacunos = ref(false);

    const sucursalesFiltradas = computed(() => {
        if (!empresaId.value) return [];
        return todasSucursales.value.filter(s => s.empresa_id === empresaId.value);
    });

    const totalLitros = computed(() => vacunos.value.reduce((sum, v) => sum + (Number(v.litros) || 0), 0));
    const formatNumber = (v: any) => Number(v || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 });

    watch(sucursalesFiltradas, (nuevasOpciones) => {
        if (nuevasOpciones.length > 0 && authStore.user?.sucursal_id) {
            sucursalId.value = Number(authStore.user.sucursal_id);
        }
    }, { immediate: true });

    onMounted(async () => {
        const [resEmp, resSuc, resTur] = await Promise.all([
            $api('/empresas', { params: { limit: 500, estado_id: ESTADO_ACTIVO } }),
            $api('/sucursales', { params: { limit: 500, estado_id: ESTADO_ACTIVO } }),
            $api('/turnos-ordeno', { params: { limit: 500, estado_id: ESTADO_ACTIVO } })
        ]);

        empresasOptions.value = (resEmp.data || []).map((e: any) => ({ label: e.empresa, value: e.empresa_id }));

        todasSucursales.value = (resSuc.data || []).map((s: any) => ({
            label: `${s.sucursal}`.trim(),
            value: s.sucursal_id,
            empresa_id: s.empresa_id
        }));

        turnosOptions.value = (resTur.data || []).map((t: any) => ({ label: t.turno, value: t.turno_ordeno_id }));

        if (authStore.user?.sucursal_id) {
            sucursalId.value = Number(authStore.user.sucursal_id);
        }

        if (authStore.user?.empresa_id) {
            empresaId.value = Number(authStore.user.empresa_id);
        } else if (sucursalId.value) {
            const sucursalEncontrada = todasSucursales.value.find(s => s.value === sucursalId.value);
            if (sucursalEncontrada) {
                empresaId.value = sucursalEncontrada.empresa_id;
            }
        }

        if (sucursalId.value) {
            cargarVacunos();
        }
    });

    const cargarVacunos = async () => {
        if (!sucursalId.value) {
            vacunos.value = [];
            return;
        }
        loadingVacunos.value = true;
        try {
            const res = await $api('/vacunos', {
                params: {
                    limit: 1000,
                    estado_id: ESTADO_ACTIVO,
                    sexo_biologico_id: SexoBiologico.HEMBRA,
                    es_productor_leche: CondicionProductorLeche.PRODUCTOR,
                    sucursal_id: sucursalId.value
                }
            });

            const vacasValidas = (res.data || []).filter((v: any) =>
                Number(v.estado_vacuno_id) === EstadoVacuno.ACTIVO &&
                !ESTADOS_VACUNO_FINALES.includes(Number(v.estado_vacuno_id))
            );

            vacunos.value = vacasValidas.map((v: any) => ({ ...v, litros: null }));

            if (vacunos.value.length === 0) {
                notify('info', 'Sin vacas', 'No hay vacas lecheras activas en esta sucursal.');
            }
        } catch (e) {
            console.error(e);
            notify('error', 'Error', 'No se pudieron cargar las vacas.');
        } finally {
            loadingVacunos.value = false;
        }
    };

    const volverALista = () => {
        router.push({
            path: '/produccion/producciones-leche',
            query: { fecha: fechaProduccion.value }
        });
    };

    const saveProduccion = async () => {
        if (!sucursalId.value || !turnoId.value || !fechaProduccion.value) {
            return notify('warn', 'Faltan datos', 'Complete empresa, sucursal, turno y fecha.');
        }

        // Validar que no haya litros negativos
        const hayNegativos = vacunos.value.some(v => Number(v.litros) < 0);
        if (hayNegativos) {
            return notify('warn', 'Datos inválidos', 'Los litros no pueden ser negativos.');
        }

        const detalles = vacunos.value.filter(v => Number(v.litros) > 0 && v.vacuno_id);

        if (detalles.length === 0) {
            return notify('warn', 'Sin datos', 'Debe registrar litros en al menos una vaca.');
        }

        const desc = Number(totalDescartado.value || 0);
        const litrosTotales = totalLitros.value;

        if (desc < 0) {
            return notify('warn', 'Datos inválidos', 'El total descartado no puede ser negativo.');
        }

        if (desc > litrosTotales) {
            return notify('warn', 'Datos incoherentes', 'El total descartado no puede superar el total de litros.');
        }

        saving.value = true;
        try {
            await $api('/producciones-leche', {
                method: 'POST',
                body: {
                    sucursal_id: Number(sucursalId.value),
                    turno_ordeno_id: Number(turnoId.value),
                    fecha_produccion: fechaProduccion.value,
                    total_descartado: desc,
                    observaciones: observaciones.value?.trim() || undefined,
                    detalles: detalles.map(d => ({
                        vacuno_id: Number(d.vacuno_id),
                        litros: Number(Number(d.litros).toFixed(2))
                    }))
                }
            });
            notify('success', 'Creado', 'Producción registrada correctamente.');
            volverALista();
        } catch (e: any) {
            const msg = e?.data?.message || 'No se pudo guardar la producción';
            notify('error', 'Error', Array.isArray(msg) ? msg[0] : msg);
        } finally {
            saving.value = false;
        }
    };
</script>