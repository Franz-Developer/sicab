// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\dto\find-producciones-leche-detalle-query.dto.ts
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ESTADO_METADATA, ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';
import { BasePaginationQueryDto } from '../../../common/dto/base-pagination-query.dto';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

export class FindProduccionesLecheDetalleQueryDto extends BasePaginationQueryDto {
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
    @IsInt({ message: 'El estado_id debe ser un número entero.' })
    @IsIn(ESTADOS_CONSULTA, {
        message: createEnumMessage(ESTADO_METADATA, ESTADOS_CONSULTA, 'estado_id'),
    })
    estado_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo vacuno_id debe ser un número entero.' })
    @Min(1, { message: 'El campo vacuno_id debe ser mayor a 0.' })
    vacuno_id?: number;

    // ─── Campos estáticos reutilizables por el Service ──────────────
    protected override getDefaultSortField(): string {
        return 'produccion_leche_detalle_id';
    }

    protected override getAllowedSortFields(): string[] {
        return FindProduccionesLecheDetalleQueryDto.getCamposPermitidosParaOrdenar();
    }

    static getCampos(): string[] {
        const alias = 'pld';
        const aliasVac = 'v';
        const aliasRaza = 'rz';
        const aliasCat = 'ct';

        return [
            `${alias}.produccion_leche_detalle_id`,
            `${alias}.produccion_leche_id`,
            `${alias}.vacuno_id`,
            `${aliasVac}.arete AS vacuno_arete`,
            `${aliasVac}.nombre AS vacuno_nombre`,
            `${aliasRaza}.raza AS raza_nombre`,
            `${aliasCat}.categoria AS categoria_nombre`,
            `${alias}.litros`,
            `${alias}.turno_ordeno_id`,
            `${alias}.observaciones`,
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
            'observaciones',
            'v.arete',
            'v.nombre',
            'rz.raza',
            'ct.categoria',
        ];
    }

    static getCamposPermitidosParaOrdenar(): string[] {
        return [
            'produccion_leche_detalle_id',
            'vacuno_id',
            'vacuno_arete',
            'vacuno_nombre',
            'raza_nombre',
            'categoria_nombre',
            'litros',
        ];
    }

    static getEquivalenciasMapeo(): Record<string, string> {
        const alias = 'pld';
        const aliasVac = 'v';
        const aliasRaza = 'rz';
        const aliasCat = 'ct';

        return {
            'produccion_leche_detalle_id': `${alias}.produccion_leche_detalle_id`,
            'produccion_leche_id': `${alias}.produccion_leche_id`,
            'vacuno_id': `${alias}.vacuno_id`,
            'vacuno_arete': `${aliasVac}.arete`,
            'vacuno_nombre': `${aliasVac}.nombre`,
            'raza_nombre': `${aliasRaza}.raza`,
            'categoria_nombre': `${aliasCat}.categoria`,
            'litros': `${alias}.litros`,
            'turno_ordeno_id': `${alias}.turno_ordeno_id`,
            'observaciones': `${alias}.observaciones`,
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
