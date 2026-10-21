// C:\sistemas\sicab\sicab-backend\src\modules\empresas\dto\create-empresa.dto.ts
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, Matches, IsDateString } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsOptionalEmail } from '../../../common/decorators/email.decorator';
import { IsOptionalImage } from '../../../common/decorators/image.decorator';
import { emptyToNull, emptyToNullUpper, emptyToUndefined, emptyToUndefinedUpper, trimUpperString } from '../../../common/utils/transform.helper';

export class CreateEmpresaDto {
    @Transform(trimUpperString)
    @IsString({ message: 'El campo empresa debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo empresa es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo empresa debe tener al menos 3 caracteres.' })
    @MaxLength(200, { message: 'El campo empresa no puede exceder los 200 caracteres.' })
    @IsSafeText()
    empresa: string;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo codigo debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo codigo es obligatorio y no puede estar vacío.' })
    @MinLength(3, { message: 'El campo codigo debe tener al menos 3 caracteres.' })
    @MaxLength(30, { message: 'El campo codigo no puede exceder los 30 caracteres.' })
    @Matches(/^[A-Z0-9_-]+$/, { message: 'El campo codigo solo puede contener letras mayúsculas, números, guiones y guiones bajos.' })
    codigo: string;

    @IsOptionalImage()
    logo?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo eslogan debe ser de tipo texto.' })
    @MinLength(3, { message: 'El campo eslogan debe tener al menos 3 caracteres.' })
    @MaxLength(150, { message: 'El campo eslogan no puede exceder los 150 caracteres.' })
    @IsSafeText()
    eslogan?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'El campo descripcion debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo descripcion no puede exceder los 500 caracteres.' })
    @IsSafeText()
    descripcion?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo lugar debe ser de tipo texto.' })
    @MinLength(3, { message: 'El campo lugar debe tener al menos 3 caracteres.' })
    @MaxLength(60, { message: 'El campo lugar no puede exceder los 60 caracteres.' })
    @IsSafeText()
    lugar?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo representante debe ser de tipo texto.' })
    @MinLength(3, { message: 'El campo representante debe tener al menos 3 caracteres.' })
    @MaxLength(100, { message: 'El campo representante no puede exceder los 100 caracteres.' })
    @IsSafeText()
    representante?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo direccion debe ser de tipo texto.' })
    @MinLength(5, { message: 'El campo direccion debe tener al menos 5 caracteres.' })
    @MaxLength(500, { message: 'El campo direccion no puede exceder los 500 caracteres.' })
    @IsSafeText()
    direccion?: string;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'El campo telefono debe ser de tipo texto.' })
    @MaxLength(100, { message: 'El campo telefono no puede exceder los 100 caracteres.' })
    @IsSafeText()
    telefono?: string;

    @IsOptionalEmail()
    email?: string;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo matricula_comercio debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El campo matricula_comercio es obligatorio y no puede estar vacío.' })
    @MaxLength(50, { message: 'El campo matricula_comercio no puede exceder los 50 caracteres.' })
    @Matches(/^[A-Z0-9-]+$/, { message: 'El campo matricula_comercio solo permite mayúsculas, números y guiones.' })
    @IsSafeText()
    matricula_comercio: string;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo licencia_frecuencia_att debe ser de tipo texto.' })
    @MaxLength(50, { message: 'El campo licencia_frecuencia_att no puede exceder los 50 caracteres.' })
    @IsSafeText()
    licencia_frecuencia_att?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_emision_licencia_att debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_emision_licencia_att?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_vencimiento_licencia_att debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_vencimiento_licencia_att?: string | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo resolucion_municipal_operacion debe ser de tipo texto.' })
    @MaxLength(50, { message: 'El campo resolucion_municipal_operacion no puede exceder los 50 caracteres.' })
    @IsSafeText()
    resolucion_municipal_operacion?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_emision_resolucion debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_emision_resolucion?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_vencimiento_resolucion debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_vencimiento_resolucion?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'El campo frecuencia_asignada_mhz debe ser de tipo texto.' })
    @MaxLength(30, { message: 'El campo frecuencia_asignada_mhz no puede exceder los 30 caracteres.' })
    @Matches(/^[0-9]+(\.[0-9]+)?(\s*(MHz|kHz|GHz))?$/, {
        message: 'El campo frecuencia_asignada_mhz debe tener formato numérico (ej. 98.5 MHz, 100 kHz).'
    })
    @IsSafeText()
    frecuencia_asignada_mhz?: string | null;
}
