// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\dto\create-categoria-vacuno.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, Matches, IsInt, Min, Max, IsIn } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefined, trimUpperString } from '../../../common/utils/transform.helper';
import { CondicionProductorLeche, SexoBiologico } from '../../../common/constants/estados.constant';
import { IsCompareFields } from '../../../common/validators/compare-fields.validator';

export class CreateCategoriaVacunoDto {
    @Transform(trimUpperString)
    @IsString({ message: 'El campo categoria debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo categoria es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo categoria debe tener al menos 3 caracteres.' })
    @MaxLength(100, { message: 'El campo categoria no puede exceder los 100 caracteres.' })
    @IsSafeText()
    categoria: string;

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
    @Type(() => Number)
    @IsInt({ message: 'El campo edad_min_meses debe ser un número entero.' })
    @Min(0, { message: 'El campo edad_min_meses debe ser mayor o igual a 0.' })
    @Max(300, { message: 'El campo edad_min_meses no puede exceder 300.' })
    @IsCompareFields('edad_min_meses', 'lte', 'edad_max_meses')  // ← AGREGAR ESTO
    edad_min_meses?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo edad_max_meses debe ser un número entero.' })
    @Min(0, { message: 'El campo edad_max_meses debe ser mayor o igual a 0.' })
    @Max(300, { message: 'El campo edad_max_meses no puede exceder 300.' })
    edad_max_meses?: number | null;

    @Type(() => Number)
    @IsInt({ message: 'El campo es_productor_leche debe ser un número entero.' })
    @IsIn([CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], {
        message: `El campo es_productor_leche debe ser ${CondicionProductorLeche.NO_PRODUCTOR} (NO PRODUCTOR) o ${CondicionProductorLeche.PRODUCTOR} (PRODUCTOR).`
    })
    es_productor_leche: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo sexo_biologico_permitido_id debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA], {
        message: `El campo sexo_biologico_permitido_id debe ser ${SexoBiologico.MACHO} (MACHO) o ${SexoBiologico.HEMBRA} (HEMBRA).`
    })
    sexo_biologico_permitido_id: number;
}
