// C:\sistemas\sicab\sicab-backend\src\common\validators\compare-fields.validator.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from 'class-validator';
import { DomainException } from '../exceptions/domain.exception';

export type CompareOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq';

const OPERATOR_SYMBOL: Record<CompareOperator, string> = {
    lt: '<',
    lte: '<=',
    gt: '>',
    gte: '>=',
    eq: '=',
    neq: '<>',
};

function compare(a: any, operator: CompareOperator, b: any): boolean {
    switch (operator) {
        case 'lt':  return a <  b;
        case 'lte': return a <= b;
        case 'gt':  return a >  b;
        case 'gte': return a >= b;
        case 'eq':  return a === b;
        case 'neq': return a !== b;
        default:    return false;
    }
}

// ============================================================
// Comparación entre dos campos del mismo DTO
// ============================================================

@ValidatorConstraint({ name: 'compareFields', async: false })
export class CompareFields implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
        const [fieldA, operator, fieldB] = args.constraints as [string, CompareOperator, string];
        const obj = args.object as Record<string, any>;

        const a = obj[fieldA];
        const b = obj[fieldB];

        if (a === undefined || b === undefined) return true;

        return compare(a, operator, b);
    }

    defaultMessage(args: ValidationArguments) {
        const [fieldA, operator, fieldB] = args.constraints as [string, CompareOperator, string];
        return `El campo ${fieldA} debe ser ${OPERATOR_SYMBOL[operator]} ${fieldB}.`;
    }
}

export function IsCompareFields(
    fieldA: string,
    operator: CompareOperator,
    fieldB: string,
): ClassDecorator & PropertyDecorator {
    return Validate(CompareFields, [fieldA, operator, fieldB]) as any;
}

// ============================================================
// Comparación condicional: si fieldA === valueA, entonces
// fieldB debe cumplir (operator valueB)
// ============================================================

export interface ConditionalCompareRule {
    fieldA: string;
    valueA: any;
    fieldB: string;
    operator: CompareOperator;
    valueB: any;
}

@ValidatorConstraint({ name: 'compareFieldsConditional', async: false })
export class CompareFieldsConditional implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments) {
        const [rules] = args.constraints as [ConditionalCompareRule[]];
        const obj = args.object as Record<string, any>;

        for (const rule of rules) {
            const a = obj[rule.fieldA];
            const b = obj[rule.fieldB];

            if (a === undefined || b === undefined) continue;
            if (a !== rule.valueA) continue;

            if (!compare(b, rule.operator, rule.valueB)) return false;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const [rules] = args.constraints as [ConditionalCompareRule[]];
        const obj = args.object as Record<string, any>;

        for (const rule of rules) {
            const a = obj[rule.fieldA];
            const b = obj[rule.fieldB];

            if (a === undefined || b === undefined) continue;
            if (a !== rule.valueA) continue;

            if (!compare(b, rule.operator, rule.valueB)) {
                return `Cuando ${rule.fieldA} = ${rule.valueA}, el campo ${rule.fieldB} debe ser ${OPERATOR_SYMBOL[rule.operator]} ${rule.valueB}.`;
            }
        }
        return 'Regla condicional incumplida.';
    }
}

export function IsCompareFieldsConditional(
    rules: ConditionalCompareRule[],
): ClassDecorator & PropertyDecorator {
    return Validate(CompareFieldsConditional, [rules]) as any;
}

// ============================================================
// Servicio de validación de no solapamiento de rangos en BD
// ============================================================

export interface ValidarNoSolapamientoParams<T extends ObjectLiteral> {
    entidad: EntityTarget<T>;
    campoMin: string;
    campoMax: string;
    valorMin: number;
    valorMax: number;
    campoPk: string;
    idExcluir?: number;
    campoEstado?: string;
    estadosValidos?: number[];
    /** Filtros adicionales opcionales (ej: excluir el comodín codigo <> 'N'). */
    filtrosExcluyentes?: Array<{ campo: string; operador: string; valor: any }>;
    /** Campos a devolver en el mensaje de error. */
    camposMensaje?: string[];
    mensajePersonalizado?: (solapada: T) => string;
}

@Injectable()
export class RangoValidadorService {
    /**
     * Valida que el rango [valorMin, valorMax] no se solape con ningún registro
     * existente en la tabla que cumpla los filtros indicados.
     *
     * Dos intervalos cerrados [a, b] y [c, d] se solapan si a <= d && c <= b.
     */
    async validarNoSolapamiento<T extends ObjectLiteral>(
        params: ValidarNoSolapamientoParams<T>,
        manager: EntityManager,
    ): Promise<void> {
        const {
            entidad,
            campoMin,
            campoMax,
            valorMin,
            valorMax,
            campoPk,
            idExcluir,
            campoEstado,
            estadosValidos,
            filtrosExcluyentes,
            camposMensaje,
            mensajePersonalizado,
        } = params;

        const qb = manager
            .createQueryBuilder(entidad, 't')
            .where(`t.${campoMin} <= :max`, { max: valorMax })
            .andWhere(`t.${campoMax} >= :min`, { min: valorMin });

        if (campoEstado && estadosValidos && estadosValidos.length > 0) {
            qb.andWhere(`t.${campoEstado} IN (:...estados)`, { estados: estadosValidos });
        }

        if (filtrosExcluyentes && filtrosExcluyentes.length > 0) {
            filtrosExcluyentes.forEach((f, i) => {
                qb.andWhere(`t.${f.campo} ${f.operador} :filtro_${i}`, { [`filtro_${i}`]: f.valor });
            });
        }

        if (idExcluir !== undefined) {
            qb.andWhere(`t.${campoPk} <> :idExcluir`, { idExcluir });
        }

        const solapada = await qb.getOne();

        if (!solapada) return;

        if (mensajePersonalizado) {
            throw new DomainException(
                mensajePersonalizado(solapada),
                { httpStatus: HttpStatus.CONFLICT },
            );
        }

        const campos = camposMensaje ?? [campoMin, campoMax];
        const detalles = campos
            .map((c) => `${c}=${(solapada as any)[c]}`)
            .join(', ');

        throw new DomainException(
            `El rango [${valorMin}, ${valorMax}] se solapa con un registro existente (${detalles}).`,
            { httpStatus: HttpStatus.CONFLICT },
        );
    }
}
