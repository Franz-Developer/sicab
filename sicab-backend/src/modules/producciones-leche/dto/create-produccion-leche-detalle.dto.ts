// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\create-produccion-leche-detalle.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class CreateProduccionLecheDetalleDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo vacuno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo vacuno_id debe ser mayor a 0.' })
    vacuno_id: number;

    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo litros debe ser un número con máximo 2 decimales.' },
    )
    @Min(0, { message: 'El campo litros no puede ser negativo.' })
    litros: number;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo observaciones no puede exceder los 500 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
