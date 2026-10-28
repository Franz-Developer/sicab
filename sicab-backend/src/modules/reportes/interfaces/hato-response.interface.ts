// C:\sistemas\sicab\sicab-backend\src\modules\reportes\interfaces\hato-response.interface.ts
export interface HatoResumen {
    total: number;
    por_categoria: Record<string, number>;
    por_raza: Record<string, number>;
    por_estado_vacuno: Record<string, number>;
    por_sexo: Record<string, number>;
    por_sucursal: Record<string, number>;
    por_es_productor_leche: Record<string, number>;
    valor_adquisicion_total: number;
    valor_residual_total: number;
    amortizacion_acumulada_total: number;
    valor_libro_total: number;
    peso_promedio: number | null;
    edad_promedio_meses: number | null;
}

export interface HatoDetalle {
    vacuno_id: number;
    arete: string;
    nombre: string;

    empresa_id: number;
    empresa: string;
    sucursal_id: number;
    sucursal: string;

    raza_id: number;
    raza: string;
    categoria_vacuno_id: number;
    categoria: string;
    tipo_semoviente_id: number;
    tipo_semoviente: string;

    sexo_biologico_id: number;
    sexo: string;
    color: string | null;
    fecha_nacimiento: string | null;
    edad_meses: number | null;

    peso_nacimiento: number | null;
    peso_actual: number | null;

    valor_adquisicion: number;
    valor_residual: number;
    valor_libro_actual: number | null;
    amortizacion_acumulada: number;
    meses_amortizados: number;

    es_productor_leche: number;
    estado_vacuno_id: number;
    estado_vacuno: string;

    fecha_ingreso: string;

    estado_id: number;
    estado_registro: string;
    usuario_operacion: string | null;
    fecha_registro: string;
    fecha_actualizacion: string | null;
}

export interface HatoResponse {
    resumen: HatoResumen;
    detalle: HatoDetalle[];
}
