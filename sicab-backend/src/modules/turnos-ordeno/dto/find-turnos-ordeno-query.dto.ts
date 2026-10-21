// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\dto\find-turnos-ordeno-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindTurnosOrdenoQueryDto extends BasePaginationQueryDto {
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

    static getCampos(): string[] {
        const alias = 't';
        return [
            `${alias}.turno_ordeno_id`,
            `${alias}.turno`,
            `${alias}.codigo`,
            `${alias}.hora_inicio`,
            `${alias}.hora_fin`,
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
        return ['turno', 'codigo', 'descripcion'];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return ['turno_ordeno_id', 'turno', 'codigo', 'hora_inicio', 'hora_fin'];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'producciones_leche', campoFk: 'turno_ordeno_id' },
            { tabla: 'producciones_leche_detalle', campoFk: 'turno_ordeno_id' }
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['turno', 'codigo', 'hora_inicio', 'hora_fin'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        return {
            'turno_ordeno_id': `${alias}.turno_ordeno_id`,
            'turno': `${alias}.turno`,
            'codigo': `${alias}.codigo`,
            'hora_inicio': `${alias}.hora_inicio`,
            'hora_fin': `${alias}.hora_fin`,
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
