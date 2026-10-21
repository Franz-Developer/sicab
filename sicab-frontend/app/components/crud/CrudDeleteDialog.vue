<!-- C:\sistemas\sicab\sicab-frontend\app\components\crud\CrudDeleteDialog.vue -->
<template>
    <Dialog
        v-model:visible="visible"
        :style="{ width: '420px' }"
        :modal="true"
        :draggable="false"
        :showHeader="false"
        :pt="{
            root: { class: 'crud-delete-dialog !p-0 overflow-hidden rounded-2xl shadow-2xl', autofocus: false },
            header: { class: '!hidden !p-0' },
            content: { class: '!p-0 !overflow-visible' },
            footer: { class: '!p-0' },
        }"
        @show="focusCancelButton"
    >
        <!-- Header visible -->
        <div class="flex items-center justify-between px-5 py-2.5 bg-amber-100">
            <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h3 class="text-xs font-black text-amber-900 uppercase tracking-wider">
                    {{ title }}
                </h3>
            </div>
            <button
                type="button"
                tabindex="-1"
                class="ripple-btn w-7 h-7 flex items-center justify-center rounded-lg text-amber-600 hover:bg-amber-200 hover:text-amber-800 transition-colors"
                @click="visible = false"
            >
                <i class="pi pi-times text-xs"></i>
            </button>
        </div>

        <!-- Body -->
        <div class="px-5 py-3 bg-amber-100">
            <div class="flex items-start gap-3">
                <div class="relative flex-shrink-0">
                    <div class="absolute inset-0 rounded-full bg-amber-300/40"></div>
                    <i class="pi pi-exclamation-triangle text-4xl text-amber-700 relative pt-0.5"></i>
                </div>

                <div class="flex-1 pt-0.5">
                    <h4 class="text-sm font-extrabold text-slate-900 leading-tight">
                        ¿Eliminar permanentemente?
                    </h4>
                    <p class="text-[11px] text-slate-800 mt-0.5 leading-relaxed">
                        Esta acción eliminará el registro de forma definitiva.
                    </p>
                </div>
            </div>

            <!-- Caja del ítem: SIN borde -->
            <div class="mt-2.5 p-2.5 rounded-xl flex items-center justify-center gap-2.5">
                <span class="text-sm font-bold text-slate-900 break-all leading-snug">
                    {{ itemName }}
                </span>
            </div>
        </div>

        <!-- Footer -->
        <template #footer>
            <div class="flex items-center justify-center gap-2 px-5 pt-2.5 pb-4 bg-amber-100 rounded-b-2xl !w-full">
                <BaseButton
                    ref="cancelBtnRef"
                    label="Cancelar"
                    icon="pi pi-times"
                    variant="dialog-cancel"
                    size="sm"
                    class="!text-[11px] !px-3 !py-1.5"
                    @click="visible = false"
                />
                <BaseButton
                    label="Sí, eliminar"
                    icon="pi pi-trash"
                    variant="danger"
                    size="sm"
                    class="!text-[11px] !px-3 !py-1.5"
                    @click="$emit('confirm')"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup lang="ts">
    import { ref, nextTick, computed } from 'vue';

    const props = defineProps<{
        visible: boolean;
        title: string;
        itemName: string;
    }>();

    const emit = defineEmits<{
        'update:visible': [value: boolean];
        confirm: [];
    }>();

    const visible = computed({
        get: () => props.visible,
        set: (val) => emit('update:visible', val),
    });

    const cancelBtnRef = ref<any>(null);

    const focusCancelButton = async () => {
        await nextTick();
        setTimeout(() => {
            requestAnimationFrame(() => {
                cancelBtnRef.value?.focus();
            });
        }, 50);
    };
</script>
