// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\tipos-semovientes.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateTipoSemovienteDto } from './dto/create-tipo-semoviente.dto';
import { TipoSemovienteResponseDto } from './dto/tipo-semoviente-response.dto';
import { FindTiposSemovientesQueryDto } from './dto/find-tipos-semovientes-query.dto';
import { UpdateTipoSemovienteDto } from './dto/update-tipo-semoviente.dto';
import { TipoSemoviente } from './entities/tipo-semoviente.entity';

@Injectable()
export class TiposSemovientesService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'tipos_semovientes',
        nombreEntidad: 'Tipo de Semoviente',
        campoPK: 'tipo_id',
        alias: 't',
        responseDto: TipoSemovienteResponseDto,
        camposBusquedaEnQ: FindTiposSemovientesQueryDto.getCamposParaQ(),
        tablasDependientes: FindTiposSemovientesQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [],
        camposFiltroEspecial: [],
        configuracionOrden: {
            campoOrdenPorDefecto: 'tipo_id',
            camposPermitidosParaOrdenar: FindTiposSemovientesQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindTiposSemovientesQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindTiposSemovientesQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly unicidadValidador: UnicidadValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    async create(dto: CreateTipoSemovienteDto, usuarioId: number): Promise<TipoSemovienteResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'semoviente', valor: dto.semoviente }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                caseInsensitive: false,
                mensajePersonalizado: `Ya existe un tipo de semoviente con el nombre "${dto.semoviente}".`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const entity = manager.create(TipoSemoviente, {
                ...dto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(entity);
                return this.findOne<TipoSemovienteResponseDto>(saved.tipo_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el tipo de semoviente', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateTipoSemovienteDto, usuarioId: number): Promise<TipoSemovienteResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException('No se enviaron campos para actualizar.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const actual = await manager.findOne(TipoSemoviente, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!actual) {
                throw new DomainException('Tipo de semoviente no encontrado.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla, id, dto, FindTiposSemovientesQueryDto.getDependencias(),
                FindTiposSemovientesQueryDto.getCamposProtegidosConDependencias(), this.campoPK, usuarioId, manager
            );

            if (dtoProcesado.semoviente !== undefined) {
                await this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'semoviente', valor: dtoProcesado.semoviente }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe otro tipo de semoviente con el nombre "${dtoProcesado.semoviente}".`
                }, manager);
            }

            manager.merge(TipoSemoviente, actual, dtoProcesado);
            actual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(actual);
                return this.findOne<TipoSemovienteResponseDto>(saved.tipo_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - tipos-semovientes ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el tipo de semoviente', 'actualizar');
            }
        });
    }
}
