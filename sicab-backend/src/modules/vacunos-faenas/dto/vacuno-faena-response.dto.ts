// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\dto\vacuno-faena-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber, toRequiredNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class VacunoFaenaResponseDto {
    @Expose() @Transform(toNumber) faena_id!: number;
    @Expose() @Transform(toNumber) vacuno_id!: number;
    @Expose() vacuno_arete?: string | null;
    @Expose() vacuno_nombre?: string | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_faena!: string;

    @Expose() @Transform(toRequiredNumber) peso_vivo_faena!: number;
    @Expose() @Transform(toRequiredNumber) peso_canal_caliente!: number;
    @Expose() @Transform(({ value }) => value ? Number(value) : null) peso_canal_fria?: number | null;
    @Expose() @Transform(({ value }) => value ? Number(value) : null) rendimiento_canal?: number | null;

    @Expose() matadero?: string | null;
    @Expose() numero_guia?: string | null;
    @Expose() observaciones?: string | null;

    @Expose() @Transform(toNumber) estado_id!: number;
    @Expose() @Transform(({ obj }) => transformMetadataAbreviatura(obj.estado_id, ESTADO_METADATA)) estado_registro!: string;
    @Expose() @Transform(({ obj }) => transformMetadataLabel(obj.estado_id, ESTADO_METADATA)) estado_label!: string;

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
