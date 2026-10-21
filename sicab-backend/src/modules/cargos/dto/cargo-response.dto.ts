// C:\sistemas\sicab\sicab-backend\src\modules\cargos\dto\cargo-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, TIPO_MONEDA_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class CargoResponseDto {
    @Expose() @Transform(toNumber) cargo_id!: number;
    @Expose() cargo!: string;
    @Expose() codigo!: string;

    @Expose() @Transform(toNumber) sueldo_base!: number;

    @Expose() @Transform(toNumber) tipo_moneda_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.tipo_moneda_id, TIPO_MONEDA_METADATA))
    tipo_moneda!: MetadataTransformResult;

    @Expose()
    @Transform(({ obj }) => obj.descripcion || null)
    descripcion?: string | null;

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
