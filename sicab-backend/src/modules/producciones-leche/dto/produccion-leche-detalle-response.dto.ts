// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\produccion-leche-detalle-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber, toRequiredNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class ProduccionLecheDetalleResponseDto {
    @Expose() @Transform(toNumber) produccion_leche_detalle_id!: number;
    @Expose() @Transform(toNumber) produccion_leche_id!: number;

    @Expose() @Transform(toNumber) vacuno_id!: number;
    @Expose() vacuno_arete?: string | null;
    @Expose() vacuno_nombre?: string | null;
    @Expose() raza_nombre?: string | null;
    @Expose() categoria_nombre?: string | null;

    @Expose() @Transform(toRequiredNumber) litros!: number;
    @Expose() observaciones?: string | null;

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
}
