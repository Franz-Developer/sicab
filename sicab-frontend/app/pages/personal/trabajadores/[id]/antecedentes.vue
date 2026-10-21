<!-- C:\sistemas\sicab\sicab-frontend\app\pages\personal\trabajadores\[id]\antecedentes.vue -->
<template>
    <AntecedentesCrud :trabajador-id="trabajadorId" :ocultar-filtro-trabajador="true" />
</template>

<script setup lang="ts">
    const route = useRoute();
    const trabajadorId = Number(route.params.id);

    if (import.meta.client && trabajadorId) {
        await navigateTo(
            `/personal/trabajador-antecedentes?trabajador_id=${trabajadorId}`,
            { replace: true }
        );
    }

    useHead({ title: 'Antecedentes del trabajador' });
</script>