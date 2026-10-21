// C:\sistemas\sicab\sicab-frontend\app\composables\useImageValidator.ts
export interface ImageValidationConfig {
    max_size: number;
    max_width: number;
    max_height: number;
    allowed_formats: string[];
    allowed_extensions: string[];
}

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

export interface ImageConfigDisplay {
    maxSizeKB: number;
    maxWidth: number;
    maxHeight: number;
    formats: string;         // "PNG, JPG, JPEG, WEBP" (para mostrar al usuario)
    extensions: string[];    // ['png', 'jpg', 'jpeg', 'webp'] (para generar accept)
    mimeTypes: string[];     // ['image/png', 'image/jpeg', 'image/webp'] (para accept)
}

export const useImageValidator = () => {
    const { getJson } = useParametroGlobal();

    const validate = async (
        file: File,
        configKey: string,
    ): Promise<ImageValidationResult> => {
        const config = (await getJson(configKey)) as ImageValidationConfig | null;

        if (!config) {
            return { valid: false, error: `No se encontró la configuración "${configKey}"` };
        }

        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!config.allowed_extensions.map((e) => e.toLowerCase()).includes(ext)) {
            return {
                valid: false,
                error: `Extensión no permitida. Permitidas: ${config.allowed_extensions.join(', ').toUpperCase()}`,
            };
        }

        if (!config.allowed_formats.map((f) => `image/${f}`).includes(file.type)) {
            return {
                valid: false,
                error: `Formato no permitido. Permitidos: ${config.allowed_formats.join(', ').toUpperCase()}`,
            };
        }

        if (file.size > config.max_size) {
            const maxKB = Math.round(config.max_size / 1024);
            const sizeKB = Math.round(file.size / 1024);
            return {
                valid: false,
                error: `Archivo muy pesado (${sizeKB} KB). Máximo permitido: ${maxKB} KB.`,
            };
        }

        const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('No se pudo leer la imagen'));
            };
            img.src = url;
        }).catch(() => null);

        if (!dims) {
            return { valid: false, error: 'No se pudo leer la imagen' };
        }

        if (dims.width > config.max_width || dims.height > config.max_height) {
            return {
                valid: false,
                error: `Dimensiones excedidas (${dims.width}×${dims.height}). Máximo: ${config.max_width}×${config.max_height} px.`,
            };
        }

        return { valid: true };
    };

    const getConfigDisplay = async (configKey: string): Promise<ImageConfigDisplay | null> => {
        const config = (await getJson(configKey)) as ImageValidationConfig | null;
        if (!config) return null;

        const extToMime: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            gif: 'image/gif',
            bmp: 'image/bmp',
            tiff: 'image/tiff',
            avif: 'image/avif',
        };

        const extensions = config.allowed_extensions.map((e) => e.toLowerCase());
        const mimeTypes = extensions
            .map((ext) => extToMime[ext])
            .filter((mime): mime is string => Boolean(mime));

        return {
            maxSizeKB: Math.round(config.max_size / 1024),
            maxWidth: config.max_width,
            maxHeight: config.max_height,
            formats: extensions.map((e) => e.toUpperCase()).join(', '),
            extensions,
            mimeTypes,
        };
    };

    return { validate, getConfigDisplay };
};
