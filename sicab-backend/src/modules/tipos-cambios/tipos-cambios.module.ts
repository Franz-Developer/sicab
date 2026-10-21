// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\tipos-cambios.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiposCambiosController } from './tipos-cambios.controller';
import { TiposCambiosService } from './tipos-cambios.service';
import { TipoCambio } from './entities/tipo-cambio.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([TipoCambio]),
        ConfigModule,
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 3,
        }),
    ],
    controllers: [TiposCambiosController],
    providers: [
        TiposCambiosService,
    ],
    exports: [
        TiposCambiosService,
    ],
})
export class TiposCambiosModule {}
