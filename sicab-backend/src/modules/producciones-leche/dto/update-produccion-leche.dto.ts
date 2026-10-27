// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\update-produccion-leche.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper, nullToUndefined } from '../../../common/utils/transform.helper';

export class UpdateProduccionLecheDto {
    @IsOptional()
    @Transform(nullToUndefined)
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo total_descartado debe ser un número con máximo 2 decimales.' },
    )
    @Min(0, { message: 'El campo total_descartado no puede ser negativo.' })
    total_descartado?: number;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(1000, { message: 'El campo observaciones no puede exceder los 1000 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
