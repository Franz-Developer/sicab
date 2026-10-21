// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\dto\update-tipo-semoviente.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoSemovienteDto } from './create-tipo-semoviente.dto';

export class UpdateTipoSemovienteDto extends PartialType(CreateTipoSemovienteDto) {}
