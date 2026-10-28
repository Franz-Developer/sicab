// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\amortizacion-vacuno-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class AmortizacionVacunoResponseDto {
    @Expose() @Transform(({ value }) => Number(value)) amortizacion_vacuno_id!: number;
    @Expose() @Transform(({ value }) => Number(value)) vacuno_id!: number;
    @Expose() vacuno_arete?: string | null;
    @Expose() vacuno_nombre?: string | null;
    @Expose() @Transform(toNumber) sucursal_id?: number | null;
    @Expose() sucursal_nombre?: string | null;
    @Expose() sucursal_codigo?: string | null;
    @Expose() @Transform(toNumber) empresa_id?: number | null;
    @Expose() empresa_nombre?: string | null;
    @Expose() empresa_codigo?: string | null;

    @Expose() @Transform(toNumber) gestion!: number;

    @Expose() @Transform(({ value }) => Number(value)) valor_inicial!: number;
    @Expose() @Transform(({ value }) => Number(value)) valor_residual!: number;
    @Expose() @Transform(({ value }) => Number(value)) amortizacion_gestion!: number;
    @Expose() @Transform(({ value }) => Number(value)) amortizacion_acumulada!: number;
    @Expose() @Transform(({ value }) => Number(value)) valor_libro!: number;

    @Expose() @Transform(toNumber) valor_inicial_ufv?: number | null;
    @Expose() @Transform(toNumber) valor_residual_ufv?: number | null;
    @Expose() @Transform(toNumber) amortizacion_gestion_ufv?: number | null;
    @Expose() @Transform(toNumber) amortizacion_acumulada_ufv?: number | null;
    @Expose() @Transform(toNumber) valor_libro_ufv?: number | null;
    @Expose() @Transform(toNumber) cotizacion_ufv_aplicada?: number | null;
    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_cotizacion_ufv?: string | null;

    @Expose() @Transform(toNumber) vida_util_anios?: number | null;
    @Expose() @Transform(toNumber) tasa_amortizacion?: number | null;

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
