// C:\sistemas\sicab\sicab-backend\src\modules\menus\entities\menu.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'menus' })
@Check('chk_menus_estadoid', 'estado_id IN (1000, 1001)')
@Check('chk_menus_baja', '(estado_id = 1000 AND usuario_id_baja IS NULL AND fecha_baja IS NULL) OR (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)')
@Check('chk_menus_titulo_notempty', "TRIM(titulo) <> ''")
@Check('chk_menus_titulo_minlength', 'LENGTH(TRIM(titulo)) >= 3')
@Check('chk_menus_icono_notempty', "icono IS NULL OR TRIM(icono) <> ''")
@Check('chk_menus_url_notempty', "url IS NULL OR TRIM(url) <> ''")
@Check('chk_menus_orden', 'orden >= 0')
@Index('uix_menus_varios_unique', ['menu_padre_id', 'titulo', 'orden'], { unique: true, where: 'estado_id = 1000' })
@Index('idx_menus_orden', ['orden'], { where: 'estado_id = 1000' })

export class Menu extends BaseAuditEntity {
    @PrimaryColumn({ name: 'menu_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    menu_id!: number;

    @Column({ name: 'menu_padre_id', type: 'bigint', nullable: true, transformer: bigintTransformer })
    menu_padre_id?: number | null;

    @Column({ name: 'titulo', type: 'varchar', length: 150, nullable: false })
    titulo!: string;

    @Column({ name: 'icono', type: 'varchar', length: 50, nullable: true })
    icono?: string | null;

    @Column({ name: 'url', type: 'varchar', length: 255, nullable: true })
    url?: string | null;

    @Column({ name: 'orden', type: 'smallint', nullable: false, default: 0 })
    orden!: number;

    @ManyToOne(() => Menu, (menu) => menu.hijos, { nullable: true })
    @JoinColumn({ name: 'menu_padre_id' })
    padre?: Menu | null;

    @OneToMany(() => Menu, (menu) => menu.padre)
    hijos?: Menu[];
}
