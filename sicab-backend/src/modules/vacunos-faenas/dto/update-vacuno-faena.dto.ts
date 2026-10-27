// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\dto\update-vacuno-faena.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVacunoFaenaDto } from './create-vacuno-faena.dto';

export class UpdateVacunoFaenaDto extends PartialType(
    OmitType(CreateVacunoFaenaDto, ['vacuno_id'] as const)
) {}
