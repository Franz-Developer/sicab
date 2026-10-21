// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\create-amortizacion-vacuno.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateAmortizacionVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo anio debe ser un número entero.' })
    @Min(1900, { message: 'El año debe ser mayor o igual a 1900.' })
    @Max(2100, { message: 'El año debe ser menor o igual a 2100.' })
    anio!: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean({ message: 'El campo recalcular debe ser un valor booleano (true/false).' })
    recalcular: boolean = false;
}
