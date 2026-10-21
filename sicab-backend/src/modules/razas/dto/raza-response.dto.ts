// C:\sistemas\sicab\sicab-backend\src\modules\razas\dto\raza-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class RazaResponseDto {
    @Expose() @Transform(toNumber) raza_id!: number;

    // ⚠️ FALTABA: FK a tipos_semovientes
    @Expose() @Transform(toNumber) tipo_semoviente_id!: number;

    // ⚠️ FALTABA: nombre del tipo de semoviente (derivado del join ts.semoviente)
    @Expose() tipo_semoviente_nombre?: string | null;

    @Expose() raza!: string;
    @Expose() codigo!: string;
    @Expose() descripcion?: string | null;
    @Expose() origen?: string | null;

    @Expose()
    @Transform(({ value }) => (value !== null && value !== undefined ? Number(value) : null))
    peso_promedio_adulto?: number | null;

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
