// C:\sistemas\sicab\sicab-backend\src\common\decorators\email.decorator.ts
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export function IsOptionalEmail(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        Transform(({ value }) => {
            if (typeof value !== 'string') return value;
            const trimmed = value.trim();
            return trimmed === '' ? undefined : trimmed.toLowerCase();
        })(target, propertyKey);

        IsOptional()(target, propertyKey);
        IsEmail({}, { message: 'email debe ser un correo electrónico válido.' })(target, propertyKey);
        MaxLength(100, { message: 'email no puede exceder los 100 caracteres.' })(target, propertyKey);
    };
}

export function IsRequiredEmail(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        Transform(({ value }) => {
            if (typeof value !== 'string') return value;
            const trimmed = value.trim();
            return trimmed === '' ? undefined : trimmed.toLowerCase();
        })(target, propertyKey);

        IsNotEmpty({ message: 'email es obligatorio.' })(target, propertyKey);
        IsEmail({}, { message: 'email debe ser un correo electrónico válido.' })(target, propertyKey);
        MaxLength(100, { message: 'email no puede exceder los 100 caracteres.' })(target, propertyKey);
    };
}
