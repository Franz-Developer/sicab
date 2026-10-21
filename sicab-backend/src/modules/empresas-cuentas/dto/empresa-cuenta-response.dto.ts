// C:\sistemas\sicab\sicab-backend\src\modules\empresas-cuentas\dto\empresa-cuenta-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, TIPO_MONEDA_METADATA, TIPO_CUENTA_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class EmpresaCuentaResponseDto {
    @Expose() @Transform(toNumber) empresa_cuenta_id!: number;
    @Expose() @Transform(toNumber) empresa_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.empresa_nombre || null)
    empresa_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.empresa_codigo || null)
    empresa_codigo!: string;

    @Expose() @Transform(toNumber) banco_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.banco_nombre || null)
    banco_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.banco_codigo_asfi || null)
    banco_codigo_asfi!: string;

    @Expose()
    @Transform(({ obj }) => obj.banco_abreviatura || null)
    banco_abreviatura!: string;

    @Expose() @Transform(toNumber) tipo_moneda_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.tipo_moneda_id, TIPO_MONEDA_METADATA))
    tipo_moneda!: MetadataTransformResult;

    @Expose() nro_cuenta!: string;

    @Expose() @Transform(toNumber) tipo_cuenta_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.tipo_cuenta_id, TIPO_CUENTA_METADATA))
    tipo_cuenta!: MetadataTransformResult;

    @Expose() titular!: string;
    @Expose() @Transform(toNumber) es_principal!: number;
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