// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\vacunos.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADOS_VIVOS, ESTADO_ACTIVO, EstadoVacuno, CondicionProductorLeche, SexoBiologico } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { UnicidadValidadorService } from '../../common/validators/unicidad-validador.service';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateVacunoDto } from './dto/create-vacuno.dto';
import { VacunoResponseDto } from './dto/vacuno-response.dto';
import { FindVacunosQueryDto } from './dto/find-vacunos-query.dto';
import { UpdateVacunoDto } from './dto/update-vacuno.dto';
import { CambiarEstadoVacunoDto } from './dto/cambiar-estado-vacuno.dto';
import { Vacuno } from './entities/vacuno.entity';

@Injectable()
export class VacunosService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'vacunos',
        nombreEntidad: 'Vacuno',
        campoPK: 'vacuno_id',
        alias: 't',
        responseDto: VacunoResponseDto,
        camposBusquedaEnQ: FindVacunosQueryDto.getCamposParaQ(),
        tablasDependientes: FindVacunosQueryDto.getDependencias(),
        joins: [
            {
                table: 'sucursales',
                alias: 'suc',
                onCondition: 'suc.sucursal_id = t.sucursal_id',
                selectColumns: [
                    'suc.sucursal AS sucursal_nombre',
                    'suc.codigo AS sucursal_codigo',
                    'suc.empresa_id AS empresa_id'
                ],
                type: 'INNER'
            },
            {
                table: 'empresas',
                alias: 'emp',
                onCondition: 'emp.empresa_id = suc.empresa_id',
                selectColumns: [
                    'emp.empresa AS empresa_nombre',
                    'emp.codigo AS empresa_codigo'
                ],
                type: 'INNER'
            }
        ],
        configuracionFiltros: [
            { nombreCampo: 'sucursal_id', nombreColumna: 'sucursal_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'raza_id', nombreColumna: 'raza_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'categoria_vacuno_id', nombreColumna: 'categoria_vacuno_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'estado_vacuno_id', nombreColumna: 'estado_vacuno_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'sexo_biologico_id', nombreColumna: 'sexo_biologico_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'es_productor_leche', nombreColumna: 'es_productor_leche', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'fecha_ingreso_desde', nombreColumna: 'fecha_ingreso', tipoDatoFiltro: 'date', operador: 'gte' },
            { nombreCampo: 'fecha_ingreso_hasta', nombreColumna: 'fecha_ingreso', tipoDatoFiltro: 'date', operador: 'lte' },
            { nombreCampo: 'fecha_nacimiento_desde', nombreColumna: 'fecha_nacimiento', tipoDatoFiltro: 'date', operador: 'gte' },
            { nombreCampo: 'fecha_nacimiento_hasta', nombreColumna: 'fecha_nacimiento', tipoDatoFiltro: 'date', operador: 'lte' },
        ],
        camposFiltroEspecial: [
            {
                nombreCampo: 'empresa_id',
                handler: (value, _queryDto, _alias, paramIndexRef, params) => {
                    params.push(value);
                    return `suc.empresa_id = $${paramIndexRef.current++}`;
                }
            }
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'vacuno_id',
            camposPermitidosParaOrdenar: FindVacunosQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindVacunosQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindVacunosQueryDto.getCamposProtegidosConDependencias(),
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

    private validarReglasVacuno(data: Record<string, any>): void {
        const estado = Number(data['estado_vacuno_id']);
        if (!estado) return;

        if (estado === EstadoVacuno.VENDIDO) {
            if (!data['fecha_salida'] || !data['motivo_salida'] || data['precio_venta'] == null) {
                throw new DomainException(
                    'Para el estado VENDIDO, la fecha_salida, el motivo_salida y el precio_venta son obligatorios.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        } else if (estado === EstadoVacuno.MUERTO) {
            if (!data['fecha_salida'] || !data['motivo_salida'] || !data['causa_muerte']) {
                throw new DomainException(
                    'Para el estado MUERTO, la fecha_salida, el motivo_salida y la causa_muerte son obligatorios.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        } else {
            if (data['fecha_salida'] || data['motivo_salida'] || data['precio_venta'] != null || data['causa_muerte'] != null) {
                throw new DomainException(
                    'Los vacunos ACTIVOS, EN TRATAMIENTO, SECA o DESCARTE no pueden tener fecha_salida, motivo_salida, precio_venta ni causa_muerte.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }

        if (data['valor_residual'] != null && data['valor_adquisicion'] != null) {
            if (Number(data['valor_residual']) > Number(data['valor_adquisicion'])) {
                throw new DomainException(
                    'El valor_residual no puede ser mayor que el valor_adquisicion.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (data['valor_residual_ufv'] != null && data['valor_adquisicion_ufv'] != null) {
            if (Number(data['valor_residual_ufv']) > Number(data['valor_adquisicion_ufv'])) {
                throw new DomainException(
                    'El valor_residual_ufv no puede ser mayor que el valor_adquisicion_ufv.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (data['fecha_salida'] && data['fecha_ingreso']) {
            if (new Date(data['fecha_salida']) < new Date(data['fecha_ingreso'])) {
                throw new DomainException(
                    'La fecha_salida no puede ser anterior a la fecha_ingreso.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }
    }

    private async validarCoherenciaCategoria(
        vacunoId: number | null,
        categoriaId: number,
        sexoBiologicoId: number,
        esProductorLeche: number,
        manager: any
    ): Promise<void> {
        const rows = await manager.query(
            `SELECT categoria_vacuno_id, es_productor_leche, sexo_biologico_permitido_id
             FROM categorias_vacuno
             WHERE categoria_vacuno_id = $1 AND estado_id = $2
             LIMIT 1`,
            [categoriaId, ESTADO_ACTIVO],
        );

        if (!rows?.[0]) {
            throw new DomainException(
                `La categoría de vacuno con ID ${categoriaId} no existe o no está activa.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const categoria = rows[0];
        const sexoPermitido = Number(categoria.sexo_biologico_permitido_id);
        const productorPermitido = Number(categoria.es_productor_leche);

        if (sexoPermitido !== Number(sexoBiologicoId)) {
            throw new DomainException(
                `La categoría seleccionada no corresponde al sexo biológico del vacuno. ` +
                `La categoría permite sexo_biologico_id=${sexoPermitido}, pero se envió sexo_biologico_id=${sexoBiologicoId}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (productorPermitido !== Number(esProductorLeche)) {
            throw new DomainException(
                `El campo es_productor_leche (${esProductorLeche}) no coincide con la categoría seleccionada, ` +
                `la cual exige es_productor_leche=${productorPermitido}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (vacunoId !== null && productorPermitido === CondicionProductorLeche.NO_PRODUCTOR) {
            const detalles = await manager.query(
                `SELECT 1 FROM producciones_leche_detalle
                 WHERE vacuno_id = $1 AND estado_id = $2 LIMIT 1`,
                [vacunoId, ESTADO_ACTIVO],
            );
            if (detalles?.length > 0) {
                throw new DomainException(
                    'No se puede asignar una categoría NO_PRODUCTOR a un vacuno con registros activos en producciones_leche_detalle.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }
    }

    private async validarProgenitores(
        padreArete: string | null | undefined,
        madreArete: string | null | undefined,
        aretePropio: string | null | undefined,
        manager: any,
    ): Promise<void> {
        if (padreArete && madreArete && padreArete === madreArete) {
            throw new DomainException(
                'El padre_arete y madre_arete no pueden ser el mismo animal.',
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (aretePropio) {
            if (padreArete && padreArete === aretePropio) {
                throw new DomainException(
                    'Un vacuno no puede ser su propio padre.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
            if (madreArete && madreArete === aretePropio) {
                throw new DomainException(
                    'Un vacuno no puede ser su propia madre.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (padreArete) {
            const rows = await manager.query(
                `SELECT vacuno_id, arete, sexo_biologico_id
                 FROM vacunos
                 WHERE arete = $1 AND estado_id IN (1000, 1001)
                 LIMIT 1`,
                [padreArete],
            );

            if (!rows?.[0]) {
                throw new DomainException(
                    `El padre con arete '${padreArete}' no existe o no está registrado.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (Number(rows[0].sexo_biologico_id) !== SexoBiologico.MACHO) {
                throw new DomainException(
                    `El arete '${padreArete}' no corresponde a un MACHO. No puede registrarse como padre.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (madreArete) {
            const rows = await manager.query(
                `SELECT vacuno_id, arete, sexo_biologico_id
                 FROM vacunos
                 WHERE arete = $1 AND estado_id IN (1000, 1001)
                 LIMIT 1`,
                [madreArete],
            );

            if (!rows?.[0]) {
                throw new DomainException(
                    `La madre con arete '${madreArete}' no existe o no está registrada.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (Number(rows[0].sexo_biologico_id) !== SexoBiologico.HEMBRA) {
                throw new DomainException(
                    `El arete '${madreArete}' no corresponde a una HEMBRA. No puede registrarse como madre.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }
    }

    async create(dto: CreateVacunoDto, usuarioId: number): Promise<VacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            this.validarReglasVacuno(dto);

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            await this.validarCoherenciaCategoria(null, dto.categoria_vacuno_id, dto.sexo_biologico_id, dto.es_productor_leche, manager);

            await this.validarProgenitores(dto.padre_arete, dto.madre_arete, dto.arete, manager);

            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'arete', valor: dto.arete }],
                campoPk: this.campoPK,
                estadosValidos: [...ESTADOS_VIVOS],
                mensajePersonalizado: `Ya existe un vacuno registrado con el arete '${dto.arete}'.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const fechaIngreso = dto.fecha_ingreso ?? new Date().toISOString().split('T')[0];

            const vacuno = manager.create(Vacuno, {
                ...dto,
                fecha_ingreso: fechaIngreso,
                usuario_id_registro: Number(usuarioId),
            } as unknown as Vacuno);

            try {
                await this.sincronizarSecuencia(manager, this.nombreTabla, this.campoPK);
                const saved = await manager.save(vacuno);
                return this.findOne<VacunoResponseDto>(saved.vacuno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en create: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el vacuno', 'crear');
            }
        });
    }

    async update(id: number, dto: UpdateVacunoDto, usuarioId: number): Promise<VacunoResponseDto> {
        let fotoAnterior: string | undefined;
        let fotoNuevo: string | undefined;

        const result = await runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException('No se enviaron campos para actualizar.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const vacunoActual = await manager.findOne(Vacuno, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!vacunoActual) {
                throw new DomainException('Vacuno no encontrado.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const merged: Record<string, any> = { ...vacunoActual, ...dto };
            this.validarReglasVacuno(merged);

            const categoriaFinal = dto.categoria_vacuno_id ?? vacunoActual.categoria_vacuno_id;
            const sexoFinal = dto.sexo_biologico_id ?? vacunoActual.sexo_biologico_id;
            const productorFinal = dto.es_productor_leche ?? vacunoActual.es_productor_leche;
            await this.validarCoherenciaCategoria(id, categoriaFinal, sexoFinal, productorFinal, manager);

            const padreFinal = dto.padre_arete ?? vacunoActual.padre_arete;
            const madreFinal = dto.madre_arete ?? vacunoActual.madre_arete;
            const areteFinal = dto.arete ?? vacunoActual.arete;
            await this.validarProgenitores(padreFinal, madreFinal, areteFinal, manager);

            fotoAnterior = vacunoActual.foto ?? undefined;

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla, id, dto, FindVacunosQueryDto.getDependencias(),
                FindVacunosQueryDto.getCamposProtegidosConDependencias(), this.campoPK, usuarioId, manager
            );

            if (dtoProcesado.arete != null && dtoProcesado.arete !== vacunoActual.arete) {
                await this.unicidadValidador.validarUnicidad({
                    tabla: this.nombreTabla,
                    campos: [{ nombre: 'arete', valor: dtoProcesado.arete }],
                    idExcluir: id,
                    campoPk: this.campoPK,
                    estadosValidos: [...ESTADOS_VIVOS],
                    mensajePersonalizado: `Ya existe un vacuno registrado con el arete '${dtoProcesado.arete}'.`
                }, manager);
            }

            if (dtoProcesado.foto && dtoProcesado.foto === vacunoActual.foto) {
                delete dtoProcesado.foto;
            }

            manager.merge(Vacuno, vacunoActual, dtoProcesado);
            vacunoActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(vacunoActual);
                fotoNuevo = saved.foto ?? undefined;
                return this.findOne<VacunoResponseDto>(saved.vacuno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - vacunos ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el vacuno', 'actualizar');
            }
        });

        if (fotoAnterior && fotoNuevo && fotoAnterior !== fotoNuevo) {
            try {
                await this.imagenValidator.eliminarArchivoFisico(fotoAnterior, 'vacunos_fotos');
                this.logger.debug(`Foto anterior eliminada: ${fotoAnterior}`);
            } catch (error) {
                this.logger.warn(`No se pudo eliminar la foto anterior "${fotoAnterior}": ${getErrorMessage(error)}. La tarea LIMPIEZA_ARCHIVOS_HUERFANOS la eliminará.`);
            }
        }

        return result;
    }

    async cambiarEstado(id: number, dto: CambiarEstadoVacunoDto, usuarioId: number): Promise<VacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'editar', manager);

            const rows = await manager.query(
                `SELECT vacuno_id, estado_vacuno_id FROM vacunos
                 WHERE vacuno_id = $1 AND estado_id = $2 FOR UPDATE`,
                [id, ESTADO_ACTIVO],
            );

            if (!rows?.[0]) {
                throw new DomainException('Vacuno no encontrado o inactivo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const estadoActual = Number(rows[0].estado_vacuno_id);

            if (estadoActual === EstadoVacuno.VENDIDO || estadoActual === EstadoVacuno.MUERTO) {
                throw new DomainException(
                    'El vacuno está en un estado FINAL (VENDIDO/MUERTO) y no puede cambiar de estado.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (dto.estado_vacuno_id === estadoActual) {
                throw new DomainException(
                    'El vacuno ya se encuentra en ese estado.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (dto.estado_vacuno_id === EstadoVacuno.VENDIDO) {
                if (!dto.fecha_salida || !dto.motivo_salida || dto.precio_venta == null) {
                    throw new DomainException(
                        'Para estado VENDIDO se requieren fecha_salida, motivo_salida y precio_venta.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            } else if (dto.estado_vacuno_id === EstadoVacuno.MUERTO) {
                if (!dto.fecha_salida || !dto.motivo_salida || !dto.causa_muerte) {
                    throw new DomainException(
                        'Para estado MUERTO se requieren fecha_salida, motivo_salida y causa_muerte.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            } else {
                if (dto.fecha_salida != null || dto.motivo_salida != null || dto.precio_venta != null || dto.causa_muerte != null) {
                    throw new DomainException(
                        'Para estados ACTIVO/EN_TRATAMIENTO/SECA/DESCARTE, fecha_salida, motivo_salida, precio_venta y causa_muerte deben estar vacíos.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            }

            await manager.query(
                `UPDATE vacunos
                 SET estado_vacuno_id = $1,
                     fecha_salida = $2,
                     motivo_salida = $3,
                     peso_salida = $4,
                     precio_venta = $5,
                     causa_muerte = $6,
                     usuario_id_actualizacion = $7,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE vacuno_id = $8 AND estado_id = $9`,
                [
                    dto.estado_vacuno_id,
                    dto.fecha_salida ?? null,
                    dto.motivo_salida ?? null,
                    dto.peso_salida ?? null,
                    dto.precio_venta ?? null,
                    dto.causa_muerte ?? null,
                    usuarioId,
                    id,
                    ESTADO_ACTIVO,
                ],
            );

            return this.findOne<VacunoResponseDto>(id, usuarioId, manager);
        });
    }
}
