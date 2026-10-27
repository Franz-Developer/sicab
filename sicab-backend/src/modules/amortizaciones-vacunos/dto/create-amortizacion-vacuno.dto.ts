// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\dto\create-amortizacion-vacuno.dto.ts
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateAmortizacionVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo gestion debe ser un número entero.' })
    @Min(2023, { message: 'La gestión debe ser mayor o igual a 2023.' })
    @Max(2100, { message: 'La gestión debe ser menor o igual a 2100.' })
    gestion!: number;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean({ message: 'El campo recalcular debe ser un valor booleano (true/false).' })
    recalcular: boolean = false;
}
