// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\create-amortizacion-vacuno.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class CreateAmortizacionVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo gestion debe ser un número entero.' })
    @Min(2024, { message: 'La gestión mínima amortizable es 2024. La gestión 2023 solo existe para el comodín del sistema.' })
    @Max(2100, { message: 'La gestión debe ser menor o igual a 2100.' })
    gestion!: number;

    @Type(() => Number)
    @IsInt({ message: 'El campo empresa_id debe ser un número entero.' })
    @Min(2, { message: 'El campo empresa_id debe ser mayor a 1 (el 1 es el comodín del sistema).' })
    empresa_id!: number;
}
