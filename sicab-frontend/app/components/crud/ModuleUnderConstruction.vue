<!-- C:\sistemas\sicab\sicab-frontend\app\components\crud\ModuleUnderConstruction.vue -->
<template>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border border-amber-200 mb-4">
            <i class="pi pi-wrench text-4xl text-amber-500"></i>
        </div>

        <h2 class="text-xl font-black text-slate-800 mb-2">
            {{ title }}
        </h2>

        <p class="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {{ message }}
        </p>

        <div v-if="showBackButton" class="mt-6">
            <NuxtLink
                to="/principal"
                class="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-sky-700 transition-colors shadow-sm"
            >
                <i class="pi pi-home text-xs"></i>
                Volver al inicio
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
    interface Props {
        title?: string;
        message?: string;
        showBackButton?: boolean;
    }

    withDefaults(defineProps<Props>(), {
        title: 'Módulo en construcción',
        message: 'Este módulo estará disponible próximamente.',
        showBackButton: true,
    });
</script>
