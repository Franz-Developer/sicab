// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\entities\vacuno-faena.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'vacunos_faenas' })
@Check('chk_faenas_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_faenas_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_faenas_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_faenas_pesovivo', 'peso_vivo_faena > 0')
@Check('chk_faenas_pesocanalcaliente', 'peso_canal_caliente > 0 AND peso_canal_caliente <= peso_vivo_faena')
@Check('chk_faenas_pesocanalfria', 'peso_canal_fria IS NULL OR (peso_canal_fria > 0 AND peso_canal_fria <= peso_canal_caliente)')
@Check('chk_faenas_rendimiento_coherente', 'rendimiento_canal IS NULL OR (rendimiento_canal > 0 AND rendimiento_canal <= 100 AND ABS(rendimiento_canal - (peso_canal_caliente / peso_vivo_faena * 100)) <= 0.5)')
@Index('uix_faenas_vacuno', ['vacuno_id'], { unique: true, where: 'estado_id IN (1000, 1002)' })

export class VacunoFaena extends BaseAuditEntity {
    @PrimaryColumn({ name: 'faena_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    faena_id!: number;

    @Column({ name: 'vacuno_id', type: 'bigint', transformer: bigintTransformer })
    vacuno_id!: number;

    @Column({ name: 'fecha_faena', type: 'date' })
    fecha_faena!: string;

    @Column({ name: 'peso_vivo_faena', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
    peso_vivo_faena!: number;

    @Column({ name: 'peso_canal_caliente', type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
    peso_canal_caliente!: number;

    @Column({ name: 'peso_canal_fria', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_canal_fria?: number | null;

    @Column({ name: 'rendimiento_canal', type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: decimalTransformer })
    rendimiento_canal?: number | null;

    @Column({ name: 'matadero', type: 'varchar', length: 150, nullable: true })
    matadero?: string | null;

    @Column({ name: 'numero_guia', type: 'varchar', length: 50, nullable: true })
    numero_guia?: string | null;

    @Column({ name: 'observaciones', type: 'varchar', length: 500, nullable: true })
    observaciones?: string | null;
}
