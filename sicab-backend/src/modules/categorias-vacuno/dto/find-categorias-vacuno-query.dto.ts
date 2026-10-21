// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\dto\find-categorias-vacuno-query.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, MaxLength } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA, CondicionProductorLeche, SexoBiologico, CONDICION_PRODUCTOR_LECHE_METADATA, SEXO_BIOLOGICO_METADATA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindCategoriasVacunoQueryDto extends BasePaginationQueryDto {
    @IsOptional()
    @IsString({ message: 'El parámetro q debe ser un texto.' })
    @MaxLength(100, { message: 'El parámetro q no puede exceder los 100 caracteres.' })
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
    @IsInt({ message: 'es_productor_leche debe ser un número entero.' })
    @IsIn([CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], {
        message: createEnumMessage(CONDICION_PRODUCTOR_LECHE_METADATA, [CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR], 'es_productor_leche')
    })
    es_productor_leche?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'sexo_biologico_permitido_id debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA], {
        message: createEnumMessage(SEXO_BIOLOGICO_METADATA, [SexoBiologico.MACHO, SexoBiologico.HEMBRA], 'sexo_biologico_permitido_id')
    })
    sexo_biologico_permitido_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'sexo debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA], {
        message: createEnumMessage(SEXO_BIOLOGICO_METADATA, [SexoBiologico.MACHO, SexoBiologico.HEMBRA], 'sexo')
    })
    @Transform(({ value, obj }) => {
        if (value !== undefined && value !== null && obj.sexo_biologico_permitido_id === undefined) {
            obj.sexo_biologico_permitido_id = value;
        }
        return value;
    })
    sexo?: number;

    static getCampos(): string[] {
        const alias = 't';
        return [
            `${alias}.categoria_vacuno_id`,
            `${alias}.categoria`,
            `${alias}.codigo`,
            `${alias}.descripcion`,
            `${alias}.edad_min_meses`,
            `${alias}.edad_max_meses`,
            `${alias}.es_productor_leche`,
            `${alias}.sexo_biologico_permitido_id`,
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
        return ['categoria', 'codigo', 'descripcion'];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'categoria_vacuno_id',
            'categoria',
            'codigo',
            'edad_min_meses',
            'edad_max_meses',
            'es_productor_leche',
            'sexo_biologico_permitido_id'
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'vacunos', campoFk: 'categoria_vacuno_id' }
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['categoria', 'codigo'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        return {
            'categoria_vacuno_id': `${alias}.categoria_vacuno_id`,
            'categoria': `${alias}.categoria`,
            'codigo': `${alias}.codigo`,
            'descripcion': `${alias}.descripcion`,
            'edad_min_meses': `${alias}.edad_min_meses`,
            'edad_max_meses': `${alias}.edad_max_meses`,
            'es_productor_leche': `${alias}.es_productor_leche`,
            'sexo_biologico_permitido_id': `${alias}.sexo_biologico_permitido_id`,
            'sexo': `${alias}.sexo_biologico_permitido_id`,
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
