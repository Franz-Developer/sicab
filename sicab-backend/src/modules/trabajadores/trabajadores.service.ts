// C:\sistemas\sicab\sicab-backend\src\modules\trabajadores\trabajadores.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO, Genero, EstadoCivilMasculino, ESTADO_CIVIL_MASCULINO_METADATA, EstadoCivilFemenino, ESTADO_CIVIL_FEMENINO_METADATA, CategoriaLicencia, CATEGORIA_LICENCIA_METADATA } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { ConfiguracionService } from '../../common/services/configuracion.service';
import { FileValidatorService } from '../../common/services/file-validator.service';
import { GenerarQRUtil } from '../../common/services/generar-qr.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { getEnumValues } from '../../common/utils/validation-helper.util';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { TrabajadorResponseDto } from './dto/trabajador-response.dto';
import { FindTrabajadoresQueryDto } from './dto/find-trabajadores-query.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { Trabajador } from './entities/trabajador.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';

@Injectable()
export class TrabajadoresService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'trabajadores',
        nombreEntidad: 'Trabajador',
        campoPK: 'trabajador_id',
        alias: 't',
        responseDto: TrabajadorResponseDto,
        camposBusquedaEnQ: FindTrabajadoresQueryDto.getCamposParaQ(),
        tablasDependientes: FindTrabajadoresQueryDto.getDependencias(),
        joins: [
            {
                table: 'sucursales',
                alias: 's',
                onCondition: 's.sucursal_id = t.sucursal_id',
                selectColumns: ['s.sucursal', 's.codigo AS sucursal_codigo'],
                type: 'INNER',
            },
            {
                table: 'empresas',
                alias: 'e',
                onCondition: 'e.empresa_id = s.empresa_id',
                selectColumns: ['e.empresa', 'e.codigo AS empresa_codigo'],
                type: 'INNER',
            },
            {
                table: 'trabajadores_cargos',
                alias: 'tc',
                onCondition: 'tc.trabajador_id = t.trabajador_id AND tc.estado_id = 1000',
                selectColumns: [],
                type: 'LEFT',
            },
            {
                table: 'cargos',
                alias: 'c',
                onCondition: 'c.cargo_id = tc.cargo_id',
                selectColumns: ['c.cargo', 'c.codigo AS cargo_codigo'],
                type: 'LEFT',
            },
        ],
        configuracionFiltros: [
            { nombreCampo: 'genero_id', nombreColumna: 'genero_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'sucursal_id', nombreColumna: 'sucursal_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'cargo_id', nombreColumna: 'tc.cargo_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'empresa_id', nombreColumna: 's.empresa_id', tipoDatoFiltro: 'number', operador: 'eq' },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'trabajador_id',
            camposPermitidosParaOrdenar: FindTrabajadoresQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindTrabajadoresQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () =>
            FindTrabajadoresQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly unicidadValidador: UnicidadValidadorService,
        private readonly generarQRUtil: GenerarQRUtil,
        private readonly configuracionService: ConfiguracionService,
        private readonly fileValidator: FileValidatorService,
        private readonly imagenValidator: ImagenValidatorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string {
        return this.config.nombreTabla;
    }

    private get campoPK(): string {
        return this.config.campoPK;
    }

    private async validarEstadoCivilPorGenero(
        generoId: number,
        estadoCivilId: number,
    ): Promise<void> {
        const estadosMasculinos = getEnumValues(EstadoCivilMasculino);
        const estadosFemeninos = getEnumValues(EstadoCivilFemenino);

        if (generoId === Genero.MASCULINO && !estadosMasculinos.includes(estadoCivilId)) {
            const valoresValidos = estadosMasculinos
                .map(id => {
                    const meta = ESTADO_CIVIL_MASCULINO_METADATA[id as EstadoCivilMasculino];
                    return `${id}(${meta?.abreviatura ?? 'DESCONOCIDO'})`;
                })
                .join(', ');
            throw new DomainException(
                `El estado civil "${estadoCivilId}" no es válido para género masculino. Valores válidos: ${valoresValidos}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (generoId === Genero.FEMENINO && !estadosFemeninos.includes(estadoCivilId)) {
            const valoresValidos = estadosFemeninos
                .map(id => {
                    const meta = ESTADO_CIVIL_FEMENINO_METADATA[id as EstadoCivilFemenino];
                    return `${id}(${meta?.abreviatura ?? 'DESCONOCIDO'})`;
                })
                .join(', ');
            throw new DomainException(
                `El estado civil "${estadoCivilId}" no es válido para género femenino. Valores válidos: ${valoresValidos}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }
    }

    private async validarCategoriaLicencia(categoriaId: number): Promise<void> {
        const valores = getEnumValues(CategoriaLicencia);
        if (!valores.includes(categoriaId)) {
            const lista = valores
                .map(id => {
                    const meta = CATEGORIA_LICENCIA_METADATA[id as CategoriaLicencia];
                    return `${id}(${meta?.abreviatura ?? 'DESCONOCIDO'})`;
                })
                .join(', ');
            throw new DomainException(
                `La categoría de licencia "${categoriaId}" no es válida. Valores válidos: ${lista}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }
    }

    async create(dto: CreateTrabajadorDto, usuarioId: number): Promise<TrabajadorResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.validarEstadoCivilPorGenero(dto.genero_id, dto.estado_civil_id);
            await this.validarCategoriaLicencia(dto.categoria_licencia_id);

            if (!dto.foto) {
                throw new DomainException(
                    'La foto del trabajador es obligatoria.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            await Promise.all([
                this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campoPk: this.campoPK,
                    campos: [
                        { nombre: 'nombres', valor: dto.nombres },
                        { nombre: 'paterno', valor: dto.paterno },
                        { nombre: 'materno', valor: dto.materno ?? '' },
                    ],
                    estadosValidos: [...ESTADOS_VIVOS],
                }, manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'dni', valor: dto.dni }],
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                }, manager),
                this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campoPk: this.campoPK,
                    campos: [{ nombre: 'apodo', valor: dto.apodo }],
                    estadosValidos: [...ESTADOS_VIVOS],
                }, manager),
                this.tablaValidador.validarRegistrosActivos(
                    'usuarios',
                    'usuario_id',
                    usuarioId,
                    undefined,
                    manager,
                ),
                this.tablaValidador.validarRegistrosActivos(
                    'sucursales',
                    'sucursal_id',
                    dto.sucursal_id ?? 1,
                    undefined,
                    manager,
                ),
            ]);

            const trabajador = manager.create(Trabajador, {
                ...dto,
                foto: dto.foto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(trabajador);

                await this.generarQRUtil.generarQRParaTrabajador(
                    saved.trabajador_id,
                    false,
                    manager,
                );

                return this.findOne<TrabajadorResponseDto>(saved.trabajador_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el trabajador', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateTrabajadorDto, usuarioId: number): Promise<TrabajadorResponseDto> {
        let fotoAnterior: string | undefined;
        let fotoNuevo: string | undefined;

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const trabajadorActual = await manager.findOne(Trabajador, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' },
            });

            if (!trabajadorActual) {
                throw new DomainException('Trabajador no encontrado.', {
                    httpStatus: HttpStatus.NOT_FOUND,
                });
            }

            fotoAnterior = trabajadorActual.foto;

            if (dto.genero_id && dto.estado_civil_id) {
                await this.validarEstadoCivilPorGenero(dto.genero_id, dto.estado_civil_id);
            } else if (dto.genero_id && trabajadorActual.genero_id) {
                await this.validarEstadoCivilPorGenero(dto.genero_id, trabajadorActual.estado_civil_id);
            } else if (dto.estado_civil_id && trabajadorActual.genero_id) {
                await this.validarEstadoCivilPorGenero(trabajadorActual.genero_id, dto.estado_civil_id);
            }

            if (dto.categoria_licencia_id) {
                await this.validarCategoriaLicencia(dto.categoria_licencia_id);
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindTrabajadoresQueryDto.getDependencias(),
                FindTrabajadoresQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager,
            );

            const validaciones: Promise<any>[] = [];

            if (dtoProcesado.nombres || dtoProcesado.paterno || dtoProcesado.materno !== undefined) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campoPk: this.campoPK,
                        idExcluir: id,
                        campos: [
                            { nombre: 'nombres', valor: dtoProcesado.nombres ?? trabajadorActual.nombres },
                            { nombre: 'paterno', valor: dtoProcesado.paterno ?? trabajadorActual.paterno },
                            { nombre: 'materno', valor: dtoProcesado.materno ?? trabajadorActual.materno ?? '' },
                        ],
                        estadosValidos: [...ESTADOS_VIVOS],
                    }, manager),
                );
            }

            if (dtoProcesado.dni) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campoPk: this.campoPK,
                        idExcluir: id,
                        campos: [{ nombre: 'dni', valor: dtoProcesado.dni }],
                        estadosValidos: [...ESTADOS_VIVOS],
                    }, manager),
                );
            }

            if (dtoProcesado.apodo) {
                validaciones.push(
                    this.unicidadValidador.validarUnicidad({
                        tabla: this.nombreTabla,
                        campoPk: this.campoPK,
                        idExcluir: id,
                        campos: [{ nombre: 'apodo', valor: dtoProcesado.apodo }],
                        estadosValidos: [...ESTADOS_VIVOS],
                    }, manager),
                );
            }

            if (
                dtoProcesado.sucursal_id !== undefined &&
                dtoProcesado.sucursal_id !== trabajadorActual.sucursal_id
            ) {
                validaciones.push(
                    this.tablaValidador.validarRegistrosActivos(
                        'sucursales',
                        'sucursal_id',
                        dtoProcesado.sucursal_id,
                        undefined,
                        manager,
                    ),
                );
            }

            if (validaciones.length > 0) {
                await Promise.all(validaciones);
            }

            if (dtoProcesado.foto) {
                if (dtoProcesado.foto === trabajadorActual.foto) {
                    delete dtoProcesado.foto;
                }
            }

            try {
                const camposAfectados = Object.keys(dtoProcesado).filter(
                    key => key !== 'foto' && key !== 'qr',
                );

                if (camposAfectados.length > 0 || dtoProcesado.foto !== undefined) {
                    manager.merge(Trabajador, trabajadorActual, dtoProcesado);
                    trabajadorActual.marcarActualizacion(usuarioId);
                    const saved = await manager.save(trabajadorActual);

                    fotoNuevo = saved.foto;
                }

                const nombreCambio = dtoProcesado.nombres || dtoProcesado.paterno || dtoProcesado.materno !== undefined;
                if (dtoProcesado.dni || nombreCambio) {
                    await this.generarQRUtil.regenerarQR(id, manager);
                }

                return this.findOne<TrabajadorResponseDto>(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el trabajador', 'actualizar');
            }
        });

        if (fotoAnterior && fotoNuevo && fotoAnterior !== fotoNuevo) {
            try {
                await this.imagenValidator.eliminarArchivoFisico(fotoAnterior, 'persons');
                this.logger.debug(`Foto anterior eliminada: ${fotoAnterior}`);
            } catch (error) {
                this.logger.warn(
                    `No se pudo eliminar la foto anterior "${fotoAnterior}": ${getErrorMessage(error)}. ` +
                    `La tarea LIMPIEZA_ARCHIVOS_HUERFANOS la eliminará después.`,
                );
            }
        }

        return result;
    }

    async regenerarQR(id: number, usuarioId: number): Promise<TrabajadorResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarRegistrosActivos(this.nombreTabla, this.campoPK, id, undefined, manager);
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'editar', manager);
            await this.generarQRUtil.regenerarQR(id, manager);
            return this.findOne<TrabajadorResponseDto>(id, usuarioId, manager);
        });
    }

    async obtenerUrlFoto(trabajadorId: number): Promise<string | null> {
        try {
            const trabajador = await this.findOne<Trabajador>(trabajadorId, 1);
            if (!trabajador?.foto) return null;

            const nombreArchivo = trabajador.foto.replace(/^persons\//, '');
            const existe = await this.fileValidator.validarArchivoFisico(nombreArchivo, 'persons');

            if (!existe) return null;

            return `/api/persons/${nombreArchivo}`;
        } catch (error) {
            this.logger.error(`Error al obtener URL de foto para trabajador ${trabajadorId}: ${getErrorMessage(error)}`);
            return null;
        }
    }

    async tieneFotoFisica(trabajadorId: number): Promise<boolean> {
        try {
            const trabajador = await this.findOne<Trabajador>(trabajadorId, 1);
            if (!trabajador?.foto) return false;

            const nombreArchivo = trabajador.foto.replace(/^persons\//, '');
            return this.fileValidator.validarArchivoFisico(nombreArchivo, 'persons');
        } catch (error) {
            this.logger.error(`Error al verificar foto física para trabajador ${trabajadorId}: ${error}`);
            return false;
        }
    }

    async obtenerConfiguracionFotoPublic(): Promise<any> {
        try {
            return await this.configuracionService.obtenerValorTipado<any>('foto_trabajador_config');
        } catch (error) {
            this.logger.error(`Error al obtener configuración de foto: ${error}`);
            return null;
        }
    }

    async validarFotoExistente(nombreFoto: string): Promise<boolean> {
        if (!nombreFoto) {
            return false;
        }

        const nombreArchivo = nombreFoto.replace(/^persons\//, '');
        return this.fileValidator.validarArchivoFisico(nombreArchivo, 'persons');
    }
}
