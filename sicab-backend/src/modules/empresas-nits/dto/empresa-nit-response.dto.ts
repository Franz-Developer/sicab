// C:\sistemas\sicab\sicab-backend\src\modules\empresas-nits\dto\empresa-nit-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, AMBIENTE_METADATA, MODALIDAD_FACTURACION_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class EmpresaNitResponseDto {
    @Expose() @Transform(toNumber) empresa_nit_id!: number;
    @Expose() @Transform(toNumber) empresa_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.empresa_nombre || null)
    empresa_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.empresa_codigo || null)
    empresa_codigo!: string;

    @Expose() @Transform(toNumber) ambiente_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.ambiente_id, AMBIENTE_METADATA))
    ambiente!: MetadataTransformResult;

    @Expose() nit!: string;
    @Expose() razon_social!: string;
    @Expose() codigo_actividad_caeb?: string | null;
    @Expose() actividad_economica_principal!: string;
    @Expose() etiqueta!: string;

    @Expose() @Transform(toNumber) modalidad_facturacion_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.modalidad_facturacion_id, MODALIDAD_FACTURACION_METADATA))
    modalidad_facturacion!: MetadataTransformResult;

    @Expose() certificado_digital?: string | null;
    @Expose() certificado_password?: string | null;
    @Expose() token_siat?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_inicio_vigencia?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_fin_vigencia?: string | null;

    @Expose() email_fiscal!: string;
    @Expose() telefono_fiscal?: string | null;
    @Expose() municipio_fiscal?: string | null;
    @Expose() direccion_fiscal?: string | null;

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
