// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores-cargos\dto\update-trabajador-cargo.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn, Min, MaxLength, IsNumber, IsDate } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { TipoMoneda, TIPO_MONEDA_METADATA } from '../../../common/constants/estados.constant';
import { getEnumValues, createEnumMessage } from '../../../common/utils/validation-helper.util';
import { emptyToUndefined } from '../../../common/utils/transform.helper';

export class UpdateTrabajadorCargoDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'sueldo_base debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'sueldo_base no puede ser negativo.' })
    sueldo_base?: number;

    @IsOptional()
    @IsInt({ message: 'tipo_moneda_id debe ser un número entero.' })
    @IsIn(getEnumValues(TipoMoneda), {
        message: createEnumMessage(TIPO_MONEDA_METADATA, getEnumValues(TipoMoneda), 'tipo_moneda_id'),
    })
    tipo_moneda_id?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'fecha_desde debe ser una fecha válida.' })
    fecha_desde?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'fecha_hasta debe ser una fecha válida.' })
    fecha_hasta?: Date;

    @IsOptional()
    @Transform(emptyToUndefined)
    @IsString({ message: 'observaciones debe ser un texto.' })
    @MaxLength(500, { message: 'observaciones no puede exceder los 500 caracteres.' })
    @IsSafeText()
    observaciones?: string;
}
