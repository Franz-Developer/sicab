// C:\sistemas\sicab\sicab-backend\src\modules\roles-menus\entities\rol-menu.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'roles_menus' })
@Check('chk_rolesmenus_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_rolesmenus_baja', '(estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_rolesmenus_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id IN (1000, 1001) AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Index('uix_rolesmenus_varios_unique', ['rol_id', 'menu_id'], { unique: true, where: 'estado_id = 1000' })

export class RolMenu extends BaseAuditEntity {
    @PrimaryColumn({ name: 'rol_menu_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    rol_menu_id!: number;

    @Column({ name: 'rol_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    rol_id!: number;

    @Column({ name: 'menu_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    menu_id!: number;
}
