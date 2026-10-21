// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\create-tipo-cambio.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsIn, IsDateString, Min, IsNotEmpty } from 'class-validator';
import { TipoMoneda } from '../../../common/constants/estados.constant';
import { trimString } from '../../../common/utils/transform.helper';

export class CreateTipoCambioDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo origen_moneda_id debe ser un número entero.' })
    @IsIn(Object.values(TipoMoneda), { message: 'El campo origen_moneda_id no es válido.' })
    origen_moneda_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo destino_moneda_id debe ser un número entero.' })
    @IsIn(Object.values(TipoMoneda), { message: 'El campo destino_moneda_id no es válido.' })
    destino_moneda_id: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El campo factor_compra debe ser un número con máximo 4 decimales.' })
    @Min(0.0001, { message: 'El campo factor_compra debe ser mayor a 0.' })
    factor_compra: number;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 4 }, { message: 'El campo factor_venta debe ser un número con máximo 4 decimales.' })
    @Min(0.0001, { message: 'El campo factor_venta debe ser mayor a 0.' })
    factor_venta: number;

    @Transform(trimString)
    @IsNotEmpty({ message: 'El campo fecha_cotizacion es obligatorio.' })
    @IsDateString({}, { message: 'El campo fecha_cotizacion debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_cotizacion: string;
}
