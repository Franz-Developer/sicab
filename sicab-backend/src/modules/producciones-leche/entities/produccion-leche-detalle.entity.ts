// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\entities\produccion-leche-detalle.entity.ts
import { Entity, Column, PrimaryColumn, Generated, Index, Check } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'producciones_leche_detalle' })
@Index('uix_produccioneslechedetalle_unico', ['produccion_leche_id', 'vacuno_id'], { unique: true, where: 'estado_id = 1000' })
@Index('idx_produccioneslechedetalle_produccion', ['produccion_leche_id'], { where: 'estado_id = 1000' })
@Index('idx_produccioneslechedetalle_vacuno', ['vacuno_id'], { where: 'estado_id = 1000' })
@Check('chk_produccioneslechedetalle_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_produccioneslechedetalle_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_produccioneslechedetalle_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_produccioneslechedetalle_litros', 'litros >= 0')
@Check('chk_produccioneslechedetalle_observaciones_notempty', "observaciones IS NULL OR TRIM(observaciones) <> ''")
export class ProduccionLecheDetalle extends BaseAuditEntity {
    @PrimaryColumn({ name: 'produccion_leche_detalle_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    produccion_leche_detalle_id!: number;

    @Column({ name: 'produccion_leche_id', type: 'bigint', transformer: bigintTransformer })
    produccion_leche_id!: number;

    @Column({ name: 'vacuno_id', type: 'bigint', transformer: bigintTransformer })
    vacuno_id!: number;

    @Column({ name: 'litros', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
    litros!: number;

    @Column({ name: 'turno_ordeno_id', type: 'bigint', transformer: bigintTransformer })
    turno_ordeno_id!: number;

    @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
    observaciones?: string | null;
}
