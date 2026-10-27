// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\create-tipo-cambio.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, IsNumber, IsIn, IsDateString, Min, IsNotEmpty, ValidateIf, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';
import { TipoMoneda } from '../../../common/constants/estados.constant';
import { trimString } from '../../../common/utils/transform.helper';

@ValidatorConstraint({ name: 'coherenciaMonedaFactores', async: false })
class CoherenciaMonedaFactoresConstraint implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments): boolean {
        const obj = args.object as CreateTipoCambioDto;
        if (obj.destino_moneda_id === TipoMoneda.UFV) {
            return obj.factor_compra === undefined || obj.factor_compra === null;
        }
        return typeof obj.factor_compra === 'number' && obj.factor_compra > 0;
    }
    defaultMessage(args: ValidationArguments): string {
        const obj = args.object as CreateTipoCambioDto;
        if (obj.destino_moneda_id === TipoMoneda.UFV) {
            return 'Para UFV (2303), factor_compra debe estar vacío o ausente.';
        }
        return 'Para Dólar (2301) o Euro (2302), factor_compra es obligatorio y debe ser mayor a 0.';
    }
}

@ValidatorConstraint({ name: 'compraMenorIgualVenta', async: false })
class CompraMenorIgualVentaConstraint implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments): boolean {
        const obj = args.object as CreateTipoCambioDto;
        if (obj.factor_compra === undefined || obj.factor_compra === null) return true;
        if (typeof obj.factor_venta !== 'number') return true;
        return obj.factor_compra <= obj.factor_venta;
    }
    defaultMessage(): string {
        return 'El campo factor_compra debe ser menor o igual a factor_venta.';
    }
}

@ValidatorConstraint({ name: 'monedasDistintas', async: false })
class MonedasDistintasConstraint implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments): boolean {
        const obj = args.object as CreateTipoCambioDto;
        return obj.origen_moneda_id !== obj.destino_moneda_id;
    }
    defaultMessage(): string {
        return 'El campo origen_moneda_id debe ser distinto de destino_moneda_id.';
    }
}

export class CreateTipoCambioDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo origen_moneda_id debe ser un número entero.' })
    @IsIn([TipoMoneda.BOLIVIANO], { message: 'El campo origen_moneda_id debe ser 2300 (BOLIVIANO).' })
    origen_moneda_id: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo destino_moneda_id debe ser un número entero.' })
    @IsIn([TipoMoneda.DOLAR, TipoMoneda.EURO, TipoMoneda.UFV], { message: 'El campo destino_moneda_id debe ser 2301 (DÓLAR), 2302 (EURO) o 2303 (UFV).' })
    destino_moneda_id: number;

    @ValidateIf((o: CreateTipoCambioDto) => o.destino_moneda_id !== TipoMoneda.UFV)
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 5 }, { message: 'El campo factor_compra debe ser un número con máximo 5 decimales.' })
    @Min(0.0001, { message: 'El campo factor_compra debe ser mayor a 0.' })
    factor_compra?: number | null;

    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 5 }, { message: 'El campo factor_venta debe ser un número con máximo 5 decimales.' })
    @Min(0.0001, { message: 'El campo factor_venta debe ser mayor a 0.' })
    factor_venta: number;

    @Transform(trimString)
    @IsNotEmpty({ message: 'El campo fecha_cotizacion es obligatorio.' })
    @IsDateString({}, { message: 'El campo fecha_cotizacion debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_cotizacion: string;

    @Validate(CoherenciaMonedaFactoresConstraint)
    // @ts-ignore: Se usa para validación de class-validator
    private readonly _coherenciaMonedaFactores?: never;

    @Validate(CompraMenorIgualVentaConstraint)
    // @ts-ignore: Se usa para validación de class-validator
    private readonly _compraMenorIgualVenta?: never;

    @Validate(MonedasDistintasConstraint)
    // @ts-ignore: Se usa para validación de class-validator
    private readonly _monedasDistintas?: never;
}
