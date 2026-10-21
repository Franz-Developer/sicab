// C:\sistemas\sicab\sicab-backend\src\modules\usuarios\dto\usuario-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class UsuarioResponseDto {
    @Expose() @Transform(toNumber) usuario_id!: number;
    @Expose() @Transform(toNumber) trabajador_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_nombre_completo || null)
    trabajador_nombre_completo!: string;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_nombres || null)
    trabajador_nombres!: string;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_paterno || null)
    trabajador_paterno!: string;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_materno || null)
    trabajador_materno!: string;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_dni || null)
    trabajador_dni!: string;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_apodo || null)
    trabajador_apodo!: string;

    @Expose() @Transform(toNumber) empresa_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.empresa_nombre || null)
    empresa_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.empresa_codigo || null)
    empresa_codigo!: string;

    @Expose() @Transform(toNumber) sucursal_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.sucursal_nombre || null)
    sucursal_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.sucursal_codigo || null)
    sucursal_codigo!: string;

    @Expose()
    @Transform(({ obj }) => (obj.sucursal_codigo_sin !== undefined && obj.sucursal_codigo_sin !== null ? Number(obj.sucursal_codigo_sin) : null))
    sucursal_codigo_sin!: number;

    @Expose() @Transform(toNumber) rol_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.rol_nombre || null)
    rol_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.rol_codigo || null)
    rol_codigo!: string;

    @Expose()
    @Transform(({ obj }) => obj.es_admin === 1 || obj.es_admin === true || obj.es_admin === '1')
    es_admin!: boolean;

    @Expose()
    @Transform(({ obj }) => (obj.cargo_id !== undefined && obj.cargo_id !== null ? Number(obj.cargo_id) : null))
    cargo_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.cargo_nombre || null)
    cargo_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.cargo_codigo || null)
    cargo_codigo!: string;

    @Expose() login!: string;
    @Expose() avatar!: string;
    @Expose() @Transform(toNumber) estado_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.estado_id, ESTADO_METADATA))
    estado_registro!: string;

    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.estado_id, ESTADO_METADATA))
    estado_label!: string;

    @Expose()
    usuario_operacion!: string;

    @Expose() @Transform(toNumber) usuario_id_registro!: number;
    @Expose() @Transform(toNumber) usuario_id_actualizacion?: number | null;
    @Expose() @Transform(toNumber) usuario_id_baja?: number | null;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_registro!: string;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_actualizacion?: string | null;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_baja?: string | null;

    @Expose()
    tiene_dependencias?: boolean;

    @Expose()
    campos_protegidos?: string[];
}
