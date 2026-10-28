// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\scheduler\tareas-scheduler.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { DataSource, EntityManager } from 'typeorm';
import { Estado } from '../../../common/constants/estados.constant';
import { TareaDispatcherService } from '../ejecutores/tarea-dispatcher.service';
import { resolverCron } from './cron-resolver.util';

interface TareaSchedulerRow {
    tarea_id: number;
    codigo: string;
    frecuencia_id: number;
    cron_expresion: string | null;
    parametros: Record<string, any> | null;
    estado_id: number;
}

@Injectable()
export class TareasSchedulerService implements OnModuleInit {
    private readonly logger = new Logger(TareasSchedulerService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly dispatcher: TareaDispatcherService,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.cargarYRegistrarTodas();
    }

    private async cargarYRegistrarTodas(): Promise<void> {
        const tareas: TareaSchedulerRow[] = await this.dataSource.query(
            `SELECT tarea_id, codigo, frecuencia_id, cron_expresion, parametros, estado_id
             FROM tareas_programadas
             WHERE estado_id = $1
               AND tarea_id <> 1`,
            [Estado.ACTIVO],
        );

        let registradas = 0;

        for (const tarea of tareas) {
            if (this.registrarCronJob(tarea)) registradas++;
        }

        this.logger.log(`Scheduler inicializado: ${registradas}/${tareas.length} tarea(s) ACTIVA(S) programada(s).`);
    }

    registrarCronJob(tarea: TareaSchedulerRow): boolean {
        const expr = resolverCron(tarea.frecuencia_id, tarea.cron_expresion);

        if (!expr) {
            this.logger.warn(
                `Tarea "${tarea.codigo}" no se programa (frecuencia_id=${tarea.frecuencia_id} sin cron válido).`,
            );
            return false;
        }

        if (this.schedulerRegistry.doesExist('cron', tarea.codigo)) {
            this.schedulerRegistry.deleteCronJob(tarea.codigo);
        }

        const job = new CronJob(expr, () => this.ejecutarSeguro(tarea.codigo));

        this.schedulerRegistry.addCronJob(tarea.codigo, job);
        job.start();

        this.logger.log(`CronJob registrado: "${tarea.codigo}" → ${expr}`);
        return true;
    }

    detenerCronJob(codigo: string): void {
        if (this.schedulerRegistry.doesExist('cron', codigo)) {
            this.schedulerRegistry.deleteCronJob(codigo);
            this.logger.log(`CronJob detenido: "${codigo}"`);
        }
    }

    async reprogramarCronJob(tareaId: number, manager?: EntityManager): Promise<void> {
        const executor = manager ?? this.dataSource;

        const [tarea]: TareaSchedulerRow[] = await executor.query(
            `SELECT tarea_id, codigo, frecuencia_id, cron_expresion, parametros, estado_id
             FROM tareas_programadas
             WHERE tarea_id = $1`,
            [tareaId],
        );

        if (!tarea) {
            this.logger.warn(`No se encontró tarea_id=${tareaId} para reprogramar.`);
            return;
        }

        if (tarea.estado_id !== Estado.ACTIVO) {
            this.detenerCronJob(tarea.codigo);
            return;
        }

        this.registrarCronJob(tarea);
    }

    private async ejecutarSeguro(codigo: string): Promise<void> {
        try {
            const [tarea] = await this.dataSource.query(
                `SELECT tarea_id, parametros, estado_id, intentos_fallidos, notificar_admin, nombre
                 FROM tareas_programadas
                 WHERE codigo = $1`,
                [codigo],
            );

            if (!tarea) {
                this.logger.warn(`Tarea "${codigo}" no existe en BD. Se detiene el CronJob.`);
                this.detenerCronJob(codigo);
                return;
            }

            if (tarea.estado_id !== Estado.ACTIVO) {
                this.logger.warn(`Tarea "${codigo}" ya no está ACTIVA (estado=${tarea.estado_id}). Se omite ejecución.`);
                this.detenerCronJob(codigo);
                return;
            }

            await this.dispatcher.ejecutar(codigo, tarea.parametros);

            await this.dataSource.query(
                `UPDATE tareas_programadas
                 SET ultima_ejecucion = CURRENT_TIMESTAMP,
                     intentos_fallidos = 0,
                     ultimo_error = NULL,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE codigo = $1 AND estado_id = $2`,
                [codigo, Estado.ACTIVO],
            );
        } catch (error: unknown) {
            await this.registrarFallo(codigo, error);
        }
    }

    private async registrarFallo(codigo: string, error: unknown): Promise<void> {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Tarea "${codigo}" falló: ${msg}`);

        try {
            await this.dataSource.query(
                `UPDATE tareas_programadas
                 SET intentos_fallidos = intentos_fallidos + 1,
                     ultimo_error = $1,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE codigo = $2 AND estado_id = $3`,
                [msg, codigo, Estado.ACTIVO],
            );
        } catch (updateError) {
            this.logger.error(`No se pudo registrar el fallo de "${codigo}": ${updateError}`);
        }
    }
}
