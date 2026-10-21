<!-- C:\sistemas\sicab\sicab-frontend\app\pages\prueba.vue -->
<!-- app/pages/prueba.vue -->
<template>
    <div class="p-8">
        <div class="mb-4">
            <BaseButton label="Ubicar ORIGEN en mapa" icon="pi pi-map-marker" variant="primary" @click="abrirOrigen" />
            <BaseButton label="Ubicar DESTINO en mapa" icon="pi pi-map-marker" variant="ghost-sky" class="ml-2"
                @click="abrirDestino" />
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="info-panel">
                <span class="info-panel-title">Coordenadas de Origen</span>
                <span class="font-mono text-xs">
                    {{ origen.lat && origen.lng ? `${origen.lat.toFixed(6)}, ${origen.lng.toFixed(6)}` : 'Sin ubicar' }}
                </span>
            </div>
            <div class="info-panel">
                <span class="info-panel-title">Coordenadas de Destino</span>
                <span class="font-mono text-xs">
                    {{ destino.lat && destino.lng ? `${destino.lat.toFixed(6)}, ${destino.lng.toFixed(6)}` : 'Sinubicar'
                    }}
                </span>
            </div>
        </div>

        <!-- Diálogo de mapa -->
        <MapPickerDialog v-model:visible="mapVisible" :tipo="mapTipo"
            :lat="mapTipo === 'origen' ? origen.lat : destino.lat"
            :lng="mapTipo === 'origen' ? origen.lng : destino.lng" @confirm="onConfirm" />
    </div>
</template>

<script setup lang="ts">
const mapVisible = ref(false);
const mapTipo = ref<'origen' | 'destino'>('origen');

const origen = ref<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
const destino = ref<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

const abrirOrigen = () => {
    mapTipo.value = 'origen';
    mapVisible.value = true;
};

const abrirDestino = () => {
    mapTipo.value = 'destino';
    mapVisible.value = true;
};

const onConfirm = (payload: { lat: number; lng: number }) => {
    if (mapTipo.value === 'origen') {
        origen.value = { ...payload };
    } else {
        destino.value = { ...payload };
    }
};
</script>
