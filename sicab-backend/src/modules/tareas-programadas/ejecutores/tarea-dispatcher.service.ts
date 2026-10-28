// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\ejecutores\tarea-dispatcher.service.ts
// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\ejecutores\tarea-dispatcher.service.ts
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TareaEjecutor } from './tarea-ejecutor.interface';
import { CalculoCategoriasEjecutor } from './calculo-categorias.ejecutor';
import { runInTransaction } from '../../../common/utils/transaction.helper';
import { DomainException } from '../../../common/exceptions/domain.exception';

@Injectable()
export class TareaDispatcherService {
    private readonly logger = new Logger(TareaDispatcherService.name);
    private readonly ejecutores: Map<string, TareaEjecutor>;

    constructor(
        private readonly dataSource: DataSource,
        calculoCategorias: CalculoCategoriasEjecutor,
    ) {
        this.ejecutores = new Map<string, TareaEjecutor>([
            [calculoCategorias.codigo, calculoCategorias],
        ]);
    }

    async ejecutar(codigo: string, parametros: Record<string, any> | null): Promise<void> {
        const ejecutor = this.ejecutores.get(codigo);

        if (!ejecutor) {
            throw new DomainException(
                `No existe un ejecutor registrado para la tarea "${codigo}". ` +
                `Verifique que el código coincida exactamente con un archivo en ejecutores/.`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }

        this.logger.log(`Ejecutando tarea "${codigo}"...`);

        await runInTransaction(this.dataSource, async (manager) => {
            await ejecutor.ejecutar(manager, parametros);
        });

        this.logger.log(`Tarea "${codigo}" completada.`);
    }
}
