<!-- C:\sistemas\sicab\sicab-frontend\app\components\layout\MenuItemNode.vue -->
<template>
    <li class="menu-item" :class="{ 'is-expanded': isExpanded }">
        <!-- Item con hijos (submenú) -->
        <template v-if="hasChildren">
            <button
                type="button"
                class="menu-action menu-action-parent"
                :class="{
                    'is-open': isExpanded,
                    'has-active-child': contieneRutaActiva && !isExpanded,
                }"
                @click="item.key && $emit('toggle', item.key)"
            >
                <span :class="item.icon" class="menu-icon" />
                <span class="menu-text">{{ item.label }}</span>

                <!-- 🟡 Punto amarillo indicador (solo si contiene ruta activa y está colapsado) -->
                <span
                    v-if="contieneRutaActiva && !isExpanded"
                    class="active-indicator-dot"
                    title="Contiene la página actual"
                />

                <NuxtLink
                    v-if="item.to"
                    :to="item.to"
                    class="menu-home-btn"
                    title="Ir al inicio"
                    @click.stop
                >
                    <i class="pi pi-home" />
                </NuxtLink>

                <i
                    class="pi pi-angle-down menu-arrow"
                    :class="{ 'rotate-180': isExpanded }"
                />
            </button>
            <ul v-show="isExpanded" class="menu-children">
                <MenuItemNode
                    v-for="child in item.items"
                    :key="child.key || child.label"
                    :item="child"
                    :depth="depth + 1"
                    :expanded-keys="expandedKeys"
                    @toggle="$emit('toggle', $event)"
                    @navigate="$emit('navigate')"
                />
            </ul>
        </template>

        <!-- Item hoja (link) -->
        <NuxtLink v-else-if="item.to" :to="item.to" class="menu-action" :class="{ 'active-link': esRutaActivaItem }"
            @click="$emit('navigate')">
            <span :class="item.icon" class="menu-icon" />
            <span class="menu-text">{{ item.label }}</span>
        </NuxtLink>

        <!-- Item sin link ni hijos -->
        <span v-else class="menu-action menu-action-disabled">
            <span :class="item.icon" class="menu-icon" />
            <span class="menu-text">{{ item.label }}</span>
        </span>
    </li>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';
    import type { MenuItem } from '~/types/menu';

    const props = defineProps<{
        item: MenuItem;
        depth: number;
        expandedKeys: Record<string, boolean>;
    }>();

    const route = useRoute();

    const esRutaActivaItem = computed<boolean>(() => {
        const normalize = (p?: string) => p?.replace(/\/$/, '').toLowerCase() ?? '';
        const a = normalize(props.item.to);
        const b = normalize(route.path);
        if (!a || !b) return false;
        if (a === b) return true;
        return b.startsWith(a + '/');
    });

    const contieneRutaActiva = computed<boolean>(() => {
        const normalize = (p?: string) => p?.replace(/\/$/, '').toLowerCase() ?? '';

        const matchRuta = (to?: string, path?: string): boolean => {
            const a = normalize(to);
            const b = normalize(path);
            if (!a || !b) return false;
            if (a === b) return true;
            return b.startsWith(a + '/');
        };

        const check = (item: MenuItem): boolean => {
            if (item.to && matchRuta(item.to, route.path)) { return true; }
            if (item.items?.length) {
                return item.items.some(check);
            }
            return false;
        };

        return check(props.item);
    });

    defineEmits<{
        toggle: [key: string | undefined];
        navigate: [];
    }>();

    const hasChildren = computed(() => !!props.item.items?.length);

    const isExpanded = computed(() => {
        if (!props.item.key) return false;
        return !!props.expandedKeys[props.item.key];
    });
</script>

