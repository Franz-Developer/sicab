// C:\sistemas\sicab\sicab-backend\src\modules\reportes\interfaces\faenas-response.interface.ts

export interface FaenasResumen {
    total_faenas: number;
    total_peso_vivo: number;
    total_peso_canal_caliente: number;
    total_peso_canal_fria: number | null;
    rendimiento_canal_promedio: number | null;
    rendimiento_canal_minimo: number | null;
    rendimiento_canal_maximo: number | null;
    por_matadero: Record<string, number>;
    por_sucursal: Record<string, number>;
    por_categoria: Record<string, number>;
    por_raza: Record<string, number>;
}

export interface FaenaDetalle {
    faena_id: number;
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

    fecha_faena: string;
    peso_vivo_faena: number;
    peso_canal_caliente: number;
    peso_canal_fria: number | null;
    rendimiento_canal: number | null;

    matadero: string | null;
    numero_guia: string | null;
    observaciones: string | null;

    estado_id: number;
    estado_registro: string;
    usuario_operacion: string | null;
    fecha_registro: string;
    fecha_actualizacion: string | null;
}

export interface FaenasPorMatadero {
    matadero: string;
    total_faenas: number;
    total_peso_vivo: number;
    total_peso_canal_caliente: number;
    rendimiento_canal_promedio: number | null;
}

export interface FaenasPorFecha {
    fecha: string;
    total_faenas: number;
    total_peso_vivo: number;
    total_peso_canal_caliente: number;
    total_peso_canal_fria: number | null;
    rendimiento_canal_promedio: number | null;
}

export interface FaenasPorSucursal {
    sucursal_id: number;
    sucursal: string;
    total_faenas: number;
    total_peso_vivo: number;
    total_peso_canal_caliente: number;
    rendimiento_canal_promedio: number | null;
}

export interface FaenasResponse {
    resumen: FaenasResumen;
    detalle: FaenaDetalle[];
    por_matadero: FaenasPorMatadero[];
    por_fecha: FaenasPorFecha[];
    por_sucursal: FaenasPorSucursal[];
}
