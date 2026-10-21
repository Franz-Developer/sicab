// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores\dto\find-trabajadores-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA, Genero, GENERO_METADATA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage, getEnumValues } from '../../../common/utils/validation-helper.util';

export class FindTrabajadoresQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'sucursal_id debe ser mayor a 0.' })
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'cargo_id debe ser un número entero.' })
    @Min(1, { message: 'cargo_id debe ser mayor a 0.' })
    cargo_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'empresa_id debe ser un número entero.' })
    @Min(1, { message: 'empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El estado_id debe ser un número entero.' })
    @IsIn(ESTADOS_CONSULTA, {
        message: createEnumMessage(ESTADO_METADATA, ESTADOS_CONSULTA, 'estado_id')
    })
    estado_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'genero_id debe ser un número entero.' })
    @IsIn(getEnumValues(Genero), {
        message: createEnumMessage(GENERO_METADATA, getEnumValues(Genero), 'genero_id')
    })
    genero_id?: number;

    static getCampos(): string[] {
        const alias = 't';
        const aliasCargo = 'c';
        const aliasSucursal = 's';
        const aliasEmpresa = 'e';
        return [
            `${alias}.trabajador_id`,
            `${alias}.sucursal_id`,
            `${alias}.genero_id`,
            `${alias}.estado_civil_id`,
            `${alias}.categoria_licencia_id`,
            `${alias}.nombres`,
            `${alias}.paterno`,
            `${alias}.materno`,
            `${alias}.apodo`,
            `${alias}.dni`,
            `${alias}.telefono`,
            `${alias}.celular`,
            `${alias}.direccion`,
            `${alias}.email`,
            `${alias}.fecha_nacimiento`,
            `${alias}.fecha_contratacion`,
            `${alias}.foto`,
            `${alias}.qr`,
            `${alias}.garante`,
            `${alias}.puntaje_acumulado`,
            `${alias}.fecha_ultimo_calculo_puntaje`,
            `${alias}.estado_id`,
            `${alias}.usuario_id_registro`,
            `${alias}.usuario_id_actualizacion`,
            `${alias}.usuario_id_baja`,
            `${alias}.fecha_registro`,
            `${alias}.fecha_actualizacion`,
            `${alias}.fecha_baja`,
            `${aliasCargo}.cargo AS cargo`,
            `${aliasCargo}.codigo AS cargo_codigo`,
            `${aliasSucursal}.sucursal AS sucursal`,
            `${aliasSucursal}.codigo AS sucursal_codigo`,
            `${aliasEmpresa}.empresa AS empresa`,
            `${aliasEmpresa}.codigo AS empresa_codigo`,
        ];
    }

    static getCamposParaQ(): string[] {
        return [
            'nombres',
            'paterno',
            'materno',
            'apodo',
            'dni',
            'telefono',
            'celular',
            'direccion',
            'email',
            'garante',
            'c.cargo',
            'c.codigo',
            's.sucursal',
            's.codigo',
            'e.empresa',
            'e.codigo',
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return ['trabajador_id', 'nombres', 'paterno', 'materno', 'apodo', 'trabajador_nombre_completo', 'dni', 'cargo', 'sucursal', 'empresa'];
    }

    static getDependencias(): Array<{ tabla: string; campoFk: string }> {
        return [
            { tabla: 'asignaciones_diarias',    campoFk: 'trabajador_id' },
            { tabla: 'conductores_categorias',  campoFk: 'trabajador_id' },
            { tabla: 'frecuencias_cobros',      campoFk: 'trabajador_id' },
            { tabla: 'mantenimientos',          campoFk: 'trabajador_id' },
            { tabla: 'moviles_suspendidos',     campoFk: 'trabajador_id' },
            { tabla: 'solicitudes_viaje',       campoFk: 'trabajador_id' },
            { tabla: 'trabajador_antecedentes', campoFk: 'trabajador_id' },
            { tabla: 'trabajadores_cargos',     campoFk: 'trabajador_id' },
            { tabla: 'usuarios',                campoFk: 'trabajador_id' },
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['dni', 'nombres', 'paterno', 'materno', 'apodo', 'sucursal_id'];
    }

    static getEquivalenciasMapeo(): Record<string, string | string[]> {
        const alias = 't';
        const aliasEmpresa = 'e';
        const aliasSucursal = 's';
        const aliasCargo = 'c';
        const aliasTrabajadorCargo = 'tc';
        return {
            'trabajador_id': `${alias}.trabajador_id`,
            'sucursal_id': `${alias}.sucursal_id`,
            'genero_id': `${alias}.genero_id`,
            'estado_civil_id': `${alias}.estado_civil_id`,
            'categoria_licencia_id': `${alias}.categoria_licencia_id`,
            'nombres': `${alias}.nombres`,
            'paterno': `${alias}.paterno`,
            'materno': `${alias}.materno`,
            'apodo': `${alias}.apodo`,
            'dni': `${alias}.dni`,
            'telefono': `${alias}.telefono`,
            'celular': `${alias}.celular`,
            'direccion': `${alias}.direccion`,
            'email': `${alias}.email`,
            'fecha_nacimiento': `${alias}.fecha_nacimiento`,
            'fecha_contratacion': `${alias}.fecha_contratacion`,
            'foto': `${alias}.foto`,
            'qr': `${alias}.qr`,
            'garante': `${alias}.garante`,
            'puntaje_acumulado': `${alias}.puntaje_acumulado`,
            'fecha_ultimo_calculo_puntaje': `${alias}.fecha_ultimo_calculo_puntaje`,
            'estado_id': `${alias}.estado_id`,
            'usuario_id_registro': `${alias}.usuario_id_registro`,
            'usuario_id_actualizacion': `${alias}.usuario_id_actualizacion`,
            'usuario_id_baja': `${alias}.usuario_id_baja`,
            'fecha_registro': `${alias}.fecha_registro`,
            'fecha_actualizacion': `${alias}.fecha_actualizacion`,
            'fecha_baja': `${alias}.fecha_baja`,
            'cargo': `${aliasCargo}.cargo`,
            'cargo_codigo': `${aliasCargo}.codigo`,
            'sucursal': `${aliasSucursal}.sucursal`,
            'sucursal_codigo': `${aliasSucursal}.codigo`,
            'empresa': `${aliasEmpresa}.empresa`,
            'empresa_codigo': `${aliasEmpresa}.codigo`,
            'sueldo_base': `${aliasTrabajadorCargo}.sueldo_base`,
            'tipo_moneda_id': `${aliasTrabajadorCargo}.tipo_moneda_id`,
            'fecha_desde': `${aliasTrabajadorCargo}.fecha_desde`,
            'fecha_hasta': `${aliasTrabajadorCargo}.fecha_hasta`,
            'es_activo': `${aliasTrabajadorCargo}.es_activo`,
            'observaciones': `${aliasTrabajadorCargo}.observaciones`,
            'trabajador_nombre_completo': [
                `${alias}.paterno`,
                `${alias}.materno`,
                `${alias}.nombres`
            ],
        };
    }
}

export { PaginatedResult };
