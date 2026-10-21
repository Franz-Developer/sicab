// C:\sistemas\sicab\sicab-backend\src\modules\empresas-cuentas\entities\empresa-cuenta.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'empresas_cuentas' })
@Check('chk_empresascuentas_tipomonedaid', 'tipo_moneda_id IN (2300, 2301, 2302, 2303)')
@Check('chk_empresascuentas_tipocuentaid', 'tipo_cuenta_id IN (1750, 1751, 1752, 1753, 1754, 1755)')
@Check('chk_empresascuentas_esprincipal', 'es_principal IN (0, 1)')
@Check('chk_empresascuentas_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_empresascuentas_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_empresascuentas_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_empresascuentas_nrocuenta_minlength', 'LENGTH(TRIM(nro_cuenta)) >= 5')
@Check('chk_empresascuentas_titular_notempty', "TRIM(titular) <> ''")
@Check('chk_empresascuentas_titular_minlength', 'LENGTH(TRIM(titular)) >= 3')
@Check('chk_empresascuentas_titular_mayusculas', 'titular = UPPER(titular)')
@Index('uix_empresascuentas_varios_unique', ['empresa_id', 'banco_id', 'nro_cuenta', 'tipo_moneda_id', 'tipo_cuenta_id'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_empresascuentas_principal_unique', ['empresa_id'], { unique: true, where: 'es_principal = 1 AND estado_id = 1000' })

export class EmpresaCuenta extends BaseAuditEntity {
    @PrimaryColumn({ name: 'empresa_cuenta_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    empresa_cuenta_id!: number;

    @Column({ name: 'empresa_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    empresa_id!: number;

    @Column({ name: 'banco_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    banco_id!: number;

    @Column({ name: 'tipo_moneda_id', type: 'smallint', nullable: false, default: 2300 })
    tipo_moneda_id!: number;

    @Column({ name: 'nro_cuenta', type: 'varchar', length: 50, nullable: false })
    nro_cuenta!: string;

    @Column({ name: 'tipo_cuenta_id', type: 'smallint', nullable: false, default: 1755 })
    tipo_cuenta_id!: number;

    @Column({ name: 'titular', type: 'varchar', length: 150, nullable: false })
    titular!: string;

    @Column({ name: 'es_principal', type: 'smallint', nullable: false, default: 0 })
    es_principal!: number;
}
