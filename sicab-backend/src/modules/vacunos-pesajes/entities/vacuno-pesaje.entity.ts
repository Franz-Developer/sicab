// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\entities\vacuno-pesaje.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'vacunos_pesajes' })
@Check('chk_pesajes_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_pesajes_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_pesajes_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_pesajes_peso', 'peso >= 0 AND peso <= 1500')
@Check('chk_pesajes_observaciones_notempty', "observaciones IS NULL OR TRIM(observaciones) <> ''")
@Index('uix_pesajes_vacuno_fecha', ['vacuno_id', 'fecha_pesaje'], { unique: true, where: 'estado_id = 1000' })
export class VacunoPesaje extends BaseAuditEntity {
    @PrimaryColumn({ name: 'pesaje_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    pesaje_id!: number;

    @Column({ name: 'vacuno_id', type: 'bigint', transformer: bigintTransformer })
    vacuno_id!: number;

    @Column({ name: 'fecha_pesaje', type: 'date' })
    fecha_pesaje!: Date;

    @Column({ name: 'peso', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
    peso!: number;

    @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
    observaciones?: string | null;
}
