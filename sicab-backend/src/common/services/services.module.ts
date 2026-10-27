// C:\sistemas\sicab\sicab-backend\src\common\services\services.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { CacheModule } from './cache.module';
import { DataSourceAdapter } from './data-source-adapter.service';
import { FileUrlService } from './file-url.service';
import { FileValidatorService } from './file-validator.service';
import { ConfiguracionService } from './configuracion.service';
import { GenerarQRUtil } from './generar-qr.service';
import { ScoringService } from './scoring.service';
import { NotificacionService } from './notificacion.service';
import { AreteService } from './arete.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        CacheModule,
    ],
    providers: [
        FileUrlService,
        FileValidatorService,
        ConfiguracionService,
        GenerarQRUtil,
        ScoringService,
        NotificacionService,
        AreteService,
        {
            provide: 'IDataSource',
            useFactory: (dataSource: DataSource) => new DataSourceAdapter(dataSource),
            inject: [DataSource],
        },
    ],
    exports: [
        FileUrlService,
        FileValidatorService,
        ConfiguracionService,
        GenerarQRUtil,
        ScoringService,
        NotificacionService,
        'IDataSource',
        CacheModule,
        AreteService,
    ],
})
export class ServicesModule {}
