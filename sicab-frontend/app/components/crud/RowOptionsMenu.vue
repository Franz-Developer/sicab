<!-- C:\sistemas\sicab\sicab-frontend\app\components\crud\RowOptionsMenu.vue -->
<template>
    <Menu ref="menuRef" :model="model" :popup="true" :pt="menuPt">
        <template #item="{ item }">
            <div class="row-menu-item flex items-center gap-2.5 w-full leading-none">
                <i :class="item.icon"
                    class="row-menu-icon text-[13px] w-5 h-5 flex items-center justify-center rounded-lg flex-shrink-0"
                    :style="{ color: item.iconColor || 'var(--menu-text)' }" />
                <span class="row-menu-label text-[11px] leading-none">
                    {{ item.label }}
                </span>
            </div>
        </template>
    </Menu>
</template>

<script lang="ts">
export interface RowOptionItem {
    label?: string;
    icon?: string;
    iconColor?: string;
    command?: () => void;
    separator?: boolean;
    disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
    model: RowOptionItem[];
    width?: string;
    theme?: 'sky' | 'amber' | 'purple' | 'green';
}>(), {
    width: 'w-64',
    theme: 'sky',
});

const menuRef = ref<any>(null);

const themeColors = {
    sky: { bg: '#e0f2fe', border: '#3b82f6', text: '#0c4a6e', separator: '#7dd3fc' },
    amber: { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', separator: '#fbbf24' },
    purple: { bg: '#f3e8ff', border: '#a855f7', text: '#581c87', separator: '#c084fc' },
    green: { bg: '#d1fae5', border: '#10b981', text: '#064e3b', separator: '#6ee7b7' },
};

const colors = computed(() => themeColors[props.theme]);

const menuPt = computed(() => ({
    root: {
        class: `!rounded-xl !shadow-2xl ${props.width} !p-2 row-menu-root`,
        style: `background: ${colors.value.bg} !important; border: 1.5px solid ${colors.value.border} !important; backdrop-filter: none; --menu-text: ${colors.value.text};`,
    },
    menu: {
        class: '!p-0',
        style: `background: ${colors.value.bg} !important;`,
    },
    menuitem: {
        class: '!rounded-lg !mb-1 last:!mb-0',
    },
    content: {
        class: '!rounded-lg !px-2.5 !py-1.5 !transition-all row-menu-content',
        style: `background: transparent !important;`,
    },
    separator: {
        class: '!my-1.5',
        style: `border-color: ${colors.value.separator} !important;`,
    },
}));

defineExpose({
    toggle: (event: Event) => menuRef.value?.toggle(event),
    hide: () => menuRef.value?.hide(),
    show: (event: Event) => menuRef.value?.show(event),
});
</script>

<style>
/* Estado base: fondo transparente + transición suave */
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content {
    background: transparent !important;
    background-color: transparent !important;
    transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease !important;
}

/* HOVER: fondo azul oscuro + desplazamiento + sombra */
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content:hover,
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content.p-focus {
    background: #1d4ed8 !important;
    background-color: #1d4ed8 !important;
    transform: translateX(3px) !important;
    box-shadow: 0 2px 8px rgba(29, 78, 216, 0.45) !important;
    border-radius: 0.5rem !important;
}

/* HOVER: forzar texto e iconos a blanco */
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content:hover .row-menu-label,
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content:hover .row-menu-icon,
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content.p-focus .row-menu-label,
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content.p-focus .row-menu-icon {
    color: #ffffff !important;
}

/* HOVER: iconos SVG/imagen a blanco puro */
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content:hover .row-menu-icon,
.p-menu .p-menuitem:not(.p-disabled) .p-menuitem-content.row-menu-content.p-focus .row-menu-icon {
    filter: brightness(0) invert(1) !important;
}

/* Texto por defecto */
.row-menu-label {
    color: var(--menu-text) !important;
    transition: color 0.15s ease;
}

/* Icono por defecto */
.row-menu-icon {
    transition: color 0.15s ease, filter 0.15s ease;
}
</style>
