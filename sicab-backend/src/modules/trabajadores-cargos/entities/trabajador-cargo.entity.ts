// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores-cargos\entities\trabajador-cargo.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'trabajadores_cargos' })
@Check('chk_trabajadorescargos_tipomonedaid', 'tipo_moneda_id IN (2300, 2301, 2302, 2303)')
@Check('chk_trabajadorescargos_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_trabajadorescargos_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_trabajadorescargos_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_trabajadorescargos_sueldobase', 'sueldo_base >= 0')
@Check('chk_trabajadorescargos_observaciones_notempty', "observaciones IS NULL OR TRIM(observaciones) <> ''")
@Check('chk_trabajadorescargos_fechas', 'fecha_hasta IS NULL OR fecha_hasta >= fecha_desde')
@Index('uix_trabajadorescargos_unico_activo', ['trabajador_id'], { unique: true, where: 'estado_id = 1000' })
@Index('idx_trabajadores_cargos_trabajador', ['trabajador_id'], { where: 'estado_id = 1000' })
@Index('idx_trabajadores_cargos_cargo_id', ['cargo_id'], { where: 'estado_id = 1000' })

export class TrabajadorCargo extends BaseAuditEntity {
    @PrimaryColumn({ name: 'trabajador_cargo_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    trabajador_cargo_id!: number;

    @Column({ name: 'trabajador_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    trabajador_id!: number;

    @Column({ name: 'cargo_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    cargo_id!: number;

    @Column({ name: 'sueldo_base', type: 'decimal', precision: 12, scale: 2, nullable: false, default: 0.00 })
    sueldo_base!: number;

    @Column({ name: 'tipo_moneda_id', type: 'smallint', nullable: false, default: 2300 })
    tipo_moneda_id!: number;

    @Column({ name: 'fecha_desde', type: 'date', nullable: false, default: () => 'CURRENT_DATE' })
    fecha_desde!: Date;

    @Column({ name: 'fecha_hasta', type: 'date', nullable: true })
    fecha_hasta?: Date | null;

    @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
    observaciones?: string | null;
}
