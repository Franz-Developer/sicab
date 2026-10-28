// C:\sistemas\sicab\sicab-backend\src\modules\reportes\reportes.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([]),
    ],
    controllers: [ReportesController],
    providers: [ReportesService],
    exports: [ReportesService],
})
export class ReportesModule {}