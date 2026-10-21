// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\dto\vacuno-pesaje-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class VacunoPesajeResponseDto {
    @Expose() @Transform(toNumber) pesaje_id!: number;
    @Expose() @Transform(toNumber) vacuno_id!: number;
    @Expose() vacuno_arete?: string | null;
    @Expose() vacuno_nombre?: string | null;
    @Expose() sucursal_id!: number;
    @Expose() sucursal_nombre?: string | null;
    @Expose() sucursal_codigo?: string | null;
    @Expose() @Transform(toNumber) empresa_id!: number;
    @Expose() empresa_nombre?: string | null;
    @Expose() empresa_codigo?: string | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_pesaje!: string;
    @Expose() @Transform(({ value }) => Number(value)) peso!: number;
    @Expose() observaciones?: string | null;

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
