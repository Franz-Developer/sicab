// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\tipo-cambio-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, TIPO_MONEDA_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class TipoCambioResponseDto {
    @Expose() @Transform(toNumber) tipo_cambio_id!: number;

    @Expose() @Transform(toNumber) origen_moneda_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.origen_moneda_id, TIPO_MONEDA_METADATA))
    origen_moneda!: MetadataTransformResult;

    @Expose() @Transform(toNumber) destino_moneda_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.destino_moneda_id, TIPO_MONEDA_METADATA))
    destino_moneda!: MetadataTransformResult;

    @Expose()
    @Transform(({ value }) => (value === null || value === undefined) ? null : Number(value))
    factor_compra!: number | null;

    @Expose()
    @Transform(({ value }) => Number(value))
    factor_venta!: number;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_cotizacion!: string;

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
