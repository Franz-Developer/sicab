// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\cambiar-estado-vacuno.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsString, IsIn, IsInt, IsNumber, Min, Max, MaxLength, IsDateString, ValidateIf, IsNotEmpty } from 'class-validator';
import { EstadoVacuno, ESTADO_VACUNO_METADATA } from '../../../common/constants/estados.constant';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToNull, emptyToNullUpper } from '../../../common/utils/transform.helper';
import { createEnumMessage } from '../../../common/utils/validation-helper.util';

const ESTADOS_VACUNO_TODOS = [
    EstadoVacuno.ACTIVO,
    EstadoVacuno.PARA_FAENA,
    EstadoVacuno.FAENADO,
    EstadoVacuno.PARA_VENTA,
    EstadoVacuno.VENDIDO,
    EstadoVacuno.MUERTO,
] as const;

const ESTADOS_FINALES = [
    EstadoVacuno.FAENADO,
    EstadoVacuno.VENDIDO,
    EstadoVacuno.MUERTO,
] as const;

const ESTADOS_CON_PRECIO_VENTA = [
    EstadoVacuno.FAENADO,
    EstadoVacuno.VENDIDO,
] as const;

export class CambiarEstadoVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo estado_vacuno_id debe ser un número entero.' })
    @IsIn(ESTADOS_VACUNO_TODOS, {
        message: createEnumMessage(ESTADO_VACUNO_METADATA, ESTADOS_VACUNO_TODOS, 'estado_vacuno_id'),
    })
    estado_vacuno_id!: number;

    @ValidateIf((o) => ESTADOS_FINALES.includes(o.estado_vacuno_id))
    @Transform(emptyToNull)
    @IsDateString({}, { message: 'El campo fecha_salida debe ser una fecha válida.' })
    @IsNotEmpty({ message: 'Si estado_vacuno_id = FAENADO, VENDIDO o MUERTO, fecha_salida es obligatoria.' })
    fecha_salida?: string | null;

    @ValidateIf((o) => ESTADOS_FINALES.includes(o.estado_vacuno_id))
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo motivo_salida debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'Si estado_vacuno_id = FAENADO, VENDIDO o MUERTO, motivo_salida es obligatorio.' })
    @MaxLength(500, { message: 'El campo motivo_salida no puede exceder los 500 caracteres.' })
    @IsSafeText()
    motivo_salida?: string | null;

    @ValidateIf((o) => ESTADOS_CON_PRECIO_VENTA.includes(o.estado_vacuno_id))
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo precio_venta debe ser un número con máximo 2 decimales.' })
    @IsNotEmpty({ message: 'Si estado_vacuno_id = FAENADO o VENDIDO, precio_venta es obligatorio.' })
    @Min(0, { message: 'El campo precio_venta no puede ser negativo.' })
    precio_venta?: number | null;

    @ValidateIf((o) => o.estado_vacuno_id === EstadoVacuno.MUERTO)
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo causa_muerte debe ser de tipo texto.' })
    @IsNotEmpty({ message: 'Si estado_vacuno_id = MUERTO, causa_muerte es obligatoria.' })
    @MaxLength(500, { message: 'El campo causa_muerte no puede exceder los 500 caracteres.' })
    @IsSafeText()
    causa_muerte?: string | null;

    @ValidateIf((o) => ESTADOS_FINALES.includes(o.estado_vacuno_id))
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El campo peso_salida debe ser un número con máximo 2 decimales.' })
    @IsNotEmpty({ message: 'Si estado_vacuno_id = FAENADO, VENDIDO o MUERTO, peso_salida es obligatorio.' })
    @Min(0, { message: 'El campo peso_salida no puede ser negativo.' })
    @Max(1500, { message: 'El campo peso_salida no puede exceder los 1500 kg.' })
    peso_salida?: number | null;
}
