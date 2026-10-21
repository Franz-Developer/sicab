<!-- C:\sistemas\sicab\sicab-frontend\app\components\base\BaseExactMatch.vue -->
<template>
    <BaseSelect
        :model-value="modelValue"
        :options="opciones"
        option-label="label"
        option-value="value"
        size="sm"
        v-tooltip.top="'Parecido: coincidencia parcial. Exacto: palabra completa.'"
        class="w-full"
        @update:model-value="onChange"
    />
</template>

<script setup lang="ts">
    interface OptionItem {
        label: string;
        value: number;
    }

    defineProps<{
        modelValue: number | null;
    }>();

    const emit = defineEmits<{
        'update:modelValue': [value: number];
    }>();

    const opciones: OptionItem[] = [
        { label: 'Parecido', value: 0 },
        { label: 'Exacto',   value: 1 },
    ];

    const onChange = (value: number): void => {
        emit('update:modelValue', value);
    };
</script>
