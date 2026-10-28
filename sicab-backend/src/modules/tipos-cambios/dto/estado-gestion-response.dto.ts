// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\dto\estado-gestion-response.dto.ts
import { Expose } from 'class-transformer';

export class EstadoGestionMonedaDto {
    @Expose() destino_moneda_id!: number;
    @Expose() destino_moneda_label!: string;
    @Expose() destino_moneda_abreviatura!: string;
    @Expose() total_dias_esperados!: number;
    @Expose() total_dias_registrados!: number;
    @Expose() dias_faltantes!: number;
    @Expose() esta_completa!: boolean;
}

export class EstadoGestionResponseDto {
    @Expose() gestion!: number;
    @Expose() es_bisiesto!: boolean;
    @Expose() monedas!: EstadoGestionMonedaDto[];
    @Expose() esta_completa_global!: boolean;
    @Expose() mensaje!: string;
}
