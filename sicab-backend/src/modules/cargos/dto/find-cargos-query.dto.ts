// C:\sistemas\sicab\sicab-backend\src\modules\cargos\dto\find-cargos-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA, TipoMoneda, TIPO_MONEDA_METADATA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage, getEnumValues } from '../../../common/utils/validation-helper.util';

export class FindCargosQueryDto extends BasePaginationQueryDto {
    @IsOptional()
    @IsString({ message: 'El parámetro q debe ser un texto.' })
    q?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo exactMatch debe ser un número entero.' })
    @IsIn([0, 1], { message: 'El campo exactMatch debe ser 0 (flexible) o 1 (exacta).' })
    exactMatch: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'usuario_id debe ser un número entero.' })
    @Min(1, { message: 'usuario_id debe ser mayor a 0.' })
    usuario_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El estado_id debe ser un número entero.' })
    @IsIn(ESTADOS_CONSULTA, {
        message: createEnumMessage(ESTADO_METADATA, ESTADOS_CONSULTA, 'estado_id')
    })
    estado_id?: number;

    @IsOptional()
    @IsString({ message: 'El campo codigo debe ser un texto.' })
    codigo?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'tipo_moneda_id debe ser un número entero.' })
    @IsIn(getEnumValues(TipoMoneda), {
        message: createEnumMessage(TIPO_MONEDA_METADATA, getEnumValues(TipoMoneda), 'tipo_moneda_id')
    })
    tipo_moneda_id?: number;

    static getCampos(): string[] {
        const alias = 't';
        return [
            `${alias}.cargo_id`,
            `${alias}.cargo`,
            `${alias}.codigo`,
            `${alias}.sueldo_base`,
            `${alias}.tipo_moneda_id`,
            `${alias}.descripcion`,
            `${alias}.estado_id`,
            `${alias}.usuario_id_registro`,
            `${alias}.usuario_id_actualizacion`,
            `${alias}.usuario_id_baja`,
            `${alias}.fecha_registro`,
            `${alias}.fecha_actualizacion`,
            `${alias}.fecha_baja`
        ];
    }

    static getCamposParaQ(): string[] {
        return [`cargo`, `codigo`, `descripcion`];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return ['cargo_id', 'cargo', 'codigo', 'sueldo_base', 'tipo_moneda_id', 'descripcion'];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'trabajadores_cargos', campoFk: 'cargo_id' },
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['cargo', 'codigo', 'sueldo_base', 'tipo_moneda_id'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        return {
            'cargo_id': `${alias}.cargo_id`,
            'cargo': `${alias}.cargo`,
            'codigo': `${alias}.codigo`,
            'sueldo_base': `${alias}.sueldo_base`,
            'tipo_moneda_id': `${alias}.tipo_moneda_id`,
            'descripcion': `${alias}.descripcion`,
            'estado_id': `${alias}.estado_id`,
            'usuario_id_registro': `${alias}.usuario_id_registro`,
            'usuario_id_actualizacion': `${alias}.usuario_id_actualizacion`,
            'usuario_id_baja': `${alias}.usuario_id_baja`,
            'fecha_registro': `${alias}.fecha_registro`,
            'fecha_actualizacion': `${alias}.fecha_actualizacion`,
            'fecha_baja': `${alias}.fecha_baja`
        };
    }
}

export { PaginatedResult };
