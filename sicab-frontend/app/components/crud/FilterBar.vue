<!-- C:\sistemas\sicab\sicab-frontend\app\components\crud\FilterBar.vue -->
<template>
    <div class="filter-bar flex flex-wrap items-center gap-2 w-full">
        <div class="flex-1 min-w-[240px] order-1">
            <BaseSearch :autofocus="autofocus" :model-value="filters.global" :placeholder="searchPlaceholder"
                @update:model-value="filters.global = $event" @search="$emit('search')" class="w-full" />
        </div>

        <div v-if="showExactMatch" class="w-32 flex-shrink-0 order-2">
            <BaseExactMatch :model-value="filters.exactMatch" @update:model-value="onExactMatchChange" />
        </div>

        <template v-if="hasAdvancedFilters">
            <div class="flex items-center gap-2 w-full order-3 sm:w-auto">
                <BaseButton :label="activeFiltersCount > 0 ? `Filtros (${activeFiltersCount})` : 'Filtros'"
                    icon="pi pi-filter" :variant="activeFiltersCount > 0 ? 'sky' : 'cancel'" size="sm"
                    class="flex-shrink-0" @click="showModal = true" />

                <BaseButton v-if="activeFiltersCount > 0" label="Limpiar" icon="pi pi-trash" variant="danger" size="sm"
                    class="flex-shrink-0" @click="$emit('clear')" />
            </div>
        </template>

        <BaseDialog v-model:visible="showModal" dialogClass="" :width="modalWidth" maxHeight="85vh" :modal="true"
            :closable="true">
            <template #header>
                <div class="flex items-center gap-3">
                    <div class="bg-sky-600 p-2 rounded-lg shadow">
                        <i class="pi pi-filter text-white text-lg"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-black text-sky-900 uppercase">
                            {{ modalTitle }}
                        </h3>
                        <p class="text-xs text-sky-700">
                            {{ modalSubtitle }}
                        </p>
                    </div>
                </div>
            </template>

            <div class="panel-contrast">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-3">
                    <slot name="advanced" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center gap-3 w-full">
                    <BaseButton label="Limpiar todo" icon="pi pi-trash" variant="ghost-red" size="sm"
                        @click="$emit('clear')" />
                    <div class="flex gap-2">
                        <BaseButton :label="`Aplicar${activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}`"
                            icon="pi pi-check" variant="primary" size="sm" @click="aplicar" />
                    </div>
                </div>
            </template>
        </BaseDialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, useSlots, Comment } from 'vue';

    interface Props {
        filters: Record<string, any>;
        searchPlaceholder?: string;
        showExactMatch?: boolean;
        autofocus?: boolean;
        activeFiltersCount?: number;
        modalTitle?: string;
        modalSubtitle?: string;
        modalWidth?: string;
    }

    const props = withDefaults(defineProps<Props>(), {
        searchPlaceholder: 'Buscar...',
        showExactMatch: true,
        autofocus: false,
        activeFiltersCount: 0,
        modalTitle: 'Filtros Avanzados',
        modalSubtitle: 'Refina la búsqueda',
        modalWidth: 'w-[95vw] sm:w-[90vw] md:w-[640px]',
    });

    const emit = defineEmits<{
        search: [];
        clear: [];
        apply: [];
    }>();

    const slots = useSlots();
    const showModal = ref(false);

    const hasAdvancedFilters = computed<boolean>(() => {
        if (!slots.advanced) return false;
        const nodes = slots.advanced();
        return Array.isArray(nodes)
            ? nodes.some((n) => n.type !== Comment || (n.children && String(n.children).trim() !== ''))
            : false;
    });

    const onExactMatchChange = (value: number): void => {
        props.filters.exactMatch = value;
        emit('search');
    };

    const aplicar = (): void => {
        showModal.value = false;
        emit('apply');
        emit('search');
    };

    defineExpose({
        openModal: () => { showModal.value = true; },
        closeModal: () => { showModal.value = false; },
    });
</script>
