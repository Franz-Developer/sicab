// C:\sistemas\sicab\sicab-backend\src\modules\roles-menus\dto\bulk-toggle-rol-menu.dto.ts
import { IsInt, IsIn, Min } from 'class-validator';
import { ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADO_METADATA } from '../../../common/constants/estados.constant';

const ESTADOS_PERMITIDOS = [ESTADO_ACTIVO, ESTADO_HISTORICO];

const MSG_ESTADO_INVALIDO =
    `estado_id debe ser ${ESTADO_ACTIVO} (${ESTADO_METADATA[ESTADO_ACTIVO].abreviatura}) ` +
    `o ${ESTADO_HISTORICO} (${ESTADO_METADATA[ESTADO_HISTORICO].abreviatura}).`;

export class BulkToggleRolMenuDto {
    @IsInt({ message: 'rol_id debe ser un número entero.' })
    @Min(1, { message: 'rol_id debe ser mayor a 0.' })
    rol_id: number;

    @IsInt({ message: 'estado_id debe ser un número entero.' })
    @IsIn(ESTADOS_PERMITIDOS, { message: MSG_ESTADO_INVALIDO })
    estado_id: number;
}
