// C:\sistemas\sicab\sicab-backend\src\common\constants\nombres-tablas.constant.ts

export interface InfoTablaAmigable {
    singular: string;
    plural: string;
    genero: 'M' | 'F';
}

export const NOMBRES_TABLAS_AMIGABLES: Record<string, InfoTablaAmigable> = {
    amortizaciones_vacunos:   { singular: 'la amortización de vacuno',          plural: 'Amortizaciones de Vacunos',             genero: 'F' },
    bancos:                   { singular: 'el banco',                          plural: 'Bancos',                                genero: 'M' },
    cargos:                   { singular: 'el cargo',                          plural: 'Cargos',                                genero: 'M' },
    categorias_vacuno:        { singular: 'la categoría de vacuno',            plural: 'Categorías de Vacuno',                  genero: 'F' },
    empresas:                 { singular: 'la empresa',                        plural: 'Empresas',                              genero: 'F' },
    empresas_cuentas:         { singular: 'la cuenta bancaria de empresa',     plural: 'Cuentas Bancarias de Empresas',         genero: 'F' },
    empresas_nits:            { singular: 'el NIT de empresa',                 plural: 'NITs de Empresas',                      genero: 'M' },
    menus:                    { singular: 'el menú',                           plural: 'Menús',                                 genero: 'M' },
    parametros_globales:      { singular: 'el parámetro global',               plural: 'Parámetros Globales',                   genero: 'M' },
    producciones_leche:       { singular: 'la producción de leche',            plural: 'Producciones de Leche',                 genero: 'F' },
    producciones_leche_detalle:{ singular: 'el detalle de producción',         plural: 'Detalles de Producción de Leche',       genero: 'M' },
    razas:                    { singular: 'la raza',                           plural: 'Razas',                                 genero: 'F' },
    roles:                    { singular: 'el rol',                            plural: 'Roles',                                 genero: 'M' },
    roles_menus:              { singular: 'el rol de menú',                    plural: 'Roles de Menús',                        genero: 'M' },
    roles_permisos_tablas:    { singular: 'el permiso de tabla de rol',        plural: 'Permisos de Tablas de Roles',           genero: 'M' },
    sucursales:               { singular: 'la sucursal',                       plural: 'Sucursales',                            genero: 'F' },
    tablas:                   { singular: 'la tabla',                          plural: 'Tablas',                                genero: 'F' },
    tipos_cambios:            { singular: 'el tipo de cambio',                 plural: 'Tipos de Cambio',                       genero: 'M' },
    tipos_semovientes:        { singular: 'el tipo de semoviente',             plural: 'Tipos de Semovientes',                  genero: 'M' },
    trabajadores:             { singular: 'el trabajador',                     plural: 'Trabajadores',                          genero: 'M' },
    trabajadores_cargos:      { singular: 'el cargo de trabajador',            plural: 'Cargos de Trabajadores',                genero: 'M' },
    turnos_ordeno:            { singular: 'el turno de ordeño',                plural: 'Turnos de Ordeño',                      genero: 'M' },
    usuarios:                 { singular: 'el usuario',                        plural: 'Usuarios',                              genero: 'M' },
    vacunos:                  { singular: 'el vacuno',                         plural: 'Vacunos',                               genero: 'M' },
    vacunos_pesajes:          { singular: 'el pesaje de vacuno',               plural: 'Pesajes de Vacunos',                    genero: 'M' },
};

export function obtenerDatosTablaAmigable(nombreTablaTecnica: string): InfoTablaAmigable {
    if (!nombreTablaTecnica || typeof nombreTablaTecnica !== 'string') {
        throw new Error('nombreTablaTecnica debe ser un string no vacío.');
    }

    if (/\s/.test(nombreTablaTecnica)) {
        throw new Error(
            `"${nombreTablaTecnica}" no es un nombre técnico válido. ` +
            `Debe ser en snake_case sin espacios ni artículos (ej. "trabajadores").`
        );
    }

    const info = NOMBRES_TABLAS_AMIGABLES[nombreTablaTecnica];
    if (info) return info;

    // Fallback para tablas no registradas (evita que el sistema falle)
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
