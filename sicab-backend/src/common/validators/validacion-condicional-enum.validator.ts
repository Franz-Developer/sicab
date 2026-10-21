// C:\sistemas\sicab\sicab-backend\src\common\validators\validacion-condicional-enum.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';

export interface ReglaEnumCondicional {
    fieldCondicion: string;
    valorCondicion: number | string;
    fieldObjetivo: string;
    valoresPermitidos: readonly (number | string)[];
}

@ValidatorConstraint({ name: 'enumCondicional', async: false })
export class EnumCondicional implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
        const [reglas] = args.constraints as [ReglaEnumCondicional[]];
        const obj = args.object as Record<string, any>;

        for (const regla of reglas) {
            const condicion = obj[regla.fieldCondicion];
            const objetivo = obj[regla.fieldObjetivo];

            if (condicion === undefined || objetivo === undefined) continue;
            if (condicion !== regla.valorCondicion) continue;

            if (!regla.valoresPermitidos.includes(objetivo)) return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const [reglas] = args.constraints as [ReglaEnumCondicional[]];
        const obj = args.object as Record<string, any>;

        for (const regla of reglas) {
            const condicion = obj[regla.fieldCondicion];
            const objetivo = obj[regla.fieldObjetivo];

            if (condicion === undefined || objetivo === undefined) continue;
            if (condicion !== regla.valorCondicion) continue;

            if (!regla.valoresPermitidos.includes(objetivo)) {
                return `El campo ${regla.fieldObjetivo} no es válido para ${regla.fieldCondicion} = ${regla.valorCondicion}.`;
            }
        }
        return 'Regla condicional de enum incumplida.';
    }
}

export function IsEnumCondicional(
    reglas: ReglaEnumCondicional[],
): ClassDecorator & PropertyDecorator {
    return Validate(EnumCondicional, [reglas]) as any;
}
