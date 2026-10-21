// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\vacunos-pesajes.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacunosPesajesController } from './vacunos-pesajes.controller';
import { VacunosPesajesService } from './vacunos-pesajes.service';
import { VacunoPesaje } from './entities/vacuno-pesaje.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([VacunoPesaje]),
        ConfigModule,
    ],
    controllers: [VacunosPesajesController],
    providers: [VacunosPesajesService],
    exports: [VacunosPesajesService],
})
export class VacunosPesajesModule {}
