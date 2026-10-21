// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\find-vacunos-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA, SexoBiologico, SEXO_BIOLOGICO_METADATA, EstadoVacuno, ESTADO_VACUNO_METADATA, CondicionProductorLeche, CONDICION_PRODUCTOR_LECHE_METADATA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

const ESTADOS_VACUNO_TODOS = [
    EstadoVacuno.ACTIVO,
    EstadoVacuno.EN_TRATAMIENTO,
    EstadoVacuno.SECA,
    EstadoVacuno.DESCARTE,
    EstadoVacuno.VENDIDO,
    EstadoVacuno.MUERTO,
] as const;

export class FindVacunosQueryDto extends BasePaginationQueryDto {
    @IsOptional()
    @IsString({ message: 'El parámetro q debe ser un texto.' })
    @IsSafeText()
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
    @IsInt({ message: 'El campo empresa_id debe ser un número entero.' })
    @Min(1, { message: 'El campo empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_id debe ser mayor a 0.' })
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo raza_id debe ser un número entero.' })
    @Min(1, { message: 'El campo raza_id debe ser mayor a 0.' })
    raza_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo categoria_vacuno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo categoria_vacuno_id debe ser mayor a 0.' })
    categoria_vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo estado_vacuno_id debe ser un número entero.' })
    @IsIn(ESTADOS_VACUNO_TODOS, {
        message: createEnumMessage(ESTADO_VACUNO_METADATA, ESTADOS_VACUNO_TODOS, 'estado_vacuno_id'),
    })
    estado_vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo sexo_biologico_id debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA], {
        message: createEnumMessage(
            SEXO_BIOLOGICO_METADATA,
            [SexoBiologico.MACHO, SexoBiologico.HEMBRA],
            'sexo_biologico_id',
        ),
    })
    sexo_biologico_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo es_productor_leche debe ser un número entero.' })
    @IsIn([CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], {
        message: createEnumMessage(
            CONDICION_PRODUCTOR_LECHE_METADATA,
            [CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR],
            'es_productor_leche',
        ),
    })
    es_productor_leche?: number;

    static getCampos(): string[] {
        const alias = 't';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';
        return [
            `${alias}.vacuno_id`,
            `${alias}.sucursal_id`,
            `${aliasSucursal}.sucursal AS sucursal_nombre`,
            `${aliasSucursal}.codigo AS sucursal_codigo`,
            `${aliasSucursal}.empresa_id`,
            `${aliasEmpresa}.empresa AS empresa_nombre`,
            `${aliasEmpresa}.codigo AS empresa_codigo`,
            `${alias}.raza_id`,
            `${alias}.categoria_vacuno_id`,
            `${alias}.arete`,
            `${alias}.nombre`,
            `${alias}.fecha_nacimiento`,
            `${alias}.fecha_ingreso`,
            `${alias}.sexo_biologico_id`,
            `${alias}.peso_nacimiento`,
            `${alias}.peso_actual`,
            `${alias}.color`,
            `${alias}.padre_arete`,
            `${alias}.madre_arete`,
            `${alias}.valor_adquisicion`,
            `${alias}.valor_residual`,
            `${alias}.valor_adquisicion_ufv`,
            `${alias}.valor_residual_ufv`,
            `${alias}.fecha_cotizacion_ufv`,
            `${alias}.vida_util_anios`,
            `${alias}.tasa_amortizacion`,
            `${alias}.fecha_inicio_amortizacion`,
            `${alias}.es_productor_leche`,
            `${alias}.estado_vacuno_id`,
            `${alias}.fecha_salida`,
            `${alias}.motivo_salida`,
            `${alias}.peso_salida`,
            `${alias}.precio_venta`,
            `${alias}.causa_muerte`,
            `${alias}.observaciones`,
            `${alias}.foto`,
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
        return [
            'arete',
            'nombre',
            'color',
            'padre_arete',
            'madre_arete',
            'observaciones',
            'suc.sucursal',
            'suc.codigo',
            'emp.empresa',
            'emp.codigo',
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'vacuno_id',
            'sucursal_id',
            'sucursal_nombre',
            'sucursal_codigo',
            'empresa_nombre',
            'empresa_codigo',
            'raza_id',
            'categoria_vacuno_id',
            'arete',
            'nombre',
            'fecha_nacimiento',
            'fecha_ingreso',
            'sexo_biologico_id',
            'peso_actual',
            'valor_adquisicion',
            'es_productor_leche',
            'estado_vacuno_id',
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'vacunos_pesajes', campoFk: 'vacuno_id' },
            { tabla: 'producciones_leche_detalle', campoFk: 'vacuno_id' },
            { tabla: 'amortizaciones_vacunos', campoFk: 'vacuno_id' },
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return [
            'arete',
            'raza_id',
            'categoria_vacuno_id',
            'fecha_nacimiento',
            'sexo_biologico_id',
        ];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';
        return {
            'vacuno_id': `${alias}.vacuno_id`,
            'sucursal_id': `${alias}.sucursal_id`,
            'sucursal_nombre': `${aliasSucursal}.sucursal`,
            'sucursal_codigo': `${aliasSucursal}.codigo`,
            'empresa_id': `${aliasSucursal}.empresa_id`,
            'empresa_nombre': `${aliasEmpresa}.empresa`,
            'empresa_codigo': `${aliasEmpresa}.codigo`,
            'raza_id': `${alias}.raza_id`,
            'categoria_vacuno_id': `${alias}.categoria_vacuno_id`,
            'arete': `${alias}.arete`,
            'nombre': `${alias}.nombre`,
            'fecha_nacimiento': `${alias}.fecha_nacimiento`,
            'fecha_ingreso': `${alias}.fecha_ingreso`,
            'sexo_biologico_id': `${alias}.sexo_biologico_id`,
            'peso_nacimiento': `${alias}.peso_nacimiento`,
            'peso_actual': `${alias}.peso_actual`,
            'color': `${alias}.color`,
            'padre_arete': `${alias}.padre_arete`,
            'madre_arete': `${alias}.madre_arete`,
            'valor_adquisicion': `${alias}.valor_adquisicion`,
            'valor_residual': `${alias}.valor_residual`,
            'valor_adquisicion_ufv': `${alias}.valor_adquisicion_ufv`,
            'valor_residual_ufv': `${alias}.valor_residual_ufv`,
            'fecha_cotizacion_ufv': `${alias}.fecha_cotizacion_ufv`,
            'vida_util_anios': `${alias}.vida_util_anios`,
            'tasa_amortizacion': `${alias}.tasa_amortizacion`,
            'fecha_inicio_amortizacion': `${alias}.fecha_inicio_amortizacion`,
            'es_productor_leche': `${alias}.es_productor_leche`,
            'estado_vacuno_id': `${alias}.estado_vacuno_id`,
            'fecha_salida': `${alias}.fecha_salida`,
            'motivo_salida': `${alias}.motivo_salida`,
            'peso_salida': `${alias}.peso_salida`,
            'precio_venta': `${alias}.precio_venta`,
            'causa_muerte': `${alias}.causa_muerte`,
            'observaciones': `${alias}.observaciones`,
            'foto': `${alias}.foto`,
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
