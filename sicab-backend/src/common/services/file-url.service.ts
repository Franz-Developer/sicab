// C:\sistemas\sicab\sicab-backend\src\common\services\file-url.service.ts
import { basename } from 'path';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
    UPLOAD_CARPETA_TO_PREFIX,
    esCarpetaValida,
} from '../constants/upload-paths.constant';

@Injectable()
export class FileUrlService {
    private readonly logger = new Logger(FileUrlService.name);
    private readonly DANGEROUS_CHARS = /[<>"{}|\\^`[\]]/g;
    private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

    constructor(private readonly configService: ConfigService) {}

    /**
     * Método GENÉRICO. Sirve para cualquier carpeta registrada en UPLOAD_PATHS.
     *
     * @param filename Nombre del archivo (ej. "2.png") o URL completa.
     * @param carpeta  Nombre de la carpeta dentro de uploads/ (ej. "logos").
     * @returns URL completa o null si el archivo no existe.
     *
     * @example
     *   getFileUrl('2.png', 'logos')                // → http://localhost:3010/api/logos/2.png
     *   getFileUrl('foto.jpg', 'vehiculo_fotos')    // → http://localhost:3010/api/vehiculo_fotos/foto.jpg
     */
    getFileUrl(filename: string | null, carpeta: string): string | null {
        if (!filename) return null;

        if (this.isValidUrl(filename)) {
            return this.sanitizeUrl(filename);
        }

        // Validar que la carpeta esté registrada
        if (!esCarpetaValida(carpeta)) {
            this.logger.warn(`Carpeta no registrada en UPLOAD_PATHS: "${carpeta}"`);
            return null;
        }

        // Verificar que el archivo exista físicamente
        if (!this.fileExists(filename, carpeta)) {
            this.logger.debug(`Archivo no encontrado: ${carpeta}/${filename}`);
            return null;
        }

        const sanitizedFilename = this.sanitizeFilename(filename);
        const urlPrefix = UPLOAD_CARPETA_TO_PREFIX[carpeta];
        const baseUrl = this.getBaseUrl();

        return `${baseUrl}${urlPrefix}/${encodeURIComponent(sanitizedFilename)}`;
    }

    /**
     * Métodos de conveniencia para los casos más comunes.
     * Puedes seguir usándolos o llamar directamente a getFileUrl('archivo.png', 'logos').
     */
    getLogoUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'logos');
    }

    getProductUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'products');
    }

    getPersonUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'persons');
    }

    getPersonQrUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'persons_qr');
    }

    getAvatarUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'avatars');
    }

    getVehiculoDocumentoUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'vehiculo_documents');
    }

    getVehiculoFotoUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'vehiculo_fotos');
    }

    getMantenimientoDocumentoUrl(filename: string | null): string | null {
        return this.getFileUrl(filename, 'mantenimiento_documents');
    }

    private fileExists(filename: string, carpeta: string): boolean {
        const filePath = path.join(this.uploadDir, carpeta, path.basename(filename));
        try {
            return fs.existsSync(filePath);
        } catch {
            return false;
        }
    }

    private isValidUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            return ['http:', 'https:'].includes(parsedUrl.protocol);
        } catch {
            return false;
        }
    }

    private sanitizeUrl(url: string): string {
        return url.replace(this.DANGEROUS_CHARS, '');
    }

    private sanitizeFilename(filename: string): string {
        let sanitized = basename(filename);
        sanitized = sanitized.replace(this.DANGEROUS_CHARS, '').trim();

        if (!sanitized) {
            this.logger.warn(`Intento de nombre de archivo vacío: "${filename}"`);
            throw new BadRequestException('Nombre de archivo inválido.');
        }

        return sanitized;
    }

    private getBaseUrl(): string {
        const port = this.configService.get<number>('PORT') || 3010;
        const host = this.configService.get<string>('APP_URL') || `http://localhost:${port}`;
        return host;
    }
}
