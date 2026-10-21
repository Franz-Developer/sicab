// C:\sistemas\sicab\sicab-backend\src\common\decorators\safe-text.decorator.ts
import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import xss from 'xss';

const HTML_TAG_PATTERN = /<\/?[a-zA-Z][^>]*>/;

const DANGEROUS_PATTERNS: RegExp[] = [
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /\bon\w+\s*=/i,
    /&#x?[0-9a-f]+;?/i,
    /&(lt|gt|amp|quot|apos|#)/i,
];

const HOMOGLYPH_LEFT = /\uFF1C/g;
const HOMOGLYPH_RIGHT = /\uFF1E/g;

export function IsSafeText(
    validationOptions?: ValidationOptions,
): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
        registerDecorator({
            name: 'isSafeText',
            target: target.constructor,
            propertyName: String(propertyKey),
            ...(validationOptions !== undefined ? { options: validationOptions } : {}),
            validator: {
                validate(value: unknown): boolean {
                    if (value === null || value === undefined || value === '') {
                        return true;
                    }

                    if (typeof value !== 'string') {
                        return false;
                    }

                    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u202E]/.test(value)) {
                        return false;
                    }

                    let normalized = value;
                    normalized = normalized.replace(HOMOGLYPH_LEFT, '<');
                    normalized = normalized.replace(HOMOGLYPH_RIGHT, '>');

                    if (HTML_TAG_PATTERN.test(normalized)) {
                        return false;
                    }

                    if (DANGEROUS_PATTERNS.some((pattern) => pattern.test(value))) {
                        return false;
                    }

                    const sanitized = xss(value, {
                        whiteList: {},
                        stripIgnoreTag: true,
                        stripIgnoreTagBody: ['script', 'style', 'iframe'],
                    });

                    if (sanitized !== value) {
                        const normalizedSanitized = sanitized
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&amp;/g, '&');

                        return normalizedSanitized === value;
                    }

                    return true;
                },

                defaultMessage(args: ValidationArguments): string {
                    return `${args.property ?? 'campo'} contiene caracteres o contenido no permitido.`;
                },
            },
        });
    };
}
