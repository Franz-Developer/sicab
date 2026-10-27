// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\update-tipo-cambio.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTipoCambioDto } from './create-tipo-cambio.dto';

export class UpdateTipoCambioDto extends PartialType(
    OmitType(CreateTipoCambioDto, [
        'origen_moneda_id',
        'destino_moneda_id',
        'fecha_cotizacion',
    ] as const)
) {}
