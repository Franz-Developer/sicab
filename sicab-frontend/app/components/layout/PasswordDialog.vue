<!-- C:\sistemas\sicab\sicab-frontend\app\components\layout\PasswordDialog.vue -->
<template>
    <Dialog
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :modal="true"
        :draggable="false"
        :closable="!isUpdatingPassword"
        class="w-[90vw] md:w-[450px]"
    >
        <template #header>
            <div class="flex items-center gap-4">
                <div class="bg-[var(--primary-dark)] p-2 rounded-lg shadow-md">
                    <i class="pi pi-lock text-white text-lg"></i>
                </div>
                <div>
                    <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight">Actualizar Contraseña</h3>
                    <p class="text-[10px] text-slate-500">Asegura tu cuenta con una clave robusta</p>
                </div>
            </div>
        </template>

        <div class="flex flex-col gap-y-4 pt-2">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div class="flex justify-between items-center mb-4 text-blue-700 uppercase font-black text-[10px]">
                    <span>Seguridad de la Cuenta</span>
                </div>
                <div class="flex flex-col gap-5">
                    <div class="flex flex-col gap-1.5">
                        <label class="block text-[11px] font-bold text-slate-600 uppercase">Contraseña Actual <span class="text-red-500">*</span></label>
                        <BaseInput v-model="currentPassword" type="password" placeholder="Ingrese su clave actual" size="sm" />
                    </div>
                    <div class="border-t border-dashed border-slate-100 my-1"></div>
                    <div class="flex flex-col gap-1.5">
                        <label class="block text-[11px] font-bold text-slate-600 uppercase">Nueva Contraseña <span class="text-red-500">*</span></label>
                        <Password v-model="newPassword" toggleMask class="w-full" inputClass="w-full p-2.5 border !rounded-lg text-sm" placeholder="Nueva clave" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="block text-[11px] font-bold text-slate-600 uppercase">Confirmar Contraseña <span class="text-red-500">*</span></label>
                        <Password v-model="confirmPassword" toggleMask :feedback="false" class="w-full" inputClass="w-full p-2.5 border !rounded-lg text-sm" placeholder="Repita su nueva clave" />
                    </div>
                    <div v-if="passwordError" class="mt-4 flex items-start gap-3 text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 animate-pulse">
                        <i class="pi pi-exclamation-triangle mt-1 text-sm"></i>
                        <div class="flex flex-col"><span class="text-[10px] font-black uppercase">Error de Seguridad</span><p class="text-[11px] font-semibold">{{ passwordError }}</p></div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end gap-3">
                <BaseButton label="Cancelar" icon="pi pi-times" :loading="isUpdatingPassword" variant="danger" @click="close" />
                <BaseButton label="Guardar Cambios" icon="pi pi-check" :loading="isUpdatingPassword" variant="primary" @click="handleUpdate" />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue';

    const props = defineProps<{ visible: boolean }>();
    const emit = defineEmits<{
        'update:visible': [value: boolean];
        'updated': [];
    }>();

    const { notify } = useNotify();
    const authStore = useAuthStore();
    const { $api } = useNuxtApp() as any;

    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const passwordError = ref<string | null>(null);
    const isUpdatingPassword = ref(false);

    watch(() => props.visible, (v) => {
        if (v) {
            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            passwordError.value = '';
        }
    });

    const close = () => emit('update:visible', false);

    const handleUpdate = async () => {
        isUpdatingPassword.value = true;
        passwordError.value = null;
        if (!authStore.user?.usuario_id) {
            notify('warn', 'Acceso Denegado', 'No se encontró usuario activo');
            isUpdatingPassword.value = false;
            return;
        }

        try {
            await $api(`/usuarios/${authStore.user.usuario_id}/password`, {
                method: 'PATCH',
                body: {
                    contrasenaActual: currentPassword.value,
                    nuevaContrasena: newPassword.value,
                    confirmarContrasena: confirmPassword.value,
                },
            });
            notify('success', 'Éxito', 'Contraseña actualizada correctamente');
            emit('updated');
            close();
        } catch (e: any) {
            const m = e?.data?.message || 'Error inesperado';
            passwordError.value = Array.isArray(m) ? m.join(', ') : m;
            notify('error', 'Error de Actualización', passwordError.value);
        } finally {
            isUpdatingPassword.value = false;
        }
    };
</script>