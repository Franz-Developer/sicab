// C:\sistemas\sicab\sicab-backend\src\modules\roles-menus\dto\toggle-rol-menu.dto.ts
import { IsInt, IsIn } from 'class-validator';
import { ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADO_METADATA } from '../../../common/constants/estados.constant';

const ESTADOS_PERMITIDOS = [ESTADO_ACTIVO, ESTADO_HISTORICO];

const MSG_ESTADO_INVALIDO =
    `estado_id debe ser ${ESTADO_ACTIVO} (${ESTADO_METADATA[ESTADO_ACTIVO].abreviatura}) ` +
    `o ${ESTADO_HISTORICO} (${ESTADO_METADATA[ESTADO_HISTORICO].abreviatura}).`;

export class ToggleRolMenuDto {
    @IsInt({ message: 'estado_id debe ser un número entero.' })
    @IsIn(ESTADOS_PERMITIDOS, { message: MSG_ESTADO_INVALIDO })
    estado_id: number;
}