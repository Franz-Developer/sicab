// C:\sistemas\sicab\sicab-backend\src\modules\reportes\interfaces\produccion-response.interface.ts
export interface ProduccionResumen {
    total_litros: number;
    total_descartado: number;
    total_neto: number;
    promedio_diario: number;
    dias_con_produccion: number;
    cantidad_turnos: number;
    cantidad_vacunos: number;
}

export interface ProduccionPorTurno {
    turno_ordeno_id: number;
    turno: string;
    codigo: string;
    total_litros: number;
    total_descartado: number;
    total_neto: number;
    cantidad_registros: number;
}

export interface ProduccionPorVaca {
    vacuno_id: number;
    arete: string;
    nombre: string;
    raza: string;
    categoria: string;
    sucursal_id: number;
    sucursal: string;
    total_litros: number;
    promedio_diario: number;
    dias_con_produccion: number;
}

export interface ProduccionPorFecha {
    fecha: string;
    sucursal_id: number;
    sucursal: string;
    turno_ordeno_id: number;
    turno: string;
    total_litros: number;
    total_descartado: number;
    total_neto: number;
    estado_id: number;
    estado_registro: string;
}

export interface ProduccionResponse {
    resumen: ProduccionResumen;
    por_turno: ProduccionPorTurno[];
    por_vaca: ProduccionPorVaca[];
    por_fecha: ProduccionPorFecha[];
}
