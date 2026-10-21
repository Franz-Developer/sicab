// C:\sistemas\sicab\sicab-backend\src\modules\roles-menus\dto\update-rol-menu.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsInt, IsIn } from 'class-validator';
import { CreateRolMenuDto } from './create-rol-menu.dto';
import { ESTADO_ACTIVO, ESTADO_HISTORICO, ESTADO_METADATA } from '../../../common/constants/estados.constant';

const ESTADOS_PERMITIDOS = [ESTADO_ACTIVO, ESTADO_HISTORICO];

const MSG_ESTADO_INVALIDO =
    `estado_id debe ser ${ESTADO_ACTIVO} (${ESTADO_METADATA[ESTADO_ACTIVO].abreviatura}) ` +
    `o ${ESTADO_HISTORICO} (${ESTADO_METADATA[ESTADO_HISTORICO].abreviatura}).`;

export class UpdateRolMenuDto extends PartialType(CreateRolMenuDto) {
    @IsOptional()
    @IsInt({ message: 'estado_id debe ser un número entero.' })
    @IsIn(ESTADOS_PERMITIDOS, { message: MSG_ESTADO_INVALIDO })
    estado_id?: number;
}
