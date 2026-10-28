// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\delete-amortizacion-by-gestion.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class DeleteAmortizacionByGestionDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo gestion debe ser un número entero.' })
    @Min(2024, { message: 'La gestión mínima es 2024.' })
    @Max(2100, { message: 'La gestión debe ser menor o igual a 2100.' })
    gestion!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo empresa_id debe ser un número entero.' })
    @Min(2, { message: 'El campo empresa_id debe ser mayor a 1.' })
    empresa_id?: number;
}
