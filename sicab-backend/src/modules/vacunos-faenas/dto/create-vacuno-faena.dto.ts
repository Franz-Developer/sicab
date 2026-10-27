// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\dto\create-vacuno-faena.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min, Max, MaxLength, IsString } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class CreateVacunoFaenaDto {
    @Type(() => Number)
    @IsInt({ message: 'vacuno_id debe ser un número entero.' })
    @IsNotEmpty({ message: 'vacuno_id es obligatorio.' })
    @Min(1, { message: 'vacuno_id debe ser mayor a 0.' })
    vacuno_id: number;

    @IsDateString({ strict: true }, { message: 'fecha_faena debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_faena: string;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'peso_vivo_faena debe tener máximo 2 decimales.' })
    @Min(1, { message: 'peso_vivo_faena debe ser mayor a 0.' })
    peso_vivo_faena: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'peso_canal_caliente debe tener máximo 2 decimales.' })
    @Min(1, { message: 'peso_canal_caliente debe ser mayor a 0.' })
    peso_canal_caliente: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'peso_canal_fria debe tener máximo 2 decimales.' })
    @Min(1, { message: 'peso_canal_fria debe ser mayor a 0.' })
    peso_canal_fria?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'rendimiento_canal debe tener máximo 2 decimales.' })
    @Min(0.01, { message: 'rendimiento_canal debe ser mayor a 0.' })
    @Max(100, { message: 'rendimiento_canal no puede superar el 100%.' })
    rendimiento_canal?: number;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'matadero debe ser un texto.' })
    @MaxLength(150)
    @IsSafeText()
    matadero?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'numero_guia debe ser un texto.' })
    @MaxLength(50)
    @IsSafeText()
    numero_guia?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'observaciones debe ser un texto.' })
    @MaxLength(500)
    @IsSafeText()
    observaciones?: string;
}
