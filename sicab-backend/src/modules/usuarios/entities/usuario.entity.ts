// C:\sistemas\sicab\sicab-backend\src\modules\usuarios\entities\usuario.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'usuarios' })
@Check('chk_usuarios_estadoid', 'estado_id IN (1000, 1002)')
@Check('chk_usuarios_actualizacion', '(estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL) OR (estado_id = 1000 AND ((usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL) OR (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)))')
@Check('chk_usuarios_login_notempty', "TRIM(login) <> ''")
@Check('chk_usuarios_login_mayusculas', 'login = UPPER(login)')
@Check('chk_usuarios_login_minlength', 'LENGTH(TRIM(login)) >= 4')
@Check('chk_usuarios_login_formato', "login ~ '^[A-Z0-9._-]+$'")
@Check('chk_usuarios_contrasena_notempty', "TRIM(contrasena) <> ''")
@Check('chk_usuarios_avatar_notempty', "TRIM(avatar) <> ''")
@Index('uix_usuarios_login_unique', ['login'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('idx_usuarios_usuario_id_registro', ['usuario_id_registro'])
@Index('idx_usuarios_usuario_id_actualizacion', ['usuario_id_actualizacion'], { where: 'usuario_id_actualizacion IS NOT NULL' })
@Index('idx_usuarios_operacion_covering', ['usuario_id_registro', 'usuario_id_actualizacion', 'login'], { where: 'estado_id IN (1000, 1002)' })
@Index('idx_usuarios_rolid', ['rol_id'])
@Index('idx_usuarios_trabajador_id', ['trabajador_id'], { where: 'estado_id = 1000' })

export class Usuario extends BaseAuditEntity {
    @PrimaryColumn({ name: 'usuario_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    usuario_id!: number;

    @Column({ name: 'trabajador_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    trabajador_id!: number;

    @Column({ name: 'rol_id', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    rol_id!: number;

    @Column({ name: 'login', type: 'varchar', length: 10, nullable: false })
    login!: string;

    @Column({ name: 'contrasena', type: 'varchar', length: 500, nullable: false })
    contrasena!: string;

    @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: false })
    avatar!: string;
}