<style scoped>
    .menu-item {
        list-style: none;
        margin-bottom: 0.2rem;
    }

    .menu-action {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        width: 100%;
        padding: 0.4rem 0.45rem;
        background: white;
        border: 1px solid #bae6fd;
        border-radius: 10px;
        color: #113f67;
        font-weight: 800;
        font-size: 0.65rem;
        line-height: 1.15;
        text-decoration: none;
        cursor: pointer;
        transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    .menu-action:hover {
        background-color: #f0f9ff;
        border-color: #7dd3fc;
    }

    .menu-action.is-open {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .menu-action-parent {
        font-family: inherit;
        text-align: left;
    }

    .menu-action-disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .menu-icon {
        color: #51adcf;
        font-size: 0.85rem;
        flex-shrink: 0;
    }

    .menu-text {
        flex: 1;
        text-align: left;
    }

    .menu-arrow {
        font-size: 0.65rem;
        transition: transform 0.2s ease;
    }

    .menu-arrow.rotate-180 {
        transform: rotate(180deg);
    }

    .menu-children {
        list-style: none;
        padding: 0.2rem 0;
        margin: 0;
        background: #e0f2fe;
        border: 1px dashed #bae6fd;
        border-top: none;
        border-radius: 0 0 10px 10px;
    }

    /* Antes: :deep(.menu-action) */
    .menu-children .menu-action {
        padding: 0.45rem 0.9rem;
        background: transparent;
        border: none;
        border-radius: 0;
        font-weight: 600;
        font-size: 0.65rem;
        color: #334155;
        transition: background-color 0.15s ease, color 0.15s ease, padding-left 0.15s ease;
    }

    .menu-children .menu-action:hover {
        background-color: #7dd3fc;
        color: #0c4a6e;
        box-shadow: inset 4px 0 0 0 #0284c7;
        font-weight: 700;
        padding-left: 1.1rem;
    }

    .menu-children .menu-action.active-link {
        background: linear-gradient(90deg, #fdba74 0%, #fbbf24 100%);
        border-left: 4px solid #ff9800;
        color: #1d4ed8;
        font-weight: 800;
    }

    .menu-children .menu-action.active-link .menu-icon {
        color: #1d4ed8;
    }

    .menu-children .menu-action.active-link::after {
        content: "\e901";
        font-family: 'primeicons';
        margin-left: auto;
        font-size: 0.6rem;
        color: #ff9800;
    }

    /* Dark mode */
    :global(html.dark) .menu-action {
        background-color: #1e293b;
        border-color: #334155;
        color: #f1f5f9;
    }

    :global(html.dark) .menu-action .menu-icon {
        color: #38bdf8;
    }

    :global(html.dark) .menu-children {
        background-color: #0b1220;
        border-color: #334155;
    }

    :global(html.dark) .menu-children .menu-action {
        color: #94a3b8;
    }

    :global(html.dark) .menu-children .menu-action:hover {
        background-color: #1e293b;
    }

    :global(html.dark) .menu-children .menu-action.active-link {
        background-color: #1e293b;
        color: #38bdf8;
    }

    /* 🟡 Punto indicador cuando el padre colapsado contiene la ruta activa */
    .active-indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #f59e0b;                    /* ámbar */
        box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
        flex-shrink: 0;
        margin-right: 0.25rem;
        animation: pulse-dot 1.8s ease-in-out infinite;
    }

    @keyframes pulse-dot {
        0%, 100% {
            box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.25);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 0 5px rgba(245, 158, 11, 0.1);
            transform: scale(1.15);
        }
    }

    /* El padre con hijo activo colapsado: leve realce visual */
    .menu-action-parent.has-active-child {
        border-color: #fbbf24;
        background: linear-gradient(90deg, #fffbeb 0%, #ffffff 100%);
    }

    .menu-action-parent.has-active-child .menu-icon {
        color: #f59e0b;
    }

    .menu-action-parent.has-active-child .menu-arrow {
        color: #f59e0b;
        font-weight: 900;
    }

    /* Dark mode */
    :global(html.dark) .menu-action-parent.has-active-child {
        background: linear-gradient(90deg, #422006 0%, #1e293b 100%);
        border-color: #f59e0b;
    }

    :global(html.dark) .menu-action-parent.has-active-child .menu-icon,
    :global(html.dark) .menu-action-parent.has-active-child .menu-arrow {
        color: #fbbf24;
    }
</style>
