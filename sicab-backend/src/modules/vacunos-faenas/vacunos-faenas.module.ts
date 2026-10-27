// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\vacunos-faenas.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacunosFaenasController } from './vacunos-faenas.controller';
import { VacunosFaenasService } from './vacunos-faenas.service';
import { VacunoFaena } from './entities/vacuno-faena.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([VacunoFaena]),
        ConfigModule,
    ],
    controllers: [VacunosFaenasController],
    providers: [VacunosFaenasService],
    exports: [VacunosFaenasService],
})
export class VacunosFaenasModule {}
