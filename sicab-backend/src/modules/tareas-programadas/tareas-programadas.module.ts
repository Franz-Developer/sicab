// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\tareas-programadas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TareaProgramada } from './entities/tarea-programada.entity';
import { TareasProgramadasController } from './tareas-programadas.controller';
import { TareasProgramadasService } from './tareas-programadas.service';
import { TareasSchedulerService } from './scheduler/tareas-scheduler.service';
import { TareaDispatcherService } from './ejecutores/tarea-dispatcher.service';
import { CalculoCategoriasEjecutor } from './ejecutores/calculo-categorias.ejecutor';

@Module({
    imports: [
        TypeOrmModule.forFeature([TareaProgramada]),
    ],
    controllers: [TareasProgramadasController],
    providers: [
        TareasProgramadasService,
        TareasSchedulerService,
        TareaDispatcherService,
        CalculoCategoriasEjecutor,
    ],
    exports: [TareasProgramadasService],
})
export class TareasProgramadasModule {}
