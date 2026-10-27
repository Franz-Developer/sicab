// C:\sistemas\sicab\sicab-frontend\app\composables\useCrudTable.ts
import { useCrudService, type FindParams } from '~/services/crud.service';
import { formatearMensajeError } from '~/constants/nombres-tablas.constant'

export interface UseCrudTableOptions<T> {
    tabla: string;
    tablaPermisos?: string;
    getCleanForm: () => T;
    getPrimaryKey?: (item: T) => number | string;
    buildPayload: (form: T) => Partial<T>;
    validate?: (form: T, rules: any, notify: any) => boolean | Promise<boolean>;
    sortFieldDefault?: string;
    sortOrderDefault?: number;
    rowsDefault?: number;
    autoLoad?: boolean;
    defaultFilters?: Record<string, any>;
    getExtraFilters?: (filters: Record<string, any>) => Record<string, any>;
    camposProtegidosPorDependencia?: string[];
}

const generarCandidatosPK = (tabla: string): string[] => {
    const candidatos = new Set<string>();

    candidatos.add('id');
    candidatos.add(`${tabla}_id`);

    const sinS = tabla.replace(/s$/, '');
    candidatos.add(`${sinS}_id`);

    const singularPorPalabra = tabla
        .split('_')
        .map((palabra) => palabra.replace(/s$/, ''))
        .join('_');
    candidatos.add(`${singularPorPalabra}_id`);

    const palabras = tabla.split('_');
    const ultimaPalabra = palabras[palabras.length - 1] ?? '';
    const ultimaSingular = ultimaPalabra.replace(/s$/, '');
    if (ultimaSingular) {
        candidatos.add(`${ultimaSingular}_id`);
    }

    const casosEspeciales: Record<string, string> = {
        'trabajador_antecedentes': 'antecedente_id',
        'roles': 'rol_id',
        'roles_permisos_tablas': 'rol_permiso_tabla_id',
        'roles_menus': 'rol_menu_id',
        'parametros_globales': 'parametro_id',
        'tareas_programadas': 'tarea_id',
    };

    const pkEspecial = casosEspeciales[tabla];
    if (pkEspecial) {
        candidatos.add(pkEspecial);
    }

    return Array.from(candidatos);
};

