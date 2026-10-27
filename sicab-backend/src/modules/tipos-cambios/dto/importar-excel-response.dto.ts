// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\importar-excel-response.dto.ts
import { Expose } from 'class-transformer';

export class ImportarExcelResponseDto {
    @Expose() procesados!: number;
    @Expose() insertados!: number;
    @Expose() errores!: number;
    @Expose() mensaje!: string;
    @Expose() detalles_errores?: string[];
}
