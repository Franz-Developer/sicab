// C:\sistemas\sicab\sicab-backend\src\common\constants\upload-paths.constant.ts

export interface UploadPathConfig {
    carpeta: string;
    urlPrefix: string;
}

export const UPLOAD_PATHS: readonly UploadPathConfig[] = [
    { carpeta: 'logos',              urlPrefix: '/api/logos' },
    { carpeta: 'products',           urlPrefix: '/api/products' },
    { carpeta: 'avatars',            urlPrefix: '/api/avatars' },
    { carpeta: 'persons',            urlPrefix: '/api/persons' },
    { carpeta: 'persons_qr',         urlPrefix: '/api/persons_qr' },
    { carpeta: 'vehiculo_documents', urlPrefix: '/api/vehiculo_documents' },
    { carpeta: 'vehiculo_fotos',     urlPrefix: '/api/vehiculo_fotos' },
    { carpeta: 'mantenimiento_documents',  urlPrefix: '/api/mantenimiento_documents' },
    { carpeta: 'archivos',           urlPrefix: '/api/archivos' },
    { carpeta: 'razas_fotos',        urlPrefix: '/api/razas_fotos' },
    { carpeta: 'vacunos_fotos',      urlPrefix: '/api/vacunos_fotos' },
] as const;

export const UPLOAD_CARPETA_TO_PREFIX: Record<string, string> = Object.fromEntries(
    UPLOAD_PATHS.map(p => [p.carpeta, p.urlPrefix])
);

export const UPLOAD_CARPETAS_VALIDAS: readonly string[] = UPLOAD_PATHS.map(p => p.carpeta);

export function esCarpetaValida(carpeta: string): boolean {
    return UPLOAD_CARPETAS_VALIDAS.includes(carpeta);
}
