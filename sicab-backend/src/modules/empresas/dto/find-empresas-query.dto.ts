// C:\sistemas\sicab\sicab-backend\src\modules\empresas\dto\find-empresas-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindEmpresasQueryDto extends BasePaginationQueryDto {
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
            `${alias}.empresa_id`,
            `${alias}.empresa`,
            `${alias}.codigo`,
            `${alias}.logo`,
            `${alias}.eslogan`,
            `${alias}.descripcion`,
            `${alias}.lugar`,
            `${alias}.representante`,
            `${alias}.direccion`,
            `${alias}.telefono`,
            `${alias}.email`,
            `${alias}.matricula_comercio`,
            `${alias}.licencia_frecuencia_att`,
            `${alias}.fecha_emision_licencia_att`,
            `${alias}.fecha_vencimiento_licencia_att`,
            `${alias}.resolucion_municipal_operacion`,
            `${alias}.fecha_emision_resolucion`,
            `${alias}.fecha_vencimiento_resolucion`,
            `${alias}.frecuencia_asignada_mhz`,
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
            'empresa',
            'codigo',
            'logo',
            'eslogan',
            'descripcion',
            'lugar',
            'representante',
            'direccion',
            'telefono',
            'email',
            'matricula_comercio',
            'licencia_frecuencia_att',
            'resolucion_municipal_operacion',
            'frecuencia_asignada_mhz'
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'empresa_id',
            'empresa',
            'codigo',
            'logo',
            'eslogan',
            'descripcion',
            'lugar',
            'representante',
            'direccion',
            'telefono',
            'email',
            'matricula_comercio',
            'licencia_frecuencia_att',
            'fecha_emision_licencia_att',
            'fecha_vencimiento_licencia_att',
            'resolucion_municipal_operacion',
            'fecha_emision_resolucion',
            'fecha_vencimiento_resolucion',
            'frecuencia_asignada_mhz'
        ];
    }

    static getDependencias(): Array<string | { tabla: string; campoFk: string }> {
        return [
            { tabla: 'sucursales', campoFk: 'empresa_id' },
            { tabla: 'empresas_nits', campoFk: 'empresa_id' },
            { tabla: 'empresas_cuentas', campoFk: 'empresa_id' },
        ];
    }

    static getCamposProtegidosConDependencias(): string[] {
        return ['empresa', 'codigo', 'matricula_comercio'];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 't';
        return {
            'empresa_id': `${alias}.empresa_id`,
            'empresa': `${alias}.empresa`,
            'codigo': `${alias}.codigo`,
            'logo': `${alias}.logo`,
            'eslogan': `${alias}.eslogan`,
            'descripcion': `${alias}.descripcion`,
            'lugar': `${alias}.lugar`,
            'representante': `${alias}.representante`,
            'direccion': `${alias}.direccion`,
            'telefono': `${alias}.telefono`,
            'email': `${alias}.email`,
            'matricula_comercio': `${alias}.matricula_comercio`,
            'licencia_frecuencia_att': `${alias}.licencia_frecuencia_att`,
            'fecha_emision_licencia_att': `${alias}.fecha_emision_licencia_att`,
            'fecha_vencimiento_licencia_att': `${alias}.fecha_vencimiento_licencia_att`,
            'resolucion_municipal_operacion': `${alias}.resolucion_municipal_operacion`,
            'fecha_emision_resolucion': `${alias}.fecha_emision_resolucion`,
            'fecha_vencimiento_resolucion': `${alias}.fecha_vencimiento_resolucion`,
            'frecuencia_asignada_mhz': `${alias}.frecuencia_asignada_mhz`,
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
