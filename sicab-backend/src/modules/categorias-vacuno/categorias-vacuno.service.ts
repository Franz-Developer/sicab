// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\categorias-vacuno.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO, CondicionProductorLeche, SexoBiologico } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateCategoriaVacunoDto } from './dto/create-categoria-vacuno.dto';
import { CategoriaVacunoResponseDto } from './dto/categoria-vacuno-response.dto';
import { FindCategoriasVacunoQueryDto } from './dto/find-categorias-vacuno-query.dto';
import { UpdateCategoriaVacunoDto } from './dto/update-categoria-vacuno.dto';
import { CategoriaVacuno } from './entities/categoria-vacuno.entity';

@Injectable()
export class CategoriasVacunoService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'categorias_vacuno',
        nombreEntidad: 'CategoriaVacuno',
        campoPK: 'categoria_vacuno_id',
        alias: 't',
        responseDto: CategoriaVacunoResponseDto,
        camposBusquedaEnQ: FindCategoriasVacunoQueryDto.getCamposParaQ(),
        tablasDependientes: FindCategoriasVacunoQueryDto.getDependencias(),
        joins: [],
        configuracionFiltros: [
            {
                nombreCampo: 'es_productor_leche',
                nombreColumna: 'es_productor_leche',
                tipoDatoFiltro: 'number',
                operador: 'eq',
                valoresPermitidos: [CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR],
            },
            {
                nombreCampo: 'sexo_biologico_permitido_id',
                nombreColumna: 'sexo_biologico_permitido_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
                valoresPermitidos: [SexoBiologico.MACHO, SexoBiologico.HEMBRA],
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'categoria_vacuno_id',
            camposPermitidosParaOrdenar: FindCategoriasVacunoQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindCategoriasVacunoQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindCategoriasVacunoQueryDto.getCamposProtegidosConDependencias(),
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

    async create(dto: CreateCategoriaVacunoDto, usuarioId: number): Promise<CategoriaVacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.validarRangoEdades(dto.edad_min_meses, dto.edad_max_meses);

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'categoria', valor: dto.categoria }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una categoría registrada con el nombre '${dto.categoria}'.`
            }, manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'codigo', valor: dto.codigo }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe una categoría registrada con el código '${dto.codigo}'.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const categoria = manager.create(CategoriaVacuno, {
                ...dto,
                descripcion: dto.descripcion ?? null,
                edad_min_meses: dto.edad_min_meses ?? null,
                edad_max_meses: dto.edad_max_meses ?? null,
                es_productor_leche: dto.es_productor_leche,
                sexo_biologico_permitido_id: dto.sexo_biologico_permitido_id,
                usuario_id_registro: Number(usuarioId),
            });

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(categoria);
                return this.findOne<CategoriaVacunoResponseDto>(saved.categoria_vacuno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la categoría de vacuno', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateCategoriaVacunoDto, usuarioId: number): Promise<CategoriaVacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const categoriaActual = await manager.findOne(CategoriaVacuno, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!categoriaActual) {
                throw new DomainException(
                    'Categoría de vacuno no encontrada.',
                    { httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            await this.validarRangoEdades(
                dto.edad_min_meses ?? categoriaActual.edad_min_meses,
                dto.edad_max_meses ?? categoriaActual.edad_max_meses,
            );

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dto,
                FindCategoriasVacunoQueryDto.getDependencias(),
                FindCategoriasVacunoQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            const validaciones: Promise<void>[] = [];

            if (dtoProcesado.categoria != null && dtoProcesado.categoria !== categoriaActual.categoria) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'categoria', valor: dtoProcesado.categoria }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una categoría registrada con el nombre '${dtoProcesado.categoria}'.`
                }, manager));
            }

            if (dtoProcesado.codigo != null && dtoProcesado.codigo !== categoriaActual.codigo) {
                validaciones.push(this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'codigo', valor: dtoProcesado.codigo }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe una categoría registrada con el código '${dtoProcesado.codigo}'.`
                }, manager));
            }

            await Promise.all(validaciones);

            manager.merge(CategoriaVacuno, categoriaActual, dtoProcesado);
            categoriaActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(categoriaActual);
                return this.findOne<CategoriaVacunoResponseDto>(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la categoría de vacuno', 'actualizar');
            }
        });
    }

    private async validarRangoEdades(
        edadMin: number | null | undefined,
        edadMax: number | null | undefined,
    ): Promise<void> {
        if (edadMin == null || edadMax == null) return;

        if (Number(edadMin) > Number(edadMax)) {
            throw new DomainException(
                `La edad mínima (${edadMin} meses) no puede ser mayor que la edad máxima (${edadMax} meses).`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }
    }
}
