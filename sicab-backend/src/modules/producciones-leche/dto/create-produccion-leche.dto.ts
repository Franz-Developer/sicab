// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\create-produccion-leche.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToUndefinedUpper } from '../../../common/utils/transform.helper';

export class CreateProduccionLecheDetalleItemDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo vacuno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo vacuno_id debe ser mayor a 0.' })
    vacuno_id: number;

    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo litros debe ser un número con máximo 2 decimales.' },
    )
    @Min(0, { message: 'El campo litros no puede ser negativo.' })
    litros: number;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo observaciones no puede exceder los 500 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}

export class CreateProduccionLecheDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_id debe ser mayor a 0.' })
    sucursal_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo turno_ordeno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo turno_ordeno_id debe ser mayor a 0.' })
    turno_ordeno_id: number;

    @IsDateString(
        { strict: true },
        { message: 'El campo fecha_produccion debe ser una fecha válida en formato YYYY-MM-DD.' },
    )
    fecha_produccion: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo total_descartado debe ser un número con máximo 2 decimales.' },
    )
    @Min(0, { message: 'El campo total_descartado no puede ser negativo.' })
    total_descartado?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'El campo temperatura_promedio debe ser un número con máximo 2 decimales.' },
    )
    @Min(-10, { message: 'El campo temperatura_promedio no puede ser menor a -10.' })
    @Max(50, { message: 'El campo temperatura_promedio no puede ser mayor a 50.' })
    temperatura_promedio?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber(
        { maxDecimalPlaces: 4 },
        { message: 'El campo densidad_promedio debe ser un número con máximo 4 decimales.' },
    )
    @Min(1.0, { message: 'El campo densidad_promedio no puede ser menor a 1.0000.' })
    @Max(1.1, { message: 'El campo densidad_promedio no puede ser mayor a 1.1000.' })
    densidad_promedio?: number | null;

    @IsOptional()
    @Transform(emptyToUndefinedUpper)
    @IsString({ message: 'El campo observaciones debe ser de tipo texto.' })
    @MaxLength(1000, { message: 'El campo observaciones no puede exceder los 1000 caracteres.' })
    @IsSafeText()
    observaciones?: string;

    @IsArray({ message: 'El campo detalles debe ser un arreglo.' })
    @ArrayMinSize(1, {
        message: 'La producción debe incluir al menos un detalle de vacuno.',
    })
    @ValidateNested({ each: true })
    @Type(() => CreateProduccionLecheDetalleItemDto)
    detalles: CreateProduccionLecheDetalleItemDto[];
}
