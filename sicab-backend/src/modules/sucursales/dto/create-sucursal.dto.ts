// C:\sistemas\sicab\sicab-backend\src\modules\sucursales\dto\create-sucursal.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength, MinLength, Matches } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefined, emptyToUndefinedUpper, trimUpperString } from '../../../common/utils/transform.helper';

export class CreateSucursalDto {
    @IsInt({ message: 'empresa_id debe ser un número entero.' })
    @IsNotEmpty({ message: 'empresa_id es obligatorio.' })
    @Min(1, { message: 'empresa_id debe ser mayor a 0.' })
    empresa_id: number;

    @Transform(trimUpperString)
    @IsString({ message: 'sucursal debe ser un texto.' })
    @IsNotEmpty({ message: 'sucursal es obligatorio.' })
    @MaxLength(150, { message: 'sucursal no puede exceder los 150 caracteres.' })
    @IsSafeText()
    sucursal: string;

    @Transform(trimUpperString)
    @IsString({ message: 'sucursal_largo debe ser un texto.' })
    @IsNotEmpty({ message: 'sucursal_largo es obligatorio.' })
    @MaxLength(300, { message: 'sucursal_largo no puede exceder los 300 caracteres.' })
    @IsSafeText()
    sucursal_largo: string;

    @Transform(trimUpperString)
    @IsString({ message: 'codigo debe ser un texto.' })
    @IsNotEmpty({ message: 'codigo es obligatorio.' })
    @MinLength(3, { message: 'codigo debe tener al menos 3 caracteres.' })
    @MaxLength(30, { message: 'codigo no puede exceder los 30 caracteres.' })
    @Matches(/^[A-Z0-9_-]+$/, { message: 'codigo debe contener solo mayúsculas, números, guiones y guiones bajos.' })
    @IsSafeText()
    codigo: string;

    @Type(() => Number)
    @IsInt({ message: 'codigo_sin debe ser un número entero.' })
    @Min(0, { message: 'codigo_sin debe ser mayor o igual a 0.' })
    codigo_sin: number;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'telefono debe ser un texto.' })
    @MaxLength(100, { message: 'telefono no puede exceder los 100 caracteres.' })
    @IsSafeText()
    telefono?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'ubicacion debe ser un texto.' })
    @MaxLength(500, { message: 'ubicacion no puede exceder los 500 caracteres.' })
    @IsSafeText()
    ubicacion?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'horario_atencion debe ser un texto.' })
    @MaxLength(200, { message: 'horario_atencion no puede exceder los 200 caracteres.' })
    @IsSafeText()
    horario_atencion?: string;
}
