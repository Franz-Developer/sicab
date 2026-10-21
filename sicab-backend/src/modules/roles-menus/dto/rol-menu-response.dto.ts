// C:\sistemas\sicab\sicab-backend\src\modules\roles-menus\dto\rol-menu-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class RolMenuResponseDto {
    @Expose() @Transform(toNumber) rol_menu_id!: number;
    @Expose() @Transform(toNumber) rol_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.rol_nombre || null)
    rol_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.rol_codigo || null)
    rol_codigo!: string;

    @Expose() @Transform(toNumber) menu_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.menu_titulo || null)
    menu_titulo!: string;

    @Expose()
    @Transform(({ obj }) => obj.menu_url || null)
    menu_url!: string;

    @Expose() @Transform(toNumber) menu_padre_id?: number | null;

    @Expose()
    @Transform(({ obj }) => obj.menu_padre_titulo || null)
    menu_padre_titulo!: string | null;

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
