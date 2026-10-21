// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores-cargos\trabajadores-cargos.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrabajadoresCargosController } from './trabajadores-cargos.controller';
import { TrabajadoresCargosService } from './trabajadores-cargos.service';
import { TrabajadorCargo } from './entities/trabajador-cargo.entity';
import { Cargo } from '../cargos/entities/cargo.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TrabajadorCargo,
            Cargo,
        ]),
        ConfigModule,
    ],
    controllers: [TrabajadoresCargosController],
    providers: [TrabajadoresCargosService],
    exports: [TrabajadoresCargosService],
})
export class TrabajadoresCargosModule {}
