// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\entities\produccion-leche.entity.ts
import { Entity, Column, PrimaryColumn, Generated, Index, Check } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'producciones_leche' })
@Index('uix_produccionesleche_fecha_turno_suc', ['fecha_produccion', 'turno_ordeno_id', 'sucursal_id'], { unique: true, where: 'estado_id = 1000' })
@Index('idx_produccionesleche_fecha', ['fecha_produccion'], { where: 'estado_id = 1000' })
@Index('idx_produccionesleche_sucursal', ['sucursal_id'], { where: 'estado_id = 1000' })
@Index('idx_produccionesleche_turno', ['turno_ordeno_id'], { where: 'estado_id = 1000' })
@Check('chk_produccionesleche_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_produccionesleche_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_produccionesleche_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_produccionesleche_totallitros', 'total_litros >= 0')
@Check('chk_produccionesleche_totaldescartado', 'total_descartado >= 0')
@Check('chk_produccionesleche_totaldescartado_menor', 'total_descartado <= total_litros')
@Check('chk_produccionesleche_totalneto', 'total_neto >= 0')
@Check('chk_produccionesleche_totalneto_coherente', 'total_neto = total_litros - total_descartado')
@Check('chk_produccionesleche_fechaproduccion', 'fecha_produccion <= CURRENT_DATE')
@Check('chk_produccionesleche_observaciones_notempty', "observaciones IS NULL OR TRIM(observaciones) <> ''")
export class ProduccionLeche extends BaseAuditEntity {
    @PrimaryColumn({ name: 'produccion_leche_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    produccion_leche_id!: number;

    @Column({ name: 'sucursal_id', type: 'bigint', transformer: bigintTransformer })
    sucursal_id!: number;

    @Column({ name: 'turno_ordeno_id', type: 'bigint', transformer: bigintTransformer })
    turno_ordeno_id!: number;

    @Column({ name: 'fecha_produccion', type: 'date' })
    fecha_produccion!: string;

    @Column({ name: 'total_litros', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
    total_litros!: number;

    @Column({ name: 'total_descartado', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
    total_descartado!: number;

    @Column({ name: 'total_neto', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
    total_neto!: number;

    @Column({ name: 'observaciones', type: 'varchar', length: 1000, nullable: true })
    observaciones?: string | null;
}
