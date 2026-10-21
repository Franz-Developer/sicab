// C:\sistemas\sicab\sicab-backend\src\modules\cargos\cargos.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADO_ACTIVO, ESTADOS_VIVOS } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { CargoResponseDto } from './dto/cargo-response.dto';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { FindCargosQueryDto } from './dto/find-cargos-query.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { Cargo } from './entities/cargo.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class CargosService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'cargos',
        nombreEntidad: 'Cargo',
        campoPK: 'cargo_id',
        alias: 't',
        responseDto: CargoResponseDto,
        camposBusquedaEnQ: FindCargosQueryDto.getCamposParaQ(),
        tablasDependientes: FindCargosQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [
            {
                nombreCampo: 'codigo',
                nombreColumna: 'codigo',
                tipoDatoFiltro: 'string',
                operador: 'ieq',
            },
            {
                nombreCampo: 'tipo_moneda_id',
                nombreColumna: 'tipo_moneda_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'cargo_id',
            camposPermitidosParaOrdenar: FindCargosQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindCargosQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindCargosQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource()
        dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly unicidadValidador: UnicidadValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string {
        return this.config.nombreTabla;
    }

    private get campoPK(): string {
        return this.config.campoPK;
    }

    async create(dto: CreateCargoDto, usuarioId: number): Promise<CargoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await Promise.all([
                this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [
                        { nombre: 'cargo', valor: dto.cargo },
                        { nombre: 'tipo_moneda_id', valor: dto.tipo_moneda_id },
                    ],
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe el cargo "${dto.cargo}" con la moneda seleccionada.`,
                }, manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [
                        { nombre: 'codigo', valor: dto.codigo },
                        { nombre: 'tipo_moneda_id', valor: dto.tipo_moneda_id },
                    ],
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe el código "${dto.codigo}" con la moneda seleccionada.`,
                }, manager),
                this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager),
            ]);

            const cargo = manager.create(Cargo, {
                ...dto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(cargo);
                return this.findOne<CargoResponseDto>(saved.cargo_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el cargo', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateCargoDto, usuarioId: number): Promise<CargoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const cargoActual = await manager.findOne(Cargo, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!cargoActual) {
                throw new DomainException(
                    `Cargo no encontrado.`,
                    { httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindCargosQueryDto.getDependencias(),
                FindCargosQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            const validaciones: Promise<any>[] = [];

            const nuevoCargo = dtoProcesado.cargo ?? cargoActual.cargo;
            const nuevoCodigo = dtoProcesado.codigo ?? cargoActual.codigo;
            const nuevoTipoMoneda = dtoProcesado.tipo_moneda_id ?? cargoActual.tipo_moneda_id;

            const cambiaCargo = dtoProcesado.cargo !== undefined && dtoProcesado.cargo !== cargoActual.cargo;
            const cambiaCodigo = dtoProcesado.codigo !== undefined && dtoProcesado.codigo !== cargoActual.codigo;
            const cambiaTipoMoneda = dtoProcesado.tipo_moneda_id !== undefined && dtoProcesado.tipo_moneda_id !== cargoActual.tipo_moneda_id;

            if (cambiaCargo || cambiaTipoMoneda) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campos: [
                            { nombre: 'cargo', valor: nuevoCargo },
                            { nombre: 'tipo_moneda_id', valor: nuevoTipoMoneda },
                        ],
                        idExcluir: id,
                        campoPk: this.campoPK,
                        estadosValidos: [...ESTADOS_VIVOS],
                        mensajePersonalizado: `Ya existe el cargo "${nuevoCargo}" con la moneda seleccionada.`,
                    }, manager)
                );
            }

            if (cambiaCodigo || cambiaTipoMoneda) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campos: [
                            { nombre: 'codigo', valor: nuevoCodigo },
                            { nombre: 'tipo_moneda_id', valor: nuevoTipoMoneda },
                        ],
                        idExcluir: id,
                        campoPk: this.campoPK,
                        estadosValidos: [...ESTADOS_VIVOS],
                        mensajePersonalizado: `Ya existe el código "${nuevoCodigo}" con la moneda seleccionada.`,
                    }, manager)
                );
            }

            if (validaciones.length > 0) {
                await Promise.all(validaciones);
            }

            Object.assign(cargoActual, dtoProcesado);
            cargoActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(cargoActual);
                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el cargo', 'actualizar');
            }
        });
    }
}
