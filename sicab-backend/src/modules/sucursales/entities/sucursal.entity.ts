// C:\sistemas\sicab\sicab-backend\src\modules\sucursales\entities\sucursal.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'sucursales' })
@Check('chk_sucursales_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_sucursales_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_sucursales_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_sucursales_codigosin', 'codigo_sin >= 0')
@Check('chk_sucursales_sucursal_notempty', "TRIM(sucursal) <> ''")
@Check('chk_sucursales_sucursal_mayusculas', 'sucursal = UPPER(sucursal)')
@Check('chk_sucursales_sucursallargo_notempty', "TRIM(sucursal_largo) <> ''")
@Check('chk_sucursales_sucursallargo_mayusculas', 'sucursal_largo = UPPER(sucursal_largo)')
@Check('chk_sucursales_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_sucursales_codigo_minlength', 'LENGTH(TRIM(codigo)) >= 3')
@Check('chk_sucursales_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_sucursales_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Index('uix_sucursales_empresaid_sucursal_unique', ['empresa_id', 'sucursal'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_sucursales_empresaid_sucursallargo_unique', ['empresa_id', 'sucursal_largo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_sucursales_empresaid_codigo_unique', ['empresa_id', 'codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_sucursales_empresaid_codigosin_unique', ['empresa_id', 'codigo_sin'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('idx_sucursales_empresa_id', ['empresa_id'], { where: 'estado_id IN (1000, 1002)' })

export class Sucursal extends BaseAuditEntity {
    @PrimaryColumn({ name: 'sucursal_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    sucursal_id!: number;

    @Column({ name: 'empresa_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    empresa_id!: number;

    @Column({ name: 'sucursal', type: 'varchar', length: 150, nullable: false })
    sucursal!: string;

    @Column({ name: 'sucursal_largo', type: 'varchar', length: 300, nullable: false })
    sucursal_largo!: string;

    @Column({ name: 'codigo', type: 'varchar', length: 30, nullable: false })
    codigo!: string;

    @Column({ name: 'codigo_sin', type: 'integer', nullable: false })
    codigo_sin!: number;

    @Column({ name: 'telefono', type: 'varchar', length: 100, nullable: true })
    telefono?: string | null;

    @Column({ name: 'ubicacion', type: 'varchar', length: 500, nullable: true })
    ubicacion?: string | null;

    @Column({ name: 'horario_atencion', type: 'varchar', length: 200, nullable: true })
    horario_atencion?: string | null;
}
