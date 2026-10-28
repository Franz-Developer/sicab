// C:\sistemas\sicab\sicab-backend\src\modules\reportes\dto\faenas-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsDateString, Min, IsIn } from 'class-validator';
import { ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';

export class FaenasQueryDto {
    @IsOptional()
    @IsDateString({}, { message: 'desde debe ser una fecha válida (YYYY-MM-DD).' })
    desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'hasta debe ser una fecha válida (YYYY-MM-DD).' })
    hasta?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'empresa_id debe ser un número entero.' })
    @Min(1)
    empresa_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'sucursal_id debe ser un número entero.' })
    @Min(1)
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'vacuno_id debe ser un número entero.' })
    @Min(1)
    vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsIn(ESTADOS_CONSULTA, { message: 'estado_id debe ser un estado válido (ACTIVO, HISTORICO, ANULADO).' })
    estado_id?: number;
}
