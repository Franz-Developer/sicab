// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\find-amortizaciones-vacunos-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';
import { IsCompareFields } from '../../../common/validators/compare-fields.validator';

export class FindAmortizacionesVacunosQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_id debe ser mayor a 0.' })
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo empresa_id debe ser un número entero.' })
    @Min(1, { message: 'El campo empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo gestion debe ser un número entero.' })
    @Min(2023, { message: 'El campo gestion debe ser mayor o igual a 2023.' })
    gestion?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'gestion_desde debe ser un número entero.' })
    @Min(2023, { message: 'gestion_desde debe ser mayor o igual a 2023.' })
    @Max(2100, { message: 'gestion_desde debe ser menor o igual a 2100.' })
    gestion_desde?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'gestion_hasta debe ser un número entero.' })
    @Min(2023, { message: 'gestion_hasta debe ser mayor o igual a 2023.' })
    @Max(2100, { message: 'gestion_hasta debe ser menor o igual a 2100.' })
    @IsCompareFields('gestion_desde', 'lte', 'gestion_hasta')
    gestion_hasta?: number;

    static getCampos(): string[] {
        const alias = 't';
        const aliasVacuno = 'v';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';

        return [
            `${alias}.amortizacion_vacuno_id`,
            `${alias}.vacuno_id`,
            `${aliasVacuno}.arete AS vacuno_arete`,
            `${aliasVacuno}.nombre AS vacuno_nombre`,
            `${aliasVacuno}.sucursal_id`,
            `${aliasSucursal}.sucursal AS sucursal_nombre`,
            `${aliasSucursal}.codigo AS sucursal_codigo`,
            `${aliasSucursal}.empresa_id`,
            `${aliasEmpresa}.empresa AS empresa_nombre`,
            `${aliasEmpresa}.codigo AS empresa_codigo`,
            `${alias}.gestion`,
            `${alias}.valor_inicial`,
            `${alias}.valor_residual`,
            `${alias}.amortizacion_gestion`,
            `${alias}.amortizacion_acumulada`,
            `${alias}.valor_libro`,
            `${alias}.valor_inicial_ufv`,
            `${alias}.valor_residual_ufv`,
            `${alias}.amortizacion_gestion_ufv`,
            `${alias}.amortizacion_acumulada_ufv`,
            `${alias}.valor_libro_ufv`,
            `${alias}.cotizacion_ufv_aplicada`,
            `${alias}.fecha_cotizacion_ufv`,
            `${alias}.vida_util_anios`,
            `${alias}.tasa_amortizacion`,
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
            'amortizacion_vacuno_id',
            'vacuno_id',
            'vacuno_arete',
            'vacuno_nombre',
            'sucursal_id',
            'sucursal_nombre',
            'sucursal_codigo',
            'empresa_id',
            'empresa_nombre',
            'empresa_codigo',
            'gestion',
            'valor_inicial',
            'amortizacion_gestion',
            'amortizacion_acumulada',
            'valor_libro'
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['vacuno_id', 'gestion'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasVacuno = 'v';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';

        return {
            'amortizacion_vacuno_id': `${alias}.amortizacion_vacuno_id`,
            'vacuno_id': `${alias}.vacuno_id`,
            'vacuno_arete': `${aliasVacuno}.arete`,
            'vacuno_nombre': `${aliasVacuno}.nombre`,
            'sucursal_id': `${aliasVacuno}.sucursal_id`,
            'sucursal_nombre': `${aliasSucursal}.sucursal`,
            'sucursal_codigo': `${aliasSucursal}.codigo`,
            'empresa_id': `${aliasSucursal}.empresa_id`,
            'empresa_nombre': `${aliasEmpresa}.empresa`,
            'empresa_codigo': `${aliasEmpresa}.codigo`,
            'gestion': `${alias}.gestion`,
            'valor_inicial': `${alias}.valor_inicial`,
            'valor_residual': `${alias}.valor_residual`,
            'amortizacion_gestion': `${alias}.amortizacion_gestion`,
            'amortizacion_acumulada': `${alias}.amortizacion_acumulada`,
            'valor_libro': `${alias}.valor_libro`,
            'valor_inicial_ufv': `${alias}.valor_inicial_ufv`,
            'valor_residual_ufv': `${alias}.valor_residual_ufv`,
            'amortizacion_gestion_ufv': `${alias}.amortizacion_gestion_ufv`,
            'amortizacion_acumulada_ufv': `${alias}.amortizacion_acumulada_ufv`,
            'valor_libro_ufv': `${alias}.valor_libro_ufv`,
            'cotizacion_ufv_aplicada': `${alias}.cotizacion_ufv_aplicada`,
            'fecha_cotizacion_ufv': `${alias}.fecha_cotizacion_ufv`,
            'vida_util_anios': `${alias}.vida_util_anios`,
            'tasa_amortizacion': `${alias}.tasa_amortizacion`,
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
