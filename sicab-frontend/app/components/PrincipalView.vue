<!-- C:\sistemas\sicab\sicab-frontend\app\components\PrincipalView.vue -->
<template>
    <div class="max-w-5xl mx-auto space-y-8">
        <!-- Sección de Bienvenida (Estática) -->
        <div class="border-b border-slate-300 dark:border-slate-700 pb-6">
            <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                ¡Bienvenido al Sistema!
            </h1>
            <div class="flex flex-wrap items-center gap-4 mt-2">
                <div class="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                    <i class="pi pi-shield text-blue-600 text-sm"></i>
                    <span class="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                        Acceso Concedido
                    </span>
                </div>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <i class="pi pi-check-circle text-emerald-500"></i> Sesión iniciada correctamente
                </p>
            </div>
        </div>

        <!-- Tarjeta Principal: Resumen del Sistema -->
        <BaseCard class="overflow-hidden">
            <!-- Encabezado con gradiente azul y icono de taxi -->
            <div class="relative h-32 bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 flex items-center px-8 overflow-hidden">
                <!-- Patrón decorativo de fondo -->
                <div class="absolute inset-0 opacity-10">
                    <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>
                <div class="relative z-10 flex items-center gap-4">
                    <div class="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
                        <i class="pi pi-car text-white text-3xl"></i>
                    </div>
                    <div>
                        <h2 class="text-white text-2xl font-black tracking-tight">Central de Radiotaxis</h2>
                        <p class="text-white/80 text-sm font-medium">Control operativo integral de la flota y conductores</p>
                    </div>
                </div>
            </div>

            <!-- Resumen de lo que controla el sistema -->
            <div class="p-6 bg-white dark:bg-slate-800">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Flota y Vehículos -->
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 transition-colors">
                        <div class="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                            <i class="pi pi-car text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide">Flota y Vehículos</h3>
                            <p class="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Registro de móviles, placas, kilometraje, documentos legales (SOAT, revisión técnica) y estado operativo de cada unidad.
                            </p>
                        </div>
                    </div>

                    <!-- Conductores y Personal -->
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 transition-colors">
                        <div class="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                            <i class="pi pi-users text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide">Conductores y Personal</h3>
                            <p class="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Trabajadores, cargos, antecedentes, puntajes y categorización automática (M-J-K-X) según desempeño.
                            </p>
                        </div>
                    </div>

                    <!-- Operación Diaria -->
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 transition-colors">
                        <div class="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                            <i class="pi pi-map-marker text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide">Operación Diaria</h3>
                            <p class="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Asignaciones de turnos, despacho de viajes, solicitudes de carrera y seguimiento en tiempo real.
                            </p>
                        </div>
                    </div>

                    <!-- Cobros y Frecuencias -->
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 transition-colors">
                        <div class="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                            <i class="pi pi-money-bill text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide">Cobros y Frecuencias</h3>
                            <p class="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Obligaciones semanales, pagos, morosidad y suspensión automática de móviles por deudas.
                            </p>
                        </div>
                    </div>

                    <!-- Mantenimiento -->
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 transition-colors">
                        <div class="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                            <i class="pi pi-wrench text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide">Mantenimiento</h3>
                            <p class="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Servicios preventivos, correctivos y de emergencia. Alertas por kilometraje, vencimiento y rendimiento.
                            </p>
                        </div>
                    </div>

                    <!-- Seguridad y Auditoría -->
                    <div class="flex items-start gap-4 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 transition-colors">
                        <div class="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 flex-shrink-0">
                            <i class="pi pi-shield text-white text-lg"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-blue-900 dark:text-blue-200 uppercase tracking-wide">Seguridad y Auditoría</h3>
                            <p class="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 leading-relaxed">
                                Roles, permisos granulares, menús dinámicos y trazabilidad completa de cada operación.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Barra inferior -->
                <div class="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span class="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                            Sistema Operativo
                        </span>
                    </div>
                    <div class="flex items-center gap-6 text-xs text-blue-700 dark:text-blue-400">
                        <span class="flex items-center gap-1.5">
                            <i class="pi pi-database text-blue-500"></i>
                            <span class="font-semibold">PostgreSQL</span>
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i class="pi pi-shield text-blue-500"></i>
                            <span class="font-semibold">Auditoría Activa</span>
                        </span>
                        <span class="flex items-center gap-1.5">
                            <i class="pi pi-check-circle text-blue-500"></i>
                            <span class="font-semibold">Estados 1000/1001/1002/1003</span>
                        </span>
                    </div>
                </div>
            </div>
        </BaseCard>
    </div>
</template>

<script setup lang="ts">
    // Medir cuándo se monta el componente
    onMounted(() => {
        const t = performance.now();
        console.log(`%c⏱️ PrincipalView montado: ${t.toFixed(2)}ms`, 'color: #3b82f6');

        // Medir cuándo se cargan las fuentes
        if (document.fonts) {
            document.fonts.ready.then(() => {
                const tf = performance.now();
                console.log(`%c🔤 Fuentes cargadas: ${tf.toFixed(2)}ms`, 'color: #8b5cf6');
            });
        }

        // Medir el paint inicial
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const tp = performance.now();
                console.log(`%c🎨 Paint completado: ${tp.toFixed(2)}ms`, 'color: #10b981');
            });
        });
    });
</script>