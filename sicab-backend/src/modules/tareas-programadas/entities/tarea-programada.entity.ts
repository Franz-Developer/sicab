// C:\sistemas\central\central-backend\src\modules\tareas-programadas\entities\tarea-programada.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'tareas_programadas' })
@Check('chk_tareasprogramadas_tipotareaid', 'tipo_tarea_id IN (3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407, 3408, 3409)')
@Check('chk_tareasprogramadas_frecuenciaid', 'frecuencia_id IN (3350, 3351, 3352, 3353, 3354, 3355, 3356, 3357, 3358, 3359)')
@Check('chk_tareasprogramadas_cron', 'frecuencia_id <> 3356 OR cron_expresion IS NOT NULL')
@Check('chk_tareasprogramadas_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_tareasprogramadas_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_tareasprogramadas_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_tareasprogramadas_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_tareasprogramadas_codigo_minlength', 'LENGTH(TRIM(codigo)) >= 3')
@Check('chk_tareasprogramadas_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_tareasprogramadas_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Check('chk_tareasprogramadas_nombre_notempty', "TRIM(nombre) <> ''")
@Check('chk_tareasprogramadas_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Check('chk_tareasprogramadas_cronexpresion_notempty', "cron_expresion IS NULL OR TRIM(cron_expresion) <> ''")
@Check('chk_tareasprogramadas_ultimoerror_notempty', "ultimo_error IS NULL OR TRIM(ultimo_error) <> ''")
@Check('chk_tareasprogramadas_notificaradmin', 'notificar_admin IN (0, 1)')
@Check('chk_tareasprogramadas_intentosfallidos', 'intentos_fallidos >= 0')
@Index('uix_tareasprogramadas_codigo_unique', ['codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })

export class TareaProgramada extends BaseAuditEntity {
    @PrimaryColumn({ name: 'tarea_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    tarea_id!: number;

    @Column({ name: 'codigo', type: 'varchar', length: 60, nullable: false })
    codigo!: string;

    @Column({ name: 'nombre', type: 'varchar', length: 150, nullable: false })
    nombre!: string;

    @Column({ name: 'descripcion', type: 'varchar', length: 500, nullable: true })
    descripcion?: string | null;

    @Column({ name: 'tipo_tarea_id', type: 'smallint', nullable: false, default: 3409 })
    tipo_tarea_id!: number;

    @Column({ name: 'frecuencia_id', type: 'smallint', nullable: false, default: 3359 })
    frecuencia_id!: number;

    @Column({ name: 'cron_expresion', type: 'varchar', length: 100, nullable: true })
    cron_expresion?: string | null;

    @Column({ name: 'parametros', type: 'jsonb', nullable: true })
    parametros?: Record<string, any> | null;

    @Column({ name: 'ultima_ejecucion', type: 'timestamptz', nullable: true })
    ultima_ejecucion?: Date | null;

    @Column({ name: 'ultimo_error', type: 'varchar', length: 3000, nullable: true })
    ultimo_error?: string | null;

    @Column({ name: 'intentos_fallidos', type: 'smallint', nullable: false, default: 0 })
    intentos_fallidos!: number;

    @Column({ name: 'notificar_admin', type: 'smallint', nullable: false, default: 0 })
    notificar_admin!: number;
}