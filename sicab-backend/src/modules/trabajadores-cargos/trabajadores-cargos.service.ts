// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores-cargos\trabajadores-cargos.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_HISTORICO } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { CreateTrabajadorCargoDto } from './dto/create-trabajador-cargo.dto';
import { TrabajadorCargoResponseDto } from './dto/trabajador-cargo-response.dto';
import { FindTrabajadoresCargosQueryDto } from './dto/find-trabajadores-cargos-query.dto';
import { UpdateTrabajadorCargoDto } from './dto/update-trabajador-cargo.dto';
import { Cargo } from '../cargos/entities/cargo.entity';
import { TrabajadorCargo } from './entities/trabajador-cargo.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class TrabajadoresCargosService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'trabajadores_cargos',
        nombreEntidad: 'TrabajadorCargo',
        campoPK: 'trabajador_cargo_id',
        alias: 't',
        responseDto: TrabajadorCargoResponseDto,
        camposBusquedaEnQ: FindTrabajadoresCargosQueryDto.getCamposParaQ(),
        tablasDependientes: FindTrabajadoresCargosQueryDto.getDependencias(),
        joins: [
            {
                table: 'trabajadores',
                alias: 'tr',
                onCondition: 'tr.trabajador_id = t.trabajador_id',
                selectColumns: [
                    'tr.nombres AS trabajador_nombres',
                    'tr.paterno AS trabajador_paterno',
                    'tr.materno AS trabajador_materno',
                    'tr.dni AS trabajador_dni',
                    'tr.apodo AS trabajador_apodo'
                ],
                type: 'INNER'
            },
            {
                table: 'cargos',
                alias: 'c',
                onCondition: 'c.cargo_id = t.cargo_id',
                selectColumns: [
                    'c.cargo AS cargo_nombre',
                    'c.codigo AS cargo_codigo'
                ],
                type: 'INNER'
            }
        ],
        configuracionFiltros: [
            {
                nombreCampo: 'trabajador_id',
                nombreColumna: 'trabajador_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
            {
                nombreCampo: 'cargo_id',
                nombreColumna: 'cargo_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
            {
                nombreCampo: 'tipo_moneda_id',
                nombreColumna: 'tipo_moneda_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'trabajador_cargo_id',
            camposPermitidosParaOrdenar: FindTrabajadoresCargosQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindTrabajadoresCargosQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindTrabajadoresCargosQueryDto.getCamposProtegidosConDependencias(),
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

    // ============================================================================================
    // ❌ ELIMINADO: esCargoConductor()
    // ❌ ELIMINADO: tieneCategoriaVigente()
    // ❌ ELIMINADO: crearCategoriaInicialSiAplica()
    //
    // Estos métodos implementaban la regla R.8 (integración con conductores_categorias),
    // que pertenece al dominio radiotaxis y NO existe en el DDL de SICAB ganadero.
    // ============================================================================================

    private async heredarSueldoBaseDesdeCargo(
        cargoId: number,
        sueldoBaseRecibido: number | undefined,
        manager: EntityManager,
    ): Promise<number> {
        if (sueldoBaseRecibido !== undefined && sueldoBaseRecibido !== null) {
            return Number(sueldoBaseRecibido);
        }

        const cargo = await manager.findOne(Cargo, {
            where: { cargo_id: cargoId, estado_id: ESTADO_ACTIVO },
        });

        if (!cargo) {
            throw new DomainException(
                `El cargo con ID ${cargoId} no existe o no está activo.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        return Number(cargo.sueldo_base);
    }

    async create(dto: CreateTrabajadorCargoDto, usuarioId: number): Promise<TrabajadorCargoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await Promise.all([
                this.tablaValidador.validarRegistrosActivos('trabajadores', 'trabajador_id', dto.trabajador_id, undefined, manager),
                this.tablaValidador.validarRegistrosActivos('cargos', 'cargo_id', dto.cargo_id, undefined, manager),
                this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [
                        { nombre: 'trabajador_id', valor: dto.trabajador_id }
                    ],
                    estadosValidos: [ESTADO_ACTIVO],
                    campoPk: this.campoPK,
                    mensajePersonalizado: 'El trabajador ya tiene un cargo activo asignado. Debe cerrar el anterior antes de asignar uno nuevo (regla R.2).'
                }, manager),
                this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager)
            ]);

            const sueldoFinal = await this.heredarSueldoBaseDesdeCargo(
                dto.cargo_id,
                dto.sueldo_base,
                manager,
            );

            const asignacion = manager.create(TrabajadorCargo, {
                trabajador_id: dto.trabajador_id,
                cargo_id: dto.cargo_id,
                sueldo_base: sueldoFinal,
                tipo_moneda_id: dto.tipo_moneda_id,
                fecha_desde: dto.fecha_desde ?? new Date(),
                fecha_hasta: null,
                observaciones: dto.observaciones ?? null,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(asignacion);

                // ❌ ELIMINADO: await this.crearCategoriaInicialSiAplica(...)

                return this.findOne<TrabajadorCargoResponseDto>(saved.trabajador_cargo_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la asignación de cargo', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateTrabajadorCargoDto, usuarioId: number): Promise<TrabajadorCargoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const CAMPOS_EDITABLES = [
                'sueldo_base',
                'tipo_moneda_id',
                'observaciones',
                'fecha_desde',
                'fecha_hasta',
            ] as const;

            const dtoFiltrado: Record<string, any> = {};
            for (const key of CAMPOS_EDITABLES) {
                if ((dto as any)[key] !== undefined) {
                    dtoFiltrado[key] = (dto as any)[key];
                }
            }

            if (Object.keys(dtoFiltrado).length === 0) {
                throw new DomainException(
                    'No se enviaron campos editables. Solo se permite modificar: sueldo_base, tipo_moneda_id, observaciones, fecha_desde y fecha_hasta. Para cambiar de cargo, use el endpoint /cambiar-cargo.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dtoFiltrado, this.campoPK, usuarioId, manager);

            const asignacionActual = await manager.findOne(TrabajadorCargo, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' },
            });

            if (!asignacionActual) {
                throw new DomainException(
                    `Asignación de trabajador y cargo no encontrada.`,
                    { id, httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dtoFiltrado,
                FindTrabajadoresCargosQueryDto.getDependencias(),
                FindTrabajadoresCargosQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            Object.assign(asignacionActual, dtoProcesado);
            asignacionActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(asignacionActual);
                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la asignación de cargo', 'actualizar');
            }
        });
    }

    async cambiarCargo(dto: CreateTrabajadorCargoDto, usuarioId: number): Promise<TrabajadorCargoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            // 1. Validar permisos y existencia de FKs
            await Promise.all([
                this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager),
                this.tablaValidador.validarRegistrosActivos('trabajadores', 'trabajador_id', dto.trabajador_id, undefined, manager),
                this.tablaValidador.validarRegistrosActivos('cargos', 'cargo_id', dto.cargo_id, undefined, manager),
                this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager),
            ]);

            // 2. Buscar el cargo ACTIVO actual del trabajador (estado_id = 1000)
            const cargoActivo = await manager.findOne(TrabajadorCargo, {
                where: {
                    trabajador_id: dto.trabajador_id,
                    estado_id: ESTADO_ACTIVO,
                },
                lock: { mode: 'pessimistic_write' },
            });

            // 3. Validar que no esté cambiando al mismo cargo
            if (cargoActivo && cargoActivo.cargo_id === dto.cargo_id) {
                throw new DomainException(
                    `El trabajador ya tiene asignado el cargo con ID ${dto.cargo_id}. Para modificarlo, use el endpoint de actualización (PATCH).`,
                    { httpStatus: HttpStatus.CONFLICT }
                );
            }

            // 4. Cerrar el cargo anterior → pasa a HISTÓRICO (1002)
            if (cargoActivo) {
                await manager.update(
                    TrabajadorCargo,
                    { trabajador_cargo_id: cargoActivo.trabajador_cargo_id },
                    {
                        estado_id: ESTADO_HISTORICO,
                        fecha_hasta: new Date(),
                        usuario_id_actualizacion: Number(usuarioId),
                        fecha_actualizacion: new Date(),
                    },
                );

                this.logger.debug(
                    `Cargo anterior cerrado: ID ${cargoActivo.trabajador_cargo_id} (cargo_id=${cargoActivo.cargo_id}) → HISTÓRICO (1002)`
                );
            }

            // 5. Crear el nuevo cargo ACTIVO
            const sueldoFinal = await this.heredarSueldoBaseDesdeCargo(
                dto.cargo_id,
                dto.sueldo_base,
                manager,
            );

            const nuevoCargo = manager.create(TrabajadorCargo, {
                trabajador_id: dto.trabajador_id,
                cargo_id: dto.cargo_id,
                sueldo_base: sueldoFinal,
                tipo_moneda_id: dto.tipo_moneda_id,
                fecha_desde: dto.fecha_desde ?? new Date(),
                fecha_hasta: null,
                observaciones: dto.observaciones ?? null,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(nuevoCargo);

                // ❌ ELIMINADO: await this.crearCategoriaInicialSiAplica(...)

                return this.findOne<TrabajadorCargoResponseDto>(saved.trabajador_cargo_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en cambiarCargo: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el cambio de cargo', 'crear');
            }
        });
    }
}
