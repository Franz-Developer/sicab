// C:\sistemas\sicab\sicab-backend\src\modules\cargos\dto\create-cargo.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, Min, MaxLength, MinLength, Matches, IsOptional, IsInt, IsIn } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToNull, trimUpperString } from '../../../common/utils/transform.helper';
import { TipoMoneda, TIPO_MONEDA_METADATA } from '../../../common/constants/estados.constant';
import { getEnumValues, createEnumMessage } from '../../../common/utils/validation-helper.util';

export class CreateCargoDto {
    @Transform(trimUpperString)
    @IsString({ message: 'El campo cargo debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo cargo es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo cargo debe tener al menos 3 caracteres.' })
    @MaxLength(100, { message: 'El campo cargo no puede exceder los 100 caracteres.' })
    @IsSafeText()
    cargo: string;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo codigo debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo codigo es obligatorio y no puede estar vacío.' })
    @MinLength(2, { message: 'El campo codigo debe tener al menos 2 caracteres.' })
    @MaxLength(60, { message: 'El campo codigo no puede exceder los 60 caracteres.' })
    @Matches(/^[A-Z0-9_-]+$/, { message: 'El campo codigo debe contener solo letras mayúsculas, números, guiones y guiones bajos.' })
    @IsSafeText()
    codigo: string;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo sueldo_base debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo sueldo_base no puede ser negativo.' })
    sueldo_base: number;

    @IsInt({ message: 'El campo tipo_moneda_id debe ser un número entero.' })
    @IsIn(getEnumValues(TipoMoneda), {
        message: createEnumMessage(TIPO_MONEDA_METADATA, getEnumValues(TipoMoneda), 'tipo_moneda_id'),
    })
    tipo_moneda_id: number;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'El campo descripcion debe ser de tipo texto.' })
    @MaxLength(255, { message: 'El campo descripcion no puede exceder los 255 caracteres.' })
    @IsSafeText()
    descripcion?: string | null;
}
