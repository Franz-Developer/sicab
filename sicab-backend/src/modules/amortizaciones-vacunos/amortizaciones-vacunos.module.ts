// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\amortizaciones-vacunos.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmortizacionesVacunosController } from './amortizaciones-vacunos.controller';
import { AmortizacionesVacunosService } from './amortizaciones-vacunos.service';
import { AmortizacionVacuno } from './entities/amortizacion-vacuno.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AmortizacionVacuno]),
        ConfigModule,
    ],
    controllers: [AmortizacionesVacunosController],
    providers: [AmortizacionesVacunosService],
    exports: [AmortizacionesVacunosService],
})
export class AmortizacionesVacunosModule {}
