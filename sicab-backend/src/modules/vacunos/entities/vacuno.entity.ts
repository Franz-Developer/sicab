// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\entities\vacuno.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';
import { SexoBiologico, EstadoVacuno, CondicionProductorLeche } from '../../../common/constants/estados.constant';

@Entity({ name: 'vacunos' })
@Check('chk_vacunos_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_vacunos_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_vacunos_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_vacunos_historico_final', `
    (estado_id = 1002 AND estado_vacuno_id IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO}))
    OR
    (estado_id IN (1000, 1001) AND estado_vacuno_id IN (${EstadoVacuno.ACTIVO}, ${EstadoVacuno.PARA_FAENA}, ${EstadoVacuno.PARA_VENTA}))
`)
@Check('chk_vacunos_sexobiologico', `sexo_biologico_id IN (${SexoBiologico.MACHO}, ${SexoBiologico.HEMBRA})`)
@Check('chk_vacunos_estadovacuno', `estado_vacuno_id IN (${EstadoVacuno.ACTIVO}, ${EstadoVacuno.PARA_FAENA}, ${EstadoVacuno.FAENADO}, ${EstadoVacuno.PARA_VENTA}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO})`)
@Check('chk_vacunos_esproductor', `es_productor_leche IN (${CondicionProductorLeche.NO_PRODUCTOR}, ${CondicionProductorLeche.PRODUCTOR})`)
@Check('chk_vacunos_arete_notempty', "TRIM(arete) <> ''")
@Check('chk_vacunos_arete_minlength', 'LENGTH(TRIM(arete)) >= 3')
@Check('chk_vacunos_arete_mayusculas', 'arete = UPPER(arete)')
@Check('chk_vacunos_nombre_notempty', "TRIM(nombre) <> ''")
@Check('chk_vacunos_nombre_minlength', 'LENGTH(TRIM(nombre)) >= 2')
@Check('chk_vacunos_nombre_mayusculas', 'nombre = UPPER(nombre)')
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
    (valor_adquisicion_ufv IS NULL AND valor_residual_ufv IS NULL)
    OR
    (valor_adquisicion_ufv IS NOT NULL AND valor_residual_ufv IS NOT NULL)
`)
@Check('chk_vacunos_pesonacimiento', 'peso_nacimiento IS NULL OR (peso_nacimiento >= 0 AND peso_nacimiento <= 70)')
@Check('chk_vacunos_pesoactual', 'peso_actual IS NULL OR (peso_actual >= 0 AND peso_actual <= 1500)')
@Check('chk_vacunos_pesosalida', 'peso_salida IS NULL OR (peso_salida >= 0 AND peso_salida <= 1500)')
@Check('chk_vacunos_pesoactual_mayor_nacimiento', `
    peso_nacimiento IS NULL
    OR peso_actual IS NULL
    OR peso_actual >= peso_nacimiento
`)
@Check('chk_vacunos_precioventa', 'precio_venta IS NULL OR precio_venta >= 0')
@Check('chk_vacunos_fechaingreso_nacimiento', 'fecha_ingreso >= fecha_nacimiento')
@Check('chk_vacunos_salida_coherente', `
    (estado_vacuno_id IN (${EstadoVacuno.ACTIVO}, ${EstadoVacuno.PARA_FAENA}, ${EstadoVacuno.PARA_VENTA}) AND fecha_salida IS NULL AND motivo_salida IS NULL AND peso_salida IS NULL)
    OR
    (estado_vacuno_id IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO}) AND fecha_salida IS NOT NULL AND motivo_salida IS NOT NULL AND peso_salida IS NOT NULL)
`)
@Check('chk_vacunos_precio_venta', `
    (estado_vacuno_id IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}) AND precio_venta IS NOT NULL)
    OR
    (estado_vacuno_id NOT IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}) AND precio_venta IS NULL)
`)
@Check('chk_vacunos_causa_muerte', `
    (estado_vacuno_id = ${EstadoVacuno.MUERTO} AND causa_muerte IS NOT NULL AND TRIM(causa_muerte) <> '')
    OR
    (estado_vacuno_id <> ${EstadoVacuno.MUERTO} AND causa_muerte IS NULL)
`)
@Check('chk_vacunos_vida_util', 'vida_util_anios IS NULL OR vida_util_anios > 0')
@Check('chk_vacunos_tasa_amort', 'tasa_amortizacion IS NULL OR (tasa_amortizacion > 0 AND tasa_amortizacion <= 100)')
@Check('chk_vacunos_meses_amort', 'meses_amortizados >= 0')
@Check('chk_vacunos_amort_acum', 'amortizacion_acumulada >= 0')
@Check('chk_vacunos_amort_acum_max', 'amortizacion_acumulada <= valor_adquisicion - valor_residual')
@Check('chk_vacunos_valor_libro', `
    valor_libro_actual IS NULL
    OR (valor_libro_actual >= valor_residual AND valor_libro_actual <= valor_adquisicion)
`)
@Check('chk_vacunos_amort_inicio', `
    fecha_inicio_amortizacion IS NULL
    OR fecha_inicio_amortizacion >= fecha_ingreso
`)
@Check('chk_vacunos_amort_ultima', `
    fecha_ultima_amortizacion IS NULL
    OR fecha_ultima_amortizacion >= fecha_inicio_amortizacion
