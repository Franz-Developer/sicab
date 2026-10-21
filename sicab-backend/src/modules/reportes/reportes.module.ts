// C:\sistemas\sicab\sicab-backend\src\modules\reportes\reportes.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
    imports: [ConfigModule],
    controllers: [ReportesController],
    providers: [ReportesService],
    exports: [ReportesService],
})
export class ReportesModule {}
