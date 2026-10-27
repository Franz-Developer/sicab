// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\dto\transferir-vacuno.dto.ts
import { Transform, Type } from 'class-transformer';
import { IsInt, Min, IsString, IsOptional, MaxLength } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { emptyToNullUpper } from '../../../common/utils/transform.helper';

export class TransferirVacunoDto {
    @Type(() => Number)
    @IsInt({ message: 'El campo sucursal_destino_id debe ser un número entero.' })
    @Min(1, { message: 'El campo sucursal_destino_id debe ser mayor a 0.' })
    sucursal_destino_id!: number;

    @IsOptional()
    @Transform(emptyToNullUpper)
    @IsString({ message: 'El campo motivo debe ser de tipo texto.' })
    @MaxLength(500, { message: 'El campo motivo no puede exceder los 500 caracteres.' })
    @IsSafeText()
    motivo?: string | null;
}
