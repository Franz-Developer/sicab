// C:\sistemas\sicab\sicab-backend\src\scripts\generar-env-keys.ts
import * as fs from 'fs';
import * as path from 'path';

const certsDir = path.join(process.cwd(), 'src/config/certs');

const privateKeyPath = path.join(certsDir, 'prisma-private.pem');
const publicKeyPath = path.join(certsDir, 'prisma-public.pem');

if (!fs.existsSync(privateKeyPath)) {
    console.error(`❌ No se encontró: ${privateKeyPath}`);
    process.exit(1);
}

if (!fs.existsSync(publicKeyPath)) {
    console.error(`❌ No se encontró: ${publicKeyPath}`);
    process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');

const publicKey = fs.readFileSync(publicKeyPath, 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n');

console.log('');
console.log('==========================================================');
console.log('COPIA ESTAS LÍNEAS EN TU .env');
console.log('==========================================================');
console.log('');
console.log(`JWT_PRIVATE_KEY="${privateKey}"`);
console.log('');
console.log(`JWT_PUBLIC_KEY="${publicKey}"`);
console.log('');
console.log('==========================================================');
