// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\entities\amortizacion-vacuno.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'amortizaciones_vacunos' })
@Check('chk_amortizaciones_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_amortizaciones_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_amortizaciones_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_amortizaciones_gestion', 'gestion BETWEEN 2023 AND 2100')
@Check('chk_amortizaciones_valorinicial', 'valor_inicial >= 0')
@Check('chk_amortizaciones_valorresidual', 'valor_residual >= 0')
@Check('chk_amortizaciones_residual_menor', 'valor_residual <= valor_inicial')
@Check('chk_amortizaciones_valorgestion', 'amortizacion_gestion >= 0')
@Check('chk_amortizaciones_acumulada', 'amortizacion_acumulada >= 0')
@Check('chk_amortizaciones_valorlibro', 'valor_libro >= 0')
@Check('chk_amortizaciones_valorlibro_minimo', 'valor_libro >= valor_residual')
@Check('chk_amortizaciones_acumulada_max', 'amortizacion_acumulada <= valor_inicial - valor_residual')
@Check('chk_amortizaciones_valorlibro_coherente', 'valor_libro = valor_inicial - amortizacion_acumulada')
@Check('chk_amortizaciones_valorinicialufv', 'valor_inicial_ufv IS NULL OR valor_inicial_ufv >= 0')
@Check('chk_amortizaciones_valorresidualufv', 'valor_residual_ufv IS NULL OR valor_residual_ufv >= 0')
@Check('chk_amortizaciones_residualufv_menor', `
    valor_inicial_ufv IS NULL OR valor_residual_ufv IS NULL OR valor_residual_ufv <= valor_inicial_ufv
`)
@Check('chk_amortizaciones_valorgestionufv', 'amortizacion_gestion_ufv IS NULL OR amortizacion_gestion_ufv >= 0')
@Check('chk_amortizaciones_acumuladaufv', 'amortizacion_acumulada_ufv IS NULL OR amortizacion_acumulada_ufv >= 0')
@Check('chk_amortizaciones_valorlibroufv', 'valor_libro_ufv IS NULL OR valor_libro_ufv >= 0')
@Check('chk_amortizaciones_cotizacionufv', 'cotizacion_ufv_aplicada IS NULL OR cotizacion_ufv_aplicada > 0')
@Check('chk_amortizaciones_ufv_coherente', `
    (valor_inicial_ufv IS NULL AND valor_residual_ufv IS NULL AND amortizacion_gestion_ufv IS NULL AND amortizacion_acumulada_ufv IS NULL AND valor_libro_ufv IS NULL AND cotizacion_ufv_aplicada IS NULL AND fecha_cotizacion_ufv IS NULL)
    OR
    (valor_inicial_ufv IS NOT NULL AND valor_residual_ufv IS NOT NULL AND amortizacion_gestion_ufv IS NOT NULL AND amortizacion_acumulada_ufv IS NOT NULL AND valor_libro_ufv IS NOT NULL AND cotizacion_ufv_aplicada IS NOT NULL AND fecha_cotizacion_ufv IS NOT NULL)
`)
@Check('chk_amortizaciones_valorlibroufv_coherente', 'valor_libro_ufv IS NULL OR valor_libro_ufv = valor_inicial_ufv - amortizacion_acumulada_ufv')
@Check('chk_amortizaciones_acumuladaufv_max', 'valor_inicial_ufv IS NULL OR amortizacion_acumulada_ufv <= valor_inicial_ufv - valor_residual_ufv')
@Check('chk_amortizaciones_vidautil', 'vida_util_anios IS NULL OR vida_util_anios > 0')
@Check('chk_amortizaciones_tasaamort', 'tasa_amortizacion IS NULL OR (tasa_amortizacion > 0 AND tasa_amortizacion <= 100)')

@Index('uix_amortizaciones_vacuno_activa', ['vacuno_id'], { unique: true, where: 'estado_id = 1000' })
@Index('uix_amortizaciones_vacuno_gestion', ['vacuno_id', 'gestion'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('idx_amortizaciones_vacuno', ['vacuno_id'], { where: 'estado_id = 1000' })
@Index('idx_amortizaciones_gestion', ['gestion'], { where: 'estado_id = 1000' })
@Index('idx_amortizaciones_ufv', ['fecha_cotizacion_ufv'], { where: 'cotizacion_ufv_aplicada IS NOT NULL' })
export class AmortizacionVacuno extends BaseAuditEntity {
    @PrimaryColumn({ name: 'amortizacion_vacuno_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    amortizacion_vacuno_id!: number;

    @Column({ name: 'vacuno_id', type: 'bigint', transformer: bigintTransformer })
    vacuno_id!: number;

    @Column({ name: 'gestion', type: 'smallint', default: 2023 })
    gestion!: number;

    @Column({ name: 'valor_inicial', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    valor_inicial!: number;

    @Column({ name: 'valor_residual', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    valor_residual!: number;

    @Column({ name: 'amortizacion_gestion', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    amortizacion_gestion!: number;

    @Column({ name: 'amortizacion_acumulada', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    amortizacion_acumulada!: number;

    @Column({ name: 'valor_libro', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    valor_libro!: number;

    @Column({ name: 'valor_inicial_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    valor_inicial_ufv?: number | null;

    @Column({ name: 'valor_residual_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    valor_residual_ufv?: number | null;

    @Column({ name: 'amortizacion_gestion_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    amortizacion_gestion_ufv?: number | null;

    @Column({ name: 'amortizacion_acumulada_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    amortizacion_acumulada_ufv?: number | null;

    @Column({ name: 'valor_libro_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    valor_libro_ufv?: number | null;

    @Column({ name: 'cotizacion_ufv_aplicada', type: 'decimal', precision: 12, scale: 6, nullable: true, transformer: decimalTransformer })
    cotizacion_ufv_aplicada?: number | null;

    @Column({ name: 'fecha_cotizacion_ufv', type: 'date', nullable: true })
    fecha_cotizacion_ufv?: Date | null;

    @Column({ name: 'vida_util_anios', type: 'smallint', nullable: true })
    vida_util_anios?: number | null;

    @Column({ name: 'tasa_amortizacion', type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: decimalTransformer })
    tasa_amortizacion?: number | null;
}
