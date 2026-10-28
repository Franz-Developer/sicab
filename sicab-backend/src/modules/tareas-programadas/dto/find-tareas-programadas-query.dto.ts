// C:\sistemas\central\central-backend\src\modules\tareas-programadas\dto\find-tareas-programadas-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsIn, IsString, MaxLength } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA, TipoTarea, TIPO_TAREA_METADATA, Frecuencia, FRECUENCIA_METADATA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage, getEnumValues } from '../../../common/utils/validation-helper.util';

export class FindTareasProgramadasQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'tipo_tarea_id debe ser un número entero.' })
    @IsIn(getEnumValues(TipoTarea), {
        message: createEnumMessage(TIPO_TAREA_METADATA, getEnumValues(TipoTarea), 'tipo_tarea_id')
    })
    tipo_tarea_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'frecuencia_id debe ser un número entero.' })
    @IsIn(getEnumValues(Frecuencia), {
        message: createEnumMessage(FRECUENCIA_METADATA, getEnumValues(Frecuencia), 'frecuencia_id')
    })
    frecuencia_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'notificar_admin debe ser un número entero.' })
    @IsIn([0, 1], { message: 'notificar_admin debe ser 0 (NO) o 1 (SÍ).' })
    notificar_admin?: number;

    @IsOptional()
    @IsString({ message: 'codigo debe ser un texto.' })
    @MaxLength(60, { message: 'codigo no puede exceder los 60 caracteres.' })
    codigo?: string;

    static getCampos(): string[] {
        const alias = 't';
        return [
            `${alias}.tarea_id`,
            `${alias}.codigo`,
            `${alias}.nombre`,
            `${alias}.descripcion`,
            `${alias}.tipo_tarea_id`,
            `${alias}.frecuencia_id`,
            `${alias}.cron_expresion`,
            `${alias}.parametros`,
            `${alias}.ultima_ejecucion`,
            `${alias}.ultimo_error`,
            `${alias}.intentos_fallidos`,
            `${alias}.notificar_admin`,
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
        return ['codigo', 'nombre', 'descripcion', 'cron_expresion', 'ultimo_error'];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'tarea_id',
            'codigo',
            'nombre',
            'tipo_tarea_id',
            'frecuencia_id',
            'ultima_ejecucion',
            'intentos_fallidos',
            'notificar_admin',
            'fecha_registro',
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return [];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        return {
            'tarea_id': `${alias}.tarea_id`,
            'codigo': `${alias}.codigo`,
            'nombre': `${alias}.nombre`,
            'descripcion': `${alias}.descripcion`,
            'tipo_tarea_id': `${alias}.tipo_tarea_id`,
            'frecuencia_id': `${alias}.frecuencia_id`,
            'cron_expresion': `${alias}.cron_expresion`,
            'parametros': `${alias}.parametros`,
            'ultima_ejecucion': `${alias}.ultima_ejecucion`,
            'ultimo_error': `${alias}.ultimo_error`,
            'intentos_fallidos': `${alias}.intentos_fallidos`,
            'notificar_admin': `${alias}.notificar_admin`,
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

export { PaginatedResult }