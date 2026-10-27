// C:\sistemas\sicab\sicab-frontend\app\constants\nombres-tablas.constant.ts

export interface InfoTablaAmigable {
    singular: string;
    plural: string;
}

export const NOMBRES_TABLAS_AMIGABLES: Record<string, InfoTablaAmigable> = {
    amortizaciones_vacunos: { singular: 'la amortización de vacuno', plural: 'Amortizaciones de Vacunos' },
    bancos: { singular: 'el banco', plural: 'Bancos' },
    cargos: { singular: 'el cargo', plural: 'Cargos' },
    categorias_vacuno: { singular: 'la categoría de vacuno', plural: 'Categorías de Vacuno' },
    constantes: { singular: 'la constante', plural: 'Constantes' },
    empresas: { singular: 'la empresa', plural: 'Empresas' },
    empresas_cuentas: { singular: 'la cuenta bancaria de empresa', plural: 'Cuentas Bancarias de Empresas' },
    empresas_nits: { singular: 'el NIT de empresa', plural: 'NITs de Empresas' },
    menus: { singular: 'el menú', plural: 'Menús' },
    ninguno: { singular: 'ninguno', plural: 'Ninguno' },
    parametros_globales: { singular: 'el parámetro global', plural: 'Parámetros Globales' },
    producciones_leche: { singular: 'la producción de leche', plural: 'Producciones de Leche' },
    producciones_leche_detalle: { singular: 'el detalle de producción', plural: 'Detalles de Producción de Leche' },
    razas: { singular: 'la raza', plural: 'Razas' },
    roles: { singular: 'el rol', plural: 'Roles' },
    roles_menus: { singular: 'el rol de menú', plural: 'Roles de Menús' },
    roles_permisos_tablas: { singular: 'el permiso de tabla de rol', plural: 'Permisos de Tablas de Roles' },
    sucursales: { singular: 'la sucursal', plural: 'Sucursales' },
    tablas: { singular: 'la tabla', plural: 'Tablas' },
    tareas_programadas: { singular: 'la tarea programada', plural: 'Tareas Programadas' },
    tipos_cambios: { singular: 'el tipo de cambio', plural: 'Tipos de Cambio' },
    tipos_semovientes: { singular: 'el tipo de semoviente', plural: 'Tipos de Semovientes' },
    trabajadores: { singular: 'el trabajador', plural: 'Trabajadores' },
    trabajadores_cargos: { singular: 'el cargo de trabajador', plural: 'Cargos de Trabajadores' },
    turnos_ordeno: { singular: 'el turno de ordeño', plural: 'Turnos de Ordeño' },
    usuarios: { singular: 'el usuario', plural: 'Usuarios' },
    vacunos: { singular: 'el vacuno', plural: 'Vacunos' },
    vacunos_historial_aretes: { singular: 'el historial de arete', plural: 'Historiales de Aretes' },
    vacunos_pesajes: { singular: 'el pesaje de vacuno', plural: 'Pesajes de Vacunos' },
    vacunos_faenas: { singular: 'la faena de vacuno', plural: 'Faenas de Vacunos' },
};

export function obtenerNombreAmigableTabla(nombreTablaTecnica: string): string {
    return NOMBRES_TABLAS_AMIGABLES[nombreTablaTecnica]?.plural || nombreTablaTecnica;
}

export function formatearMensajeError(mensaje: string): string {
    if (!mensaje) return mensaje;

    let mensajeLimpio = mensaje;
    const tablasOrdenadas = Object.keys(NOMBRES_TABLAS_AMIGABLES).sort((a, b) => b.length - a.length);

    tablasOrdenadas.forEach((tablaTecnica) => {
        const info = NOMBRES_TABLAS_AMIGABLES[tablaTecnica];
        if (!info) return;
        const tablaEscapada = tablaTecnica.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(tablaEscapada, 'g');
        mensajeLimpio = mensajeLimpio.replace(regex, info.plural);
    });

    return mensajeLimpio;
}