`)
@Check('chk_vacunos_amort_coherencia', `
    (meses_amortizados = 0 AND fecha_ultima_amortizacion IS NULL AND amortizacion_acumulada = 0)
    OR
    (meses_amortizados > 0 AND fecha_inicio_amortizacion IS NOT NULL AND fecha_ultima_amortizacion IS NOT NULL)
`)
@Check('chk_vacunos_padre_madre_distintos', 'padre_id = 1 OR madre_id = 1 OR padre_id <> madre_id')
@Check('chk_vacunos_padre_no_self', 'padre_id = 1 OR padre_id <> vacuno_id')
@Check('chk_vacunos_madre_no_self', 'madre_id = 1 OR madre_id <> vacuno_id')
@Index('uix_vacunos_arete', ['arete'], { unique: true, where: 'estado_id IN (1000, 1001, 1002)' })
@Index('uix_vacunos_nombre_activo', ['nombre'], { unique: true, where: `estado_id = 1000 AND estado_vacuno_id NOT IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO})` })
@Index('idx_vacunos_sucursal', ['sucursal_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_raza', ['raza_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_categoria', ['categoria_vacuno_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_estadovacuno', ['estado_vacuno_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_productor', ['es_productor_leche'], { where: `estado_id = 1000 AND es_productor_leche = ${CondicionProductorLeche.PRODUCTOR}` })
@Index('idx_vacunos_tiposemoviente', ['tipo_semoviente_id'], { where: 'estado_id = 1000' })
@Index('idx_vacunos_fechaingreso', ['fecha_ingreso'], { where: 'estado_id IN (1000, 1001)' })
@Index('idx_vacunos_amort', ['fecha_ultima_amortizacion'], { where: `estado_id = 1000 AND estado_vacuno_id NOT IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO})` })
@Index('idx_vacunos_nombre', ['nombre'], { where: `estado_id = 1000 AND estado_vacuno_id NOT IN (${EstadoVacuno.FAENADO}, ${EstadoVacuno.VENDIDO}, ${EstadoVacuno.MUERTO})` })
@Index('idx_vacunos_padre', ['padre_id'], { where: 'estado_id = 1000 AND padre_id <> 1' })
@Index('idx_vacunos_madre', ['madre_id'], { where: 'estado_id = 1000 AND madre_id <> 1' })
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

    @Column({ name: 'tipo_semoviente_id', type: 'bigint', transformer: bigintTransformer })
    tipo_semoviente_id!: number;

    @Column({ name: 'arete', type: 'varchar', length: 50 })
    arete!: string;

    @Column({ name: 'nombre', type: 'varchar', length: 150 })
    nombre!: string;

    @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
    fecha_nacimiento?: Date | null;

    @Column({ name: 'fecha_ingreso', type: 'date', default: () => 'CURRENT_DATE' })
    fecha_ingreso!: Date;

    @Column({ name: 'sexo_biologico_id', type: 'smallint', default: SexoBiologico.HEMBRA })
    sexo_biologico_id!: number;

    @Column({ name: 'peso_nacimiento', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_nacimiento?: number | null;

    @Column({ name: 'peso_actual', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_actual?: number | null;

    @Column({ name: 'color', type: 'varchar', length: 50, nullable: true })
    color?: string | null;

    @Column({ name: 'padre_id', type: 'bigint', nullable: true, default: 1, transformer: bigintTransformer })
    padre_id?: number | null;

    @Column({ name: 'madre_id', type: 'bigint', nullable: true, default: 1, transformer: bigintTransformer })
    madre_id?: number | null;

    @Column({ name: 'valor_adquisicion', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    valor_adquisicion!: number;

    @Column({ name: 'valor_residual', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    valor_residual!: number;

    @Column({ name: 'valor_adquisicion_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    valor_adquisicion_ufv?: number | null;

    @Column({ name: 'valor_residual_ufv', type: 'decimal', precision: 14, scale: 5, nullable: true, transformer: decimalTransformer })
    valor_residual_ufv?: number | null;

    @Column({ name: 'es_productor_leche', type: 'smallint', default: CondicionProductorLeche.NO_PRODUCTOR })
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

    @Column({ name: 'vida_util_anios', type: 'smallint', nullable: true })
    vida_util_anios?: number | null;

    @Column({ name: 'tasa_amortizacion', type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: decimalTransformer })
    tasa_amortizacion?: number | null;

    @Column({ name: 'fecha_inicio_amortizacion', type: 'date', nullable: true })
    fecha_inicio_amortizacion?: Date | null;

    @Column({ name: 'fecha_ultima_amortizacion', type: 'date', nullable: true })
    fecha_ultima_amortizacion?: Date | null;

    @Column({ name: 'meses_amortizados', type: 'smallint', default: 0 })
    meses_amortizados!: number;

    @Column({ name: 'amortizacion_acumulada', type: 'decimal', precision: 14, scale: 2, default: 0, transformer: decimalTransformer })
    amortizacion_acumulada!: number;

    @Column({ name: 'valor_libro_actual', type: 'decimal', precision: 14, scale: 2, nullable: true, transformer: decimalTransformer })
    valor_libro_actual?: number | null;
}
