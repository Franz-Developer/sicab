<!-- C:\sistemas\sicab\sicab-frontend\app\pages\personal\trabajador-antecedentes\index.vue -->
<template>
    <AntecedentesCrud :trabajador-id="trabajadorIdFromQuery ?? undefined"
        :ocultar-filtro-trabajador="!!trabajadorIdFromQuery" />
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';

    useHead({ title: 'Antecedentes' });

    const route = useRoute();

    const trabajadorIdFromQuery = computed<number | null>(() => {
        const raw = route.query.trabajador_id;
        const id = Number(raw);
        return Number.isFinite(id) && id > 0 ? id : null;
    });
</script>
