// C:\sistemas\sicab\sicab-backend\src\common\decorators\image.decorator.ts
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsSafeText } from './safe-text.decorator';

export function IsOptionalImage(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol) => {
        IsOptional()(target, propertyKey);

        Transform(({ value }) => typeof value === 'string' ? value.trim() : value)(target, propertyKey);

        IsString({ message: `El campo ${String(propertyKey)} debe ser de tipo texto.` })(target, propertyKey);
        MaxLength(255, { message: `El campo ${String(propertyKey)} no puede exceder los 255 caracteres.` })(target, propertyKey);
        IsSafeText()(target, propertyKey);
    };
}
