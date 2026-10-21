// C:\sistemas\sicab\sicab-backend\src\common\services\notificacion.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CanalNotificacion, Estado, EstadoNotificacion, TipoNotificacion } from '../constants/estados.constant';
import { getErrorMessage } from '../utils/error.util';

export interface NotificacionDestinatario {
    cliente_id?: number | null;
    trabajador_id?: number | null;
    usuario_id?: number | null;
}

export interface CrearNotificacionParams {
    destinatario: NotificacionDestinatario;
    tipo_notificacion_id: TipoNotificacion;
    canal_notificacion_id?: CanalNotificacion;
    titulo: string;
    mensaje: string;
    datos_extra?: Record<string, any> | null;
    referencia_id?: number | null;
    referencia_tipo?: string | null;
    usuario_id_registro: number;
}

@Injectable()
export class NotificacionService {
    private readonly logger = new Logger(NotificacionService.name);

    async crear(
        params: CrearNotificacionParams,
        manager: EntityManager,
    ): Promise<number | null> {
        try {
            const tieneDestinatario =
                params.destinatario.cliente_id != null ||
                params.destinatario.trabajador_id != null ||
                params.destinatario.usuario_id != null;

            if (!tieneDestinatario) {
                this.logger.warn(
                    `Notificación sin destinatario. Tipo: ${params.tipo_notificacion_id}. Se omite.`,
                );
                return null;
            }

            const canalId =
                params.canal_notificacion_id ??
                this.inferirCanal(params.destinatario);

            const titulo = this.truncar(params.titulo, 150);
            const mensaje = this.truncar(params.mensaje, 2000);

            const result = await manager.query(
                `INSERT INTO notificaciones
                    (cliente_id, trabajador_id, usuario_id,
                     canal_notificacion_id, tipo_notificacion_id,
                     titulo, mensaje, datos_extra,
                     referencia_id, referencia_tipo,
                     estado_notificacion_id, estado_id, usuario_id_registro)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 RETURNING notificacion_id`,
                [
                    params.destinatario.cliente_id ?? null,
                    params.destinatario.trabajador_id ?? null,
                    params.destinatario.usuario_id ?? null,
                    canalId,
                    params.tipo_notificacion_id,
                    titulo,
                    mensaje,
                    params.datos_extra ? JSON.stringify(params.datos_extra) : null,
                    params.referencia_id ?? null,
                    params.referencia_tipo ?? null,
                    EstadoNotificacion.PENDIENTE,
                    Estado.ACTIVO,
                    params.usuario_id_registro,
                ],
            );

            const notificacionId = Number(result[0].notificacion_id);

            this.logger.debug(
                `Notificación #${notificacionId} creada (tipo ${params.tipo_notificacion_id}, canal ${canalId}).`,
            );

            return notificacionId;
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            this.logger.error(
                `Error al crear notificación tipo ${params.tipo_notificacion_id}: ${errorMessage}`,
            );
            return null;
        }
    }

    async crearMultiples(
        paramsList: CrearNotificacionParams[],
        manager: EntityManager,
    ): Promise<(number | null)[]> {
        const resultados: (number | null)[] = [];
        for (const params of paramsList) {
            const id = await this.crear(params, manager);
            resultados.push(id);
        }
        return resultados;
    }

    private inferirCanal(destinatario: NotificacionDestinatario): CanalNotificacion {
        if (destinatario.cliente_id != null) {
            return CanalNotificacion.PUSH;
        }
        if (destinatario.trabajador_id != null) {
            return CanalNotificacion.PUSH;
        }
        if (destinatario.usuario_id != null) {
            return CanalNotificacion.INTERNA;
        }
        return CanalNotificacion.INTERNA;
    }

    private truncar(texto: string, maxLength: number): string {
        if (!texto) return '';
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength - 3) + '...';
    }
}
