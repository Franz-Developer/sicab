// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores-cargos\dto\trabajador-cargo-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, TIPO_MONEDA_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';
import { buildNombreCompleto } from '../../../common/utils/nombre-completo.util';

export class TrabajadorCargoResponseDto {
    @Expose() @Transform(toNumber) trabajador_cargo_id!: number;
    @Expose() @Transform(toNumber) trabajador_id!: number;

    @Expose()
    @Transform(({ obj }) => buildNombreCompleto(obj.trabajador_paterno, obj.trabajador_materno, obj.trabajador_nombres))
    trabajador_nombre_completo?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_dni || null)
    trabajador_dni!: string;

    @Expose()
    @Transform(({ obj }) => obj.trabajador_apodo || null)
    trabajador_apodo!: string | null;

    @Expose() @Transform(toNumber) cargo_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.cargo_nombre || null)
    cargo_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.cargo_codigo || null)
    cargo_codigo!: string;

    @Expose()
    @Transform(({ value }) => Number(value))
    sueldo_base!: number;

    @Expose() @Transform(toNumber) tipo_moneda_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.tipo_moneda_id, TIPO_MONEDA_METADATA))
    tipo_moneda!: MetadataTransformResult;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_desde!: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_hasta?: string | null;

    @Expose()
    @Transform(({ value }) => value ?? null)
    observaciones?: string | null;

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
