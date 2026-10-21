// C:\sistemas\sicab\sicab-backend\src\modules\parametros-globales\dto\parametro-global-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, TIPO_DATO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class ParametroGlobalResponseDto {
    @Expose() @Transform(toNumber) parametro_id!: number;
    @Expose() clave!: string;
    @Expose() valor!: string;
    @Expose() @Transform(toNumber) tipo_dato_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.tipo_dato_id, TIPO_DATO_METADATA))
    tipo_dato!: MetadataTransformResult;

    @Expose() datos_json?: any | null;
    @Expose() descripcion?: string | null;
    @Expose() @Transform(toNumber) editable!: number;
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
