// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\find-tipos-cambios-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, IsDateString } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA, TipoMoneda } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindTiposCambiosQueryDto extends BasePaginationQueryDto {
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
        message: createEnumMessage(ESTADO_METADATA, ESTADOS_CONSULTA, 'estado_id'),
    })
    estado_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo origen_moneda_id debe ser un número entero.' })
    @IsIn(Object.values(TipoMoneda), { message: 'El campo origen_moneda_id no es válido.' })
    origen_moneda_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo destino_moneda_id debe ser un número entero.' })
    @IsIn(Object.values(TipoMoneda), { message: 'El campo destino_moneda_id no es válido.' })
    destino_moneda_id?: number;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_desde debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_hasta debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_hasta?: string;

    static getCampos(): string[] {
        const alias = 't';
        return [
            `${alias}.tipo_cambio_id`,
            `${alias}.origen_moneda_id`,
            `${alias}.destino_moneda_id`,
            `${alias}.factor_compra`,
            `${alias}.factor_venta`,
            `${alias}.fecha_cotizacion`,
            `${alias}.estado_id`,
            `${alias}.usuario_id_registro`,
            `${alias}.usuario_id_actualizacion`,
            `${alias}.usuario_id_baja`,
            `${alias}.fecha_registro`,
            `${alias}.fecha_actualizacion`,
            `${alias}.fecha_baja`,
        ];
    }

    static getCamposParaQ(): string[] {
        return []; // No hay campos de texto para buscar en q
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'tipo_cambio_id',
            'origen_moneda_id',
            'destino_moneda_id',
            'fecha_cotizacion',
            'factor_compra',
            'factor_venta',
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['origen_moneda_id', 'destino_moneda_id', 'fecha_cotizacion'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        return {
            'tipo_cambio_id': `${alias}.tipo_cambio_id`,
            'origen_moneda_id': `${alias}.origen_moneda_id`,
            'destino_moneda_id': `${alias}.destino_moneda_id`,
            'factor_compra': `${alias}.factor_compra`,
            'factor_venta': `${alias}.factor_venta`,
            'fecha_cotizacion': `${alias}.fecha_cotizacion`,
            'estado_id': `${alias}.estado_id`,
            'usuario_id_registro': `${alias}.usuario_id_registro`,
            'usuario_id_actualizacion': `${alias}.usuario_id_actualizacion`,
            'usuario_id_baja': `${alias}.usuario_id_baja`,
            'fecha_registro': `${alias}.fecha_registro`,
            'fecha_actualizacion': `${alias}.fecha_actualizacion`,
            'fecha_baja': `${alias}.fecha_baja`,
        };
    }
}

export { PaginatedResult };
