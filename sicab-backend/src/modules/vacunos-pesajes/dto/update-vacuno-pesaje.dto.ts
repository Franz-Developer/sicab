// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\dto\update-vacuno-pesaje.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVacunoPesajeDto } from './create-vacuno-pesaje.dto';

export class UpdateVacunoPesajeDto extends PartialType(
    OmitType(CreateVacunoPesajeDto, ['vacuno_id'] as const)
) {}
