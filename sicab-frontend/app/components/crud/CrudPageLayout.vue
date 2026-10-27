<!-- C:\sistemas\sicab\sicab-frontend\app\components\crud\CrudPageLayout.vue -->
<template>
    <div class="flex flex-col h-full min-h-0">
        <!-- ─── HEADER ─── -->
        <div class="flex items-center justify-between gap-2 mb-1 flex-nowrap">
            <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="bg-[var(--primary-dark)] p-1.5 rounded-lg shadow-md shadow-blue-900/20 flex-shrink-0">
                    <i :class="[icon, 'text-white text-sm']"></i>
                </div>
                <div class="leading-none min-w-0">
                    <h1
                        class="text-xs sm:text-sm font-black text-[var(--primary-dark)] dark:text-blue-300 uppercase tracking-tight leading-none truncate">
                        {{ title }}
                    </h1>
                    <p
                        class="text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px] font-semibold leading-none mt-0.5 truncate">
                        {{ subtitle }}
                    </p>
                </div>
            </div>

            <!-- Slot #actions (múltiples botones) con fallback a showAction -->
            <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0">
                <slot name="actions" />
            </div>

            <BaseButton v-else-if="showAction" :label="actionLabel" :icon="actionIcon" variant="primary" size="sm"
                class="flex-shrink-0 whitespace-nowrap" @click="$emit('action')" />
        </div>

        <!-- ─── CONTENEDOR DEL CONTENIDO ─── -->
        <div class="flex-1 min-h-0 bg-white rounded-2xl shadow-sm overflow-hidden">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    withDefaults(defineProps<{
        icon: string;
        title: string;
        subtitle?: string;
        showAction?: boolean;
        actionLabel?: string;
        actionIcon?: string;
    }>(), {
        subtitle: '',
        showAction: false,
        actionLabel: 'NUEVO',
        actionIcon: 'pi pi-plus',
    });

    defineEmits<{ (e: 'action'): void }>();
</script>