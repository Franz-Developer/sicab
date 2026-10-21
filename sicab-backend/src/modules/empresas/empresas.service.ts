// C:\sistemas\sicab\sicab-backend\src\modules\empresas\empresas.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { EmpresaResponseDto } from './dto/empresa-response.dto';
import { FindEmpresasQueryDto } from './dto/find-empresas-query.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';

interface FechasCruzadasInput {
    fecha_emision_licencia_att?: string | Date | null;
    fecha_vencimiento_licencia_att?: string | Date | null;
    fecha_emision_resolucion?: string | Date | null;
    fecha_vencimiento_resolucion?: string | Date | null;
}

@Injectable()
export class EmpresasService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'empresas',
        nombreEntidad: 'Empresa',
        campoPK: 'empresa_id',
        alias: 't',
        responseDto: EmpresaResponseDto,
        camposBusquedaEnQ: FindEmpresasQueryDto.getCamposParaQ(),
        tablasDependientes: FindEmpresasQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [],
        configuracionOrden: {
            campoOrdenPorDefecto: 'empresa_id',
            camposPermitidosParaOrdenar: FindEmpresasQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindEmpresasQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindEmpresasQueryDto.getCamposProtegidosConDependencias(),
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

    private validarFechasCruzadas(dto: FechasCruzadasInput): void {
        const emisionAtt = dto.fecha_emision_licencia_att;
        const vencimientoAtt = dto.fecha_vencimiento_licencia_att;

        if ((emisionAtt && !vencimientoAtt) || (!emisionAtt && vencimientoAtt)) {
            throw new DomainException(
                'Debe proporcionar tanto la fecha de emisión como la de vencimiento de la licencia ATT, o ninguna de las dos.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        if (emisionAtt && vencimientoAtt && new Date(emisionAtt) > new Date(vencimientoAtt)) {
            throw new DomainException(
                'La fecha de emisión de la licencia ATT no puede ser posterior a la fecha de vencimiento.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const emisionRes = dto.fecha_emision_resolucion;
        const vencimientoRes = dto.fecha_vencimiento_resolucion;

        if ((emisionRes && !vencimientoRes) || (!emisionRes && vencimientoRes)) {
            throw new DomainException(
                'Debe proporcionar tanto la fecha de emisión como la de vencimiento de la resolución municipal, o ninguna de las dos.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        if (emisionRes && vencimientoRes && new Date(emisionRes) > new Date(vencimientoRes)) {
            throw new DomainException(
                'La fecha de emisión de la resolución municipal no puede ser posterior a la fecha de vencimiento.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }
    }

    async create(dto: CreateEmpresaDto, usuarioId: number): Promise<EmpresaResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            this.validarFechasCruzadas(dto);

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'empresa', valor: dto.empresa }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una empresa registrada con el nombre '${dto.empresa}'.`
            }, manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'codigo', valor: dto.codigo }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una empresa registrada con el código '${dto.codigo}'.`
            }, manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'matricula_comercio', valor: dto.matricula_comercio }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una empresa registrada con la matrícula de comercio '${dto.matricula_comercio}'.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const empresa = manager.create(Empresa, {
                ...dto,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(empresa);
                return this.findOne<EmpresaResponseDto>(saved.empresa_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la empresa', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateEmpresaDto, usuarioId: number): Promise<EmpresaResponseDto> {
        let logoAnterior: string | undefined;
        let logoNuevo: string | undefined;

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const empresaActual = await manager.findOne(Empresa, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!empresaActual) {
                throw new DomainException(
                    'Empresa no encontrada.',
                    { httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            logoAnterior = empresaActual.logo;

            this.validarFechasCruzadas({ ...empresaActual, ...dto });

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindEmpresasQueryDto.getDependencias(),
                FindEmpresasQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            const validaciones: Promise<void>[] = [];

            if (dtoProcesado.empresa != null) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'empresa', valor: dtoProcesado.empresa }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una empresa registrada con el nombre '${dtoProcesado.empresa}'.`
                }, manager));
            }

            if (dtoProcesado.codigo != null) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'codigo', valor: dtoProcesado.codigo }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una empresa registrada con el código '${dtoProcesado.codigo}'.`
                }, manager));
            }

            if (dtoProcesado.matricula_comercio != null) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'matricula_comercio', valor: dtoProcesado.matricula_comercio }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una empresa registrada con la matrícula de comercio '${dtoProcesado.matricula_comercio}'.`
                }, manager));
            }

            await Promise.all(validaciones);

            if (dtoProcesado.logo) {
                if (dtoProcesado.logo === empresaActual.logo) {
                    delete dtoProcesado.logo;
                }
            }

            manager.merge(Empresa, empresaActual, dtoProcesado);
            empresaActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(empresaActual);

                logoNuevo = saved.logo;

                return this.findOne<EmpresaResponseDto>(saved.empresa_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(
                    `Error inesperado en update - empresas ID:${id}: ${errorMessage}`,
                    getErrorStack(error)
                );
                throw crearError(error, 'la empresa', 'actualizar');
            }
        });

        if (logoAnterior && logoNuevo && logoAnterior !== logoNuevo) {
            try {
                await this.imagenValidator.eliminarArchivoFisico(logoAnterior, 'logos');
                this.logger.debug(`Logo anterior eliminado: ${logoAnterior}`);
            } catch (error) {
                this.logger.warn(
                    `No se pudo eliminar el logo anterior "${logoAnterior}": ${getErrorMessage(error)}. ` +
                    `La tarea LIMPIEZA_ARCHIVOS_HUERFANOS lo eliminará después.`
                );
            }
        }

        return result;
    }
}
