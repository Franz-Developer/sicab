<!-- C:\sistemas\sicab\sicab-frontend\app\components\base\BaseDialog.vue -->
<template>
    <Dialog v-model:visible="visibleModel" :modal="modal" :closable="closable" :draggable="draggable"
        :class="dialogClass" :style="dialogStyle" @show="onShow">
        <template v-if="$slots.header" #header>
            <slot name="header" />
        </template>

        <slot />

        <template v-if="$slots.footer" #footer>
            <slot name="footer" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    const props = withDefaults(defineProps<{
        visible: boolean;
        dialogClass?: string;
        width?: string;
        maxHeight?: string;
        modal?: boolean;
        closable?: boolean;
        draggable?: boolean;
    }>(), {
        dialogClass: '',
        width: '',
        maxHeight: '90vh',
        modal: true,
        closable: true,
        draggable: true,
    });

    const emit = defineEmits<{
        'update:visible': [value: boolean];
        show: [];
    }>();

    const visibleModel = computed({
        get: () => props.visible,
        set: (val) => emit('update:visible', val),
    });

    const dialogClass = computed(() => {
        const base = 'custom-modal crud-celeste-dialog';
        return [base, props.dialogClass, props.width].filter(Boolean).join(' ');
    });

    const dialogStyle = computed(() => ({
        maxHeight: props.maxHeight,
    }));

    const onShow = () => emit('show');
</script>
