// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\cambiar-estado-vacuno.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, IsNumber, Min, MaxLength, IsDateString } from 'class-validator';
import { EstadoVacuno, ESTADO_VACUNO_METADATA } from '../../../common/constants/estados.constant';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToNull, emptyToNullUpper } from '../../../common/utils/transform.helper';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

const ESTADOS_VACUNO_TODOS = [
    EstadoVacuno.ACTIVO,
    EstadoVacuno.EN_TRATAMIENTO,
    EstadoVacuno.SECA,
    EstadoVacuno.DESCARTE,
    EstadoVacuno.VENDIDO,
    EstadoVacuno.MUERTO,
] as const;

export class CambiarEstadoVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo estado_vacuno_id debe ser un número entero.' })
    @IsIn(ESTADOS_VACUNO_TODOS, {
        message: createEnumMessage(ESTADO_VACUNO_METADATA, ESTADOS_VACUNO_TODOS, 'estado_vacuno_id'),
    })
    estado_vacuno_id!: number;

    @IsOptional()
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_salida debe ser una fecha válida.' })
    fecha_salida?: string | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo motivo_salida debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo motivo_salida no puede exceder los 500 caracteres.' })
    @IsSafeText()
    motivo_salida?: string | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo peso_salida debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo peso_salida no puede ser negativo.' })
    peso_salida?: number | null;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo precio_venta debe ser un número con máximo 2 decimales.' })
    @Min(0, { message: 'El campo precio_venta no puede ser negativo.' })
    precio_venta?: number | null;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo causa_muerte debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo causa_muerte no puede exceder los 500 caracteres.' })
    @IsSafeText()
    causa_muerte?: string | null;
}