export const useCrudTable = <T extends { [k: string]: any }>(opts: UseCrudTableOptions<T>) => {
    const { notify } = useNotify();
    const { $rules } = useNuxtApp() as any;

    const crud = useCrudService<T>(opts.tabla);
    const permisos = crud.permisos(opts.tablaPermisos);

    const resolvePK = (item: T): number | string => {
        if (opts.getPrimaryKey) return opts.getPrimaryKey(item);

        const candidatos = generarCandidatosPK(opts.tabla);

        for (const key of candidatos) {
            const valor = item[key];
            if (valor !== undefined && valor !== null && valor !== '') {
                return valor;
            }
        }

        throw new Error(
            `[useCrudTable] No se pudo resolver la PK de "${opts.tabla}". ` +
            `Candidatos probados: ${candidatos.join(', ')}. ` +
            `Define getPrimaryKey() en las opciones del composable.`
        );
    };

    // ---------- Estado del listado ----------
    const items = ref<T[]>([]) as Ref<T[]>;
    const loading = ref(false);
    const totalRecords = ref(0);
    const filters = ref<Record<string, any>>({
        global: '',
        ...(opts.defaultFilters ?? {}),
    });
    const lazyParams = ref({
        first: 0,
        rows: opts.rowsDefault ?? 20,
        page: 0,
        sortField: opts.sortFieldDefault ?? 'id',
        sortOrder: 1,
    });

    // ---------- Estado del formulario ----------
    const dialog = ref(false);
    const deleteDialog = ref(false);
    const formObj = ref<T>(opts.getCleanForm()) as Ref<T>;
    const submitted = ref(false);
    const touched = ref<Record<string, boolean>>({});

    const isUpdate = computed(() => {
        try {
            const pk = resolvePK(formObj.value);
            return pk !== null && pk !== undefined && pk !== '' && pk !== 0;
        } catch {
            return false;
        }
    });

    const formTitle = computed(() => (isUpdate.value ? 'Editar registro' : 'Nuevo registro'));

    // ---------- Campos protegidos por dependencias ----------
    const camposProtegidos = computed<string[]>(() => {
        if (!formObj.value?.tiene_dependencias) return [];
        return opts.camposProtegidosPorDependencia ?? formObj.value?.campos_protegidos ?? [];
    });

    const estaProtegido = (campo: string): boolean => {
        return camposProtegidos.value.includes(campo);
    };

    // ---------- Cargar listado ----------
    const load = async (search = '', silent = false) => {
        if (!silent) { loading.value = true; }
        try {
            const params: FindParams = {
                limit: lazyParams.value.rows,
                offset: lazyParams.value.first,
                sortField: lazyParams.value.sortField,
                sortOrder: lazyParams.value.sortOrder,
            };
            if (search?.trim()) params.q = search.trim();
            if (opts.getExtraFilters) {
                Object.assign(params, opts.getExtraFilters(filters.value));
            }

            const response = await crud.listar(params);
            items.value = response.data || [];
            totalRecords.value = response.total || 0;
        } catch (err: any) {
            const msg = err?.data?.message
                ?? err?.response?._data?.message
                ?? err?.message
                ?? 'Error al cargar la lista.';
            notify('error', 'Error al cargar', Array.isArray(msg) ? msg.join(', ') : msg);
            console.error(`Error al cargar ${opts.tabla}:`, err);
        } finally {
            if (!silent) loading.value = false;
        }
    };

    // ---------- Paginación / orden / búsqueda ----------
    const onPage = (event: any) => {
        lazyParams.value = event;
        load(filters.value.global, true);
    };

    const onSort = (event: any) => {
        lazyParams.value = event;
        load(filters.value.global, true);
    };

    const onSearch = () => {
        lazyParams.value.first = 0;
        load(filters.value.global, true);
    };

    // ---------- Formulario: abrir/cerrar ----------
    const resetForm = () => {
        formObj.value = opts.getCleanForm();
        submitted.value = false;
        touched.value = {};
    };

    const openNew = () => {
        resetForm();
        dialog.value = true;
    };

    const edit = async (data: T) => {
        Object.keys(formObj.value).forEach((k) => {
            (formObj.value as any)[k] = undefined;
        });
        Object.assign(formObj.value, data);

        submitted.value = false;
        touched.value = {};
        dialog.value = true;

        try {
            const pk = resolvePK(data);
            const detalle = await crud.obtener(pk);

            Object.assign(formObj.value, detalle);

            console.log(`[useCrudTable:edit] ${opts.tabla} →`, {
                tiene_dependencias: (detalle as any)?.tiene_dependencias,
                campos_protegidos: (detalle as any)?.campos_protegidos,
            });
        } catch (err) {
            console.warn(`No se pudo cargar el detalle de ${opts.tabla}:`, err);
        }
    };

    const hideDialog = () => {
        dialog.value = false;
        resetForm();
    };

    // ---------- Guardar ----------
    const save = async () => {
        submitted.value = true;

        if (opts.validate) {
            const result = opts.validate(formObj.value, $rules, notify);
            const valido = result instanceof Promise ? await result : result;
            if (!valido) return;
        }

        try {
            loading.value = true;
            const payload = opts.buildPayload(formObj.value);

            if (isUpdate.value) {
                const pk = resolvePK(formObj.value);
                await crud.actualizar(pk, payload);
                notify('success', 'Actualizado', 'El registro se actualizó correctamente.');
            } else {
                await crud.crear(payload);
                notify('success', 'Creado', 'El registro se creó correctamente.');
            }

            await load();
            hideDialog();
        } catch (err: any) {
            const msg = err?.data?.message || 'No se pudo guardar el registro';
            notify('error', isUpdate.value ? 'Error al actualizar' : 'Error al crear',
                Array.isArray(msg) ? msg.join(', ') : msg);
            console.error(`Error al guardar ${opts.tabla}:`, err);
        } finally {
            loading.value = false;
        }
    };

    // ---------- Archivar / Desarchivar ----------
    const toggleEstado = async (data: T) => {
        const accion = data.estado_id === 1000 ? 'archivar' : 'desarchivar';
        try {
            const pk = resolvePK(data);
            if (accion === 'archivar') await crud.archivar(pk);
            else await crud.desarchivar(pk);

            notify('success', 'Estado actualizado',
                `El registro se ${accion === 'archivar' ? 'archivó' : 'restauró'} correctamente.`);
            load(filters.value.global, true);
        } catch (err: any) {
            const msg = err?.data?.message || `No se pudo ${accion} el registro`;
            notify('error', 'Error al actualizar estado', Array.isArray(msg) ? msg.join(', ') : msg);
            console.error(`Error al ${accion}:`, err);
        }
    };

    // ---------- Eliminar ----------
    const confirmDelete = (data: T) => {
        formObj.value = { ...data };
        deleteDialog.value = true;
    };

        const deleteItem = async () => {
        try {
            deleteDialog.value = false;
            loading.value = true;
            const pk = resolvePK(formObj.value);
            await crud.eliminar(pk);
            notify('success', 'Eliminado', 'El registro se eliminó correctamente.');
            await load();
        } catch (err: any) {
            const errorData = err?.data;
            let msg = errorData?.message || 'No se pudo eliminar el registro';

            if (Array.isArray(msg)) msg = msg.join(', ');

            const msgAmigable = formatearMensajeError(msg);

            let extra = '';
            if (errorData?.detalles) {
                const motivos = [];
                if (errorData.detalles.activas) motivos.push(`${errorData.detalles.activas} activo(s)`);
                if (errorData.detalles.historicas) motivos.push(`${errorData.detalles.historicas} histórico(s)`);
                if (motivos.length) extra = `. Dependencias: ${motivos.join(' y ')}.`;
            }

            notify('error', 'Error al eliminar', `${msgAmigable}${extra}`);
            console.error(`Error al eliminar ${opts.tabla}:`, err);
        } finally {
            loading.value = false;
        }
    };

    // ---------- Init ----------
    if (opts.autoLoad !== false) {
        onMounted(() => {
            if (permisos.leer) load();
            else notify('warn', 'Acceso denegado', 'No tiene permisos para ver este módulo.');
        });
    }

    return {
        items, loading, totalRecords, filters, lazyParams,
        dialog, deleteDialog, formObj, submitted, touched,
        isUpdate, formTitle, permisos, crud,
        camposProtegidos, estaProtegido,
        load, onPage, onSort, onSearch,
        openNew, edit, hideDialog, save,
        toggleEstado, confirmDelete, deleteItem,
        resolvePK,
    };
};
