// C:\sistemas\sicab\sicab-backend\src\modules\reportes\dto\hato-query.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsIn, Min } from 'class-validator';
import { EstadoVacuno } from '../../../common/constants/estados.constant';

export class HatoQueryDto {
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
    @IsIn([
        EstadoVacuno.ACTIVO,
        EstadoVacuno.PARA_FAENA,
        EstadoVacuno.FAENADO,
        EstadoVacuno.PARA_VENTA,
        EstadoVacuno.VENDIDO,
        EstadoVacuno.MUERTO
    ], {
        message: 'estado_vacuno_id debe ser un estado válido de vacuno.'
    })
    estado_vacuno_id?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsIn([0, 1])
    es_productor_leche?: number;
}
