// C:\sistemas\sicab\sicab-backend\src\modules\reportes\dto\amortizaciones-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsIn, Min, Max } from 'class-validator';
import { ESTADOS_CONSULTA } from '../../../common/constants/estados.constant';

export class AmortizacionesQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'gestion debe ser un número entero.' })
    @Min(2023)
    @Max(2100)
    gestion?: number;

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
    @IsIn(ESTADOS_CONSULTA)
    estado_id?: number;
}
