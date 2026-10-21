// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\dto\create-tipo-semoviente.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, MaxLength, Min, Max, IsNotEmpty } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class CreateTipoSemovienteDto {
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo semoviente debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo semoviente es obligatorio.' })
    @MaxLength(100, { message: 'El campo semoviente no puede exceder los 100 caracteres.' })
    @IsSafeText()
    semoviente: string;

    @Type(() => Number)
    @IsInt({ message: 'El campo vida_util_anios debe ser un número entero.' })
    @Min(1, { message: 'El campo vida_util_anios debe ser mayor a 0.' })
    vida_util_anios: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo tasa_amortizacion debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo tasa_amortizacion no puede ser negativo.' })
    @Max(100, { message: 'El campo tasa_amortizacion no puede exceder el 100%.' })
    tasa_amortizacion: number;
}
