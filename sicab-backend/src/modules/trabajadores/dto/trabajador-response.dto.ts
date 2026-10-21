// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores\dto\trabajador-response.dto.ts
import { Expose, Transform } from 'class-transformer';
import { ESTADO_METADATA, Genero, GENERO_METADATA, EstadoCivilMasculino, ESTADO_CIVIL_MASCULINO_METADATA, EstadoCivilFemenino, ESTADO_CIVIL_FEMENINO_METADATA, CATEGORIA_LICENCIA_METADATA } from '../../../common/constants/estados.constant';
import { transformMetadataAbreviatura, transformMetadataLabel, toNumber } from '../../../common/utils/transform-metadata.util';
import { formatLocalDate, formatOnlyDate } from '../../../common/utils/date-formatter.util';

const transformEstadoCivil = ({ obj }: { obj: TrabajadorRawResult }) => {
    const id = Number(obj.estado_civil_id);
    const generoId = Number(obj.genero_id);

    const metadata = generoId === Genero.MASCULINO
        ? ESTADO_CIVIL_MASCULINO_METADATA[id as EstadoCivilMasculino]
        : ESTADO_CIVIL_FEMENINO_METADATA[id as EstadoCivilFemenino];

    return metadata?.abreviatura ?? '';
};

const transformNombreCompleto = ({ obj }: { obj: TrabajadorRawResult }) => {
    const partes = [
        obj.paterno,
        obj.materno,
        obj.nombres,
    ].filter(val => val !== null && val !== undefined && String(val).trim() !== '');

    return partes.join(' ');
};

export interface TrabajadorRawResult {
    trabajador_id: string | number;
    sucursal_id: string | number;
    sucursal?: string;
    sucursal_codigo?: string;
    empresa?: string;
    empresa_codigo?: string;
    cargo?: string;
    cargo_codigo?: string;
    genero_id: string | number;
    estado_civil_id: string | number;
    categoria_licencia_id: string | number;
    nombres: string;
    paterno: string;
    materno?: string | null;
    apodo: string;
    dni: string;
    telefono?: string | null;
    celular?: string | null;
    direccion?: string | null;
    email?: string | null;
    fecha_nacimiento?: string | Date | null;
    fecha_contratacion?: string | Date | null;
    foto: string;
    qr?: string | null;
    garante?: string | null;
    puntaje_acumulado: string | number;
    fecha_ultimo_calculo_puntaje?: string | Date | null;
    estado_id: string | number;
    estado_registro: string;
    usuario_operacion: string;
    usuario_id_registro: string | number;
    usuario_id_actualizacion?: string | number | null;
    usuario_id_baja?: string | number | null;
    fecha_registro: string | Date;
    fecha_actualizacion?: string | Date | null;
    fecha_baja?: string | Date | null;
    total_count?: string | number;
    tiene_dependencias?: boolean;
    campos_protegidos?: string[];
}

export class TrabajadorResponseDto {
    @Expose() @Transform(toNumber) trabajador_id!: number;
    @Expose() @Transform(toNumber) sucursal_id!: number;

    @Expose() sucursal!: string;

    @Expose() sucursal_codigo!: string;
    @Expose() empresa!: string;

    @Expose() empresa_codigo!: string;
    @Expose() cargo?: string | null;
    @Expose() cargo_codigo?: string | null;

    @Expose() @Transform(toNumber) genero_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.genero_id, GENERO_METADATA))
    genero!: string;

    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.genero_id, GENERO_METADATA))
    genero_label!: string;

    @Expose() @Transform(toNumber) estado_civil_id!: number;

    @Expose()
    @Transform(transformEstadoCivil)
    estado_civil!: string;

    @Expose() @Transform(toNumber) categoria_licencia_id!: number;

    @Expose()
    @Transform(({ obj }) => transformMetadataAbreviatura(obj.categoria_licencia_id, CATEGORIA_LICENCIA_METADATA))
    categoria_licencia!: string;

    @Expose()
    @Transform(({ obj }) => transformMetadataLabel(obj.categoria_licencia_id, CATEGORIA_LICENCIA_METADATA))
    categoria_licencia_label!: string;

    @Expose() nombres!: string;
    @Expose() paterno!: string;
    @Expose() materno?: string | null;
    @Expose() apodo!: string;

    @Expose()
    @Transform(transformNombreCompleto)
    trabajador_nombre_completo!: string;

    @Expose() dni!: string;
    @Expose() telefono?: string | null;
    @Expose() celular?: string | null;
    @Expose() direccion?: string | null;
    @Expose() email?: string | null;
    @Expose() garante?: string | null;

    @Expose() @Transform(toNumber) puntaje_acumulado!: number;

    @Expose()
    @Transform(({ value }) => formatLocalDate(value))
    fecha_ultimo_calculo_puntaje?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_nacimiento?: string | null;

    @Expose()
    @Transform(({ value }) => formatOnlyDate(value))
    fecha_contratacion?: string | null;

    @Expose() foto!: string;
    @Expose() qr?: string | null;
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
