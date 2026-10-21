// C:\sistemas\sicab\sicab-backend\src\modules\bancos\dto\create-banco.dto.ts
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, MinLength, Matches, IsOptional } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToNull, trimUpperString, trimString } from '../../../common/utils/transform.helper';

export class CreateBancoDto {
    @Transform(trimUpperString)
    @IsString({ message: 'El campo banco debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo banco es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo banco debe tener al menos 3 caracteres.' })
    @MaxLength(60, { message: 'El campo banco no puede exceder los 60 caracteres.' })
    @Matches(/^[A-Z0-9 ._&-]+$/, {
        message: 'El campo banco solo permite letras, números, espacios, puntos, guiones bajos, guiones y ampersand.',
    })
    @IsSafeText()
    banco: string;

    @Transform(trimString)
    @IsString({ message: 'El campo codigo_asfi debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo codigo_asfi es obligatorio y no puede estar vacío.' })
    @MinLength(2, { message: 'El campo codigo_asfi debe tener exactamente 2 caracteres.' })
    @MaxLength(2, { message: 'El campo codigo_asfi no puede exceder los 2 caracteres.' })
    @Matches(/^[0-9]{2}$/, { message: 'El campo codigo_asfi debe ser un número de 2 dígitos (ej. 01, 32).' })
    @IsSafeText()
    codigo_asfi: string;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo abreviatura debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo abreviatura es obligatorio y no puede estar vacío.' })
    @MinLength(2, { message: 'El campo abreviatura debe tener al menos 2 caracteres.' })
    @MaxLength(20, { message: 'El campo abreviatura no puede exceder los 20 caracteres.' })
    @Matches(/^[A-Z0-9_-]+$/, {
        message: 'El campo abreviatura solo permite letras, números, guiones y guiones bajos.',
    })
    @IsSafeText()
    abreviatura: string;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'El campo descripcion debe ser de tipo texto.' })
    @MaxLength(255, { message: 'El campo descripcion no puede exceder los 255 caracteres.' })
    @IsSafeText()
    descripcion?: string | null;
}
