// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\ejecutores\tarea-ejecutor.interface.ts
import { EntityManager } from 'typeorm';

export interface TareaEjecutor {
    readonly codigo: string;

    ejecutar(
        manager: EntityManager,
        parametros: Record<string, any> | null,
    ): Promise<void>;
}
