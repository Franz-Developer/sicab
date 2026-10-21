// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\vacunos.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacunosController } from './vacunos.controller';
import { VacunosService } from './vacunos.service';
import { Vacuno } from './entities/vacuno.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vacuno]),
        ConfigModule,
    ],
    controllers: [VacunosController],
    providers: [VacunosService],
    exports: [VacunosService],
})
export class VacunosModule {}
