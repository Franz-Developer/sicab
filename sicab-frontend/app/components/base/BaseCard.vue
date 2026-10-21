<!-- C:\sistemas\sicab\sicab-frontend\app\components\base\BaseCard.vue -->
<template>
    <div :class="variantClasses">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    const props = withDefaults(defineProps<{
        variant?: 'default' | 'outline';
    }>(), {
        variant: 'default',
    });

    const variantClasses = computed(() => {
        const base = 'bg-white rounded-2xl overflow-hidden';

        if (props.variant === 'outline') {
            // Para el popover del usuario y casos con borde azul marcado
            return `${base} border-2 border-blue-400 dark:border-blue-500`;
        }

        // Default: sombra + borde sutil
        return `${base} shadow-md border border-slate-200 dark:border-slate-700`;
    });
</script>