// C:\sistemas\sicab\sicab-backend\src\modules\sucursales\dto\sucursal-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class SucursalResponseDto {
    @Expose() @Transform(toNumber) sucursal_id!: number;
    @Expose() @Transform(toNumber) empresa_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.empresa_nombre || null)
    empresa_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.empresa_codigo || null)
    empresa_codigo!: string;

    @Expose() sucursal!: string;
    @Expose() sucursal_largo!: string;
    @Expose() codigo!: string;
    @Expose() @Transform(toNumber) codigo_sin!: number;

    @Expose()
    @Transform(({ value }) => value ?? null)
    telefono?: string | null;

    @Expose()
    @Transform(({ value }) => value ?? null)
    ubicacion?: string | null;

    @Expose()
    @Transform(({ value }) => value ?? null)
    horario_atencion?: string | null;

    @Expose() @Transform(toNumber) estado_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.estado_id, ESTADO_METADATA))
    estado_registro!: string;

    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.estado_id, ESTADO_METADATA))
    estado_label!: string;

    @Expose() usuario_operacion!: string;

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

    @Expose() tiene_dependencias?: boolean;
    @Expose() campos_protegidos?: string[];
}
