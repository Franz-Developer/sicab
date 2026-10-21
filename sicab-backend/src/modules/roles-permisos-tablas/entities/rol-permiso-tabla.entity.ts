// C:\sistemas\sicab\sicab-backend\src\modules\roles-permisos-tablas\entities\rol-permiso-tabla.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'roles_permisos_tablas' })
@Check('chk_rpt_estado', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_rpt_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_rpt_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_rpt_leer', 'leer IN (0, 1)')
@Check('chk_rpt_crear', 'crear IN (0, 1)')
@Check('chk_rpt_editar', 'editar IN (0, 1)')
@Check('chk_rpt_eliminar', 'eliminar IN (0, 1)')
@Check('chk_rpt_anular', 'anular IN (0, 1)')
@Check('chk_rpt_archivar', 'archivar IN (0, 1)')
@Check('chk_rpt_desarchivar', 'desarchivar IN (0, 1)')
@Index('uix_rpt_unique', ['rol_id', 'tabla_id'], { unique: true, where: 'estado_id = 1000' })

export class RolPermisoTabla extends BaseAuditEntity {
    @PrimaryColumn({ name: 'rol_permiso_tabla_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    rol_permiso_tabla_id!: number;

    @Column({ name: 'rol_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    rol_id!: number;

    @Column({ name: 'tabla_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    tabla_id!: number;

    @Column({ name: 'leer', type: 'smallint', nullable: false, default: 0 })
    leer!: number;

    @Column({ name: 'crear', type: 'smallint', nullable: false, default: 0 })
    crear!: number;

    @Column({ name: 'editar', type: 'smallint', nullable: false, default: 0 })
    editar!: number;

    @Column({ name: 'eliminar', type: 'smallint', nullable: false, default: 0 })
    eliminar!: number;

    @Column({ name: 'anular', type: 'smallint', nullable: false, default: 0 })
    anular!: number;

    @Column({ name: 'archivar', type: 'smallint', nullable: false, default: 0 })
    archivar!: number;

    @Column({ name: 'desarchivar', type: 'smallint', nullable: false, default: 0 })
    desarchivar!: number;
}
