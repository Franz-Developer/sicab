// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\produccion-leche-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber, toRequiredNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';
import { ProduccionLecheDetalleResponseDto } from './produccion-leche-detalle-response.dto';

export class ProduccionLecheResponseDto {
    @Expose() @Transform(toNumber) produccion_leche_id!: number;

    @Expose() @Transform(toNumber) sucursal_id!: number;
    @Expose() sucursal_nombre?: string | null;
    @Expose() sucursal_codigo?: string | null;

    @Expose() @Transform(toNumber) empresa_id?: number | null;
    @Expose() empresa_nombre?: string | null;
    @Expose() empresa_codigo?: string | null;

    @Expose() @Transform(toNumber) turno_ordeno_id!: number;
    @Expose() turno_nombre?: string | null;
    @Expose() turno_codigo?: string | null;
    @Expose() turno_hora_inicio?: string | null;
    @Expose() turno_hora_fin?: string | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_produccion!: string;

    @Expose() @Transform(toRequiredNumber) total_litros!: number;
    @Expose() @Transform(toRequiredNumber) total_descartado!: number;
    @Expose() @Transform(toRequiredNumber) total_neto!: number;

    @Expose() observaciones?: string | null;

    @Expose()
    @Type(() => ProduccionLecheDetalleResponseDto)
    detalles?: ProduccionLecheDetalleResponseDto[];

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

    @Expose() @Transform(({ value }) => formatLocalDate(value)) fecha_registro!: string;
    @Expose() @Transform(({ value }) => formatLocalDate(value)) fecha_actualizacion?: string | null;
    @Expose() @Transform(({ value }) => formatLocalDate(value)) fecha_baja?: string | null;

    @Expose() tiene_dependencias?: boolean;
    @Expose() campos_protegidos?: string[];
}
