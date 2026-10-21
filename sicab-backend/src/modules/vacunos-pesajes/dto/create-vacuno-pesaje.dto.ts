// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\dto\create-vacuno-pesaje.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min, IsDateString } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToNullUpper, emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class CreateVacunoPesajeDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo vacuno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo vacuno_id debe ser mayor a 0.' })
    vacuno_id: number;

    @Transform(emptyToNullUpper)
    @IsDateString({}, { message: 'El campo fecha_pesaje debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_pesaje: string;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo peso debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo peso no puede ser negativo.' })
    peso: number;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo observaciones no puede exceder los 500 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
