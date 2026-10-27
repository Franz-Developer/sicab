// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\create-vacuno.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsNumber, Max, Min, IsInt, IsIn, IsDateString } from 'class-validator';
import { SexoBiologico, SEXO_BIOLOGICO_METADATA, CondicionProductorLeche, CONDICION_PRODUCTOR_LECHE_METADATA } from '../../../common/constants/estados.constant';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsOptionalImage } from '../../../common/decorators/image.decorator';
import { emptyToNullUpper, trimUpperString, emptyToUndefined } from '../../../common/utils/transform.helper';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';
import { IsCompareFields } from '../../../common/validators/compare-fields.validator';

export class CreateVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_id debe ser mayor a 0.' })
    sucursal_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo raza_id debe ser un número entero.' })
    @Min(1, { message: 'El campo raza_id debe ser mayor a 0.' })
    raza_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo tipo_semoviente_id debe ser un número entero.' })
    @Min(1, { message: 'El campo tipo_semoviente_id debe ser mayor a 0.' })
    tipo_semoviente_id: number;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo nombre debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El nombre es obligatorio.' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
    @MaxLength(150, { message: 'El nombre no puede exceder los 150 caracteres.' })
    @IsSafeText()
    nombre: string;

    @Type(() => Number)
    @IsInt({ message: 'El campo sexo_biologico_id debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA], { message: createEnumMessage(SEXO_BIOLOGICO_METADATA, [SexoBiologico.MACHO, SexoBiologico.HEMBRA], 'sexo_biologico_id') })
    sexo_biologico_id: number;

    @IsDateString({}, { message: 'El campo fecha_nacimiento debe ser una fecha válida (YYYY-MM-DD).' })
    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria para calcular la categoría del animal.' })
    fecha_nacimiento: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsDateString({}, { message: 'El campo fecha_ingreso debe ser una fecha válida (YYYY-MM-DD).' })
    @IsCompareFields('fecha_ingreso', 'gte', 'fecha_nacimiento')
    fecha_ingreso?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso_nacimiento debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El peso_nacimiento no puede ser negativo.' })
    @Max(70, { message: 'El peso_nacimiento no puede exceder los 70 kg.' })
    peso_nacimiento?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso_actual debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El peso_actual no puede ser negativo.' })
    @Max(1500, { message: 'El peso_actual no puede exceder los 1500 kg.' })
    peso_actual?: number | null;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'El campo color debe ser de tipo texto.' })
    @MaxLength(50, { message: 'El campo color no puede exceder los 50 caracteres.' })
    @IsSafeText()
    color?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo padre_id debe ser un número entero.' })
    @Min(1, { message: 'El campo padre_id debe ser mayor a 0.' })
    padre_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo madre_id debe ser un número entero.' })
    @Min(1, { message: 'El campo madre_id debe ser mayor a 0.' })
    madre_id?: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor_adquisicion debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El valor_adquisicion no puede ser negativo.' })
    valor_adquisicion: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor_residual debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El valor_residual no puede ser negativo.' })
    @IsCompareFields('valor_residual', 'lte', 'valor_adquisicion')
    valor_residual: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo es_productor_leche debe ser un número entero.' })
    @IsIn([CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], { message: createEnumMessage(CONDICION_PRODUCTOR_LECHE_METADATA, [CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], 'es_productor_leche') })
    es_productor_leche: number;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(1000, { message: 'El campo observaciones no puede exceder los 1000 caracteres.' })
    @IsSafeText()
    observaciones?: string | null;

    @IsOptionalImage()
    foto?: string | null;
}
