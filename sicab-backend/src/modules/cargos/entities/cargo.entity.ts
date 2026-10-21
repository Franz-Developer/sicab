// C:\sistemas\sicab\sicab-backend\src\modules\cargos\entities\cargo.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'cargos' })
@Check('chk_cargos_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_cargos_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_cargos_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_cargos_cargo_notempty', "TRIM(cargo) <> ''")
@Check('chk_cargos_cargo_minlength', 'LENGTH(TRIM(cargo)) >= 3')
@Check('chk_cargos_cargo_mayusculas', 'cargo = UPPER(cargo)')
@Check('chk_cargos_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_cargos_codigo_minlength', 'LENGTH(TRIM(codigo)) >= 2')
@Check('chk_cargos_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_cargos_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Check('chk_cargos_sueldobase', 'sueldo_base >= 0')
@Check('chk_cargos_tipomonedaid', 'tipo_moneda_id IN (2300, 2301, 2302, 2303)')
@Check('chk_cargos_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Index('uix_cargos_cargo_unique', ['cargo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_cargos_codigo_unique', ['codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })

export class Cargo extends BaseAuditEntity {
    @PrimaryColumn({ name: 'cargo_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    cargo_id!: number;

    @Column({ name: 'cargo', type: 'varchar', length: 100, nullable: false })
    cargo!: string;

    @Column({ name: 'codigo', type: 'varchar', length: 60, nullable: false })
    codigo!: string;

    @Column({ name: 'sueldo_base', type: 'decimal', precision: 12, scale: 2, nullable: false, default: 0.00, transformer: decimalTransformer })
    sueldo_base!: number;

    @Column({ name: 'tipo_moneda_id', type: 'smallint', nullable: false, default: 2300 })
    tipo_moneda_id!: number;

    @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
    descripcion?: string | null;
}
