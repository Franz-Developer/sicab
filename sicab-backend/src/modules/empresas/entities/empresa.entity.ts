// C:\sistemas\sicab\sicab-backend\src\modules\empresas\entities\empresa.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'empresas' })
@Check('chk_empresas_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_empresas_codigo_minlength', 'LENGTH(TRIM(codigo)) >= 3')
@Check('chk_empresas_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_empresas_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Check('chk_empresas_empresa_notempty', "TRIM(empresa) <> ''")
@Check('chk_empresas_empresa_mayusculas', 'empresa = UPPER(empresa)')
@Check('chk_empresas_empresa_minlength', 'LENGTH(TRIM(empresa)) >= 3')
@Check('chk_empresas_logo_notempty', "TRIM(logo) <> ''")
@Check('chk_empresas_matricula_notempty', "TRIM(matricula_comercio) <> ''")
@Check('chk_empresas_matricula_formato', "matricula_comercio ~ '^[A-Z0-9-]+$'")
@Check('chk_empresas_email_formato', "email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
@Check('chk_empresas_telefono_notempty', "telefono IS NULL OR TRIM(telefono) <> ''")
@Check('chk_empresas_eslogan_notempty', "eslogan IS NULL OR TRIM(eslogan) <> ''")
@Check('chk_empresas_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Check('chk_empresas_lugar_notempty', "lugar IS NULL OR TRIM(lugar) <> ''")
@Check('chk_empresas_representante_notempty', "representante IS NULL OR TRIM(representante) <> ''")
@Check('chk_empresas_direccion_notempty', "direccion IS NULL OR TRIM(direccion) <> ''")
@Check('chk_empresas_eslogan_minlength', 'eslogan IS NULL OR LENGTH(TRIM(eslogan)) >= 3')
@Check('chk_empresas_lugar_minlength', 'lugar IS NULL OR LENGTH(TRIM(lugar)) >= 3')
@Check('chk_empresas_representante_minlength', 'representante IS NULL OR LENGTH(TRIM(representante)) >= 3')
@Check('chk_empresas_direccion_minlength', 'direccion IS NULL OR LENGTH(TRIM(direccion)) >= 5')
@Check('chk_empresas_frecuencia_formato', "frecuencia_asignada_mhz IS NULL OR frecuencia_asignada_mhz ~ '^[0-9]+(\\.[0-9]+)?(\\s*(MHz|kHz|GHz))?$'")
@Check('chk_empresas_fechas_licencia_att', 'fecha_emision_licencia_att IS NULL OR fecha_vencimiento_licencia_att IS NULL OR fecha_vencimiento_licencia_att >= fecha_emision_licencia_att')
@Check('chk_empresas_fechas_resolucion', 'fecha_emision_resolucion IS NULL OR fecha_vencimiento_resolucion IS NULL OR fecha_vencimiento_resolucion >= fecha_emision_resolucion')
@Check('chk_empresas_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_empresas_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_empresas_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Index('uix_empresas_empresa_unique', ['empresa'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_empresas_codigo_unique', ['codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_empresas_matriculacomercio_unique', ['matricula_comercio'], { unique: true, where: 'estado_id IN (1000, 1002)' })

export class Empresa extends BaseAuditEntity {
    @PrimaryColumn({ name: 'empresa_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    empresa_id!: number;

    @Column({ name: 'empresa', type: 'varchar', length: 200, nullable: false })
    empresa!: string;

    @Column({ name: 'codigo', type: 'varchar', length: 30, nullable: false })
    codigo!: string;

    @Column({ name: 'logo', type: 'varchar', length: 255, nullable: false })
    logo!: string;

    @Column({ name: 'eslogan', type: 'varchar', length: 150, nullable: true })
    eslogan?: string | null;

    @Column({ name: 'descripcion', type: 'varchar', length: 500, nullable: true })
    descripcion?: string | null;

    @Column({ name: 'lugar', type: 'varchar', length: 60, nullable: true })
    lugar?: string | null;

    @Column({ name: 'representante', type: 'varchar', length: 100, nullable: true })
    representante?: string | null;

    @Column({ name: 'direccion', type: 'varchar', length: 500, nullable: true })
    direccion?: string | null;

    @Column({ name: 'telefono', type: 'varchar', length: 100, nullable: true })
    telefono?: string | null;

    @Column({ name: 'email', type: 'varchar', length: 100, nullable: true })
    email?: string | null;

    @Column({ name: 'matricula_comercio', type: 'varchar', length: 50, nullable: false })
    matricula_comercio!: string;

    @Column({ name: 'licencia_frecuencia_att', type: 'varchar', length: 50, nullable: true })
    licencia_frecuencia_att?: string | null;                    // ← FIX

    @Column({ name: 'fecha_emision_licencia_att', type: 'date', nullable: true })
    fecha_emision_licencia_att?: Date | null;

    @Column({ name: 'fecha_vencimiento_licencia_att', type: 'date', nullable: true })
    fecha_vencimiento_licencia_att?: Date | null;

    @Column({ name: 'resolucion_municipal_operacion', type: 'varchar', length: 50, nullable: true })
    resolucion_municipal_operacion?: string | null;

    @Column({ name: 'fecha_emision_resolucion', type: 'date', nullable: true })
    fecha_emision_resolucion?: Date | null;

    @Column({ name: 'fecha_vencimiento_resolucion', type: 'date', nullable: true })
    fecha_vencimiento_resolucion?: Date | null;

    @Column({ name: 'frecuencia_asignada_mhz', type: 'varchar', length: 30, nullable: true })
    frecuencia_asignada_mhz?: string | null;
}
