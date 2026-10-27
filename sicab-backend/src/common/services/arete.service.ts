// C:\sistemas\sicab\sicab-backend\src\common\services\arete.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';

@Injectable()
export class AreteService {
    async generarSiguienteArete(manager: EntityManager, sucursalId: number): Promise<string> {
        try {
            const result = await manager.query(
                `SELECT public.fn_generar_siguiente_arete() AS arete`
            );

            if (!result?.[0]?.arete) {
                throw new DomainException(
                    `No se pudo generar el arete para la sucursal ${sucursalId}.`,
                    { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR }
                );
            }

            return result[0].arete;

        } catch (error: unknown) {
            if (error instanceof DomainException) throw error;

            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new DomainException(
                `Error al generar el siguiente arete: ${errorMessage}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR }
            );
        }
    }
}
