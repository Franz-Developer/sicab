// C:\sistemas\sicab\sicab-backend\src\modules\tablas\entities\tabla.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'tablas' })
@Check('chk_tablas_estadoid', 'estado_id IN (1000, 1001)')
@Check('chk_tablas_baja', '(estado_id = 1000 AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_tablas_nombre_notempty', "TRIM(nombre) <> ''")
@Check('chk_tablas_nombre_formato', "nombre = LOWER(TRIM(nombre)) AND nombre ~ '^[a-z][a-z0-9_]*$'")
@Check('chk_tablas_permite_leer',        'permite_leer IN (0, 1)')
@Check('chk_tablas_permite_crear',       'permite_crear IN (0, 1)')
@Check('chk_tablas_permite_editar',      'permite_editar IN (0, 1)')
@Check('chk_tablas_permite_eliminar',    'permite_eliminar IN (0, 1)')
@Check('chk_tablas_permite_anular',      'permite_anular IN (0, 1)')
@Check('chk_tablas_permite_archivar',    'permite_archivar IN (0, 1)')
@Check('chk_tablas_permite_desarchivar', 'permite_desarchivar IN (0, 1)')
@Index('uix_tablas_nombre_unique', ['nombre'], { unique: true, where: 'estado_id = 1000' })
@Index('idx_tablas_estado', ['estado_id'], { where: 'estado_id = 1000' })

export class Tabla extends BaseAuditEntity {
    @PrimaryColumn({ name: 'tabla_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    tabla_id!: number;

    @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: false })
    nombre!: string;

    @Column({ name: 'permite_leer', type: 'smallint', nullable: false, default: 1 })
    permite_leer!: number;

    @Column({ name: 'permite_crear', type: 'smallint', nullable: false, default: 1 })
    permite_crear!: number;

    @Column({ name: 'permite_editar', type: 'smallint', nullable: false, default: 1 })
    permite_editar!: number;

    @Column({ name: 'permite_eliminar', type: 'smallint', nullable: false, default: 1 })
    permite_eliminar!: number;

    @Column({ name: 'permite_anular', type: 'smallint', nullable: false, default: 0 })
    permite_anular!: number;

    @Column({ name: 'permite_archivar', type: 'smallint', nullable: false, default: 0 })
    permite_archivar!: number;

    @Column({ name: 'permite_desarchivar', type: 'smallint', nullable: false, default: 0 })
    permite_desarchivar!: number;
}
