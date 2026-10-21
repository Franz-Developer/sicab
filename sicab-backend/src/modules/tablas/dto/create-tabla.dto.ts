// C:\sistemas\sicab\sicab-backend\src\modules\tablas\dto\create-tabla.dto.ts
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, MinLength, Matches, IsOptional, IsInt, IsIn } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';

export class CreateTablaDto {
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsString({ message: 'nombre debe ser un texto.' })
    @IsNotEmpty({ message: 'nombre es obligatorio.' })
    @MinLength(1, { message: 'nombre debe tener al menos 1 carácter.' })
    @MaxLength(100, { message: 'nombre no puede exceder los 100 caracteres.' })
    @Matches(/^[a-z][a-z0-9_]*$/, { message: 'nombre debe comenzar con letra minúscula y contener solo letras minúsculas, números y guiones bajos.' })
    @IsSafeText()
    nombre: string;

    @IsOptional()
    @IsInt({ message: 'permite_leer debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_leer debe ser 0 o 1.' })
    permite_leer?: number;

    @IsOptional()
    @IsInt({ message: 'permite_crear debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_crear debe ser 0 o 1.' })
    permite_crear?: number;

    @IsOptional()
    @IsInt({ message: 'permite_editar debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_editar debe ser 0 o 1.' })
    permite_editar?: number;

    @IsOptional()
    @IsInt({ message: 'permite_eliminar debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_eliminar debe ser 0 o 1.' })
    permite_eliminar?: number;

    @IsOptional()
    @IsInt({ message: 'permite_anular debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_anular debe ser 0 o 1.' })
    permite_anular?: number;

    @IsOptional()
    @IsInt({ message: 'permite_archivar debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_archivar debe ser 0 o 1.' })
    permite_archivar?: number;

    @IsOptional()
    @IsInt({ message: 'permite_desarchivar debe ser 0 o 1.' })
    @IsIn([0, 1], { message: 'permite_desarchivar debe ser 0 o 1.' })
    permite_desarchivar?: number;
}
