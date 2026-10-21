<!-- C:\sistemas\sicab\sicab-frontend\app\pages\base.vue -->
<template>
    <div class="min-h-[70vh] flex items-center justify-center px-4">
        <div class="flex flex-col items-center text-center gap-4 max-w-md">

            <!-- Icono -->
            <div class="bg-sky-600 p-5 rounded-2xl shadow-lg">
                <i class="pi pi-wrench text-white text-4xl"></i>
            </div>

            <!-- Título -->
            <h1 class="text-2xl font-black text-sky-900 uppercase tracking-wider">
                En Construcción
            </h1>

            <!-- Subtítulo -->
            <p class="text-sm text-slate-600 leading-relaxed">
                Esta sección todavía no está disponible.
                Estamos trabajando para tenerla lista pronto.
            </p>

            <!-- Badge -->
            <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                <i class="pi pi-clock text-[10px]"></i>
                Próximamente
            </span>

            <!-- Botón volver -->
            <BaseButton label="Volver al inicio" icon="pi pi-arrow-left" variant="primary" size="sm" class="mt-2"
                @click="volver" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useRouter } from 'vue-router';

    useHead({ title: 'En Construcción' });

    const router = useRouter();

    const volver = (): void => {
        router.push('/');
    };
</script>
