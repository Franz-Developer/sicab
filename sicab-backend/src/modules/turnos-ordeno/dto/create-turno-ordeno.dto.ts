// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\dto\create-turno-ordeno.dto.ts
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefined, trimUpperString } from '../../../common/utils/transform.helper';

export class CreateTurnoOrdenoDto {
    @Transform(trimUpperString)
    @IsString({ message: 'El campo turno debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo turno es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo turno debe tener al menos 3 caracteres.' })
    @MaxLength(50, { message: 'El campo turno no puede exceder los 50 caracteres.' })
    @IsSafeText()
    turno: string;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo codigo debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo codigo es obligatorio y no puede estar vacío.' })
    @MaxLength(20, { message: 'El campo codigo no puede exceder los 20 caracteres.' })
    @Matches(/^[A-Z0-9_-]+$/, { message: 'El campo codigo solo puede contener letras mayúsculas, números, guiones y guiones bajos.' })
    @IsSafeText()
    codigo: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString({ message: 'El campo hora_inicio debe ser de tipo texto (HH:mm).' })
    @IsNotEmpty({ message: 'El campo hora_inicio es obligatorio.' })
    hora_inicio: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString({ message: 'El campo hora_fin debe ser de tipo texto (HH:mm).' })
    @IsNotEmpty({ message: 'El campo hora_fin es obligatorio.' })
    hora_fin: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'El campo descripcion debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo descripcion no puede exceder los 500 caracteres.' })
    @IsSafeText()
    descripcion?: string;
}
