// C:\sistemas\sicab\sicab-backend\src\common\decorators\is-proximo-km-mayor-que-km.decorator.ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsProximoKmMayorQueKm(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isProximoKmMayorQueKm',
            target: object.constructor,
            propertyName: propertyName,
            ...(validationOptions !== undefined ? { options: validationOptions } : {}),
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const obj = args.object as any;
                    if (value == null || obj.kilometraje == null) return true;
                    return Number(value) > Number(obj.kilometraje);
                },
                defaultMessage(_args: ValidationArguments) {
                    return 'proximo_kilometraje debe ser mayor que kilometraje.';
                },
            },
        });
    };
}
