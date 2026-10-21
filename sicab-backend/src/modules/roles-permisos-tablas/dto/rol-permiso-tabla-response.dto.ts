// C:\sistemas\sicab\sicab-backend\src\modules\roles-permisos-tablas\dto\rol-permiso-tabla-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate } from '../../../common/utils/date-formatter.util';

export class RolPermisoTablaResponseDto {
    @Expose() @Transform(toNumber) rol_permiso_tabla_id!: number;

    @Expose() @Transform(toNumber) rol_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.rol_nombre || null)
    rol_nombre!: string;

    @Expose()
    @Transform(({ obj }) => obj.rol_codigo || null)
    rol_codigo!: string;

    @Expose()
    @Transform(({ obj }) => (obj.rol_estado_id != null ? Number(obj.rol_estado_id) : null))
    rol_estado_id?: number | null;

    @Expose() @Transform(toNumber) tabla_id!: number;

    @Expose()
    @Transform(({ obj }) => obj.tabla_nombre || null)
    tabla_nombre!: string;

    @Expose() @Transform(toNumber) tabla_permite_leer!: number;
    @Expose() @Transform(toNumber) tabla_permite_crear!: number;
    @Expose() @Transform(toNumber) tabla_permite_editar!: number;
    @Expose() @Transform(toNumber) tabla_permite_eliminar!: number;
    @Expose() @Transform(toNumber) tabla_permite_anular!: number;
    @Expose() @Transform(toNumber) tabla_permite_archivar!: number;
    @Expose() @Transform(toNumber) tabla_permite_desarchivar!: number;

    @Expose() @Transform(toNumber) leer!: number;
    @Expose() @Transform(toNumber) crear!: number;
    @Expose() @Transform(toNumber) editar!: number;
    @Expose() @Transform(toNumber) eliminar!: number;
    @Expose() @Transform(toNumber) anular!: number;
    @Expose() @Transform(toNumber) archivar!: number;
    @Expose() @Transform(toNumber) desarchivar!: number;

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
