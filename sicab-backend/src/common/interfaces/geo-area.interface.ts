// C:\sistemas\sicab\sicab-backend\src\common\interfaces\geo-area.interface.ts
export interface GeoAreaServicio {
    activo: boolean;
    nombre: string;
    lat_min: number;
    lat_max: number;
    lng_min: number;
    lng_max: number;
    validar_origen: boolean;
    validar_destino: boolean;
}
