// C:\sistemas\sicab\sicab-backend\src\modules\reportes\dto\amortizaciones-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsDateString, IsIn, Min } from 'class-validator';
import { ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';

export class AmortizacionesQueryDto {
    @IsOptional()
    @IsDateString({}, { message: 'desde debe ser una fecha válida (YYYY-MM-DD).' })
    desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'hasta debe ser una fecha válida (YYYY-MM-DD).' })
    hasta?: string;

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
    @IsIn(ESTADOS_CONSULTA)
    estado_id?: number;
}
