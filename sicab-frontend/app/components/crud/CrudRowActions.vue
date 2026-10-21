<!-- C:\sistemas\sicab\sicab-frontend\app\components\crud\CrudRowActions.vue -->
<template>
    <div class="flex gap-0.5 justify-center">
        <!-- EDITAR (morado: modificar) -->
        <BaseButton
            v-if="puede.editar && esActivo"
            icon="pi pi-pencil"
            variant="ghost-purple"
            size="xs"
            class="!p-0 !w-5 !h-5"
            @click="$emit('edit')"
            v-tooltip.top="'Editar'"
        />

        <!-- ARCHIVAR / RESTAURAR (naranja / verde) -->
        <BaseButton
            v-if="mostrarArchivar && puede.archivar"
            :icon="esActivo ? 'pi pi-lock-open' : 'pi pi-lock'"
            :variant="esActivo ? 'ghost-orange' : 'ghost-green'"
            size="xs"
            class="!p-0 !w-5 !h-5"
            @click="$emit('toggle')"
            v-tooltip.top="esActivo ? 'Archivar' : 'Restaurar'"
        />

        <!-- ANULAR (ámbar: advertencia seria, el registro sigue vivo) -->
        <BaseButton
            v-if="soportaAnular && puede.anular && esActivo"
            icon="pi pi-ban"
            variant="ghost-amber"
            size="xs"
            class="!p-0 !w-5 !h-5"
            @click="$emit('anular')"
            v-tooltip.top="'Anular'"
        />

        <!-- ELIMINAR (rojo: destrucción, el registro se borra) -->
        <BaseButton
            v-if="puede.eliminar && esActivo"
            icon="pi pi-trash"
            variant="ghost-red"
            size="xs"
            class="!p-0 !w-5 !h-5"
            @click="$emit('delete')"
            v-tooltip.top="'Eliminar'"
        />
    </div>
</template>

<script setup lang="ts">
    import { ESTADO_ACTIVO } from '~/constants/estados.constant';

    const props = withDefaults(defineProps<{
        estadoId: number;
        puede: {
            editar: boolean;
            eliminar: boolean;
            archivar: boolean;
            anular?: boolean;
        };
        soportaAnular?: boolean;
        mostrarArchivar?: boolean;
    }>(), {
        soportaAnular: false,
        mostrarArchivar: true
    });

    defineEmits<{
        edit: [];
        toggle: [];
        delete: [];
        anular: [];
    }>();

    const esActivo = computed(() => props.estadoId === ESTADO_ACTIVO);
</script>