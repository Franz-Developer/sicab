// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\update-produccion-leche.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class UpdateProduccionLecheDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo total_descartado debe ser un número con máximo 2 decimales.' },
    )
    @Min(0, { message: 'El campo total_descartado no puede ser negativo.' })
    total_descartado?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo temperatura_promedio debe ser un número con máximo 2 decimales.' },
    )
    @Min(-10, { message: 'El campo temperatura_promedio no puede ser menor a -10.' })
    @Max(50, { message: 'El campo temperatura_promedio no puede ser mayor a 50.' })
    temperatura_promedio?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 4 },
        { message: 'El campo densidad_promedio debe ser un número con máximo 4 decimales.' },
    )
    @Min(1.0, { message: 'El campo densidad_promedio no puede ser menor a 1.0000.' })
    @Max(1.1, { message: 'El campo densidad_promedio no puede ser mayor a 1.1000.' })
    densidad_promedio?: number | null;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(1000, { message: 'El campo observaciones no puede exceder los 1000 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
