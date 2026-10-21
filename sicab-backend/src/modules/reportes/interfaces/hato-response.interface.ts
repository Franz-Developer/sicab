// C:\sistemas\sicab\sicab-backend\src\modules\reportes\interfaces\hato-response.interface.ts
export interface HatoResumen {
    total: number;
    por_categoria: Record<string, number>;
    por_raza: Record<string, number>;
    por_estado: Record<string, number>;
    por_sucursal: Record<string, number>;
    valor_adquisicion_total: number;
    valor_libro_total: number;
}

export interface HatoDetalle {
    vacuno_id: number;
    arete: string;
    nombre: string | null;
    raza: string;
    categoria: string;
    sexo: string;
    edad_meses: number | null;
    peso_actual: number | null;
    valor_adquisicion: number;
    valor_libro: number;
    estado_vacuno_id: number;
    estado_vacuno: string;
    sucursal: string;
    fecha_ingreso: string;
}

export interface HatoResponse {
    resumen: HatoResumen;
    detalle: HatoDetalle[];
}
