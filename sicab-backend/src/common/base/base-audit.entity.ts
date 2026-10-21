// C:\sistemas\sicab\sicab-backend\src\common\base\base-audit.entity.ts
import { Column } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { ESTADO_ACTIVO } from '../constants/estados.constant';
import { bigintTransformer } from '../utils/typeorm-transformers.util';
import { DomainException } from '../exceptions/domain.exception';

export abstract class BaseAuditEntity {
    @Column({ name: 'estado_id', type: 'smallint', nullable: false, default: ESTADO_ACTIVO })
    estado_id: number = ESTADO_ACTIVO;

    @Column({ name: 'usuario_id_registro', type: 'bigint', nullable: false, default: 1, transformer: bigintTransformer })
    usuario_id_registro!: number;

    @Column({ name: 'usuario_id_actualizacion', type: 'bigint', nullable: true, transformer: bigintTransformer })
    usuario_id_actualizacion?: number | null = null;

    @Column({ name: 'usuario_id_baja', type: 'bigint', nullable: true, transformer: bigintTransformer })
    usuario_id_baja?: number | null = null;

    @Column({ name: 'fecha_registro', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    fecha_registro!: Date;

    @Column({ name: 'fecha_actualizacion', type: 'timestamptz', nullable: true })
    fecha_actualizacion?: Date | null = null;

    @Column({ name: 'fecha_baja', type: 'timestamptz', nullable: true })
    fecha_baja?: Date | null = null;

    marcarActualizacion(usuarioId: number): void {
        this.validarUsuario(usuarioId, 'actualizar');

        if (this.estado_id !== ESTADO_ACTIVO) {
            throw new DomainException(
                `No se puede actualizar un registro en estado ${this.estado_id}. Solo se permiten registros ACTIVOS.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        this.usuario_id_actualizacion = usuarioId;
        this.fecha_actualizacion = new Date();
        this.usuario_id_baja = null;
        this.fecha_baja = null;
    }

    private validarUsuario(usuarioId: number, accion: string): void {
        if (!usuarioId || usuarioId <= 0 || !Number.isInteger(usuarioId)) {
            throw new DomainException(
                `Usuario ID inválido para ${accion}. Debe ser un entero positivo.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }
    }
}
