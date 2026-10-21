// C:\sistemas\sicab\sicab-backend\src\modules\reportes\dto\hato-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsIn, Min } from 'class-validator';

export class HatoQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'sucursal_id debe ser un número entero.' })
    @Min(1)
    sucursal_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'raza_id debe ser un número entero.' })
    @Min(1)
    raza_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'categoria_vacuno_id debe ser un número entero.' })
    @Min(1)
    categoria_vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'estado_vacuno_id debe ser un número entero.' })
    @IsIn([1, 2, 3, 4, 5, 6], { message: 'estado_vacuno_id debe estar entre 1 y 6.' })
    estado_vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsIn([0, 1])
    es_productor_leche?: number;
}
