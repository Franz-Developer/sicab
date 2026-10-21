// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\entities\tipo-semoviente.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'tipos_semovientes' })
@Check('chk_tipossemovientes_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_tipossemovientes_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_tipossemovientes_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_tipossemovientes_vidautil', 'vida_util_anios > 0')
@Check('chk_tipossemovientes_tasaamort', 'tasa_amortizacion >= 0 AND tasa_amortizacion <= 100')
@Check('chk_tipossemovientes_semoviente_notempty', "TRIM(semoviente) <> ''")
@Index('uix_tipossemovientes_semoviente', ['semoviente'], { unique: true, where: 'estado_id IN (1000, 1002)' })
export class TipoSemoviente extends BaseAuditEntity {
    @PrimaryColumn({ name: 'tipo_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    tipo_id!: number;

    @Column({ name: 'semoviente', type: 'varchar', length: 100 })
    semoviente!: string;

    @Column({ name: 'vida_util_anios', type: 'integer' })
    vida_util_anios!: number;

    @Column({ name: 'tasa_amortizacion', type: 'decimal', precision: 5, scale: 2, transformer: decimalTransformer })
    tasa_amortizacion!: number;
}
