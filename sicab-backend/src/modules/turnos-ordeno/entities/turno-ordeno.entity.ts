// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\entities\turno-ordeno.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'turnos_ordeno' })
@Check('chk_turnosordeno_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_turnosordeno_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_turnosordeno_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_turnosordeno_turno_notempty', "TRIM(turno) <> ''")
@Check('chk_turnosordeno_turno_minlength', 'LENGTH(TRIM(turno)) >= 3')
@Check('chk_turnosordeno_turno_mayusculas', 'turno = UPPER(turno)')
@Check('chk_turnosordeno_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_turnosordeno_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_turnosordeno_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Check('chk_turnosordeno_horas', 'hora_fin > hora_inicio')
@Check('chk_turnosordeno_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Index('uix_turnosordeno_codigo', ['codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_turnosordeno_turno', ['turno'], { unique: true, where: 'estado_id IN (1000, 1002)' })
export class TurnoOrdeno extends BaseAuditEntity {
    @PrimaryColumn({ name: 'turno_ordeno_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    turno_ordeno_id!: number;

    @Column({ name: 'turno', type: 'varchar', length: 50 })
    turno!: string;

    @Column({ name: 'codigo', type: 'varchar', length: 20 })
    codigo!: string;

    @Column({ name: 'hora_inicio', type: 'time' })
    hora_inicio!: string;

    @Column({ name: 'hora_fin', type: 'time' })
    hora_fin!: string;

    @Column({ name: 'descripcion', type: 'varchar', length: 500, nullable: true })
    descripcion?: string | null;
}
