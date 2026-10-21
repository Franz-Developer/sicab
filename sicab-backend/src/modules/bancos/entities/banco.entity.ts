// C:\sistemas\sicab\sicab-backend\src\modules\bancos\entities\banco.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'bancos' })
@Check('chk_bancos_banco_notempty', "TRIM(banco) <> ''")
@Check('chk_bancos_banco_minlength', 'LENGTH(TRIM(banco)) >= 3')
@Check('chk_bancos_banco_mayusculas', 'banco = UPPER(banco)')
@Check('chk_bancos_banco_formato', "banco ~ '^[A-Z0-9 ._&-]+$'")
@Check('chk_bancos_abreviatura_notempty', "TRIM(abreviatura) <> ''")
@Check('chk_bancos_abreviatura_minlength', 'LENGTH(TRIM(abreviatura)) >= 2')
@Check('chk_bancos_abreviatura_mayusculas', 'abreviatura = UPPER(abreviatura)')
@Check('chk_bancos_abreviatura_formato', "abreviatura ~ '^[A-Z0-9_-]+$'")
@Check('chk_bancos_codigoasfi_notempty', "TRIM(codigo_asfi) <> ''")
@Check('chk_bancos_codigoasfi_numerico', "codigo_asfi ~ '^[0-9]{2}$'")
@Check('chk_bancos_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Check('chk_bancos_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_bancos_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_bancos_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)

@Index('uix_bancos_codigoasfi_unique', ['codigo_asfi'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_bancos_abreviatura_unique', ['abreviatura'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_bancos_banco_unique', ['banco'], { unique: true, where: 'estado_id IN (1000, 1002)' })

export class Banco extends BaseAuditEntity {
    @PrimaryColumn({ name: 'banco_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    banco_id!: number;

    @Column({ name: 'banco', type: 'varchar', length: 60, nullable: false })
    banco!: string;

    @Column({ name: 'codigo_asfi', type: 'char', length: 2, nullable: false })
    codigo_asfi!: string;

    @Column({ name: 'abreviatura', type: 'varchar', length: 20, nullable: false })
    abreviatura!: string;

    @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
    descripcion: string | null = null;
}
