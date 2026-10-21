// C:\sistemas\sicab\sicab-backend\src\common\utils\upload.helper.ts
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomBytes } from 'crypto';

export interface UploadConfig {
    allowedFormats: string[];
    allowedExtensions: string[];
    maxSize: number;
    destination: string;
}

const generarNombreUnico = (): string => {
    const timestamp = Date.now();
    const random = randomBytes(3).toString('hex');
    return `${timestamp}-${random}`;
};

export const createUploadStorage = (config: UploadConfig) => {
    return diskStorage({
        destination: (_req, _file, cb) => {
            const dir = join(process.cwd(), 'uploads', config.destination);
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (_req, file, cb) => {
            const ext = extname(file.originalname).toLowerCase().replace('.', '');
            const base = generarNombreUnico();
            cb(null, `${base}.${ext}`);
        },
    });
};

export const createUploadFileFilter = (_config: UploadConfig) => {
    return (_req: any, file: Express.Multer.File, cb: any) => {
        const ext = extname(file.originalname).toLowerCase().replace('.', '');

        const blacklist = [
            'exe', 'dll', 'msi', 'com', 'scr',
            'bat', 'cmd', 'ps1', 'sh',
            'php', 'py', 'rb', 'pl',
        ];

        if (blacklist.includes(ext)) {
            return cb(
                new BadRequestException(`Extensión .${ext} no permitida por seguridad.`),
                false,
            );
        }

        cb(null, true);
    };
};
