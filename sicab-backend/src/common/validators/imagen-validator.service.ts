// C:\sistemas\sicab\sicab-backend\src\common\validators\imagen-validator.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { DomainException } from '../exceptions/domain.exception';
import { ConfiguracionService } from '../services/configuracion.service';

interface ArchivoConfig {
    max_size: number;
    max_width: number;
    max_height: number;
    allowed_formats: string[];
    allowed_extensions: string[];
    default_logo: string;
    retention_days: number;
}

@Injectable()
export class ImagenValidatorService {
    private uploadDir = path.resolve(process.cwd(), 'uploads');

    private readonly MAGIC_NUMBERS: { [key: string]: string } = {
        'png': '89504e47',
        'jpg': 'ffd8ffe0',
        'jpeg': 'ffd8ffe0',
        'gif': '47494638',
        'webp': '52494646',
        'svg': '3c737667',
        'bmp': '424d',
        'tiff': '49492a00',
        'tif': '49492a00',
        'ico': '00000100',
        'exe': '4d5a',
        'dll': '4d5a',
        'msi': 'd0cf11e0',
        'com': '4d5a',
        'scr': '4d5a',
        'js': '2f2f',
        'bat': '404563',
        'cmd': '404563',
        'ps1': 'efbbbf',
        'sh': '2321',
        'php': '3c3f',
        'py': '2321',
        'rb': '2321',
        'pl': '2321',
        'zip': '504b0304',
        'rar': '52617221',
        '7z': '377abcaf',
        'tar': '75737461',
        'gz': '1f8b08',
    };

    constructor(private readonly configuracionService: ConfiguracionService) {}

    private async obtenerConfiguracion(tipo: string): Promise<ArchivoConfig | null> {
        return await this.configuracionService.obtenerValorTipado<ArchivoConfig>(tipo);
    }

    private async verificarMagicNumber(file: Express.Multer.File, config: ArchivoConfig): Promise<void> {
        const buffer = file.buffer.slice(0, 20);
        const hexString = buffer.toString('hex').toLowerCase();

        for (const [extension, magic] of Object.entries(this.MAGIC_NUMBERS)) {
            if (hexString.startsWith(magic)) {
                const fileExtension = path.extname(file.originalname).toLowerCase().replace('.', '');

                const ejecutableExtensions = ['exe', 'dll', 'msi', 'com', 'scr'];
                const scriptExtensions = ['js', 'bat', 'cmd', 'ps1', 'sh', 'php', 'py', 'rb', 'pl'];

                if (ejecutableExtensions.includes(extension) || scriptExtensions.includes(extension)) {
                    throw new DomainException(
                        `El archivo parece ser un ejecutable o script (${extension}). No se permiten archivos ejecutables.`,
                        { httpStatus: HttpStatus.FORBIDDEN }
                    );
                }

                const imageExtensions = config.allowed_extensions;
                if (imageExtensions.includes(extension) && imageExtensions.includes(fileExtension)) {
                    if (!extension.startsWith(fileExtension) && !fileExtension.startsWith(extension)) {
                        console.warn(
                            `Advertencia: El archivo tiene firma de ${extension} pero extensión .${fileExtension}`
                        );
                    }
                }
                return;
            }
        }

        throw new DomainException(
            'El archivo no tiene un formato de imagen válido o está corrupto.',
            { httpStatus: HttpStatus.BAD_REQUEST }
        );
    }

