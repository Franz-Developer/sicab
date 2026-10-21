// C:\sistemas\sicab\sicab-backend\src\modules\reportes\interfaces\produccion-response.interface.ts
export interface ProduccionResumen {
    total_litros: number;
    total_descartado: number;
    total_neto: number;
    promedio_diario: number;
    temperatura_promedio: number | null;
    densidad_promedio: number | null;
}

export interface ProduccionPorTurno {
    turno_ordeno_id: number;
    turno: string;
    total_litros: number;
    total_descartado: number;
    total_neto: number;
}

export interface ProduccionPorVaca {
    vacuno_id: number;
    arete: string;
    nombre: string | null;
    total_litros: number;
    promedio_diario: number;
}

export interface ProduccionPorFecha {
    fecha: string;
    total_litros: number;
    total_neto: number;
}

export interface ProduccionResponse {
    resumen: ProduccionResumen;
    por_turno: ProduccionPorTurno[];
    por_vaca: ProduccionPorVaca[];
    por_fecha: ProduccionPorFecha[];
}
