// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\dto\find-tipos-semovientes-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindTiposSemovientesQueryDto extends BasePaginationQueryDto {
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
            `${alias}.tipo_id`,
            `${alias}.semoviente`,
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
        return ['semoviente'];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return ['tipo_id', 'semoviente', 'vida_util_anios', 'tasa_amortizacion'];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'razas', campoFk: 'tipo_semoviente_id' },
            { tabla: 'vacunos', campoFk: 'tipo_semoviente_id' },
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['semoviente', 'vida_util_anios', 'tasa_amortizacion'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';

        return {
            'tipo_id': `${alias}.tipo_id`,
            'semoviente': `${alias}.semoviente`,
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