    private async validarImagenConSharp(file: Express.Multer.File, config: ArchivoConfig): Promise<void> {
        try {
            const metadata = await sharp(file.buffer).metadata();

            if (!metadata.width || !metadata.height) {
                throw new Error('Dimensiones inválidas');
            }

            if (!metadata.format) {
                throw new Error('Formato inválido');
            }

            if (!config.allowed_formats.includes(metadata.format.toLowerCase())) {
                throw new Error(`Formato no permitido: ${metadata.format}`);
            }

        } catch (error) {
            throw new DomainException(
                `El archivo no es una imagen válida. Solo se permiten imágenes ${config.allowed_formats.join(', ')}.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }
    }

    private async verificarContenidoSospechoso(file: Express.Multer.File): Promise<void> {
        const buffer = file.buffer;
        const contenido = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000));

        const patronesSospechosos = [
            /<script/i,
            /javascript:/i,
            /onload=/i,
            /onerror=/i,
            /onclick=/i,
            /onmouseover=/i,
            /eval\(/i,
            /document\./i,
            /window\./i,
            /alert\(/i,
            /prompt\(/i,
            /confirm\(/i,
            /<\?php/i,
            /<\%/i,
            /<%/i,
            /jsp:/i,
            /\.exe/i,
            /\.dll/i,
            /\.bat/i,
            /\.cmd/i,
            /\.ps1/i,
        ];

        for (const patron of patronesSospechosos) {
            if (patron.test(contenido)) {
                throw new DomainException(
                    'El archivo contiene contenido sospechoso o potencialmente malicioso.',
                    { httpStatus: HttpStatus.FORBIDDEN }
                );
            }
        }
    }

    async validarArchivo(
        file: Express.Multer.File,
        claveConfig: string,
        validarDimensiones: boolean = true
    ): Promise<void> {
        if (!file) {
            throw new DomainException('No se ha proporcionado ningún archivo.', {
                httpStatus: HttpStatus.BAD_REQUEST
            });
        }

        const config = await this.obtenerConfiguracion(claveConfig);
        if (!config) {
            return;
        }

        await this.verificarMagicNumber(file, config);
        await this.verificarContenidoSospechoso(file);
        await this.validarImagenConSharp(file, config);

        if (file.size > config.max_size) {
            const maxKb = Math.round(config.max_size / 1024);
            throw new DomainException(
                `El archivo excede el tamaño máximo permitido de ${maxKb} KB.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
        if (config.allowed_extensions && !config.allowed_extensions.includes(extension)) {
            throw new DomainException(
                `Extensión no permitida. Formatos válidos: ${config.allowed_extensions.join(', ')}.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        if (config.allowed_formats && config.allowed_formats.length > 0) {
            const formatoValido = config.allowed_formats.some(format => {
                return file.mimetype.includes(format) || extension.includes(format);
            });

            if (!formatoValido) {
                throw new DomainException(
                    `Formato de archivo no permitido. Formatos válidos: ${config.allowed_formats.join(', ')}.`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }

        if (validarDimensiones && (config.max_width || config.max_height)) {
            try {
                const metadata = await sharp(file.buffer).metadata();

                if (config.max_width && metadata.width && metadata.width > config.max_width) {
                    throw new DomainException(
                        `El ancho de la imagen (${metadata.width}px) excede el máximo permitido de ${config.max_width}px.`,
                        { httpStatus: HttpStatus.BAD_REQUEST }
                    );
                }

                if (config.max_height && metadata.height && metadata.height > config.max_height) {
                    throw new DomainException(
                        `El alto de la imagen (${metadata.height}px) excede el máximo permitido de ${config.max_height}px.`,
                        { httpStatus: HttpStatus.BAD_REQUEST }
                    );
                }
            } catch (error) {
                throw new DomainException(
                    `No se pudo validar las dimensiones de la imagen.`,
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }
    }

    async guardarArchivoFisico(file: Express.Multer.File, subCarpeta: string = 'archivos'): Promise<string> {
        const extension = path.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(3).toString('hex');
        const nombreUnico = `${timestamp}-${randomString}${extension}`;

        const destinoCarpeta = path.join(this.uploadDir, subCarpeta);
        await fs.mkdir(destinoCarpeta, { recursive: true });

        const rutaCompleta = path.join(destinoCarpeta, nombreUnico);
        await fs.writeFile(rutaCompleta, file.buffer);

        return `${nombreUnico}`;
    }

    async renombrarArchivo(
        nombreArchivoOrigen: string,
        subCarpeta: string = 'logos'
    ): Promise<string> {
        if (!nombreArchivoOrigen) {
            throw new DomainException('No se ha proporcionado un nombre de archivo.', {
                httpStatus: HttpStatus.BAD_REQUEST
            });
        }

        let nombreArchivo = nombreArchivoOrigen;
        if (nombreArchivo.includes('/')) {
            nombreArchivo = path.basename(nombreArchivo);
        }

        const rutaOrigen = path.join(this.uploadDir, subCarpeta, nombreArchivo);

        try {
            await fs.access(rutaOrigen);
        } catch (error) {
            throw new DomainException(
                `El archivo origen no existe: ${nombreArchivo}`,
                { httpStatus: HttpStatus.NOT_FOUND }
            );
        }

        try {
            const fileBuffer = await fs.readFile(rutaOrigen);
            await sharp(fileBuffer).metadata();
        } catch (error) {
            throw new DomainException(
                `El archivo origen no es una imagen válida.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const extension = path.extname(nombreArchivo).toLowerCase();
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(3).toString('hex');
        const nuevoNombre = `${timestamp}-${randomString}${extension}`;

        const rutaDestino = path.join(this.uploadDir, subCarpeta, nuevoNombre);

        await fs.rename(rutaOrigen, rutaDestino);

        return `${subCarpeta}/${nuevoNombre}`;
    }

    async generarNombreUnico(nombreArchivo: string, subCarpeta: string = 'archivos'): Promise<string> {
        if (!nombreArchivo) {
            return nombreArchivo;
        }

        if (nombreArchivo.match(/^\d{13}-[a-f0-9]{6}\.[a-zA-Z]+$/)) {
            if (!nombreArchivo.includes('/')) {
                return `${subCarpeta}/${nombreArchivo}`;
            }
            return nombreArchivo;
        }

        if (nombreArchivo.includes('/')) {
            nombreArchivo = path.basename(nombreArchivo);
        }

        const extension = path.extname(nombreArchivo).toLowerCase() || '.png';
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(3).toString('hex');
        const nuevoNombre = `${timestamp}-${randomString}${extension}`;

        return `${subCarpeta}/${nuevoNombre}`;
    }

    async validarExistenciaArchivo(nombreArchivo: string, subCarpeta?: string): Promise<boolean> {
        if (!nombreArchivo) return false;

        let rutaCompleta = nombreArchivo;
        if (subCarpeta && !nombreArchivo.includes(subCarpeta)) {
            rutaCompleta = path.join(this.uploadDir, subCarpeta, path.basename(nombreArchivo));
        } else if (!path.isAbsolute(nombreArchivo)) {
            rutaCompleta = path.join(this.uploadDir, nombreArchivo);
        }

        try {
            await fs.access(rutaCompleta);
            return true;
        } catch {
            return false;
        }
    }

        /**
     * Elimina un archivo físico del disco de forma idempotente.
     *
     * Reglas:
     *  - Si el archivo no existe (ENOENT), retorna silenciosamente.
     *  - Si el nombre incluye prefijo de subcarpeta (ej. "vehiculo_fotos/xxx.png"),
     *    se normaliza extrayendo solo el basename.
     *  - Protegido contra path traversal: la ruta resuelta debe permanecer
     *    dentro de `uploads/<subCarpeta>`.
     *
     * Usado por los servicios al reemplazar/quitar imágenes y como complemento
     * de la tarea programada LIMPIEZA_ARCHIVOS_HUERFANOS.
     *
     * @param nombreArchivo Nombre del archivo (solo basename o con subcarpeta).
     * @param subCarpeta    Subcarpeta dentro de uploads/ (por defecto 'archivos').
     */
    async eliminarArchivoFisico(
        nombreArchivo: string | null | undefined,
        subCarpeta: string = 'archivos',
    ): Promise<void> {
        if (!nombreArchivo) return;

        const nombre = nombreArchivo.includes('/')
            ? path.basename(nombreArchivo)
            : nombreArchivo;

        const subCarpetaSegura = path.basename(subCarpeta);
        const rutaBase = path.resolve(this.uploadDir, subCarpetaSegura);
        const rutaCompleta = path.resolve(rutaBase, nombre);

        if (rutaCompleta !== rutaBase && !rutaCompleta.startsWith(rutaBase + path.sep)) {
            throw new DomainException(
                'Ruta de archivo inválida detectada al intentar eliminar el archivo físico.',
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        try {
            await fs.access(rutaCompleta);
            await fs.unlink(rutaCompleta);
        } catch (error) {
            const err = error as NodeJS.ErrnoException;

            if (err.code === 'ENOENT') {
                return;
            }

            throw new DomainException(
                `No se pudo eliminar el archivo físico "${nombre}": ${err.message}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

        /**
     * ✅ MÉTODO UNIVERSAL: Procesa una imagen que puede venir de 2 formas:
     *
     * 1. Como `Express.Multer.File` (subida por multipart/form-data)
     * 2. Como string (nombre de un archivo existente en uploads/{carpeta}/)
     *
     * En AMBOS casos:
     * - Valida con `claveConfig` (ej. 'logo_config', 'avatar_config', 'foto_trabajador_config')
     * - Guarda en `uploads/{carpeta}/`
     * - Devuelve el nombre final del archivo (con timestamp + random)
     *
     * Si no hay file ni string, devuelve '' (cadena vacía).
     */
    async procesarImagen(
        file: Express.Multer.File | undefined,
        nombreArchivo: string | undefined,
        claveConfig: string,
        carpeta: string,
    ): Promise<string> {
        // 1. Si hay archivo subido por multipart/form-data
        if (file) {
            await this.validarArchivo(file, claveConfig);
            return await this.guardarArchivoFisico(file, carpeta);
        }

        // 2. Si viene un nombre de archivo como string
        if (nombreArchivo && nombreArchivo.trim() !== '') {
            const nombreLimpio = path.basename(nombreArchivo);
            const rutaFisica = path.join(this.uploadDir, carpeta, nombreLimpio);

            let buffer: Buffer;
            let stats: { size: number };

            try {
                buffer = await fs.readFile(rutaFisica);
                stats = await fs.stat(rutaFisica);
            } catch (error) {
                const err = error as NodeJS.ErrnoException;

                if (err.code === 'ENOENT') {
                    throw new DomainException(
                        `El archivo "${nombreArchivo}" no existe en uploads/${carpeta}/.`,
                        { httpStatus: HttpStatus.NOT_FOUND }
                    );
                }

                throw new DomainException(
                    `No se pudo leer el archivo "${nombreArchivo}": ${err.message}`,
                    { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR }
                );
            }

            // Construir un objeto similar a Express.Multer.File
            const archivoSimulado: Express.Multer.File = {
                fieldname: 'file',
                originalname: nombreLimpio,
                encoding: '7bit',
                mimetype: this.inferirMimeType(nombreLimpio),
                size: stats.size,
                buffer,
                stream: null as any,
                destination: '',
                filename: nombreLimpio,
                path: rutaFisica,
            };

            // ✅ Validación con la MISMA clave de configuración
            await this.validarArchivo(archivoSimulado, claveConfig);

            // Renombrar con timestamp + random (formato seguro)
            return await this.renombrarArchivo(nombreArchivo, carpeta);
        }

        // 3. No hay ni archivo ni string
        return '';
    }

    /**
     * Helper interno: infiere el MIME type a partir de la extensión.
     */
    private inferirMimeType(nombreArchivo: string): string {
        const ext = path.extname(nombreArchivo).toLowerCase();
        const mimes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.tiff': 'image/tiff',
            '.svg': 'image/svg+xml',
        };
        return mimes[ext] ?? 'application/octet-stream';
    }
}

