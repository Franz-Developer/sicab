// C:\sistemas\sicab\sicab-backend\src\modules\razas\dto\create-raza.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, Matches, IsNumber, Min } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsOptionalImage } from '../../../common/decorators/image.decorator';
import { emptyToUndefined, emptyToUndefinedUpper, trimUpperString } from '../../../common/utils/transform.helper';

export class CreateRazaDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo tipo_semoviente_id debe ser un número entero.' })
    @Min(1, { message: 'El campo tipo_semoviente_id debe ser mayor a 0.' })
    tipo_semoviente_id: number;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo raza debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo raza es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo raza debe tener al menos 3 caracteres.' })
    @MaxLength(100, { message: 'El campo raza no puede exceder los 100 caracteres.' })
    @IsSafeText()
    raza: string;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo codigo debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo codigo es obligatorio y no puede estar vacío.' })
    @MinLength(2, { message: 'El campo codigo debe tener al menos 2 caracteres.' })
    @MaxLength(30, { message: 'El campo codigo no puede exceder los 30 caracteres.' })
    @Matches(/^[A-Z0-9_-]+$/, { message: 'El campo codigo solo puede contener letras mayúsculas, números, guiones y guiones bajos.' })
    @IsSafeText()
    codigo: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'El campo descripcion debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo descripcion no puede exceder los 500 caracteres.' })
    @IsSafeText()
    descripcion?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo origen debe ser de tipo texto.' })
    @MaxLength(100, { message: 'El campo origen no puede exceder los 100 caracteres.' })
    @IsSafeText()
    origen?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo peso_promedio_adulto debe ser un número con máximo 2 decimales.' })
    @Min(0.01, { message: 'El campo peso_promedio_adulto debe ser mayor a 0.' })
    peso_promedio_adulto?: number | null;

    @IsOptionalImage()
    foto?: string | null;
}
