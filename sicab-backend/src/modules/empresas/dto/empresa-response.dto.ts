// C:\sistemas\sicab\sicab-backend\src\modules\empresas\dto\empresa-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

export class EmpresaResponseDto {
    @Expose() @Transform(toNumber) empresa_id!: number;
    @Expose() empresa!: string;
    @Expose() codigo!: string;
    @Expose() logo!: string;
    @Expose() eslogan?: string | null;
    @Expose() descripcion?: string | null;
    @Expose() lugar?: string | null;
    @Expose() representante?: string | null;
    @Expose() direccion?: string | null;
    @Expose() telefono?: string | null;
    @Expose() email?: string | null;
    @Expose() matricula_comercio?: string | null;
    @Expose() licencia_frecuencia_att?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_emision_licencia_att?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_vencimiento_licencia_att?: string | null;

    @Expose() resolucion_municipal_operacion?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_emision_resolucion?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_vencimiento_resolucion?: string | null;

    @Expose() frecuencia_asignada_mhz?: string | null;
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
