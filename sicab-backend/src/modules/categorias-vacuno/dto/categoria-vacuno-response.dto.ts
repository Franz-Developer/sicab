// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\dto\categoria-vacuno-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, CONDICION_PRODUCTOR_LECHE_METADATA, SEXO_BIOLOGICO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class CategoriaVacunoResponseDto {
    @Expose() @Transform(toNumber) categoria_vacuno_id!: number;
    @Expose() categoria!: string;
    @Expose() codigo!: string;
    @Expose() descripcion?: string | null;

    @Expose() @Transform(toNumber) edad_min_meses?: number | null;
    @Expose() @Transform(toNumber) edad_max_meses?: number | null;

    @Expose() @Transform(toNumber) es_productor_leche!: number;
    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.es_productor_leche, CONDICION_PRODUCTOR_LECHE_METADATA))
    es_productor_leche_registro!: string;
    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.es_productor_leche, CONDICION_PRODUCTOR_LECHE_METADATA))
    es_productor_leche_label!: string;

    @Expose() @Transform(toNumber) sexo_biologico_permitido_id!: number;
    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.sexo_biologico_permitido_id, SEXO_BIOLOGICO_METADATA))
    sexo_biologico_permitido_registro!: string;
    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.sexo_biologico_permitido_id, SEXO_BIOLOGICO_METADATA))
    sexo_biologico_permitido_label!: string;

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
