<!-- C:\sistemas\sicab\sicab-frontend\app\components\base\BaseTable.vue -->
<template>
    <div class="base-table h-full flex flex-col min-h-0">

        <!-- DESKTOP: tabla normal -->
        <DataTable
            v-if="viewportReady && isDesktop"
            v-bind="$attrs"
            lazy
            :class="['text-[11px]', tableClass, 'h-full flex flex-col']"
            :value="value"
            :loading="loading"
            :paginator="paginator"
            :rows="rows"
            :totalRecords="totalRecords"
            :first="first"
            :sortField="sortField"
            :sortOrder="sortOrder"
            :expandedRows="expandedRowsModel"
            :dataKey="rowKey || undefined"
            :selection="selectionModel"
            :selectionMode="selectionMode || undefined"
            @page="onPage"
            @sort="onSort"
            @update:expandedRows="onExpandedRowsUpdate"
            @update:selection="onSelectionUpdate"
            @row-select="onRowSelect"
            @row-unselect="onRowUnselect"
            @row-select-all="onRowSelectAll"
            @row-unselect-all="onRowUnselectAll"
            size="small"
            scrollable
            scrollHeight="flex"
            currentPageReportTemplate="{first} a {last} de {totalRecords}"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="rowsPerPageOptions"
        >
            <template #header>
                <slot name="header" />
            </template>

            <template
                v-for="column in columns"
                :key="column.field || column.template || column.header || (column.selection ? 'sel' : '') || (column.expander ? 'exp' : '')"
            >
                <!-- Columna expander -->
                <Column
                    v-if="column.expander"
                    expander
                    :class="column.class"
                    :style="column.style"
                />

                <!-- Columna selección (checkbox/radio) -->
                <Column
                    v-else-if="column.selection"
                    :selectionMode="selectionMode || 'multiple'"
                    :class="column.class"
                    :style="column.style || 'width: 3rem;'"
                    headerStyle="width: 3rem;"
                    bodyStyle="width: 3rem; text-align: center;"
                />

                <!-- Columna normal -->
                <Column
                    v-else
                    :field="column.field"
                    :sortable="column.sortable !== undefined ? column.sortable : true"
                    :headerClass="'bg-[var(--primary-dark)] text-white text-[10px] uppercase tracking-wider font-bold text-center ' + (column.headerClass || '')"
                    :bodyClass="'text-[11px] ' + (column.bodyClass || '')"
                    :class="column.class"
                    :style="column.style"
                >
                    <!-- ═══ HEADER: slot personalizado (header-<field>) o texto ═══ -->
                    <template #header>
                        <BaseDynamicSlot
                            v-if="resolveHeaderSlotName(column)"
                            :name="resolveHeaderSlotName(column)!"
                            :data="headerSlotData"
                            :slots="slots as any"
                        />
                        <template v-else>
                            {{ column.header }}
                        </template>
                    </template>

                    <!-- ═══ BODY ═══ -->
                    <template #body="slotProps">
                        <BaseDynamicSlot
                            v-if="column.template && slots[column.template]"
                            :name="column.template"
                            :data="slotProps.data"
                            :slots="slots as any"
                        />
                        <template v-else>
                            {{ getFieldValue(slotProps.data, column.field) }}
                        </template>
                    </template>
                </Column>
            </template>

            <!-- ═══ ESTADO VACÍO (desktop) ═══ -->
            <template v-if="$slots.empty" #empty>
                <slot name="empty" />
            </template>

            <!-- Slot de expansión (desktop) -->
            <template #expansion="{ data }">
                <slot name="expansion" :data="data" />
            </template>
        </DataTable>

        <!-- MÓVIL: tarjetas generadas con v-for -->
        <div
            v-else-if="viewportReady"
            class="flex flex-col w-full h-full min-h-0 overflow-y-auto"
        >
            <!-- Filtros (slot header) -->
            <div class="flex-shrink-0">
                <slot name="header" />
            </div>

            <!-- Barra de selección móvil (solo multiple) -->
            <div
                v-if="selectionMode === 'multiple' && value.length > 0"
                class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 my-2 flex-shrink-0"
            >
                <label class="flex items-center gap-2 text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        :checked="allSelected"
                        :indeterminate.prop="someSelected && !allSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 accent-[var(--primary-dark)]"
                    />
                    <span>Seleccionar todo</span>
                </label>
                <span class="text-[10px] font-bold text-slate-500">
                    {{ selectedCount }} seleccionado(s)
                </span>
            </div>

            <!-- Estado de carga -->
            <div
                v-if="loading"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center"
            >
                <p class="text-xs font-semibold text-slate-500">
                    Cargando registros...
                </p>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="value.length === 0"
                class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                <slot name="empty">
                    <p class="text-xs font-semibold text-slate-500">
                        No se encontraron registros.
                    </p>
                </slot>
            </div>

            <!-- Tarjetas + paginador -->
            <template v-else>
                <div
                    class="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 pb-1
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-thumb]:bg-slate-300
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent"
                >
                    <div
                        v-for="(item, idx) in value"
                        :key="rowKey ? item[rowKey] : idx"
                        class="flex-shrink-0 bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden transition-all"
                        :class="{ 'ring-2 ring-blue-400 border-blue-400': isSelected(item) }"
                    >
                        <!-- Checkbox/radio de selección (solo si selectionMode) -->
                        <label
                            v-if="selectionMode"
                            class="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200 cursor-pointer select-none"
                        >
                            <input
                                :type="selectionMode === 'single' ? 'radio' : 'checkbox'"
                                :name="selectionMode === 'single' ? 'row-selection' : undefined"
                                :checked="isSelected(item)"
                                @change="toggleRow(item)"
                                class="w-4 h-4 accent-[var(--primary-dark)]"
                            />
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Seleccionar
                            </span>
                        </label>

                        <div
                            v-for="column in columns"
                            :key="column.field || column.template || column.header || (column.selection ? 'sel' : '') || (column.expander ? 'exp' : '')"
                            v-show="!column.expander && !column.selection"
                            class="flex justify-between items-start gap-4 px-4 py-3 border-b border-dashed border-slate-200 last:border-b-0"
                        >
                            <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-dark)] flex-shrink-0 pt-0.5">
                                {{ column.header }}
                            </span>
                            <div class="text-[11px] text-right flex-1">
                                <BaseDynamicSlot
                                    v-if="resolveSlotName(column.template)"
                                    :name="resolveSlotName(column.template)!"
                                    :data="item"
                                    :slots="slots as any"
                                />
                                <template v-else-if="column.field">
                                    {{ getFieldValue(item, column.field) }}
                                </template>
                            </div>
                        </div>

                        <!-- Expansión en móvil -->
                        <div
                            v-if="slots.expansion"
                            class="px-3 pb-3 pt-1 border-t border-dashed border-slate-200 bg-slate-50"
                        >
                            <slot name="expansion" :data="item" />
                        </div>
                    </div>
                </div>

                <!-- Paginador móvil -->
                <div
                    v-if="paginator && totalRecords > 0"
                    class="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-3 py-2 mt-2 flex-shrink-0"
                >
                    <BaseButton
                        icon="pi pi-angle-left"
                        variant="secondary-light"
                        size="sm"
                        :disabled="first === 0"
                        @click="onPage({ first: Math.max(0, first - rows), rows })"
                    />
                    <span class="text-[10px] font-bold text-slate-600">
                        {{ first + 1 }} – {{ Math.min(first + rows, totalRecords) }} de {{ totalRecords }}
                    </span>
                    <select
                        :value="rows"
                        @change="onRowsChange"
                        class="text-[10px] font-bold border border-slate-300 rounded px-1 py-0.5 bg-white"
                    >
                        <option v-for="n in rowsPerPageOptions" :key="n" :value="n">{{ n }}</option>
                    </select>
                    <BaseButton
                        icon="pi pi-angle-right"
                        variant="secondary-light"
                        size="sm"
                        :disabled="first + rows >= totalRecords"
                        @click="onPage({ first: first + rows, rows })"
                    />
                </div>
            </template>
        </div>

        <!-- Placeholder mientras se determina el viewport -->
        <div
            v-else
            class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center"
        >
            <p class="text-xs font-semibold text-slate-400">
                Cargando vista...
            </p>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
    import { ref, onMounted, onBeforeUnmount, computed, useSlots } from 'vue';

    const slots = useSlots();

    type BaseSlots<T> = {
        header?: () => any;
        expansion?: (props: { data: T }) => any;
        empty?: () => any;
    } & {
        [K in `body-${string}`]?: (props: { data: T }) => any;
    } & {
        [K in `header-${string}`]?: (props: { data: T }) => any;
    };

    interface TableColumn<T> {
        field?: (keyof T & string) | string;
        header?: string;
        sortable?: boolean;
        template?: string;
        headerSlot?: string;
        headerClass?: string;
        bodyClass?: string;
        class?: string;
        style?: string;
        expander?: boolean;
        selection?: boolean;
        hideOnMobile?: boolean;
    }

    const props = withDefaults(defineProps<{
        value: T[];
        loading?: boolean;
        paginator?: boolean;
        rows?: number;
        totalRecords?: number;
        first?: number;
        sortField?: string;
        sortOrder?: number;
        columns: TableColumn<T>[];
        rowKey?: string;
        tableClass?: string;
        /** Filas expandidas (v-model) */
        expandedRows?: any[] | Record<string, boolean>;
        /** Modo de selección. `null` = desactivado (default) */
        selectionMode?: 'single' | 'multiple' | null;
        /** Filas seleccionadas (v-model). En 'multiple' es array; en 'single' es objeto. */
        selection?: T[] | T | null;
        /** Datos que se pasan a los slots `header-<field>` (opcional). */
        headerSlotData?: Record<string, any>;
        /** Opciones de filas por página en el paginador */
        rowsPerPageOptions?: number[];
    }>(), {
        loading: false,
        paginator: true,
        rows: 10,
        totalRecords: 0,
        first: 0,
        sortField: '',
        sortOrder: 1,
        rowKey: '',
        tableClass: '',
        expandedRows: () => [],
        selectionMode: null,
        selection: null,
        headerSlotData: () => ({}),
        rowsPerPageOptions: () => [10, 20, 50, 100],
    });

    const emit = defineEmits<{
        (e: 'page', event: any): void;
        (e: 'sort', event: any): void;
        (e: 'update:expandedRows', value: any): void;
        (e: 'update:selection', value: any): void;
        (e: 'row-select', event: any): void;
        (e: 'row-unselect', event: any): void;
        (e: 'row-select-all', event: any): void;
        (e: 'row-unselect-all', event: any): void;
    }>();

    defineSlots<BaseSlots<T>>();

    // ============ EXPANSIÓN ============
    const expandedRowsModel = computed({
        get: () => props.expandedRows,
        set: (val) => emit('update:expandedRows', val),
    });

    const onExpandedRowsUpdate = (val: any) => {
        emit('update:expandedRows', val);
    };

    // ============ SELECCIÓN ============
    const selectionModel = computed<any>({
        get: () => {
            if (props.selectionMode === 'multiple') {
                return Array.isArray(props.selection) ? props.selection : [];
            }
            return props.selection;
        },
        set: (val) => emit('update:selection', val),
    });

    const onSelectionUpdate = (val: any) => {
        emit('update:selection', val);
    };

    const onRowSelect = (event: any) => emit('row-select', event);
    const onRowUnselect = (event: any) => emit('row-unselect', event);
    const onRowSelectAll = (event: any) => emit('row-select-all', event);
    const onRowUnselectAll = (event: any) => emit('row-unselect-all', event);

    const selectedCount = computed(() => {
        if (props.selectionMode === 'multiple') {
            return Array.isArray(props.selection) ? props.selection.length : 0;
        }
        return props.selection ? 1 : 0;
    });

    const isSelected = (item: T): boolean => {
        if (!props.selectionMode) return false;
        const key = props.rowKey;
        const sel = Array.isArray(props.selection)
            ? props.selection
            : (props.selection ? [props.selection] : []);
        if (key) {
            return sel.some((s: any) => s?.[key] === item?.[key]);
        }
        return sel.includes(item);
    };

    const allSelected = computed(() => {
        if (props.selectionMode !== 'multiple') return false;
        return props.value.length > 0 && props.value.every((item) => isSelected(item));
    });

    const someSelected = computed(() => {
        if (props.selectionMode !== 'multiple') return false;
        return props.value.some((item) => isSelected(item));
    });

    const toggleRow = (item: T) => {
        if (!props.selectionMode) return;
        const current = Array.isArray(props.selection)
            ? [...props.selection]
            : (props.selection ? [props.selection] : []);
        const key = props.rowKey;

        const exists = key
            ? current.some((s: any) => s?.[key] === item?.[key])
            : current.includes(item);

        let next: T[];
        if (exists) {
            next = key
                ? current.filter((s: any) => s?.[key] !== item?.[key])
                : current.filter((s) => s !== item);
        } else {
            if (props.selectionMode === 'single') {
                next = [item];
            } else {
                next = [...current, item];
            }
        }
        emit('update:selection', props.selectionMode === 'single' ? (next[0] ?? null) : next);
    };

    const toggleSelectAll = () => {
        if (props.selectionMode !== 'multiple') return;
        if (allSelected.value) {
            emit('update:selection', []);
        } else {
            emit('update:selection', [...props.value]);
        }
    };

    // ============ EVENTOS ============
    const onPage = (event: any) => emit('page', event);
    const onSort = (event: any) => emit('sort', event);

    const onRowsChange = (event: Event) => {
        const newRows = Number((event.target as HTMLSelectElement).value);
        emit('page', {
            first: 0,
            rows: newRows,
            page: 0,
            sortField: props.sortField,
            sortOrder: props.sortOrder,
        });
    };

    // ============ HELPERS ============
    function getFieldValue(item: T, field?: string | keyof T): unknown {
        if (!field) return '';
        const fieldStr = String(field);
        if (fieldStr.includes('.')) {
            const keys = fieldStr.split('.');
            let result: any = item;
            for (const key of keys) {
                if (result == null) return '';
                result = result[key];
            }
            return result ?? '';
        }
        const value = item[field as keyof T];
        return value ?? '';
    }

    function resolveSlotName(template?: string): string | null {
        if (!template) return null;
        if (slots[template]) return template;
        const conPrefijo = `body-${template}`;
        if (slots[conPrefijo]) return conPrefijo;
        if (template.startsWith('body-')) {
            const sinPrefijo = template.slice(5);
            if (slots[sinPrefijo]) return sinPrefijo;
        }
        return null;
    }

    /** Resuelve el nombre del slot de header para una columna. */
    function resolveHeaderSlotName(column: TableColumn<T>): string | null {
        // 1. Si la columna declara headerSlot explícito
        if (column.headerSlot && slots[column.headerSlot]) return column.headerSlot;

        // 2. Convención: header-<field>
        if (column.field) {
            const conPrefijo = `header-${column.field}`;
            if (slots[conPrefijo]) return conPrefijo;
        }

        // 3. Convención: header-<template-sin-body>
        if (column.template && column.template.startsWith('body-')) {
            const conPrefijo = `header-${column.template.slice(5)}`;
            if (slots[conPrefijo]) return conPrefijo;
        }

        return null;
    }

    // ============ VIEWPORT ============
    const viewportReady = ref(false);
    const isDesktop = ref(false);
    let mediaQuery: MediaQueryList | null = null;

    const updateIsDesktop = (event: MediaQueryListEvent) => {
        isDesktop.value = !event.matches;
    };

    onMounted(() => {
        mediaQuery = window.matchMedia('(max-width: 768px)');
        isDesktop.value = !mediaQuery.matches;
        viewportReady.value = true;
        mediaQuery.addEventListener('change', updateIsDesktop);
    });

    onBeforeUnmount(() => {
        mediaQuery?.removeEventListener('change', updateIsDesktop);
    });
</script>
