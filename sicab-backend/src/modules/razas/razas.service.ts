// C:\sistemas\sicab\sicab-backend\src\modules\razas\razas.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateRazaDto } from './dto/create-raza.dto';
import { RazaResponseDto } from './dto/raza-response.dto';
import { FindRazasQueryDto } from './dto/find-razas-query.dto';
import { UpdateRazaDto } from './dto/update-raza.dto';
import { Raza } from './entities/raza.entity';

@Injectable()
export class RazasService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'razas',
        nombreEntidad: 'Raza',
        campoPK: 'raza_id',
        alias: 't',
        responseDto: RazaResponseDto,
        camposBusquedaEnQ: FindRazasQueryDto.getCamposParaQ(),
        tablasDependientes: FindRazasQueryDto.getDependencias(),
        joins: [
            {
                table: 'tipos_semovientes',
                alias: 'ts',
                onCondition: 'ts.tipo_id = t.tipo_semoviente_id',
                selectColumns: ['ts.semoviente AS tipo_semoviente_nombre'],
                type: 'INNER'
            }
        ],
        configuracionFiltros: [
            {
                nombreCampo: 'tipo_semoviente_id',
                nombreColumna: 'tipo_semoviente_id',
                tipoDatoFiltro: 'number',
                operador: 'eq'
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'raza_id',
            camposPermitidosParaOrdenar: FindRazasQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindRazasQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindRazasQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
        private readonly unicidadValidador: UnicidadValidadorService,
        private readonly imagenValidator: ImagenValidatorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    async create(dto: CreateRazaDto, usuarioId: number): Promise<RazaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            // ⚠️ VALIDAR que tipo_semoviente_id exista y esté ACTIVO
            await this.tablaValidador.validarRegistrosActivos(
                'tipos_semovientes',
                'tipo_id',
                dto.tipo_semoviente_id,
                undefined,
                manager
            );

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'raza', valor: dto.raza }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una raza registrada con el nombre '${dto.raza}'.`
            }, manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'codigo', valor: dto.codigo }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una raza registrada con el código '${dto.codigo}'.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const raza = manager.create(Raza, {
                ...dto,
                descripcion: dto.descripcion ?? null,
                origen: dto.origen ?? null,
                peso_promedio_adulto: dto.peso_promedio_adulto ?? null,
                foto: dto.foto ?? null,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(raza);
                return this.findOne<RazaResponseDto>(saved.raza_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la raza', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateRazaDto, usuarioId: number): Promise<RazaResponseDto> {
        let fotoAnterior: string | undefined;
        let fotoNuevo: string | undefined;

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const razaActual = await manager.findOne(Raza, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!razaActual) {
                throw new DomainException('Raza no encontrada.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            fotoAnterior = razaActual.foto ?? undefined;

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindRazasQueryDto.getDependencias(),
                FindRazasQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            // ⚠️ VALIDAR que tipo_semoviente_id exista si va a cambiar
            if (dtoProcesado.tipo_semoviente_id != null && dtoProcesado.tipo_semoviente_id !== razaActual.tipo_semoviente_id) {
                await this.tablaValidador.validarRegistrosActivos(
                    'tipos_semovientes',
                    'tipo_id',
                    dtoProcesado.tipo_semoviente_id,
                    undefined,
                    manager
                );
            }

            const validaciones: Promise<void>[] = [];

            if (dtoProcesado.raza != null && dtoProcesado.raza !== razaActual.raza) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'raza', valor: dtoProcesado.raza }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una raza registrada con el nombre '${dtoProcesado.raza}'.`
                }, manager));
            }

            if (dtoProcesado.codigo != null && dtoProcesado.codigo !== razaActual.codigo) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'codigo', valor: dtoProcesado.codigo }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una raza registrada con el código '${dtoProcesado.codigo}'.`
                }, manager));
            }

            await Promise.all(validaciones);

            if (dtoProcesado.foto) {
                if (dtoProcesado.foto === razaActual.foto) {
                    delete dtoProcesado.foto;
                }
            }

            manager.merge(Raza, razaActual, dtoProcesado);
            razaActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(razaActual);
                fotoNuevo = saved.foto ?? undefined;
                return this.findOne<RazaResponseDto>(saved.raza_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - razas ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la raza', 'actualizar');
            }
        });

        if (fotoAnterior && fotoNuevo && fotoAnterior !== fotoNuevo) {
            try {
                await this.imagenValidator.eliminarArchivoFisico(fotoAnterior, 'razas_fotos');
                this.logger.debug(`Foto anterior eliminada: ${fotoAnterior}`);
            } catch (error) {
                this.logger.warn(
                    `No se pudo eliminar la foto anterior "${fotoAnterior}": ${getErrorMessage(error)}. ` +
                    `La tarea LIMPIEZA_ARCHIVOS_HUERFANOS la eliminará después.`
                );
            }
        }

        return result;
    }
}
