// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\tareas-programadas.service.ts
// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\tareas-programadas.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADO_ACTIVO, Frecuencia } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { FindTareasProgramadasQueryDto } from './dto/find-tareas-programadas-query.dto';
import { TareaProgramadaResponseDto } from './dto/tarea-programada-response.dto';
import { UpdateTareaProgramadaDto } from './dto/update-tarea-programada.dto';
import { TareaProgramada } from './entities/tarea-programada.entity';
import { TareasSchedulerService } from './scheduler/tareas-scheduler.service';

@Injectable()
export class TareasProgramadasService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'tareas_programadas',
        nombreEntidad: 'Tarea Programada',
        campoPK: 'tarea_id',
        alias: 't',
        responseDto: TareaProgramadaResponseDto,
        camposBusquedaEnQ: FindTareasProgramadasQueryDto.getCamposParaQ(),
        tablasDependientes: [],
        joins: [],
        configuracionFiltros: [
            { nombreCampo: 'tipo_tarea_id',    nombreColumna: 'tipo_tarea_id',    tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'frecuencia_id',    nombreColumna: 'frecuencia_id',    tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'notificar_admin',  nombreColumna: 'notificar_admin',  tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'codigo',           nombreColumna: 'codigo',           tipoDatoFiltro: 'string', operador: 'ieq' },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'tarea_id',
            camposPermitidosParaOrdenar: FindTareasProgramadasQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindTareasProgramadasQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindTareasProgramadasQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource()
        dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly schedulerService: TareasSchedulerService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string {
        return this.config.nombreTabla;
    }

    private get campoPK(): string {
        return this.config.campoPK;
    }

    async update(id: number, dto: UpdateTareaProgramadaDto, usuarioId: number): Promise<TareaProgramadaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const tareaActual = await manager.findOne(TareaProgramada, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!tareaActual) {
                throw new DomainException(
                    'Tarea programada no encontrada.',
                    { httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const frecuenciaFinal = dto.frecuencia_id ?? tareaActual.frecuencia_id;
            const cronFinal = dto.cron_expresion !== undefined ? dto.cron_expresion : tareaActual.cron_expresion;

            if (frecuenciaFinal === Frecuencia.CRON && (!cronFinal || !String(cronFinal).trim())) {
                throw new DomainException('Si la frecuencia es CRON, la expresión cron es obligatoria.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            if (frecuenciaFinal !== Frecuencia.CRON && cronFinal !== undefined && cronFinal !== null && String(cronFinal).trim() !== '') {
                throw new DomainException(`cron_expresion solo es válida cuando frecuencia_id = ${Frecuencia.CRON} (CRON).`, { httpStatus: HttpStatus.BAD_REQUEST });
            }

            if (dto.descripcion !== undefined)     tareaActual.descripcion = dto.descripcion?.trim() || null;
            if (dto.frecuencia_id !== undefined)   tareaActual.frecuencia_id = dto.frecuencia_id;
            if (dto.parametros !== undefined)      tareaActual.parametros = dto.parametros ?? null;
            if (dto.notificar_admin !== undefined) tareaActual.notificar_admin = Number(dto.notificar_admin);

            if (tareaActual.frecuencia_id === Frecuencia.CRON) {
                if (dto.cron_expresion !== undefined) {
                    tareaActual.cron_expresion = dto.cron_expresion?.trim() || null;
                }
            } else {
                tareaActual.cron_expresion = null;
            }

            tareaActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(tareaActual);
                await this.schedulerService.reprogramarCronJob(id, manager);

                return this.findOne<TareaProgramadaResponseDto>(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la tarea programada', 'actualizar');
            }
        });
    }
}
