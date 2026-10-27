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
    @Expose() raza_nombre?: string | null;
    @Expose() @Transform(toNumber) categoria_vacuno_id!: number;
    @Expose() categoria_vacuno_nombre?: string | null;
    @Expose() @Transform(toNumber) categoria_edad_min_meses?: number | null;
    @Expose() @Transform(toNumber) categoria_edad_max_meses?: number | null;
    @Expose() @Transform(toNumber) tipo_semoviente_id!: number;
    @Expose() tipo_semoviente_nombre?: string | null;

    @Expose() arete!: string;
    @Expose() nombre?: string | null;

    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_nacimiento?: string | null;
    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_ingreso!: string;

    @Expose()
    @Transform(({ obj }) => {
        if (!obj.fecha_nacimiento) return null;
        const fechaNac = new Date(obj.fecha_nacimiento);
        const hoy = new Date();
        let meses = (hoy.getFullYear() - fechaNac.getFullYear()) * 12;
        meses -= fechaNac.getMonth();
        meses += hoy.getMonth();
        if (hoy.getDate() < fechaNac.getDate()) meses--;
        return meses >= 0 ? meses : 0;
    })
    edad_meses?: number | null;

    @Expose()
    @Transform(({ obj }) => {
        if (!obj.fecha_nacimiento) return null;
        const fechaNac = new Date(obj.fecha_nacimiento);
        const hoy = new Date();
        let meses = (hoy.getFullYear() - fechaNac.getFullYear()) * 12;
        meses -= fechaNac.getMonth();
        meses += hoy.getMonth();
        if (hoy.getDate() < fechaNac.getDate()) meses--;
        return Math.floor(meses / 12);
    })
    edad_anios?: number | null;

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

    @Expose() @Transform(toNumber) padre_id?: number | null;
    @Expose() padre_arete?: string | null;
    @Expose() padre_nombre?: string | null;
    @Expose() @Transform(toNumber) padre_estado_id?: number | null;
    @Expose() @Transform(toNumber) padre_estado_vacuno_id?: number | null;

    @Expose()
    @Transform(({ obj }) => obj.padre_estado_id != null
        ? transformMetadataAbreviatura(obj.padre_estado_id, ESTADO_METADATA)
        : null)
    padre_estado_abreviatura?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.padre_estado_id != null
        ? transformMetadataLabel(obj.padre_estado_id, ESTADO_METADATA)
        : null)
    padre_estado_label?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.padre_estado_vacuno_id != null
        ? ESTADO_VACUNO_METADATA[obj.padre_estado_vacuno_id as EstadoVacuno]?.abreviatura ?? null
        : null)
    padre_estado_vacuno_abreviatura?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.padre_estado_vacuno_id != null
        ? ESTADO_VACUNO_METADATA[obj.padre_estado_vacuno_id as EstadoVacuno]?.label ?? null
        : null)
    padre_estado_vacuno_label?: string | null;

    @Expose() @Transform(toNumber) madre_id?: number | null;
    @Expose() madre_arete?: string | null;
    @Expose() madre_nombre?: string | null;
    @Expose() @Transform(toNumber) madre_estado_id?: number | null;
    @Expose() @Transform(toNumber) madre_estado_vacuno_id?: number | null;

    @Expose()
    @Transform(({ obj }) => obj.madre_estado_id != null
        ? transformMetadataAbreviatura(obj.madre_estado_id, ESTADO_METADATA)
        : null)
    madre_estado_abreviatura?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.madre_estado_id != null
        ? transformMetadataLabel(obj.madre_estado_id, ESTADO_METADATA)
        : null)
    madre_estado_label?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.madre_estado_vacuno_id != null
        ? ESTADO_VACUNO_METADATA[obj.madre_estado_vacuno_id as EstadoVacuno]?.abreviatura ?? null
        : null)
    madre_estado_vacuno_abreviatura?: string | null;

    @Expose()
    @Transform(({ obj }) => obj.madre_estado_vacuno_id != null
        ? ESTADO_VACUNO_METADATA[obj.madre_estado_vacuno_id as EstadoVacuno]?.label ?? null
        : null)
    madre_estado_vacuno_label?: string | null;

    @Expose() @Transform(({ value }) => Number(value)) valor_adquisicion!: number;
    @Expose() @Transform(({ value }) => Number(value)) valor_residual!: number;
    @Expose() @Transform(({ value }) => value !== null ? Number(value) : null) valor_adquisicion_ufv?: number | null;
    @Expose() @Transform(({ value }) => value !== null ? Number(value) : null) valor_residual_ufv?: number | null;

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

    @Expose() @Transform(toNumber) vida_util_anios?: number | null;
    @Expose() @Transform(({ value }) => value !== null && value !== undefined ? Number(value) : null) tasa_amortizacion?: number | null;
    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_inicio_amortizacion?: string | null;
    @Expose() @Transform(({ value }) => formatOnlyDate(value)) fecha_ultima_amortizacion?: string | null;
    @Expose() @Transform(toNumber) meses_amortizados?: number;
    @Expose() @Transform(({ value }) => value !== null && value !== undefined ? Number(value) : null) amortizacion_acumulada?: number | null;
    @Expose() @Transform(({ value }) => value !== null && value !== undefined ? Number(value) : null) valor_libro_actual?: number | null;

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
