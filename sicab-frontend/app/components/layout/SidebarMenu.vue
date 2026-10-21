<!-- C:\sistemas\sicab\sicab-frontend\app\components\layout\SidebarMenu.vue -->
<template>
    <div class="modern-sidebar">
        <div class="menu-container custom-scrollbar sidebar-scroll pr-2">
            <!-- Esperar a que la store tenga el menú hidratado -->
            <template v-if="primeMenu.length">
                <ul class="menu-root">
                    <MenuItemNode
                        v-for="item in primeMenu"
                        :key="item.key || item.label"
                        :item="item"
                        :depth="0"
                        :expanded-keys="expandedKeys"
                        @toggle="onToggle"
                        @navigate="closeOnMobile"
                    />
                </ul>
            </template>
            <div v-else class="p-4 text-xs text-slate-400 text-center">
                Cargando menú...
            </div>
            <div class="h-20 w-full"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAuthStore } from '@/stores/auth';
    import { computed, ref, watch } from 'vue';
    import { useRoute } from 'vue-router';
    import type { MenuItem } from '~/types/menu';
    import MenuItemNode from './MenuItemNode.vue';

    const authStore = useAuthStore();
    const route = useRoute();
    const expandedKeys = ref<Record<string, boolean>>({});

    const primeMenu = computed<MenuItem[]>(() => authStore.menu);

    const onToggle = (key: string | undefined) => {
        if (!key) return;
        expandedKeys.value = {
            ...expandedKeys.value,
            [key]: !expandedKeys.value[key],
        };
    };

    const updateActiveMenu = () => {
        const findAndExpand = (items: MenuItem[], targetPath: string): boolean => {
            for (const item of items) {
                if (item.to === targetPath) {
                    return true;
                }
                if (item.items?.length) {
                    if (findAndExpand(item.items, targetPath)) {
                        if (item.key) expandedKeys.value[item.key] = true;
                        return true;
                    }
                }
            }
            return false;
        };
        findAndExpand(primeMenu.value, route.path);
    };

    const closeOnMobile = () => {
        if (window.innerWidth < 768) {
            window.dispatchEvent(new CustomEvent('close-sidebar'));
        }
    };

    watch(
        primeMenu,
        (menu) => {
            if (!menu.length) return;
            updateActiveMenu();
        },
        { immediate: true }
    );

    watch(() => route.path, () => {
        updateActiveMenu();
        if (window.innerWidth < 768) {
            window.dispatchEvent(new CustomEvent('close-sidebar'));
        }
    });
</script>

<style scoped>
    .modern-sidebar {
        height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 0.5rem 0.25rem;
        background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
        overflow: hidden;
    }

    .menu-container {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 4px;
        padding-bottom: 5rem;
        scrollbar-width: thin;
        scrollbar-color: #113f67 #e2e8f0;
    }

    .menu-container::-webkit-scrollbar {
        width: 10px;
    }

    .menu-container::-webkit-scrollbar-track {
        background: #e2e8f0;
        border-radius: 5px;
        margin: 4px 0;
    }

    .menu-container::-webkit-scrollbar-thumb {
        background: #113f67;
        border-radius: 5px;
        border: 2px solid #e2e8f0;
    }

    .menu-container::-webkit-scrollbar-thumb:hover {
        background: #0a2a45;
    }

    .menu-root {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    @media (max-width: 767px) {
        .modern-sidebar {
            padding: 0.4rem 0.2rem;
        }
    }

    html.dark .modern-sidebar {
        background: #0f172a !important;
    }

    html.dark .menu-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
    }

    html.dark .menu-container::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    html.dark .menu-container {
        scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    }
</style>
