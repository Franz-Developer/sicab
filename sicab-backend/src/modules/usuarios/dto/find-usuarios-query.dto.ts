// C:\sistemas\sicab\sicab-backend\src\modules\usuarios\dto\find-usuarios-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindUsuariosQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'trabajador_id debe ser un número entero.' })
    @Min(1, { message: 'trabajador_id debe ser mayor a 0.' })
    trabajador_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'rol_id debe ser un número entero.' })
    @Min(1, { message: 'rol_id debe ser mayor a 0.' })
    rol_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'empresa_id debe ser un número entero.' })
    @Min(1, { message: 'empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

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

    static getCampos(): string[] {
        const alias = 't';
        const aliasTrabajador = 'tr';
        const aliasSucursal = 's';
        const aliasEmpresa = 'e';
        const aliasRol = 'r';
        const aliasCargo = 'c';
        return [
            `${alias}.usuario_id`,
            `${alias}.trabajador_id`,
            `${alias}.rol_id`,
            `${alias}.login`,
            `${alias}.contrasena`,
            `${alias}.avatar`,
            `${alias}.estado_id`,
            `${alias}.usuario_id_registro`,
            `${alias}.usuario_id_actualizacion`,
            `${alias}.usuario_id_baja`,
            `${alias}.fecha_registro`,
            `${alias}.fecha_actualizacion`,
            `${alias}.fecha_baja`,
            `CONCAT_WS(' ', ${aliasTrabajador}.paterno, ${aliasTrabajador}.materno, ${aliasTrabajador}.nombres) AS trabajador_nombre_completo`,
            `${aliasTrabajador}.nombres AS trabajador_nombres`,
            `${aliasTrabajador}.paterno AS trabajador_paterno`,
            `${aliasTrabajador}.materno AS trabajador_materno`,
            `${aliasTrabajador}.dni AS trabajador_dni`,
            `${aliasTrabajador}.apodo AS trabajador_apodo`,
            `${aliasEmpresa}.empresa_id AS empresa_id`,
            `${aliasEmpresa}.empresa AS empresa_nombre`,
            `${aliasEmpresa}.codigo AS empresa_codigo`,
            `${aliasSucursal}.sucursal AS sucursal_nombre`,
            `${aliasSucursal}.codigo AS sucursal_codigo`,
            `${aliasSucursal}.codigo_sin AS sucursal_codigo_sin`,
            `${aliasRol}.rol AS rol_nombre`,
            `${aliasRol}.codigo AS rol_codigo`,
            `${aliasCargo}.cargo_id AS cargo_id`,
            `${aliasCargo}.cargo AS cargo_nombre`,
            `${aliasCargo}.codigo AS cargo_codigo`
        ];
    }

    static getCamposParaQ(): string[] {
        return [
            't.login',
            'tr.nombres',
            'tr.paterno',
            'tr.materno',
            'tr.dni',
            'tr.apodo',
            'e.empresa',
            'e.codigo',
            's.sucursal',
            's.codigo',
            'r.rol',
            'r.codigo',
            'c.cargo',
            'c.codigo'
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'usuario_id',
            'trabajador_id',
            'rol_id',
            'empresa_id',
            'cargo_id',
            'login',
            'trabajador_nombre_completo',
            'trabajador_nombres',
            'trabajador_paterno',
            'trabajador_materno',
            'trabajador_dni',
            'empresa_nombre',
            'empresa_codigo',
            'sucursal_nombre',
            'sucursal_codigo',
            'sucursal_codigo_sin',
            'rol_nombre',
            'rol_codigo',
            'cargo_nombre',
            'cargo_codigo'
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'bancos', campoFk: 'usuario_id_registro' },
            { tabla: 'bancos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'bancos', campoFk: 'usuario_id_baja' },

            { tabla: 'empresas', campoFk: 'usuario_id_registro' },
            { tabla: 'empresas', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'empresas', campoFk: 'usuario_id_baja' },

            { tabla: 'empresas_nits', campoFk: 'usuario_id_registro' },
            { tabla: 'empresas_nits', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'empresas_nits', campoFk: 'usuario_id_baja' },

            { tabla: 'empresas_cuentas', campoFk: 'usuario_id_registro' },
            { tabla: 'empresas_cuentas', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'empresas_cuentas', campoFk: 'usuario_id_baja' },

            { tabla: 'sucursales', campoFk: 'usuario_id_registro' },
            { tabla: 'sucursales', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'sucursales', campoFk: 'usuario_id_baja' },

            { tabla: 'cargos', campoFk: 'usuario_id_registro' },
            { tabla: 'cargos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'cargos', campoFk: 'usuario_id_baja' },

            { tabla: 'trabajadores', campoFk: 'usuario_id_registro' },
            { tabla: 'trabajadores', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'trabajadores', campoFk: 'usuario_id_baja' },

            { tabla: 'trabajadores_cargos', campoFk: 'usuario_id_registro' },
            { tabla: 'trabajadores_cargos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'trabajadores_cargos', campoFk: 'usuario_id_baja' },

            { tabla: 'trabajador_antecedentes', campoFk: 'usuario_id_registro' },
            { tabla: 'trabajador_antecedentes', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'trabajador_antecedentes', campoFk: 'usuario_id_baja' },

            { tabla: 'roles', campoFk: 'usuario_id_registro' },
            { tabla: 'roles', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'roles', campoFk: 'usuario_id_baja' },

            { tabla: 'usuarios', campoFk: 'usuario_id_registro' },
            { tabla: 'usuarios', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'usuarios', campoFk: 'usuario_id_baja' },

            { tabla: 'tablas', campoFk: 'usuario_id_registro' },
            { tabla: 'tablas', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'tablas', campoFk: 'usuario_id_baja' },

            { tabla: 'roles_permisos_tablas', campoFk: 'usuario_id_registro' },
            { tabla: 'roles_permisos_tablas', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'roles_permisos_tablas', campoFk: 'usuario_id_baja' },

            { tabla: 'menus', campoFk: 'usuario_id_registro' },
            { tabla: 'menus', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'menus', campoFk: 'usuario_id_baja' },

            { tabla: 'roles_menus', campoFk: 'usuario_id_registro' },
            { tabla: 'roles_menus', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'roles_menus', campoFk: 'usuario_id_baja' },

            { tabla: 'parametros_globales', campoFk: 'usuario_id_registro' },
            { tabla: 'parametros_globales', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'parametros_globales', campoFk: 'usuario_id_baja' },

            { tabla: 'tareas_programadas', campoFk: 'usuario_id_registro' },
            { tabla: 'tareas_programadas', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'tareas_programadas', campoFk: 'usuario_id_baja' },

            { tabla: 'vehiculos', campoFk: 'usuario_id_registro' },
            { tabla: 'vehiculos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'vehiculos', campoFk: 'usuario_id_baja' },

            { tabla: 'vehiculos_documentos', campoFk: 'usuario_id_registro' },
            { tabla: 'vehiculos_documentos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'vehiculos_documentos', campoFk: 'usuario_id_baja' },

            { tabla: 'categorias_conductores', campoFk: 'usuario_id_registro' },
            { tabla: 'categorias_conductores', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'categorias_conductores', campoFk: 'usuario_id_baja' },

            { tabla: 'conductores_categorias', campoFk: 'usuario_id_registro' },
            { tabla: 'conductores_categorias', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'conductores_categorias', campoFk: 'usuario_id_baja' },

            { tabla: 'frecuencias_semanales', campoFk: 'usuario_id_registro' },
            { tabla: 'frecuencias_semanales', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'frecuencias_semanales', campoFk: 'usuario_id_baja' },

            { tabla: 'frecuencias_cobros', campoFk: 'usuario_id_registro' },
            { tabla: 'frecuencias_cobros', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'frecuencias_cobros', campoFk: 'usuario_id_baja' },

            { tabla: 'frecuencias_pagos', campoFk: 'usuario_id_registro' },
            { tabla: 'frecuencias_pagos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'frecuencias_pagos', campoFk: 'usuario_id_baja' },

            { tabla: 'moviles_suspendidos', campoFk: 'usuario_id_registro' },
            { tabla: 'moviles_suspendidos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'moviles_suspendidos', campoFk: 'usuario_id_baja' },

            { tabla: 'asignaciones_diarias', campoFk: 'usuario_id_registro' },
            { tabla: 'asignaciones_diarias', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'asignaciones_diarias', campoFk: 'usuario_id_baja' },

            { tabla: 'tipos_mantenimiento', campoFk: 'usuario_id_registro' },
            { tabla: 'tipos_mantenimiento', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'tipos_mantenimiento', campoFk: 'usuario_id_baja' },

            { tabla: 'proveedores', campoFk: 'usuario_id_registro' },
            { tabla: 'proveedores', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'proveedores', campoFk: 'usuario_id_baja' },

            { tabla: 'mantenimientos', campoFk: 'usuario_id_registro' },
            { tabla: 'mantenimientos', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'mantenimientos', campoFk: 'usuario_id_baja' },

            { tabla: 'solicitudes_viaje', campoFk: 'usuario_id_registro' },
            { tabla: 'solicitudes_viaje', campoFk: 'usuario_id_actualizacion' },
            { tabla: 'solicitudes_viaje', campoFk: 'usuario_id_baja' },
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['login', 'trabajador_id', 'rol_id'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasTrabajador = 'tr';
        const aliasSucursal = 's';
        const aliasEmpresa = 'e';
        const aliasRol = 'r';
        const aliasCargo = 'c';
        return {
            'usuario_id': `${alias}.usuario_id`,
            'trabajador_id': `${alias}.trabajador_id`,
            'rol_id': `${alias}.rol_id`,
            'empresa_id': `${aliasEmpresa}.empresa_id`,
            'cargo_id': `${aliasCargo}.cargo_id`,
            'login': `${alias}.login`,
            'contrasena': `${alias}.contrasena`,
            'avatar': `${alias}.avatar`,
            'estado_id': `${alias}.estado_id`,
            'usuario_id_registro': `${alias}.usuario_id_registro`,
            'usuario_id_actualizacion': `${alias}.usuario_id_actualizacion`,
            'usuario_id_baja': `${alias}.usuario_id_baja`,
            'fecha_registro': `${alias}.fecha_registro`,
            'fecha_actualizacion': `${alias}.fecha_actualizacion`,
            'fecha_baja': `${alias}.fecha_baja`,
            'trabajador_nombre_completo': `CONCAT_WS(' ', ${aliasTrabajador}.paterno, ${aliasTrabajador}.materno, ${aliasTrabajador}.nombres)`,
            'trabajador_nombres': `${aliasTrabajador}.nombres`,
            'trabajador_paterno': `${aliasTrabajador}.paterno`,
            'trabajador_materno': `${aliasTrabajador}.materno`,
            'trabajador_dni': `${aliasTrabajador}.dni`,
            'trabajador_apodo': `${aliasTrabajador}.apodo`,
            'empresa_nombre': `${aliasEmpresa}.empresa`,
            'empresa_codigo': `${aliasEmpresa}.codigo`,
            'sucursal_nombre': `${aliasSucursal}.sucursal`,
            'sucursal_codigo': `${aliasSucursal}.codigo`,
            'sucursal_codigo_sin': `${aliasSucursal}.codigo_sin`,
            'rol_nombre': `${aliasRol}.rol`,
            'rol_codigo': `${aliasRol}.codigo`,
            'cargo_nombre': `${aliasCargo}.cargo`,
            'cargo_codigo': `${aliasCargo}.codigo`
        };
    }
}

export { PaginatedResult };
