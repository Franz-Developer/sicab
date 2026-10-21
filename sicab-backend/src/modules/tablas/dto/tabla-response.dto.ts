// C:\sistemas\sicab\sicab-backend\src\modules\tablas\dto\tabla-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class TablaResponseDto {
    @Expose()
    @Transform(toNumber)
    tabla_id!: number;

    @Expose()
    nombre!: string;

    @Expose() @Transform(toNumber) permite_leer!: number;
    @Expose() @Transform(toNumber) permite_crear!: number;
    @Expose() @Transform(toNumber) permite_editar!: number;
    @Expose() @Transform(toNumber) permite_eliminar!: number;
    @Expose() @Transform(toNumber) permite_anular!: number;
    @Expose() @Transform(toNumber) permite_archivar!: number;
    @Expose() @Transform(toNumber) permite_desarchivar!: number;

    @Expose()
    @Transform(toNumber)
    estado_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.estado_id, ESTADO_METADATA))
    estado_registro!: string;

    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.estado_id, ESTADO_METADATA))
    estado_label!: string;

    @Expose()
    usuario_operacion!: string;

    @Expose()
    @Transform(toNumber)
    usuario_id_registro!: number;

    @Expose()
    @Transform(toNumber)
    usuario_id_actualizacion?: number | null;

    @Expose()
    @Transform(toNumber)
    usuario_id_baja?: number | null;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_registro!: string;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_actualizacion?: string | null;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_baja?: string | null;

    @Expose()
    tiene_dependencias?: boolean;

    @Expose()
    campos_protegidos?: string[];
}
