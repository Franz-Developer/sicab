// C:\sistemas\sicab\sicab-backend\src\common\validators\validators.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametroGlobal } from '../../modules/parametros-globales/entities/parametro-global.entity';
import { ImagenValidatorService } from './imagen-validator.service';
import { RangoValidadorService, CompareFields } from './compare-fields.validator';
import { TablaValidadorService } from './tabla-validador.service';
import { UnicidadValidadorService } from './unicidad-validador.service';
import { VacunoValidadorService } from './vacuno-validador.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([ParametroGlobal])],
    providers: [
        TablaValidadorService,
        UnicidadValidadorService,
        ImagenValidatorService,
        RangoValidadorService,
        CompareFields,
        VacunoValidadorService,
    ],
    exports: [
        TablaValidadorService,
        UnicidadValidadorService,
        ImagenValidatorService,
        RangoValidadorService,
        VacunoValidadorService,
    ],
})
export class ValidatorsModule {}
