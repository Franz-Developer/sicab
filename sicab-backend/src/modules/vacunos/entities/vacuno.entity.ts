// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\entities\vacuno.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';
import { SexoBiologico, EstadoVacuno, CondicionProductorLeche } from '../../../common/constants/estados.constant';

@Entity({ name: 'vacunos' })
@Check('chk_vacunos_estadoid', 'estado_id IN (1000, 1001)')
@Check('chk_vacunos_baja', `
    (estado_id = 1000 AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_vacunos_sexobiologico', `sexo_biologico_id IN (${SexoBiologico.MACHO}, ${SexoBiologico.HEMBRA})`)
@Check('chk_vacunos_estadovacuno', `estado_vacuno_id IN (${EstadoVacuno.ACTIVO}, ${EstadoVacuno.EN_TRATAMIENTO}, ${EstadoVacuno.SECA}, ${EstadoVacuno.DESCARTE}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO})`)
@Check('chk_vacunos_esproductor', `es_productor_leche IN (${CondicionProductorLeche.NO_PRODUCTOR}, ${CondicionProductorLeche.PRODUCTOR})`)
@Check('chk_vacunos_arete_notempty', "TRIM(arete) <> ''")
@Check('chk_vacunos_arete_minlength', 'LENGTH(TRIM(arete)) >= 3')
@Check('chk_vacunos_arete_mayusculas', 'arete = UPPER(arete)')
@Check('chk_vacunos_valoradquisicion', 'valor_adquisicion >= 0')
@Check('chk_vacunos_valorresidual', 'valor_residual >= 0')
@Check('chk_vacunos_residual_menor', 'valor_residual <= valor_adquisicion')
@Check('chk_vacunos_valoradquisicionufv', 'valor_adquisicion_ufv IS NULL OR valor_adquisicion_ufv >= 0')
@Check('chk_vacunos_valorresidualufv', 'valor_residual_ufv IS NULL OR valor_residual_ufv >= 0')
@Check('chk_vacunos_residualufv_menor', `
    valor_adquisicion_ufv IS NULL
    OR valor_residual_ufv IS NULL
    OR valor_residual_ufv <= valor_adquisicion_ufv
`)
@Check('chk_vacunos_ufv_coherente', `
    (valor_adquisicion_ufv IS NULL AND valor_residual_ufv IS NULL AND fecha_cotizacion_ufv IS NULL)
    OR
    (valor_adquisicion_ufv IS NOT NULL AND fecha_cotizacion_ufv IS NOT NULL)
`)
@Check('chk_vacunos_vidautil', 'vida_util_anios > 0')
@Check('chk_vacunos_tasaamort', 'tasa_amortizacion >= 0 AND tasa_amortizacion <= 100')
@Check('chk_vacunos_pesonacimiento', 'peso_nacimiento IS NULL OR peso_nacimiento >= 0')
@Check('chk_vacunos_pesoactual', 'peso_actual IS NULL OR peso_actual >= 0')
@Check('chk_vacunos_pesosalida', 'peso_salida IS NULL OR peso_salida >= 0')
@Check('chk_vacunos_precioventa', 'precio_venta IS NULL OR precio_venta >= 0')
@Check('chk_vacunos_fechanacimiento', 'fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE')
@Check('chk_vacunos_fechaingreso', 'fecha_ingreso <= CURRENT_DATE')
@Check('chk_vacunos_fechasalida', 'fecha_salida IS NULL OR fecha_salida <= CURRENT_DATE')
@Check('chk_vacunos_salida_coherente', `
    (estado_vacuno_id IN (${EstadoVacuno.ACTIVO}, ${EstadoVacuno.EN_TRATAMIENTO}, ${EstadoVacuno.SECA}, ${EstadoVacuno.DESCARTE}) AND fecha_salida IS NULL AND motivo_salida IS NULL)
    OR
    (estado_vacuno_id IN (${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO}) AND fecha_salida IS NOT NULL AND motivo_salida IS NOT NULL)
`)
@Check('chk_vacunos_precio_venta', `
    (estado_vacuno_id = ${EstadoVacuno.VENDIDO} AND precio_venta IS NOT NULL)
    OR
    (estado_vacuno_id <> ${EstadoVacuno.VENDIDO} AND precio_venta IS NULL)
`)
@Check('chk_vacunos_causa_muerte', `
    (estado_vacuno_id = ${EstadoVacuno.MUERTO} AND causa_muerte IS NOT NULL AND TRIM(causa_muerte) <> '')
    OR
    (estado_vacuno_id <> ${EstadoVacuno.MUERTO} AND causa_muerte IS NULL)
