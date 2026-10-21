<!-- C:\sistemas\sicab\sicab-frontend\app\components\base\MapPickerDialog.vue -->
<template>
    <BaseDialog v-model:visible="visibleModel" dialogClass="" width="w-[95vw] sm:w-[90vw] md:w-[820px] lg:w-[900px]"
        maxHeight="92vh" :modal="true" :closable="true" :draggable="true">
        <template #header>
            <div class="flex items-center gap-3">
                <div class="bg-sky-600 p-2 rounded-lg shadow">
                    <i class="pi pi-map-marker text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-sky-900 uppercase">
                        Ubicar {{ tipo === 'origen' ? 'Origen' : 'Destino' }}
                    </h3>
                    <p class="text-xs text-sky-700">
                        Haz clic en el mapa o arrastra el marcador para elegir la ubicación exacta
                    </p>
                </div>
            </div>
        </template>

        <div>
            <!-- ⚠️ Error de configuración -->
            <div v-if="configError" class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div class="flex items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-red-600 text-lg mt-0.5"></i>
                    <div>
                        <p class="text-sm font-bold text-red-800 uppercase tracking-wider">
                            Error de configuración
                        </p>
                        <p class="text-xs text-red-700 leading-relaxed mt-1">
                            {{ configError }}
                        </p>
                        <p class="text-[11px] text-red-600 mt-2">
                            Contacte al administrador del sistema.
                        </p>
                    </div>
                </div>
            </div>

            <!-- ⏳ Cargando config -->
            <div v-else-if="!configLista" class="p-8 text-center">
                <i class="pi pi-spin pi-spinner text-2xl text-sky-500"></i>
                <p class="text-xs text-slate-500 mt-2">Cargando configuración del mapa...</p>
            </div>

            <!-- ✅ Mapa (solo si config OK) -->
            <template v-else>
                <div class="w-full h-[440px] rounded-xl border-2 border-sky-200 overflow-hidden">
                    <LMap ref="mapRef" :zoom="zoom!" :center="center!" :use-global-leaflet="false" @ready="onMapReady">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
                            layer-type="base" name="OpenStreetMap" />

                        <LMarker :lat-lng="markerPosition!" :draggable="true" @update:lat-lng="onMarkerDrag" />
                    </LMap>
                </div>

                <!-- Vista previa de coordenadas -->
                <div class="mt-3 grid grid-cols-2 gap-3">
                    <div class="info-panel">
                        <span class="info-panel-title">Latitud</span>
                        <span class="text-sm font-mono font-bold text-sky-900">{{ latTexto }}</span>
                    </div>
                    <div class="info-panel">
                        <span class="info-panel-title">Longitud</span>
                        <span class="text-sm font-mono font-bold text-sky-900">{{ lngTexto }}</span>
                    </div>
                </div>

                <div v-if="areaError"
                    class="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <i class="pi pi-exclamation-triangle text-red-600 text-sm mt-0.5"></i>
                    <div class="flex-1">
                        <p class="text-[11px] font-bold text-red-800 uppercase tracking-wider">
                            Fuera del área de servicio
                        </p>
                        <p class="text-[11px] text-red-700 leading-relaxed mt-0.5">
                            {{ areaError }}
                        </p>
                    </div>
                </div>

                <small class="block mt-2 text-slate-500 text-[10px]">
                    <i class="pi pi-info-circle mr-1"></i>
                    Haz clic en cualquier parte del mapa para mover el marcador. También puedes arrastrarlo.
                </small>
            </template>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" variant="dialog-cancel" @click="cerrar" />
                <BaseButton label="Confirmar ubicación" icon="pi pi-check" variant="primary"
                    :disabled="!configLista || !!areaError || validandoArea" :loading="validandoArea"
                    @click="confirmar" />
            </div>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onMounted } from 'vue';

    // ============ PROPS / EMITS ============
    const props = defineProps<{
        visible: boolean;
        tipo: 'origen' | 'destino';
        lat: number | string | null | undefined;
        lng: number | string | null | undefined;
    }>();

    const emit = defineEmits<{
        'update:visible': [value: boolean];
        'confirm': [payload: { lat: number; lng: number }];
    }>();

    const visibleModel = computed({
        get: () => props.visible,
        set: (val) => emit('update:visible', val),
    });

    // ============ DEPENDENCIAS ============
    const { validarCoordenadas } = useGeoAreaValidator();
    const { getInt, getDecimal } = useParametroGlobal();

    // ============ CONFIG DEL MAPA ============
    const zoom = ref<number | null>(null);
    const defaultCenter = ref<[number, number] | null>(null);
    const configError = ref<string | null>(null);

    // ============ ESTADO DEL MAPA ============
    const mapRef = ref<any>(null);
    const markerPosition = ref<[number, number] | null>(null);
    const center = ref<[number, number] | null>(null);

    // ============ ESTADO DE VALIDACIÓN ============
    const areaError = ref<string | null>(null);
    const validandoArea = ref(false);

    // ============ COMPUTED ============
    const latTexto = computed(() =>
        markerPosition.value ? markerPosition.value[0].toFixed(6) : '—'
    );
    const lngTexto = computed(() =>
        markerPosition.value ? markerPosition.value[1].toFixed(6) : '—'
    );

    const configLista = computed<boolean>(() =>
        zoom.value !== null && defaultCenter.value !== null && !configError.value
    );

    // ============ CARGA DE CONFIG DESDE BD ============
    const cargarConfigMapa = async (): Promise<void> => {
        configError.value = null;

        const z = await getInt('mapa_zoom_default');
        const lat = await getDecimal('mapa_centro_lat');
        const lng = await getDecimal('mapa_centro_lng');

        if (z === null || z < 1 || z > 19) {
            configError.value = 'Falta o es inválido el parámetro "mapa_zoom_default" (1-19).';
            return;
        }

        if (
            lat === null || lng === null ||
            !Number.isFinite(lat) || !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            configError.value = 'Faltan o son inválidos los parámetros "mapa_centro_lat" / "mapa_centro_lng".';
            return;
        }

        zoom.value = z;
        defaultCenter.value = [lat, lng];
        center.value = [lat, lng];
        markerPosition.value = [lat, lng];
    };

    onMounted(() => {
        cargarConfigMapa();
    });

    // ============ VALIDACIÓN DEL MARCADOR ============
    const validarMarcador = async (): Promise<void> => {
        if (!markerPosition.value) {
            areaError.value = null;
            return;
        }

        const [lat, lng] = markerPosition.value;

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            areaError.value = null;
            return;
        }

        validandoArea.value = true;
        try {
            const result = await validarCoordenadas(lat, lng, props.tipo);
            areaError.value = result.valido ? null : (result.error ?? 'Ubicación fuera del área de servicio.');
        } finally {
            validandoArea.value = false;
        }
    };

    // ============ AL ABRIR EL DIÁLOGO ============
    watch(() => props.visible, async (isVisible) => {
        if (!isVisible) {
            areaError.value = null;
            return;
        }

        if (!configLista.value) {
            await cargarConfigMapa();
            if (!configLista.value) return;
        }

        const latNum = Number(props.lat);
        const lngNum = Number(props.lng);

        if (
            Number.isFinite(latNum) && Number.isFinite(lngNum) &&
            latNum >= -90 && latNum <= 90 &&
            lngNum >= -180 && lngNum <= 180 &&
            latNum !== 0 && lngNum !== 0
        ) {
            markerPosition.value = [latNum, lngNum];
            center.value = [latNum, lngNum];
        } else {
            const fallback = defaultCenter.value!;
            markerPosition.value = [...fallback];
            center.value = [...fallback];
        }

        await validarMarcador();
    });

    // ============ EVENTOS DEL MAPA ============
    const onMapReady = () => {
        const map = mapRef.value?.leafletObject;
        if (!map) return;
        map.on('click', async (e: any) => {
            markerPosition.value = [e.latlng.lat, e.latlng.lng];
            await validarMarcador();
        });
    };

    const onMarkerDrag = async (newLatLng: any) => {
        if (Array.isArray(newLatLng)) {
            markerPosition.value = [newLatLng[0], newLatLng[1]];
        } else if (newLatLng?.lat != null && newLatLng?.lng != null) {
            markerPosition.value = [newLatLng.lat, newLatLng.lng];
        }
        await validarMarcador();
    };

    // ============ CONFIRMAR / CERRAR ============
    const confirmar = async () => {
        if (!markerPosition.value) return;

        await validarMarcador();
        if (areaError.value) return;

        emit('confirm', {
            lat: markerPosition.value[0],
            lng: markerPosition.value[1],
        });
        visibleModel.value = false;
    };

    const cerrar = () => {
        areaError.value = null;
        visibleModel.value = false;
    };
</script>