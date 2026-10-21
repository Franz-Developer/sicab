// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\update-amortizacion-vacuno.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefined } from '../../../common/utils/transform.helper';

export class UpdateAmortizacionVacunoDto {
    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo observaciones no puede exceder los 500 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
