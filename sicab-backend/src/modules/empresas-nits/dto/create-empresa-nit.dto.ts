// C:\sistemas\sicab\sicab-backend\src\modules\empresas-nits\dto\create-empresa-nit.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsDate, IsIn, Min, MaxLength, MinLength, Matches } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsRequiredEmail } from '../../../common/decorators/email.decorator';
import { Ambiente, AMBIENTE_METADATA, ModalidadFacturacion, MODALIDAD_FACTURACION_METADATA } from '../../../common/constants/estados.constant';
import { getEnumValues, createEnumMessage } from '../../../common/utils/validation-helper.util';
import { emptyToNull, emptyToNullUpper, trimString, trimUpperString } from '../../../common/utils/transform.helper';

export class CreateEmpresaNitDto {
    @IsInt({ message: 'empresa_id debe ser un número entero.' })
    @IsNotEmpty({ message: 'empresa_id es obligatorio.' })
    @Min(1, { message: 'empresa_id debe ser mayor a 0.' })
    empresa_id: number;

    @IsInt({ message: 'ambiente_id debe ser un número entero.' })
    @IsNotEmpty({ message: 'ambiente_id es obligatorio.' })
    @IsIn(getEnumValues(Ambiente), {
        message: createEnumMessage(AMBIENTE_METADATA, getEnumValues(Ambiente), 'ambiente_id'),
    })
    ambiente_id: number;

    @Transform(trimString)
    @IsString({ message: 'nit debe ser un texto.' })
    @IsNotEmpty({ message: 'nit es obligatorio.' })
    @MinLength(7, { message: 'nit debe tener al menos 7 caracteres.' })
    @MaxLength(20, { message: 'nit no puede exceder los 20 caracteres.' })
    @Matches(/^[0-9]+$/, { message: 'nit debe contener solo números.' })
    @IsSafeText()
    nit: string;

    @Transform(trimUpperString)
    @IsString({ message: 'razon_social debe ser un texto.' })
    @IsNotEmpty({ message: 'razon_social es obligatorio.' })
    @MinLength(3, { message: 'razon_social debe tener al menos 3 caracteres.' })
    @MaxLength(500, { message: 'razon_social no puede exceder los 500 caracteres.' })
    @IsSafeText()
    razon_social: string;

    @Transform(trimUpperString)
    @IsString({ message: 'actividad_economica_principal debe ser un texto.' })
    @IsNotEmpty({ message: 'actividad_economica_principal es obligatorio.' })
    @MinLength(3, { message: 'actividad_economica_principal debe tener al menos 3 caracteres.' })
    @MaxLength(2000, { message: 'actividad_economica_principal no puede exceder los 2000 caracteres.' })
    @IsSafeText()
    actividad_economica_principal: string;

    @Transform(trimUpperString)
    @IsString({ message: 'etiqueta debe ser un texto.' })
    @IsNotEmpty({ message: 'etiqueta es obligatorio.' })
    @MinLength(1, { message: 'etiqueta debe tener al menos 1 carácter.' })
    @MaxLength(30, { message: 'etiqueta no puede exceder los 30 caracteres.' })
    @Matches(/^[A-Z_]+$/, { message: 'etiqueta debe contener solo mayúsculas y guiones bajos.' })
    @IsSafeText()
    etiqueta: string;

    @IsInt({ message: 'modalidad_facturacion_id debe ser un número entero.' })
    @IsNotEmpty({ message: 'modalidad_facturacion_id es obligatorio.' })
    @IsIn(getEnumValues(ModalidadFacturacion), {
        message: createEnumMessage(
            MODALIDAD_FACTURACION_METADATA,
            getEnumValues(ModalidadFacturacion),
            'modalidad_facturacion_id',
        ),
    })
    modalidad_facturacion_id: number;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'certificado_digital debe ser un texto.' })
    @MaxLength(2000, { message: 'certificado_digital no puede exceder los 2000 caracteres.' })
    @IsSafeText()
    certificado_digital?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'certificado_password debe ser un texto.' })
    @MaxLength(500, { message: 'certificado_password no puede exceder los 500 caracteres.' })
    @IsSafeText()
    certificado_password?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'token_siat debe ser un texto.' })
    @MaxLength(4000, { message: 'token_siat no puede exceder los 4000 caracteres.' })
    @IsSafeText()
    token_siat?: string | null;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'fecha_inicio_vigencia debe ser una fecha válida.' })
    fecha_inicio_vigencia?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'fecha_fin_vigencia debe ser una fecha válida.' })
    fecha_fin_vigencia?: Date;

    @IsRequiredEmail()
    email_fiscal: string;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'codigo_actividad_caeb debe ser un texto.' })
    @MaxLength(20, { message: 'codigo_actividad_caeb no puede exceder los 20 caracteres.' })
    @IsSafeText()
    codigo_actividad_caeb?: string | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsString({ message: 'telefono_fiscal debe ser un texto.' })
    @MaxLength(100, { message: 'telefono_fiscal no puede exceder los 100 caracteres.' })
    @IsSafeText()
    telefono_fiscal?: string | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'municipio_fiscal debe ser un texto.' })
    @MaxLength(100, { message: 'municipio_fiscal no puede exceder los 100 caracteres.' })
    @IsSafeText()
    municipio_fiscal?: string | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'direccion_fiscal debe ser un texto.' })
    @MaxLength(500, { message: 'direccion_fiscal no puede exceder los 500 caracteres.' })
    @IsSafeText()
    direccion_fiscal?: string | null;
}
