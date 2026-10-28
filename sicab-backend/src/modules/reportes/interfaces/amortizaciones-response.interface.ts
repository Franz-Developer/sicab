// C:\sistemas\sicab\sicab-backend\src\modules\reportes\interfaces\amortizaciones-response.interface.ts
export interface AmortizacionesResumen {
    total_valor_inicial: number;
    total_amortizado_rango: number;
    total_amort_acumulada: number;
    total_valor_libro: number;
    total_valor_inicial_ufv: number;
    total_amortizado_rango_ufv: number;
    total_amort_acumulada_ufv: number;
    total_valor_libro_ufv: number;
    cantidad_vacunos: number;
    cantidad_registros: number;
}

export interface AmortizacionDetalle {
    amortizacion_vacuno_id: number;
    vacuno_id: number;
    arete: string;
    nombre: string | null;
    periodo: string;
    gestion: number;
    empresa_id: number;
    empresa: string;
    sucursal_id: number;
    sucursal: string;
    raza: string;
    categoria: string;
    valor_inicial: number;
    amortizacion_periodo: number;
    amortizacion_acumulada: number;
    valor_libro: number;
    valor_inicial_ufv: number | null;
    amortizacion_periodo_ufv: number | null;
    amortizacion_acumulada_ufv: number | null;
    valor_libro_ufv: number | null;
    cotizacion_ufv_aplicada: number | null;
    fecha_cotizacion_ufv: string | null;
    vida_util_anios: number | null;
    tasa_amortizacion: number | null;
    estado_id: number;
    estado_registro: string;
    usuario_operacion: string | null;
    fecha_registro: string;
    fecha_actualizacion: string | null;
}

export interface AmortizacionesResponse {
    resumen: AmortizacionesResumen;
    detalle: AmortizacionDetalle[];
}
