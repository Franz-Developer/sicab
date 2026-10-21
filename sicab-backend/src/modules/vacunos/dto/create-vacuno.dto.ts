// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\create-vacuno.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, IsNumber, Min, Max, IsInt, IsIn, IsDateString } from 'class-validator';
import { SexoBiologico, SEXO_BIOLOGICO_METADATA, EstadoVacuno, ESTADO_VACUNO_METADATA, CondicionProductorLeche, CONDICION_PRODUCTOR_LECHE_METADATA } from '../../../common/constants/estados.constant';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsOptionalImage } from '../../../common/decorators/image.decorator';
import { emptyToNull, trimUpperString, emptyToNullUpper, emptyToUndefinedUpper, emptyToUndefined } from '../../../common/utils/transform.helper';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';
import { IsCompareFields } from '../../../common/validators/compare-fields.validator';

export class CreateVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    sucursal_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo raza_id debe ser un número entero.' })
    raza_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo categoria_vacuno_id debe ser un número entero.' })
    categoria_vacuno_id: number;

    @Transform(trimUpperString)
    @IsString({ message: 'El campo arete debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'El arete es obligatorio.' })
    @MinLength(3, { message: 'El arete debe tener al menos 3 caracteres.' })
    @MaxLength(50, { message: 'El arete no puede exceder los 50 caracteres.' })
    @IsSafeText()
    arete: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo nombre debe ser de tipo texto.' })
    @MaxLength(150, { message: 'El nombre no puede exceder los 150 caracteres.' })
    @IsSafeText()
    nombre?: string;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_nacimiento debe ser una fecha válida.' })
    fecha_nacimiento?: string | null;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsDateString({}, { message: 'El campo fecha_ingreso debe ser una fecha válida.' })
    fecha_ingreso?: string;

    @Type(() => Number)
    @IsInt({ message: 'El campo sexo_biologico_id debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA], {
        message: createEnumMessage(SEXO_BIOLOGICO_METADATA, [SexoBiologico.MACHO, SexoBiologico.HEMBRA], 'sexo_biologico_id'),
    })
    sexo_biologico_id: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso_nacimiento debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El peso_nacimiento no puede ser negativo.' })
    peso_nacimiento?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El peso_actual debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El peso_actual no puede ser negativo.' })
    peso_actual?: number | null;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo color debe ser de tipo texto.' })
    @MaxLength(50, { message: 'El campo color no puede exceder los 50 caracteres.' })
    @IsSafeText()
    color?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo padre_arete debe ser de tipo texto.' })
    @MaxLength(50, { message: 'El campo padre_arete no puede exceder los 50 caracteres.' })
    @IsSafeText()
    padre_arete?: string;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo madre_arete debe ser de tipo texto.' })
    @MaxLength(50, { message: 'El campo madre_arete no puede exceder los 50 caracteres.' })
    @IsSafeText()
    madre_arete?: string;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor_adquisicion debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El valor_adquisicion no puede ser negativo.' })
    valor_adquisicion: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El valor_residual debe tener máximo 2 decimales.' })
    @Min(0, { message: 'El valor_residual no puede ser negativo.' })
    @IsCompareFields('valor_residual', 'lte', 'valor_adquisicion')
    valor_residual: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El campo valor_adquisicion_ufv debe ser un número con máximo 4 decimales.' })
    @Min(0, { message: 'El campo valor_adquisicion_ufv no puede ser negativo.' })
    valor_adquisicion_ufv?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El campo valor_residual_ufv debe ser un número con máximo 4 decimales.' })
    @Min(0, { message: 'El campo valor_residual_ufv no puede ser negativo.' })
    @IsCompareFields('valor_residual_ufv', 'lte', 'valor_adquisicion_ufv')
    valor_residual_ufv?: number | null;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_cotizacion_ufv debe ser una fecha válida.' })
    fecha_cotizacion_ufv?: string | null;

    @Type(() => Number)
    @IsInt({ message: 'El campo vida_util_anios debe ser un número entero.' })
    @Min(1, { message: 'La vida_util_anios debe ser mayor a 0.' })
    vida_util_anios: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo tasa_amortizacion debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo tasa_amortizacion no puede ser negativo.' })
    @Max(100, { message: 'La tasa_amortizacion no puede ser mayor a 100.' })
    tasa_amortizacion: number;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_inicio_amortizacion debe ser una fecha válida.' })
    fecha_inicio_amortizacion?: string | null;

    @Type(() => Number)
    @IsInt({ message: 'El campo es_productor_leche debe ser un número entero.' })
    @IsIn([CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], {
        message: createEnumMessage(CONDICION_PRODUCTOR_LECHE_METADATA, [CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], 'es_productor_leche'),
    })
    es_productor_leche: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo estado_vacuno_id debe ser un número entero.' })
    @IsIn(
        [EstadoVacuno.ACTIVO, EstadoVacuno.EN_TRATAMIENTO, EstadoVacuno.SECA, EstadoVacuno.DESCARTE, EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO],
        {
            message: createEnumMessage(
                ESTADO_VACUNO_METADATA,
                [EstadoVacuno.ACTIVO, EstadoVacuno.EN_TRATAMIENTO, EstadoVacuno.SECA, EstadoVacuno.DESCARTE, EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO],
                'estado_vacuno_id',
            ),
        },
    )
    estado_vacuno_id: number;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_salida debe ser una fecha válida.' })
    fecha_salida?: string | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo motivo_salida debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo motivo_salida no puede exceder los 500 caracteres.' })
    @IsSafeText()
    motivo_salida?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo peso_salida debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo peso_salida no puede ser negativo.' })
    peso_salida?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo precio_venta debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo precio_venta no puede ser negativo.' })
    precio_venta?: number | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo causa_muerte debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo causa_muerte no puede exceder los 500 caracteres.' })
    @IsSafeText()
    causa_muerte?: string | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(1000, { message: 'El campo observaciones no puede exceder los 1000 caracteres.' })
    @IsSafeText()
    observaciones?: string | null;

    @IsOptionalImage()
    foto?: string | null;
}
