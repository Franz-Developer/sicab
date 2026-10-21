// C:\sistemas\sicab\sicab-backend\src\modules\menus\dto\update-menu.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {}
