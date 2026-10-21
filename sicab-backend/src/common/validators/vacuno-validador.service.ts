// C:\sistemas\sicab\sicab-backend\src\common\validators\vacuno-validador.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';
import { ESTADO_ACTIVO, SexoBiologico, CondicionProductorLeche, EstadoVacuno } from '../constants/estados.constant';

@Injectable()
export class VacunoValidadorService {
    async validarProductorLeche(
        vacunoId: number,
        sucursalIdEsperada: number | null,
        manager: EntityManager,
    ): Promise<void> {
        // ✅ CORREGIDO: 'sexo' -> 'sexo_biologico_id'
        const rows = await manager.query(
            `SELECT vacuno_id, arete, sexo_biologico_id, es_productor_leche, estado_vacuno_id,
                    estado_id, sucursal_id
             FROM vacunos
             WHERE vacuno_id = $1 LIMIT 1`,
            [vacunoId],
        );

        if (!rows?.[0]) {
            throw new DomainException(
                `El vacuno con ID ${vacunoId} no existe.`,
                { httpStatus: HttpStatus.NOT_FOUND },
            );
        }

        const v = rows[0];

        // 1. Validar que el vacuno esté ACTIVO
        if (Number(v.estado_id) !== ESTADO_ACTIVO) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) no está ACTIVO.`,
                { httpStatus: HttpStatus.NOT_FOUND },
            );
        }

        // 2. Validar que sea HEMBRA (usando la constante)
        if (Number(v.sexo_biologico_id) !== SexoBiologico.HEMBRA) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) no es HEMBRA.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        // 3. Validar que esté marcado como productor de leche
        if (Number(v.es_productor_leche) !== CondicionProductorLeche.PRODUCTOR) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) no está marcado como productor de leche.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        // 4. Validar que no esté en estados finales (VENDIDO o MUERTO)
        const estadoVacunoId = Number(v.estado_vacuno_id);
        if ([EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO].includes(estadoVacunoId as any)) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) está VENDIDO o MUERTO.`,
                { httpStatus: HttpStatus.CONFLICT },
            );
        }

        // 5. Validar sucursal (si se especificó)
        if (sucursalIdEsperada !== null && Number(v.sucursal_id) !== Number(sucursalIdEsperada)) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) pertenece a otra sucursal.`,
                { httpStatus: HttpStatus.CONFLICT },
            );
        }
    }
}
