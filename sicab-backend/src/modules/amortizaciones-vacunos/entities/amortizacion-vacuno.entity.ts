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
@Check('chk_amortizaciones_valorinicial', 'valor_inicial >= 0')
@Check('chk_amortizaciones_valorperiodo', 'amortizacion_periodo >= 0')
@Check('chk_amortizaciones_acumulada', 'amortizacion_acumulada >= 0')
@Check('chk_amortizaciones_valorlibro', 'valor_libro >= 0')
@Check('chk_amortizaciones_valorlibro_coherente', 'valor_libro = valor_inicial - amortizacion_periodo')
@Check('chk_amortizaciones_valorinicialufv', 'valor_inicial_ufv IS NULL OR valor_inicial_ufv >= 0')
@Check('chk_amortizaciones_valorperiodoufv', 'amortizacion_periodo_ufv IS NULL OR amortizacion_periodo_ufv >= 0')
@Check('chk_amortizaciones_acumuladaufv', 'amortizacion_acumulada_ufv IS NULL OR amortizacion_acumulada_ufv >= 0')
@Check('chk_amortizaciones_valorlibroufv', 'valor_libro_ufv IS NULL OR valor_libro_ufv >= 0')
@Check('chk_amortizaciones_cotizacionufv', 'cotizacion_ufv_aplicada IS NULL OR cotizacion_ufv_aplicada > 0')
@Check('chk_amortizaciones_ufv_coherente', `
    (valor_inicial_ufv IS NULL AND amortizacion_periodo_ufv IS NULL
     AND amortizacion_acumulada_ufv IS NULL AND valor_libro_ufv IS NULL
     AND cotizacion_ufv_aplicada IS NULL AND fecha_cotizacion_ufv IS NULL)
    OR
    (valor_inicial_ufv IS NOT NULL AND cotizacion_ufv_aplicada IS NOT NULL
     AND fecha_cotizacion_ufv IS NOT NULL)
`)
@Check('chk_amortizaciones_valorlibroufv_coherente', `
    valor_libro_ufv IS NULL
    OR valor_libro_ufv = valor_inicial_ufv - amortizacion_periodo_ufv
`)
@Index('uix_amortizaciones_vacuno_periodo', ['vacuno_id', 'periodo'], { unique: true, where: 'estado_id = 1000' })
export class AmortizacionVacuno extends BaseAuditEntity {
    @PrimaryColumn({ name: 'amortizacion_vacuno_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    amortizacion_vacuno_id!: number;

    @Column({ name: 'vacuno_id', type: 'bigint', transformer: bigintTransformer })
    vacuno_id!: number;

    @Column({ name: 'gestion_id', type: 'bigint', transformer: bigintTransformer })
    gestion_id!: number;

    @Column({ name: 'periodo', type: 'smallint' })
    periodo!: number;

    @Column({ name: 'valor_inicial', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
    valor_inicial!: number;

    @Column({ name: 'amortizacion_periodo', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
    amortizacion_periodo!: number;

    @Column({ name: 'amortizacion_acumulada', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
    amortizacion_acumulada!: number;

    @Column({ name: 'valor_libro', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
    valor_libro!: number;

    @Column({ name: 'valor_inicial_ufv', type: 'decimal', precision: 14, scale: 4, nullable: true, transformer: decimalTransformer })
    valor_inicial_ufv?: number | null;

    @Column({ name: 'amortizacion_periodo_ufv', type: 'decimal', precision: 14, scale: 4, nullable: true, transformer: decimalTransformer })
    amortizacion_periodo_ufv?: number | null;

    @Column({ name: 'amortizacion_acumulada_ufv', type: 'decimal', precision: 14, scale: 4, nullable: true, transformer: decimalTransformer })
    amortizacion_acumulada_ufv?: number | null;

    @Column({ name: 'valor_libro_ufv', type: 'decimal', precision: 14, scale: 4, nullable: true, transformer: decimalTransformer })
    valor_libro_ufv?: number | null;

    @Column({ name: 'cotizacion_ufv_aplicada', type: 'decimal', precision: 12, scale: 6, nullable: true, transformer: decimalTransformer })
    cotizacion_ufv_aplicada?: number | null;

    @Column({ name: 'fecha_cotizacion_ufv', type: 'date', nullable: true })
    fecha_cotizacion_ufv?: Date | null;

    @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
    observaciones?: string | null;
}
