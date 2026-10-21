// C:\sistemas\sicab\sicab-backend\src\common\validators\comprobante-pago.validator.ts
import { Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { TipoPagoFrecuencia } from '../constants/estados.constant';

@ValidatorConstraint({ name: 'comprobanteCoherente', async: false })
export class ComprobanteCoherenteConstraint implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
        const obj = args.object as any;
        const tipo = obj.tipo_pago_frecuencia_id;
        const comprobante = obj.numero_comprobante;
        const banco = obj.banco_id ?? 1;

        if (tipo === TipoPagoFrecuencia.EFECTIVO) {
            return comprobante == null && banco === 1;
        }
        if (tipo === TipoPagoFrecuencia.TRANSFERENCIA) {
            return typeof comprobante === 'string' && comprobante.trim() !== '' && banco > 1;
        }
        if (tipo === TipoPagoFrecuencia.QR) {
            return typeof comprobante === 'string' && comprobante.trim() !== '' && banco === 1;
        }
        if (tipo === TipoPagoFrecuencia.OTRO) {
            return banco === 1;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const obj = args.object as any;
        const tipo = obj.tipo_pago_frecuencia_id;
        if (tipo === TipoPagoFrecuencia.EFECTIVO) return 'Para EFECTIVO, numero_comprobante debe estar vacío y banco_id debe ser 1.';
        if (tipo === TipoPagoFrecuencia.TRANSFERENCIA) return 'Para TRANSFERENCIA, numero_comprobante es obligatorio y banco_id debe ser mayor a 1.';
        if (tipo === TipoPagoFrecuencia.QR) return 'Para QR, numero_comprobante es obligatorio y banco_id debe ser 1.';
        if (tipo === TipoPagoFrecuencia.OTRO) return 'Para OTRO, banco_id debe ser 1.';
        return 'Combinación de tipo de pago, banco y comprobante inválida.';
    }
}

export function IsComprobanteCoherente(): ClassDecorator {
    return Validate(ComprobanteCoherenteConstraint) as any;
}
