// C:\sistemas\sicab\sicab-backend\src\common\decorators\telefono.decorator.ts
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { REGEX_TELEFONO, MENSAJE_TELEFONO_INVALIDO } from '../constants/regex.constant';
import { IsSafeText } from './safe-text.decorator';
import { emptyToNull, trimString } from '../utils/transform.helper';

export function IsTelefonoRequerido(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
        Transform(trimString)(target, propertyKey);
        IsString()(target, propertyKey);
        IsNotEmpty({ message: `${String(propertyKey)} es obligatorio.` })(target, propertyKey);
        MinLength(7, { message: `${String(propertyKey)} debe tener al menos 7 caracteres.` })(target, propertyKey);
        MaxLength(20, { message: `${String(propertyKey)} no puede exceder los 20 caracteres.` })(target, propertyKey);
        Matches(REGEX_TELEFONO, {
            message: `${String(propertyKey)} ${MENSAJE_TELEFONO_INVALIDO}`,
        })(target, propertyKey);
        IsSafeText()(target, propertyKey);
    };
}

export function IsTelefonoOpcional(): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
        Transform(emptyToNull)(target, propertyKey);
        IsOptional()(target, propertyKey);
        IsString()(target, propertyKey);
        MinLength(7, { message: `${String(propertyKey)} debe tener al menos 7 caracteres.` })(target, propertyKey);
        MaxLength(20, { message: `${String(propertyKey)} no puede exceder los 20 caracteres.` })(target, propertyKey);
        Matches(REGEX_TELEFONO, {
            message: `${String(propertyKey)} ${MENSAJE_TELEFONO_INVALIDO}`,
        })(target, propertyKey);
        IsSafeText()(target, propertyKey);
    };
}
