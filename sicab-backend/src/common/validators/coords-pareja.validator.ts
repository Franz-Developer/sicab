// C:\sistemas\sicab\sicab-backend\src\common\validators\coords-pareja.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';

@ValidatorConstraint({ name: 'coordsPareja', async: false })
export class CoordsPareja implements ValidatorConstraintInterface {
    validate(_: unknown, args: ValidationArguments): boolean {
        const [latField, lngField] = args.constraints as [string, string];
        const obj = args.object as Record<string, unknown>;

        const lat = obj[latField];
        const lng = obj[lngField];

        const latVacio = lat === undefined || lat === null;
        const lngVacio = lng === undefined || lng === null;

        if (latVacio && lngVacio) return true;
        if (!latVacio && !lngVacio) return true;

        return false;
    }

    defaultMessage(args: ValidationArguments): string {
        const [latField, lngField] = args.constraints as [string, string];
        return `Debe proporcionar ${latField} y ${lngField} juntos, o dejar ambos vacíos.`;
    }
}

export function IsCoordsPareja(
    latField: string,
    lngField: string,
): ClassDecorator & PropertyDecorator {
    return Validate(CoordsPareja, [latField, lngField]) as ClassDecorator & PropertyDecorator;
}
