// C:\sistemas\sicab\sicab-backend\src\modules\bancos\dto\update-banco.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBancoDto } from './create-banco.dto';

export class UpdateBancoDto extends PartialType(CreateBancoDto) {}
