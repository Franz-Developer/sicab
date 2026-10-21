// C:\sistemas\sicab\sicab-backend\src\modules\razas\razas.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazasController } from './razas.controller';
import { RazasService } from './razas.service';
import { Raza } from './entities/raza.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Raza]),
        ConfigModule,
    ],
    controllers: [RazasController],
    providers: [RazasService],
    exports: [RazasService],
})
export class RazasModule {}
