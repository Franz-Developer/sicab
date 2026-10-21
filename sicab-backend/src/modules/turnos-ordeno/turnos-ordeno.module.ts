// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\turnos-ordeno.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnosOrdenoController } from './turnos-ordeno.controller';
import { TurnosOrdenoService } from './turnos-ordeno.service';
import { TurnoOrdeno } from './entities/turno-ordeno.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TurnoOrdeno]),
        ConfigModule,
    ],
    controllers: [TurnosOrdenoController],
    providers: [TurnosOrdenoService],
    exports: [TurnosOrdenoService],
})
export class TurnosOrdenoModule {}
