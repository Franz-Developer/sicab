// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\producciones-leche.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduccionesLecheController } from './producciones-leche.controller';
import { ProduccionesLecheService } from './producciones-leche.service';
import { ProduccionLecheDetalleService } from './producciones-leche-detalle.service';
import { ProduccionLeche } from './entities/produccion-leche.entity';
import { ProduccionLecheDetalle } from './entities/produccion-leche-detalle.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProduccionLeche, ProduccionLecheDetalle]),
        ConfigModule,
    ],
    controllers: [ProduccionesLecheController],
    providers: [
        ProduccionesLecheService,
        ProduccionLecheDetalleService
    ],
    exports: [
        ProduccionesLecheService,
        ProduccionLecheDetalleService
    ],
})
export class ProduccionesLecheModule {}
