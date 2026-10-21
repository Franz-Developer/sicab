// C:\sistemas\sicab\sicab-backend\src\modules\menus\dto\menu-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class MenuResponseDto {
    @Expose() @Transform(toNumber) menu_id!: number;

    @Expose()
    @Transform(({ obj }) => (obj.menu_padre_id !== null && obj.menu_padre_id !== undefined ? Number(obj.menu_padre_id) : null))
    menu_padre_id?: number | null;

    @Expose() titulo!: string;
    @Expose() icono?: string | null;
    @Expose() url?: string | null;

    @Expose()
    @Transform(({ value }) => Number(value))
    orden!: number;

    @Expose() @Transform(toNumber) estado_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.estado_id, ESTADO_METADATA))
    estado_registro!: string;

    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.estado_id, ESTADO_METADATA))
    estado_label!: string;

    @Expose()
    usuario_operacion!: string;

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
