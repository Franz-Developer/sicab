// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\tipos-semovientes.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposSemovientesController } from './tipos-semovientes.controller';
import { TiposSemovientesService } from './tipos-semovientes.service';
import { TipoSemoviente } from './entities/tipo-semoviente.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TipoSemoviente]),
        ConfigModule,
    ],
    controllers: [TiposSemovientesController],
    providers: [TiposSemovientesService],
    exports: [TiposSemovientesService],
})
export class TiposSemovientesModule {}
