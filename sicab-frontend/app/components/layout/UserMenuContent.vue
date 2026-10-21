<!-- C:\sistemas\sicab\sicab-frontend\app\components\layout\UserMenuContent.vue -->
<template>
    <BaseCard variant="outline" class="w-72">
        <!-- Header compacto -->
        <div class="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100/70 to-slate-100 border-b border-slate-200">
            <div class="relative flex-shrink-0">
                <img :src="avatarUrl" class="w-10 h-10 rounded-full border-2 border-amber-500 object-cover" />
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
                <span class="text-xs font-black text-slate-800 uppercase tracking-tight truncate">
                    {{ authStore.user?.login }}
                </span>
                <span class="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                    <span class="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span> En línea
                </span>
            </div>
        </div>

        <!-- Datos en formato compacto -->
        <div class="px-3 py-2 space-y-1.5 text-[10px]">
            <div class="flex items-center justify-between gap-2">
                <span class="font-normal text-slate-900 uppercase tracking-wider text-[10px] flex-shrink-0">Nombre</span>
                <span class="font-semibold text-slate-700 truncate text-right">
                    {{ authStore.user?.trabajador_nombre_completo || '-' }}
                </span>
            </div>
            <div class="flex items-center justify-between gap-2">
                <span class="font-normal text-slate-900 uppercase tracking-wider text-[10px] flex-shrink-0">DNI</span>
                <span class="font-semibold text-slate-700">{{ authStore.user?.trabajador_dni || '-' }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
                <span class="font-normal text-slate-900 uppercase tracking-wider text-[10px] flex-shrink-0">Empresa</span>
                <span class="font-semibold text-slate-700 truncate text-right">
                    {{ authStore.user?.empresa_nombre || '-' }}
                </span>
            </div>
            <div class="flex items-center justify-between gap-2">
                <span class="font-normal text-slate-900 uppercase tracking-wider text-[10px] flex-shrink-0">Sucursal</span>
                <span class="font-semibold text-slate-700 truncate text-right">
                    {{ authStore.user?.sucursal_nombre || '-' }}
                </span>
            </div>
            <div class="flex items-center justify-between gap-2">
                <span class="font-normal text-slate-900 uppercase tracking-wider text-[10px] flex-shrink-0">Cargo</span>
                <span class="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full text-[9px] truncate">
                    {{ authStore.user?.cargo_nombre || '-' }}
                </span>
            </div>
            <div class="flex items-center justify-between gap-2">
                <span class="font-normal text-slate-900 uppercase tracking-wider text-[10px] flex-shrink-0">Rol</span>
                <span class="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full text-[9px] truncate">
                    {{ authStore.user?.rol_nombre || '-' }}
                </span>
            </div>
        </div>

        <!-- Acciones -->
        <div class="border-t border-slate-200">
            <button
                @click="$emit('change-password')"
                class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gradient-to-r hover:from-amber-100 hover:to-amber-200 text-slate-700 transition-all group"
            >
                <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all flex-shrink-0">
                    <i class="pi pi-lock text-[10px]"></i>
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider">Cambiar Contraseña</span>
            </button>
            <button
                @click="$emit('logout')"
                class="w-full flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200 transition-colors border-t border-slate-100 group"
            >
                <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-red-500 group-hover:text-white transition-all flex-shrink-0">
                    <i class="pi pi-power-off text-[10px]"></i>
                </div>
                <span class="text-[10px] font-bold text-red-500 uppercase tracking-widest">Cerrar sesión</span>
            </button>
        </div>
    </BaseCard>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    defineEmits<{
        'change-password': [];
        'logout': [];
    }>();

    const authStore = useAuthStore();
    const config = useRuntimeConfig();

    const avatarUrl = computed(() => {
        const avatar = authStore.user?.avatar;
        if (!avatar) return `${config.public.apiBase}/avatars/0.png`;
        return avatar.toString().startsWith('http') ? avatar : `${config.public.apiBase}/avatars/${avatar}`;
    });
</script>
