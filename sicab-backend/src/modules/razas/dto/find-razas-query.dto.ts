// C:\sistemas\sicab\sicab-backend\src\modules\razas\dto\find-razas-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindRazasQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'El campo tipo_semoviente_id debe ser un número entero.' })
    @Min(1, { message: 'El campo tipo_semoviente_id debe ser mayor a 0.' })
    tipo_semoviente_id?: number;

    // Todos los campos de la tabla principal + join a tipos_semovientes.
    static getCampos(): string[] {
        const alias = 't';
        const aliasTipoSemoviente = 'ts';
        return [
            `${alias}.raza_id`,
            `${alias}.tipo_semoviente_id`,
            `${aliasTipoSemoviente}.semoviente AS tipo_semoviente_nombre`,
            `${alias}.raza`,
            `${alias}.codigo`,
            `${alias}.descripcion`,
            `${alias}.origen`,
            `${alias}.peso_promedio_adulto`,
            `${alias}.foto`,
            `${alias}.estado_id`,
            `${alias}.usuario_id_registro`,
            `${alias}.usuario_id_actualizacion`,
            `${alias}.usuario_id_baja`,
            `${alias}.fecha_registro`,
            `${alias}.fecha_actualizacion`,
            `${alias}.fecha_baja`
        ];
    }

    // Todos los campos VARCHAR que son buscables con q.
    static getCamposParaQ(): string[] {
        return ['raza', 'codigo', 'descripcion', 'origen', 'ts.semoviente'];
    }

    // Todos los campos de la tabla principal menos auditoría + join.
    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'raza_id',
            'tipo_semoviente_id',
            'tipo_semoviente_nombre',
            'raza',
            'codigo',
            'origen',
            'peso_promedio_adulto'
        ];
    }

    // Todas las dependencias (vacunos.raza_id).
    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'vacunos', campoFk: 'raza_id' }
        ];
    }

    // Campos que no deben modificarse si la tabla tiene dependencias activas.
    static getCamposProtegidosConDependencias(): string[] {
        return ['tipo_semoviente_id', 'raza', 'codigo'];
    }

    // Mapeo de alias SQL para ORDER BY.
    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasTipoSemoviente = 'ts';
        return {
            'raza_id': `${alias}.raza_id`,
            'tipo_semoviente_id': `${alias}.tipo_semoviente_id`,
            'tipo_semoviente_nombre': `${aliasTipoSemoviente}.semoviente`,
            'raza': `${alias}.raza`,
            'codigo': `${alias}.codigo`,
            'descripcion': `${alias}.descripcion`,
            'origen': `${alias}.origen`,
            'peso_promedio_adulto': `${alias}.peso_promedio_adulto`,
            'foto': `${alias}.foto`,
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
