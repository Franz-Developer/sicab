// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\update-produccion-leche-detalle.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class UpdateProduccionLecheDetalleDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo litros debe ser un número con máximo 2 decimales.' },
    )
    @Min(0, { message: 'El campo litros no puede ser negativo.' })
    litros?: number;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo observaciones no puede exceder los 500 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
