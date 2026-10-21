<!-- C:\sistemas\sicab\sicab-frontend\app\layouts\default.vue -->
<template>
    <div v-if="authStore.user" class="flex flex-col h-screen bg-white dark:bg-[#0b1220] font-sans">
        <header class="h-12 bg-[var(--primary-dark)] flex items-center justify-between px-4 shadow-md z-30 border-b-4 border-[#ff9800]">
            <div class="flex items-center gap-3">
                <button
                    @click="toggleSidebar"
                    class="relative text-white hover:bg-white/10 p-2 rounded-md transition-all group"
                    :class="{ 'rotate-90': !isSidebarOpen }"
                    v-tooltip.bottom="isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'"
                >
                    <i class="pi pi-bars text-lg"></i>
                    <span class="absolute bottom-1.5 right-1.5 w-2 h-2 bg-slate-400 rounded-full"></span>
                </button>
                <span class="text-white font-black tracking-tighter text-base">{{ config.public.appName }}</span>
            </div>

            <div class="flex items-center gap-5">
                <NuxtLink to="/principal" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#ff9800] transition-all" v-tooltip.bottom="'Ir a la página principal'">
                    <i class="pi pi-home text-base"></i>
                </NuxtLink>

                <div class="text-right hidden md:block leading-none">
                    <p class="text-white text-[12px] font-black uppercase">{{ authStore.user?.login || 'Invitado' }}</p>
                    <p class="text-emerald-400 text-[10px] font-bold italic">En línea</p>
                </div>

                <button @click="openUserMenu" class="rounded-full ring-2 ring-transparent hover:ring-amber-400 transition-all" v-tooltip.bottom="'Mi cuenta'">
                    <img :src="avatarUrl" class="w-9 h-9 rounded-full border-2 border-white/20 object-cover" />
                </button>

                <!-- Popover lazy: solo se monta al primer clic -->
                <Popover
                    v-if="userMenuMounted"
                    ref="userMenu"
                    append-to="body"
                    :pt="{ root: { class: 'user-menu-popover' } }"
                >
                    <UserMenuContent
                        @change-password="onChangePassword"
                        @logout="handleLogout"
                    />
                </Popover>
            </div>
        </header>

        <div class="flex flex-1 overflow-hidden">
            <div
                v-if="isMobile && isSidebarOpen"
                class="fixed inset-0 bg-black/60 z-40 md:hidden"
                @click="isSidebarOpen = false"
            ></div>

            <aside
                :class="[
                    'bg-slate-100 border-r h-full z-50 transition-[width] duration-300 flex-shrink-0 overflow-hidden',
                    'fixed md:relative md:translate-x-0 top-0 left-0',
                    isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0',
                    isSidebarOpen ? 'w-44 md:w-48' : (isMobile ? 'w-44 md:w-48' : 'w-0')
                ]"
            >
                <SidebarMenu v-if="isSidebarOpen" />
            </aside>

            <main class="flex-1 min-h-0 bg-slate-50 flex flex-col overflow-hidden">
                <div class="flex-1 min-h-0 p-2 overflow-hidden">
                    <Suspense>
                        <slot :key="$route.fullPath" />
                        <template #fallback>
                            <div class="w-full h-full flex items-center justify-center flex-col gap-3">
                                <i class="pi pi-spin pi-spinner text-4xl text-sky-500"></i>
                                <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">Cargando
                                    módulo...</span>
                            </div>
                        </template>
                    </Suspense>
                </div>
                <footer class="px-6 py-2 border-t bg-white flex justify-between items-center flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span class="text-[10px] font-bold text-slate-500 uppercase">Sucursal: S-00{{ authStore.user?.sucursal_id }}</span>
                    </div>
                    <p class="text-slate-400 text-[10px] font-black uppercase">{{ config.public.appName }} v{{ config.public.appVersion }} • {{ new Date().getFullYear() }}</p>
                </footer>
            </main>
        </div>

        <!-- Lazy: solo se monta al abrir el modal -->
        <PasswordDialog
            v-if="showPasswordModal"
            v-model:visible="showPasswordModal"
        />
    </div>

    <!-- Fallback mientras no hay usuario -->
    <div v-else class="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0b1220]">
        <div class="text-center">
            <i class="pi pi-spin pi-spinner text-4xl text-slate-400"></i>
            <p class="mt-4 text-sm text-slate-500 font-semibold uppercase tracking-wider">Cerrando sesión...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, defineAsyncComponent } from 'vue';
    import { useRoute } from 'vue-router';
    import SidebarMenu from '~/components/layout/SidebarMenu.vue';

    const UserMenuContent = defineAsyncComponent(() => import('~/components/layout/UserMenuContent.vue'));
    const PasswordDialog = defineAsyncComponent(() => import('~/components/layout/PasswordDialog.vue'));

    const route = useRoute();
    const authStore = useAuthStore();
    const config = useRuntimeConfig();

    const userMenu = ref();
    const isSidebarOpen = ref<boolean>(true);
    const isMobile = ref<boolean>(false);
    const showPasswordModal = ref<boolean>(false);
    const userMenuMounted = ref<boolean>(false);

    const avatarUrl = computed(() => {
        const avatar = authStore.user?.avatar;
        if (!avatar) return `${config.public.apiBase}/avatars/0.png`;
        return avatar.toString().startsWith('http') ? avatar : `${config.public.apiBase}/avatars/${avatar}`;
    });

    const openUserMenu = async (event: Event): Promise<void> => {
        if (!userMenuMounted.value) {
            userMenuMounted.value = true;
            await nextTick();
        }
        userMenu.value?.toggle(event);
    };

    const onChangePassword = (): void => {
        userMenu.value?.hide();
        showPasswordModal.value = true;
    };

    const toggleSidebar = (): void => {
        isSidebarOpen.value = !isSidebarOpen.value;
    };

    // Detectar móvil — SIN forzar el estado en el primer render
    let mediaQuery: MediaQueryList | null = null;

    const handleMediaChange = (e: MediaQueryListEvent): void => {
        isMobile.value = e.matches;
        isSidebarOpen.value = !e.matches;
    };

    onMounted(() => {
        mediaQuery = window.matchMedia('(max-width: 767px)');
        isMobile.value = mediaQuery.matches;
        isSidebarOpen.value = !mediaQuery.matches;
        mediaQuery.addEventListener('change', handleMediaChange);
    });

    onBeforeUnmount(() => {
        mediaQuery?.removeEventListener('change', handleMediaChange);
    });

    // Cerrar sidebar al navegar (solo en móvil)
    watch(() => route.path, () => {
        if (isMobile.value) {
            isSidebarOpen.value = false;
        }
    }, { immediate: false });

    const handleLogout = async (): Promise<void> => {
        userMenu.value?.hide();
        await authStore.logout();
    };
</script>
