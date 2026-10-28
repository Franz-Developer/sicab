// C:\sistemas\sicab\sicab-backend\src\modules\reportes\dto\produccion-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class ProduccionQueryDto {
    @IsOptional()
    @IsDateString({}, { message: 'desde debe ser una fecha válida (YYYY-MM-DD).' })
    desde?: string;

    @IsOptional()
    @IsDateString({}, { message: 'hasta debe ser una fecha válida (YYYY-MM-DD).' })
    hasta?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'empresa_id debe ser un número entero.' })
    @Min(1, { message: 'empresa_id debe ser mayor a 0.' })
    empresa_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'sucursal_id debe ser un número entero.' })
    @Min(1, { message: 'sucursal_id debe ser mayor a 0.' })
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'turno_ordeno_id debe ser un número entero.' })
    @Min(1, { message: 'turno_ordeno_id debe ser mayor a 0.' })
    turno_ordeno_id?: number;
}
