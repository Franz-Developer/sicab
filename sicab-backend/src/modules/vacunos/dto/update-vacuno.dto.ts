// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\update-vacuno.dto.ts
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateVacunoDto } from './create-vacuno.dto';

export class UpdateVacunoDto extends PartialType(
    OmitType(CreateVacunoDto, [] as const)
) {}
