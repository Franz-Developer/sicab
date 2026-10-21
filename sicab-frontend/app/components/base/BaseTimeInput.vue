<!-- C:\sistemas\sicab\sicab-frontend\app\components\base\BaseTimeInput.vue -->
<template>
    <div class="flex flex-col gap-0.5 w-full">
        <!-- Label opcional -->
        <label
            v-if="label"
            class="text-[9px] font-bold text-slate-500 uppercase tracking-wider"
        >
            {{ label }}
        </label>

        <div class="relative">
            <!-- Icono opcional (a la izquierda) -->
            <i
                v-if="icon"
                :class="icon"
                class="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400 text-xs"
            ></i>

            <!-- Input nativo type="time" -->
            <input
                ref="inputRef"
                type="time"
                :value="modelValue"
                :step="step"
                :min="min"
                :max="max"
                :disabled="disabled"
                :required="required"
                :class="inputClasses"
                @input="onInput"
                @blur="onBlur"
            />
        </div>

        <!-- Mensaje de error -->
        <small v-if="error" class="text-red-500 font-medium text-[10px]">
            {{ error }}
        </small>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';

    const props = withDefaults(defineProps<{
        modelValue?: string;
        label?: string;
        icon?: string;
        size?: 'sm' | 'default';
        disabled?: boolean;
        error?: string;
        required?: boolean;
        step?: number | string;
        min?: string | undefined;
        max?: string | undefined;
    }>(), {
        modelValue: '',
        label: '',
        icon: '',
        size: 'sm',
        disabled: false,
        error: '',
        required: false,
        step: 60,
        min: undefined,
        max: undefined,
    });

    const emit = defineEmits<{
        'update:modelValue': [value: string];
        blur: [];
    }>();

    const inputRef = ref<HTMLInputElement | null>(null);

    const inputClasses = computed(() => [
        'w-full bg-white border border-[var(--border-color)] rounded-[var(--radius-std)] transition-all',
        'focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-blue-100',
        'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
        props.icon ? 'has-icon pl-9' : 'pl-3',
        props.error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : '',
        props.size === 'sm'
            ? 'min-h-[32px] !text-xs !py-1'
            : 'min-h-[36px] text-sm !py-1.5',
    ]);

    const onInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        // El input nativo ya devuelve "HH:MM" o "" si está vacío
        emit('update:modelValue', target.value);
    };

    const onBlur = () => {
        emit('blur');
    };

    // Exponer métodos para foco desde el padre
    defineExpose({
        focus: () => inputRef.value?.focus(),
        blur: () => inputRef.value?.blur(),
        select: () => inputRef.value?.select(),
        getInputEl: () => inputRef.value,
    });
</script>
