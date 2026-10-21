// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\vacuno-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, SEXO_BIOLOGICO_METADATA, SexoBiologico, EstadoVacuno, ESTADO_VACUNO_METADATA, CondicionProductorLeche, CONDICION_PRODUCTOR_LECHE_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class VacunoResponseDto {
    @Expose() @Transform(toNumber) vacuno_id!: number;
    @Expose() @Transform(toNumber) sucursal_id!: number;
    @Expose() sucursal_nombre?: string | null;
    @Expose() sucursal_codigo?: string | null;
    @Expose() @Transform(toNumber) empresa_id!: number;
    @Expose() empresa_nombre?: string | null;
    @Expose() empresa_codigo?: string | null;

    @Expose() @Transform(toNumber) raza_id!: number;
    @Expose() @Transform(toNumber) categoria_vacuno_id!: number;
    @Expose() arete!: string;
    @Expose() nombre?: string | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_nacimiento?: string | null;
    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_ingreso!: string;

    @Expose() @Transform(toNumber) sexo_biologico_id!: number;

    @Expose()
    @Transform(({ obj }) => SEXO_BIOLOGICO_METADATA[obj.sexo_biologico_id as SexoBiologico]?.abreviatura ?? null)
    sexo?: string | null;

    @Expose()
    @Transform(({ obj }) => SEXO_BIOLOGICO_METADATA[obj.sexo_biologico_id as SexoBiologico]?.label ?? null)
    sexo_label?: string | null;

    @Expose() @Transform(({ value }) => value !== null && value !== undefined ? Number(value) : null) peso_nacimiento?: number | null;
    @Expose() @Transform(({ value }) => value !== null && value !== undefined ? Number(value) : null) peso_actual?: number | null;

    @Expose() color?: string | null;
    @Expose() padre_arete?: string | null;
    @Expose() madre_arete?: string | null;

    @Expose() @Transform(({ value }) => Number(value)) valor_adquisicion!: number;
    @Expose() @Transform(({ value }) => Number(value)) valor_residual!: number;
    @Expose() @Transform(({ value }) => value !== null ? Number(value) : null) valor_adquisicion_ufv?: number | null;
    @Expose() @Transform(({ value }) => value !== null ? Number(value) : null) valor_residual_ufv?: number | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_cotizacion_ufv?: string | null;
    @Expose() @Transform(toNumber) vida_util_anios!: number;
    @Expose() @Transform(({ value }) => Number(value)) tasa_amortizacion!: number;
    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_inicio_amortizacion?: string | null;

    @Expose() @Transform(toNumber) es_productor_leche!: number;

    @Expose()
    @Transform(({ obj }) => CONDICION_PRODUCTOR_LECHE_METADATA[obj.es_productor_leche as CondicionProductorLeche]?.abreviatura ?? null)
    es_productor_leche_abreviatura?: string | null;

    @Expose()
    @Transform(({ obj }) => CONDICION_PRODUCTOR_LECHE_METADATA[obj.es_productor_leche as CondicionProductorLeche]?.label ?? null)
    es_productor_leche_label?: string | null;

    @Expose() @Transform(toNumber) estado_vacuno_id!: number;

    @Expose()
    @Transform(({ obj }) => ESTADO_VACUNO_METADATA[obj.estado_vacuno_id as EstadoVacuno]?.abreviatura ?? null)
    estado_vacuno_abreviatura?: string | null;

    @Expose()
    @Transform(({ obj }) => ESTADO_VACUNO_METADATA[obj.estado_vacuno_id as EstadoVacuno]?.label ?? null)
    estado_vacuno_label?: string | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_salida?: string | null;
    @Expose() motivo_salida?: string | null;
    @Expose() @Transform(({ value }) => value !== null ? Number(value) : null) peso_salida?: number | null;
    @Expose() @Transform(({ value }) => value !== null ? Number(value) : null) precio_venta?: number | null;
    @Expose() causa_muerte?: string | null;
    @Expose() observaciones?: string | null;
    @Expose() foto?: string | null;

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
