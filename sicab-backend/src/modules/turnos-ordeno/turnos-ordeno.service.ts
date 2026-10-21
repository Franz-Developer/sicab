// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\turnos-ordeno.service.ts
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
import { CreateTurnoOrdenoDto } from './dto/create-turno-ordeno.dto';
import { TurnoOrdenoResponseDto } from './dto/turno-ordeno-response.dto';
import { FindTurnosOrdenoQueryDto } from './dto/find-turnos-ordeno-query.dto';
import { UpdateTurnoOrdenoDto } from './dto/update-turno-ordeno.dto';
import { TurnoOrdeno } from './entities/turno-ordeno.entity';

@Injectable()
export class TurnosOrdenoService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'turnos_ordeno',
        nombreEntidad: 'Turno de Ordeño',
        campoPK: 'turno_ordeno_id',
        alias: 't',
        responseDto: TurnoOrdenoResponseDto,
        camposBusquedaEnQ: FindTurnosOrdenoQueryDto.getCamposParaQ(),
        tablasDependientes: FindTurnosOrdenoQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [],
        configuracionOrden: {
            campoOrdenPorDefecto: 'turno_ordeno_id',
            camposPermitidosParaOrdenar: FindTurnosOrdenoQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindTurnosOrdenoQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindTurnosOrdenoQueryDto.getCamposProtegidosConDependencias(),
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

    private validarHoras(horaInicio: string, horaFin: string): void {
        if (horaFin <= horaInicio) {
            throw new DomainException(
                'La hora de fin debe ser mayor que la hora de inicio.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }
    }

    async create(dto: CreateTurnoOrdenoDto, usuarioId: number): Promise<TurnoOrdenoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            this.validarHoras(dto.hora_inicio, dto.hora_fin);

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'turno', valor: dto.turno }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe un turno registrado con el nombre '${dto.turno}'.`
            }, manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'codigo', valor: dto.codigo }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe un turno registrado con el código '${dto.codigo}'.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const turno = manager.create(TurnoOrdeno, {
                ...dto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(turno);
                return this.findOne<TurnoOrdenoResponseDto>(saved.turno_ordeno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el turno de ordeño', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateTurnoOrdenoDto, usuarioId: number): Promise<TurnoOrdenoResponseDto> {
        const result = await runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException('No se enviaron campos para actualizar.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const turnoActual = await manager.findOne(TurnoOrdeno, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!turnoActual) {
                throw new DomainException('Turno de ordeño no encontrado.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const horaInicio = dto.hora_inicio ?? turnoActual.hora_inicio;
            const horaFin = dto.hora_fin ?? turnoActual.hora_fin;
            this.validarHoras(horaInicio, horaFin);

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla, id, dto, FindTurnosOrdenoQueryDto.getDependencias(),
                FindTurnosOrdenoQueryDto.getCamposProtegidosConDependencias(), this.campoPK, usuarioId, manager
            );

            const validaciones: Promise<void>[] = [];

            if (dtoProcesado.turno != null && dtoProcesado.turno !== turnoActual.turno) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'turno', valor: dtoProcesado.turno }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe un turno registrado con el nombre '${dtoProcesado.turno}'.`
                }, manager));
            }

            if (dtoProcesado.codigo != null && dtoProcesado.codigo !== turnoActual.codigo) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'codigo', valor: dtoProcesado.codigo }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe un turno registrado con el código '${dtoProcesado.codigo}'.`
                }, manager));
            }

            await Promise.all(validaciones);

            manager.merge(TurnoOrdeno, turnoActual, dtoProcesado);
            turnoActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(turnoActual);
                return this.findOne<TurnoOrdenoResponseDto>(saved.turno_ordeno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - turnos-ordeno ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el turno de ordeño', 'actualizar');
            }
        });

        return result;
    }
}
