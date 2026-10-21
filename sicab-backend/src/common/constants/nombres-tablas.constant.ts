// C:\sistemas\sicab\sicab-backend\src\common\constants\nombres-tablas.constant.ts

export interface InfoTablaAmigable {
    singular: string;
    plural: string;
    genero: 'M' | 'F';
}

export const NOMBRES_TABLAS_AMIGABLES: Record<string, InfoTablaAmigable> = {
    asignaciones_diarias:     { singular: 'la asignación diaria',              plural: 'Asignaciones Diarias',                  genero: 'F' },
    bancos:                   { singular: 'el banco',                          plural: 'Bancos',                                genero: 'M' },
    cargos:                   { singular: 'el cargo',                          plural: 'Cargos',                                genero: 'M' },
    categorias_conductores:   { singular: 'la categoría de conductor',         plural: 'Categorías de Conductores',             genero: 'F' },
    conductores_categorias:   { singular: 'la relación de categoría de conductor', plural: 'Categorías de Conductores (Relación)', genero: 'F' },
    empresas:                 { singular: 'la empresa',                        plural: 'Empresas',                              genero: 'F' },
    empresas_cuentas:         { singular: 'la cuenta bancaria de empresa',     plural: 'Cuentas Bancarias de Empresas',         genero: 'F' },
    empresas_nits:            { singular: 'el NIT de empresa',                 plural: 'NITs de Empresas',                      genero: 'M' },
    frecuencias_cobros:       { singular: 'la frecuencia de cobro',            plural: 'Frecuencias de Cobros',                 genero: 'F' },
    frecuencias_pagos:        { singular: 'el pago de frecuencia',             plural: 'Pagos de Frecuencias',                  genero: 'M' },
    frecuencias_semanales:    { singular: 'la frecuencia semanal',             plural: 'Frecuencias Semanales',                 genero: 'F' },
    mantenimientos:           { singular: 'el mantenimiento',                  plural: 'Mantenimientos',                        genero: 'M' },
    menus:                    { singular: 'el menú',                           plural: 'Menús',                                 genero: 'M' },
    moviles_suspendidos:      { singular: 'el móvil suspendido',               plural: 'Móviles Suspendidos',                   genero: 'M' },
    parametros_globales:      { singular: 'el parámetro global',               plural: 'Parámetros Globales',                   genero: 'M' },
    proveedores:              { singular: 'el proveedor',                      plural: 'Proveedores',                           genero: 'M' },
    roles:                    { singular: 'el rol',                            plural: 'Roles',                                 genero: 'M' },
    roles_menus:              { singular: 'el rol de menú',                    plural: 'Roles de Menús',                        genero: 'M' },
    roles_permisos_tablas:    { singular: 'el permiso de tabla de rol',        plural: 'Permisos de Tablas de Roles',           genero: 'M' },
    solicitudes_viaje:        { singular: 'la solicitud de viaje',             plural: 'Solicitudes de Viaje',                  genero: 'F' },
    sucursales:               { singular: 'la sucursal',                       plural: 'Sucursales',                            genero: 'F' },
    tablas:                   { singular: 'la tabla',                          plural: 'Tablas',                                genero: 'F' },
    tareas_programadas:       { singular: 'la tarea programada',               plural: 'Tareas Programadas',                    genero: 'F' },
    tipos_mantenimiento:      { singular: 'el tipo de mantenimiento',          plural: 'Tipos de Mantenimiento',                genero: 'M' },
    trabajador_antecedentes:  { singular: 'el antecedente de trabajador',      plural: 'Antecedentes de Trabajadores',          genero: 'M' },
    trabajadores:             { singular: 'el trabajador',                     plural: 'Trabajadores',                          genero: 'M' },
    trabajadores_cargos:      { singular: 'el cargo de trabajador',            plural: 'Cargos de Trabajadores',                genero: 'M' },
    usuarios:                 { singular: 'el usuario',                        plural: 'Usuarios',                              genero: 'M' },
    vehiculos:                { singular: 'el vehículo',                       plural: 'Vehículos',                             genero: 'M' },
    vehiculos_documentos:     { singular: 'el documento de vehículo',          plural: 'Documentos de Vehículos',               genero: 'M' },
};

export function obtenerDatosTablaAmigable(nombreTablaTecnica: string): InfoTablaAmigable {
    if (!nombreTablaTecnica || typeof nombreTablaTecnica !== 'string') {
        throw new Error('nombreTablaTecnica debe ser un string no vacío.');
    }

    if (/\s/.test(nombreTablaTecnica)) {
        throw new Error(
            `"${nombreTablaTecnica}" no es un nombre técnico válido. ` +
            `Debe ser en snake_case sin espacios ni artículos (ej. "tareas_programadas").`
        );
    }

    const info = NOMBRES_TABLAS_AMIGABLES[nombreTablaTecnica];
    if (info) return info;

    return {
        singular: `el registro de ${nombreTablaTecnica}`,
        plural: nombreTablaTecnica,
        genero: 'M',
    };
}

export function obtenerNombreAmigableTabla(nombreTablaTecnica: string): string {
    return NOMBRES_TABLAS_AMIGABLES[nombreTablaTecnica]?.plural || nombreTablaTecnica;
}

export function obtenerGeneroTabla(nombreTablaTecnica: string): 'M' | 'F' {
    return NOMBRES_TABLAS_AMIGABLES[nombreTablaTecnica]?.genero ?? 'M';
}
