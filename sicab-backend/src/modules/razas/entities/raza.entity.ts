// C:\sistemas\sicab\sicab-backend\src\modules\razas\entities\raza.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'razas' })
@Check('chk_razas_pesopromedio', 'peso_promedio_adulto IS NULL OR peso_promedio_adulto > 0')
@Check('chk_razas_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_razas_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_razas_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_razas_raza_notempty', "TRIM(raza) <> ''")
@Check('chk_razas_raza_minlength', 'LENGTH(TRIM(raza)) >= 3')
@Check('chk_razas_raza_mayusculas', 'raza = UPPER(raza)')
@Check('chk_razas_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_razas_codigo_minlength', 'LENGTH(TRIM(codigo)) >= 2')
@Check('chk_razas_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_razas_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Check('chk_razas_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Check('chk_razas_origen_notempty', "origen IS NULL OR TRIM(origen) <> ''")
@Check('chk_razas_foto_notempty', "foto IS NULL OR TRIM(foto) <> ''")
@Index('uix_razas_codigo', ['codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_razas_raza', ['raza'], { unique: true, where: 'estado_id IN (1000, 1002)' })
export class Raza extends BaseAuditEntity {
    @PrimaryColumn({ name: 'raza_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    raza_id!: number;

    @Column({ name: 'tipo_semoviente_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    tipo_semoviente_id!: number;

    @Column({ name: 'raza', type: 'varchar', length: 100, nullable: false })
    raza!: string;

    @Column({ name: 'codigo', type: 'varchar', length: 30, nullable: false })
    codigo!: string;

    @Column({ name: 'descripcion', type: 'varchar', length: 500, nullable: true })
    descripcion?: string | null;

    @Column({ name: 'origen', type: 'varchar', length: 100, nullable: true })
    origen?: string | null;

    @Column({ name: 'peso_promedio_adulto', type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
    peso_promedio_adulto?: number | null;

    @Column({ name: 'foto', type: 'varchar', length: 255, nullable: true })
    foto?: string | null;
}