`)
@Index('uix_vacunos_arete', ['arete'], { unique: true, where: 'estado_id IN (1000, 1001)' })
@Index('idx_vacunos_sucursal', ['sucursal_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_raza', ['raza_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_categoria', ['categoria_vacuno_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_estadovacuno', ['estado_vacuno_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_productor', ['es_productor_leche'], { where: `estado_id = 1000 AND es_productor_leche = ${CondicionProductorLeche.PRODUCTOR}` })
@Index('idx_vacunos_ufv', ['fecha_cotizacion_ufv'], { where: 'valor_adquisicion_ufv IS NOT NULL' })
export class Vacuno extends BaseAuditEntity {
    @PrimaryColumn({ name: 'vacuno_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    vacuno_id!: number;

    @Column({ name: 'sucursal_id', type: 'bigint', transformer: bigintTransformer })
    sucursal_id!: number;

    @Column({ name: 'raza_id', type: 'bigint', transformer: bigintTransformer })
    raza_id!: number;

    @Column({ name: 'categoria_vacuno_id', type: 'bigint', transformer: bigintTransformer })
    categoria_vacuno_id!: number;

    @Column({ name: 'arete', type: 'varchar', length: 50 })
    arete!: string;

    @Column({ name: 'nombre', type: 'varchar', length: 150, nullable: true })
    nombre?: string | null;

    @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
    fecha_nacimiento?: Date | null;

    @Column({ name: 'fecha_ingreso', type: 'date' })
    fecha_ingreso!: Date;

    @Column({ name: 'sexo_biologico_id', type: 'smallint' })
    sexo_biologico_id!: number;

    @Column({ name: 'peso_nacimiento', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_nacimiento?: number | null;

    @Column({ name: 'peso_actual', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_actual?: number | null;

    @Column({ name: 'color', type: 'varchar', length: 50, nullable: true })
    color?: string | null;

    @Column({ name: 'padre_arete', type: 'varchar', length: 50, nullable: true })
    padre_arete?: string | null;

    @Column({ name: 'madre_arete', type: 'varchar', length: 50, nullable: true })
    madre_arete?: string | null;

    @Column({ name: 'valor_adquisicion', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
    valor_adquisicion!: number;

    @Column({ name: 'valor_residual', type: 'decimal', precision: 14, scale: 2, transformer: decimalTransformer })
    valor_residual!: number;

    @Column({ name: 'valor_adquisicion_ufv', type: 'decimal', precision: 14, scale: 4, nullable: true, transformer: decimalTransformer })
    valor_adquisicion_ufv?: number | null;

    @Column({ name: 'valor_residual_ufv', type: 'decimal', precision: 14, scale: 4, nullable: true, transformer: decimalTransformer })
    valor_residual_ufv?: number | null;

    @Column({ name: 'fecha_cotizacion_ufv', type: 'date', nullable: true })
    fecha_cotizacion_ufv?: Date | null;

    @Column({ name: 'vida_util_anios', type: 'integer' })
    vida_util_anios!: number;

    @Column({ name: 'tasa_amortizacion', type: 'decimal', precision: 5, scale: 2, transformer: decimalTransformer })
    tasa_amortizacion!: number;

    @Column({ name: 'fecha_inicio_amortizacion', type: 'date', nullable: true })
    fecha_inicio_amortizacion?: Date | null;

    @Column({ name: 'es_productor_leche', type: 'smallint' })
    es_productor_leche!: number;

    @Column({ name: 'estado_vacuno_id', type: 'smallint', default: EstadoVacuno.ACTIVO })
    estado_vacuno_id!: number;

    @Column({ name: 'fecha_salida', type: 'date', nullable: true })
    fecha_salida?: Date | null;

    @Column({ name: 'motivo_salida', type: 'varchar', length: 500, nullable: true })
    motivo_salida?: string | null;

    @Column({ name: 'peso_salida', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_salida?: number | null;

    @Column({ name: 'precio_venta', type: 'decimal', precision: 14, scale: 2, nullable: true, transformer: decimalTransformer })
    precio_venta?: number | null;

    @Column({ name: 'causa_muerte', type: 'varchar', length: 500, nullable: true })
    causa_muerte?: string | null;

    @Column({ name: 'observaciones', type: 'varchar', length: 1000, nullable: true })
    observaciones?: string | null;

    @Column({ name: 'foto', type: 'varchar', length: 255, nullable: true })
    foto?: string | null;
}
