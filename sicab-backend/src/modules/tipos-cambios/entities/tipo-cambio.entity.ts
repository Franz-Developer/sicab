// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\entities\tipo-cambio.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer, decimalTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'tipos_cambios' })
@Check('chk_tiposcambios_origenmonedaid', 'origen_moneda_id IN (2300, 2301, 2302, 2303)')
@Check('chk_tiposcambios_destinomonedaid', 'destino_moneda_id IN (2300, 2301, 2302, 2303)')
@Check('chk_tiposcambios_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_tiposcambios_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_tiposcambios_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_tiposcambios_factorcompra', 'factor_compra > 0')
@Check('chk_tiposcambios_factorventa', 'factor_venta > 0')
@Check('chk_tiposcambios_factores', 'factor_compra <= factor_venta')
@Check('chk_tiposcambios_distinto', 'origen_moneda_id <> destino_moneda_id')
@Index('uix_tiposcambios_cotizacion_unique', ['origen_moneda_id', 'destino_moneda_id', 'fecha_cotizacion'], { unique: true, where: 'estado_id = 1000' })
@Index('idx_tiposcambios_cotizacion', ['fecha_cotizacion'], { where: 'estado_id = 1000' })
export class TipoCambio extends BaseAuditEntity {
    @PrimaryColumn({ name: 'tipo_cambio_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    tipo_cambio_id!: number;

    @Column({ name: 'origen_moneda_id', type: 'smallint' })
    origen_moneda_id!: number;

    @Column({ name: 'destino_moneda_id', type: 'smallint' })
    destino_moneda_id!: number;

    @Column({ name: 'factor_compra', type: 'decimal', precision: 12, scale: 4, transformer: decimalTransformer })
    factor_compra!: number;

    @Column({ name: 'factor_venta', type: 'decimal', precision: 12, scale: 4, transformer: decimalTransformer })
    factor_venta!: number;

    @Column({ name: 'fecha_cotizacion', type: 'date' })
    fecha_cotizacion!: Date;
}
