// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\dto\find-vacunos-pesajes-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, IsDateString } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindVacunosPesajesQueryDto extends BasePaginationQueryDto {
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
    @Type(() => Number)
    @IsInt({ message: 'El campo vacuno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo vacuno_id debe ser mayor a 0.' })
    vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo empresa_id debe ser un número entero.' })
    @Min(1, { message: 'El campo empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_id debe ser mayor a 0.' })
    sucursal_id?: number;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_pesaje_desde debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_pesaje_desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_pesaje_hasta debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_pesaje_hasta?: string;

    static getCampos(): string[] {
        const alias = 't';
        const aliasVacuno = 'v';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';

        return [
            `${alias}.pesaje_id`,
            `${alias}.vacuno_id`,
            `${aliasVacuno}.arete AS vacuno_arete`,
            `${aliasVacuno}.nombre AS vacuno_nombre`,
            `${aliasVacuno}.sucursal_id`,
            `${aliasSucursal}.sucursal AS sucursal_nombre`,
            `${aliasSucursal}.codigo AS sucursal_codigo`,
            `${aliasSucursal}.empresa_id`,
            `${aliasEmpresa}.empresa AS empresa_nombre`,
            `${aliasEmpresa}.codigo AS empresa_codigo`,
            `${alias}.fecha_pesaje`,
            `${alias}.peso`,
            `${alias}.observaciones`,
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
        return [
            'observaciones',
            'v.arete',
            'v.nombre',
            'suc.sucursal',
            'suc.codigo',
            'emp.empresa',
            'emp.codigo'
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'pesaje_id',
            'vacuno_id',
            'vacuno_arete',
            'vacuno_nombre',
            'sucursal_id',
            'sucursal_nombre',
            'sucursal_codigo',
            'empresa_nombre',
            'empresa_codigo',
            'fecha_pesaje',
            'peso'
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['vacuno_id', 'fecha_pesaje'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasVacuno = 'v';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';

        return {
            'pesaje_id': `${alias}.pesaje_id`,
            'vacuno_id': `${alias}.vacuno_id`,
            'vacuno_arete': `${aliasVacuno}.arete`,
            'vacuno_nombre': `${aliasVacuno}.nombre`,
            'sucursal_id': `${aliasVacuno}.sucursal_id`,
            'sucursal_nombre': `${aliasSucursal}.sucursal`,
            'sucursal_codigo': `${aliasSucursal}.codigo`,
            'empresa_id': `${aliasSucursal}.empresa_id`,
            'empresa_nombre': `${aliasEmpresa}.empresa`,
            'empresa_codigo': `${aliasEmpresa}.codigo`,
            'fecha_pesaje': `${alias}.fecha_pesaje`,
            'peso': `${alias}.peso`,
            'observaciones': `${alias}.observaciones`,
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
