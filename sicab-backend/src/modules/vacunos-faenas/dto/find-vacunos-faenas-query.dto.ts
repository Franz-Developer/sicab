// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\dto\find-vacunos-faenas-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsIn, IsString, IsDateString, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindVacunosFaenasQueryDto extends BasePaginationQueryDto {
    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsIn([0, 1])
    exactMatch: number = 0;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsIn(ESTADOS_CONSULTA, {
        message: createEnumMessage(ESTADO_METADATA, ESTADOS_CONSULTA, 'estado_id')
    })
    estado_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    vacuno_id?: number;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_faena_desde debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_faena_desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'fecha_faena_hasta debe ser una fecha válida (YYYY-MM-DD).' })
    fecha_faena_hasta?: string;

    static getCampos(): string[] {
        const alias = 't';
        const aliasVac = 'v';
        return [
            `${alias}.faena_id`,
            `${alias}.vacuno_id`,
            `${aliasVac}.arete AS vacuno_arete`,
            `${aliasVac}.nombre AS vacuno_nombre`,
            `${alias}.fecha_faena`,
            `${alias}.peso_vivo_faena`,
            `${alias}.peso_canal_caliente`,
            `${alias}.peso_canal_fria`,
            `${alias}.rendimiento_canal`,
            `${alias}.matadero`,
            `${alias}.numero_guia`,
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
        return ['matadero', 'numero_guia', 'observaciones', 'v.arete', 'v.nombre'];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'faena_id',
            'vacuno_id',
            'vacuno_arete',
            'vacuno_nombre',
            'fecha_faena',
            'peso_vivo_faena',
            'rendimiento_canal'
        ];
    }

    static getDependencias() {
        return []; // Una faena no tiene tablas hijas
    }

    static getCamposProtegidosConDependencias(): string[] {
        return [];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        const aliasVac = 'v';
        return {
            'faena_id': `${alias}.faena_id`,
            'vacuno_id': `${alias}.vacuno_id`,
            'vacuno_arete': `${aliasVac}.arete`,
            'vacuno_nombre': `${aliasVac}.nombre`,
            'fecha_faena': `${alias}.fecha_faena`,
            'peso_vivo_faena': `${alias}.peso_vivo_faena`,
            'peso_canal_caliente': `${alias}.peso_canal_caliente`,
            'peso_canal_fria': `${alias}.peso_canal_fria`,
            'rendimiento_canal': `${alias}.rendimiento_canal`,
            'matadero': `${alias}.matadero`,
            'numero_guia': `${alias}.numero_guia`,
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
