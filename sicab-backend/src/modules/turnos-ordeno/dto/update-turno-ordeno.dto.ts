// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\dto\update-turno-ordeno.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTurnoOrdenoDto } from './create-turno-ordeno.dto';

export class UpdateTurnoOrdenoDto extends PartialType(CreateTurnoOrdenoDto) {}
