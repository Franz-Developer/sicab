// C:\sistemas\central\central-backend\src\modules\tareas-programadas\dto\tarea-programada-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, TIPO_TAREA_METADATA, FRECUENCIA_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadata, transformMetadataAbreviatura, transformMetadataLabel, toNumber, MetadataTransformResult } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class TareaProgramadaResponseDto {
    @Expose() @Transform(toNumber) tarea_id!: number;
    @Expose() codigo!: string;
    @Expose() nombre!: string;

    @Expose()
    @Transform(({ value }) => value ?? null)
    descripcion?: string | null;

    @Expose() @Transform(toNumber) tipo_tarea_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.tipo_tarea_id, TIPO_TAREA_METADATA))
    tipo_tarea!: MetadataTransformResult;

    @Expose() @Transform(toNumber) frecuencia_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadata(obj.frecuencia_id, FRECUENCIA_METADATA))
    frecuencia!: MetadataTransformResult;

    @Expose()
    @Transform(({ value }) => value ?? null)
    cron_expresion?: string | null;

    @Expose()
    @Transform(({ value }) => value ?? null)
    parametros?: Record<string, any> | null;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    ultima_ejecucion?: string | null;

    @Expose()
    @Transform(({ value }) => value ?? null)
    ultimo_error?: string | null;

    @Expose()
    @Transform(({ value }) => Number(value))
    intentos_fallidos!: number;

    @Expose()
    @Transform(({ value }) => Number(value))
    notificar_admin!: number;

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
}
