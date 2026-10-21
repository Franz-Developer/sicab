// C:\sistemas\sicab\sicab-frontend\app\constants\nombres-tablas.constant.ts

export interface InfoTablaAmigable {
    singular: string;
    plural: string;
}

export const NOMBRES_TABLAS_AMIGABLES: Record<string, InfoTablaAmigable> = {
    asignaciones_diarias: { singular: 'la asignación diaria', plural: 'Asignaciones Diarias' },
    bancos: { singular: 'el banco', plural: 'Bancos' },
    cargos: { singular: 'el cargo', plural: 'Cargos' },
    categorias_conductores: { singular: 'la categoría de conductor', plural: 'Categorías de Conductores' },
    conductores_categorias: { singular: 'la asignación de categoría', plural: 'Asignaciones de Categoría' },
    constantes: { singular: 'la constante', plural: 'Constantes' },
    empresas: { singular: 'la empresa', plural: 'Empresas' },
    empresas_cuentas: { singular: 'la cuenta bancaria de empresa', plural: 'Cuentas Bancarias de Empresas' },
    empresas_nits: { singular: 'el NIT de empresa', plural: 'NITs de Empresas' },
    frecuencias_cobros: { singular: 'la frecuencia de cobro', plural: 'Frecuencias de Cobros' },
    frecuencias_pagos: { singular: 'el pago de frecuencia', plural: 'Pagos de Frecuencias' },
    frecuencias_semanales: { singular: 'la frecuencia semanal', plural: 'Frecuencias Semanales' },
    mantenimientos: { singular: 'el mantenimiento', plural: 'Mantenimientos' },
    menus: { singular: 'el menú', plural: 'Menús' },
    moviles_suspendidos: { singular: 'el móvil suspendido', plural: 'Móviles Suspendidos' },
    parametros_globales: { singular: 'el parámetro global', plural: 'Parámetros Globales' },
    proveedores: { singular: 'el proveedor', plural: 'Proveedores' },
    roles: { singular: 'el rol', plural: 'Roles' },
    roles_menus: { singular: 'el rol de menú', plural: 'Roles de Menús' },
    roles_permisos_tablas: { singular: 'el permiso de tabla de rol', plural: 'Permisos de Tablas de Roles' },
    solicitudes_viaje: { singular: 'la solicitud de viaje', plural: 'Solicitudes de Viaje' },
    sucursales: { singular: 'la sucursal', plural: 'Sucursales' },
    tablas: { singular: 'la tabla', plural: 'Tablas' },
    tareas_programadas: { singular: 'la tarea programada', plural: 'Tareas Programadas' },
    tipos_mantenimiento: { singular: 'el tipo de mantenimiento', plural: 'Tipos de Mantenimiento' },
    trabajador_antecedentes: { singular: 'el antecedente de trabajador', plural: 'Antecedentes de Trabajadores' },
    trabajadores: { singular: 'el trabajador', plural: 'Trabajadores' },
    trabajadores_cargos: { singular: 'el cargo de trabajador', plural: 'Cargos de Trabajadores' },
    usuarios: { singular: 'el usuario', plural: 'Usuarios' },
    vehiculos: { singular: 'el vehículo', plural: 'Vehículos' },
    vehiculos_alertas: { singular: 'la alerta de vehículo', plural: 'Alertas de Vehículos' },
    vehiculos_documentos: { singular: 'el documento de vehículo', plural: 'Documentos de Vehículos' },
    bonos_cliente: { singular: 'el bono de cliente', plural: 'Bonos de Clientes' },
    clientes: { singular: 'el cliente', plural: 'Clientes' },
    codigos_promo: { singular: 'el código promocional', plural: 'Códigos Promocionales' },
    notificaciones: { singular: 'la notificación', plural: 'Notificaciones' },
    referidos: { singular: 'el referido', plural: 'Referidos' },
    tipos_servicio: { singular: 'el tipo de servicio', plural: 'Tipos de Servicio' },
    tipos_antecedente_detalle: { singular: 'el detalle de tipo de antecedente', plural: 'Detalles de Tipos de Antecedente' },
    vehiculos_ubicaciones: { singular: 'la ubicación de vehículo', plural: 'Ubicaciones de Vehículos' },
    vehiculos_geocercas: { singular: 'la geocerca de vehículo', plural: 'Geocercas de Vehículos' },
};

export function obtenerNombreAmigableTabla(nombreTablaTecnica: string): string {
    return NOMBRES_TABLAS_AMIGABLES[nombreTablaTecnica]?.plural || nombreTablaTecnica;
}
