// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\find-producciones-leche-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, IsDateString } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindProduccionesLecheQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'El campo sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_id debe ser mayor a 0.' })
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo turno_ordeno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo turno_ordeno_id debe ser mayor a 0.' })
    turno_ordeno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo empresa_id debe ser un número entero.' })
    @Min(1, { message: 'El campo empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_produccion_desde debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_produccion_desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_produccion_hasta debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_produccion_hasta?: string;

    protected override getDefaultSortField(): string {
        return 'fecha_produccion';
    }

    protected override getAllowedSortFields(): string[] {
        return FindProduccionesLecheQueryDto.getCamposPermitidosParaOrdenar();
    }

    static getCampos(): string[] {
        const alias = 't';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';
        const aliasTurno = 'tur';

        return [
            `${alias}.produccion_leche_id`,
            `${alias}.sucursal_id`,
            `${aliasSucursal}.sucursal AS sucursal_nombre`,
            `${aliasSucursal}.codigo AS sucursal_codigo`,
            `${aliasSucursal}.empresa_id AS empresa_id`,
            `${aliasEmpresa}.empresa AS empresa_nombre`,
            `${aliasEmpresa}.codigo AS empresa_codigo`,
            `${alias}.turno_ordeno_id`,
            `${aliasTurno}.turno AS turno_nombre`,
            `${aliasTurno}.codigo AS turno_codigo`,
            `${aliasTurno}.hora_inicio AS turno_hora_inicio`,
            `${aliasTurno}.hora_fin AS turno_hora_fin`,
            `${alias}.fecha_produccion`,
            `${alias}.total_litros`,
            `${alias}.total_descartado`,
            `${alias}.total_neto`,
            `${alias}.temperatura_promedio`,
            `${alias}.densidad_promedio`,
            `${alias}.observaciones`,
            `(SELECT COUNT(*) FROM producciones_leche_detalle d
              WHERE d.produccion_leche_id = ${alias}.produccion_leche_id
                AND d.estado_id = 1000) AS total_vacunos`,
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
            'suc.sucursal',
            'suc.codigo',
            'emp.empresa',
            'emp.codigo',
            'tur.turno',
            'tur.codigo'
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'produccion_leche_id',
            'sucursal_id',
            'sucursal_nombre',
            'sucursal_codigo',
            'empresa_nombre',
            'empresa_codigo',
            'turno_ordeno_id',
            'turno_nombre',
            'turno_codigo',
            'fecha_produccion',
            'total_litros',
            'total_neto'
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'producciones_leche_detalle', campoFk: 'produccion_leche_id' }
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['sucursal_id', 'turno_ordeno_id', 'fecha_produccion'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasSucursal = 'suc';
        const aliasEmpresa = 'emp';
        const aliasTurno = 'tur';

        return {
            'produccion_leche_id': `${alias}.produccion_leche_id`,
            'sucursal_id': `${alias}.sucursal_id`,
            'sucursal_nombre': `${aliasSucursal}.sucursal`,
            'sucursal_codigo': `${aliasSucursal}.codigo`,
            'empresa_id': `${aliasSucursal}.empresa_id`,
            'empresa_nombre': `${aliasEmpresa}.empresa`,
            'empresa_codigo': `${aliasEmpresa}.codigo`,
            'turno_ordeno_id': `${alias}.turno_ordeno_id`,
            'turno_nombre': `${aliasTurno}.turno`,
            'turno_codigo': `${aliasTurno}.codigo`,
            'fecha_produccion': `${alias}.fecha_produccion`,
            'total_litros': `${alias}.total_litros`,
            'total_descartado': `${alias}.total_descartado`,
            'total_neto': `${alias}.total_neto`,
            'temperatura_promedio': `${alias}.temperatura_promedio`,
            'densidad_promedio': `${alias}.densidad_promedio`,
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
