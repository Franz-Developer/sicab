// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores\dto\create-trabajador.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn, MaxLength, Min, MinLength, IsDate } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsOptionalEmail } from '../../../common/decorators/email.decorator';
import { IsOptionalImage } from '../../../common/decorators/image.decorator';
import { Genero, GENERO_METADATA, EstadoCivilMasculino, EstadoCivilFemenino, CategoriaLicencia, CATEGORIA_LICENCIA_METADATA } from '../../../common/constants/estados.constant';
import { getEnumValues, createEnumMessage } from '../../../common/utils/validation-helper.util';
import { emptyToUndefined, emptyToUndefinedUpper, trimString, trimUpperString } from '../../../common/utils/transform.helper';
import { IsEnumCondicional } from '../../../common/validators/validacion-condicional-enum.validator';

@IsEnumCondicional([
    {
        fieldCondicion: 'genero_id',
        valorCondicion: Genero.MASCULINO,
        fieldObjetivo: 'estado_civil_id',
        valoresPermitidos: getEnumValues(EstadoCivilMasculino),
    },
    {
        fieldCondicion: 'genero_id',
        valorCondicion: Genero.FEMENINO,
        fieldObjetivo: 'estado_civil_id',
        valoresPermitidos: getEnumValues(EstadoCivilFemenino),
    },
])
export class CreateTrabajadorDto {
    @IsOptional()
    @IsInt({ message: 'sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'sucursal_id debe ser válido.' })
    sucursal_id?: number;

    @IsInt({ message: 'genero_id debe ser un número entero.' })
    @IsIn(getEnumValues(Genero), {
        message: createEnumMessage(GENERO_METADATA, getEnumValues(Genero), 'genero_id')
    })
    genero_id: number;

    @IsInt({ message: 'estado_civil_id debe ser un número entero.' })
    @IsIn([...getEnumValues(EstadoCivilMasculino), ...getEnumValues(EstadoCivilFemenino)], {
        message: 'estado_civil_id debe ser un valor válido según el género seleccionado.'
    })
    estado_civil_id: number;

    @Transform(trimUpperString)
    @IsString({ message: 'nombres debe ser un texto.' })
    @IsNotEmpty({ message: 'nombres es obligatorio.' })
    @MinLength(3, { message: 'nombres debe tener al menos 3 caracteres.' })
    @MaxLength(150, { message: 'nombres no puede exceder los 150 caracteres.' })
    @IsSafeText()
    nombres: string;

    @Transform(trimUpperString)
    @IsString({ message: 'paterno debe ser un texto.' })
    @IsNotEmpty({ message: 'paterno es obligatorio.' })
    @MinLength(3, { message: 'paterno debe tener al menos 3 caracteres.' })
    @MaxLength(80, { message: 'paterno no puede exceder los 80 caracteres.' })
    @IsSafeText()
    paterno: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'materno debe ser un texto.' })
    @MinLength(3, { message: 'materno debe tener al menos 3 caracteres.' })
    @MaxLength(80, { message: 'materno no puede exceder los 80 caracteres.' })
    @IsSafeText()
    materno?: string;

    @Transform(trimString)
    @IsString({ message: 'dni debe ser un texto.' })
    @IsNotEmpty({ message: 'dni es obligatorio.' })
    @MinLength(5, { message: 'dni debe tener al menos 5 caracteres.' })
    @MaxLength(20, { message: 'dni no puede exceder los 20 caracteres.' })
    @IsSafeText()
    dni: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'telefono debe ser un texto.' })
    @MaxLength(100, { message: 'telefono no puede exceder los 100 caracteres.' })
    @IsSafeText()
    telefono?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'direccion debe ser un texto.' })
    @MaxLength(255, { message: 'direccion no puede exceder los 255 caracteres.' })
    @IsSafeText()
    direccion?: string;

    @IsOptionalEmail()
    email?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'fecha_nacimiento debe ser una fecha válida.' })
    fecha_nacimiento?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'fecha_contratacion debe ser una fecha válida.' })
    fecha_contratacion?: Date;

    @IsOptionalImage()
    foto?: string;

    @IsInt({ message: 'categoria_licencia_id debe ser un número entero.' })
    @IsIn(getEnumValues(CategoriaLicencia), {
        message: createEnumMessage(CATEGORIA_LICENCIA_METADATA, getEnumValues(CategoriaLicencia), 'categoria_licencia_id')
    })
    categoria_licencia_id: number;

    @Transform(trimUpperString)
    @IsString({ message: 'apodo debe ser un texto.' })
    @IsNotEmpty({ message: 'apodo es obligatorio.' })
    @MinLength(3, { message: 'apodo debe tener al menos 3 caracteres.' })
    @MaxLength(80, { message: 'apodo no puede exceder los 80 caracteres.' })
    @IsSafeText()
    apodo: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'celular debe ser un texto.' })
    @MaxLength(100, { message: 'celular no puede exceder los 100 caracteres.' })
    @IsSafeText()
    celular?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'garante debe ser un texto.' })
    @MaxLength(3000, { message: 'garante no puede exceder los 3000 caracteres.' })
    @IsSafeText()
    garante?: string;
}
