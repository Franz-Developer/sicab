// C:\sistemas\sicab\sicab-frontend\app\composables\useGeoAreaValidator.ts

export interface GeoAreaConfig {
    tipo: 'circulo' | 'poligono';
    lat?: number;
    lng?: number;
    radio_m?: number;
    puntos?: Array<[number, number]>;
}

export interface GeoValidationResult {
    valido: boolean;
    error?: string;
}

const EARTH_RADIUS_M = 6_371_000;

/** Distancia Haversine en metros entre dos coordenadas. */
const haversineMetros = (
    lat1: number, lng1: number,
    lat2: number, lng2: number,
): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
};

/** Point-in-polygon (ray casting). */
const puntoEnPoligono = (
    lat: number,
    lng: number,
    puntos: Array<[number, number]>,
): boolean => {
    let dentro = false;
    for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
        const [latI, lngI] = puntos[i]!;
        const [latJ, lngJ] = puntos[j]!;
        const intersecta =
            lngI > lng !== lngJ > lng &&
            lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
        if (intersecta) dentro = !dentro;
    }
    return dentro;
};

export const useGeoAreaValidator = () => {
    const { getJson } = useParametroGlobal();

    const esConfigValida = (cfg: any): cfg is GeoAreaConfig => {
        if (!cfg || typeof cfg !== 'object') return false;
        if (cfg.tipo === 'circulo') {
            return (
                Number.isFinite(cfg.lat) &&
                Number.isFinite(cfg.lng) &&
                Number.isFinite(cfg.radio_m) &&
                cfg.radio_m > 0
            );
        }
        if (cfg.tipo === 'poligono') {
            return Array.isArray(cfg.puntos) && cfg.puntos.length >= 3;
        }
        return false;
    };

    const cargarConfig = async (
        tipo: 'origen' | 'destino',
    ): Promise<GeoAreaConfig | null> => {
        const clave =
            tipo === 'origen'
                ? 'area_servicio_origen'
                : 'area_servicio_destino';

        const cfg = await getJson<GeoAreaConfig>(clave);
        return esConfigValida(cfg) ? cfg : null;
    };

    const validarCoordenadas = async (
        lat: number,
        lng: number,
        tipo: 'origen' | 'destino',
    ): Promise<GeoValidationResult> => {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return { valido: false, error: 'Coordenadas inválidas.' };
        }

        const cfg = await cargarConfig(tipo);

        // Sin configuración → no se puede validar → se permite
        if (!cfg) {
            return { valido: true };
        }

        if (cfg.tipo === 'circulo') {
            const dist = haversineMetros(lat, lng, cfg.lat!, cfg.lng!);
            if (dist > cfg.radio_m!) {
                const km = (cfg.radio_m! / 1000).toFixed(1);
                return {
                    valido: false,
                    error: `La ubicación está a ${(dist / 1000).toFixed(2)} km del centro. El área permitida tiene un radio de ${km} km.`,
                };
            }
            return { valido: true };
        }

        if (cfg.tipo === 'poligono') {
            if (!puntoEnPoligono(lat, lng, cfg.puntos!)) {
                return {
                    valido: false,
                    error: 'La ubicación está fuera del polígono de servicio permitido.',
                };
            }
            return { valido: true };
        }

        return { valido: true };
    };

    return { validarCoordenadas };
};
