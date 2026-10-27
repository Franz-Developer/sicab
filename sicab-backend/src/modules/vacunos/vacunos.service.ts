// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\vacunos.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_BORRADO, ESTADO_HISTORICO, Estado, EstadoVacuno, CondicionProductorLeche, SexoBiologico, TipoMoneda } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { AreteService } from '../../common/services/arete.service';
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
import { TransferirVacunoDto } from './dto/transferir-vacuno.dto';

export interface GestionesDisponiblesResult {
    gestiones_ingreso: number[];
    gestiones_nacimiento: number[];
}

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
                selectColumns: ['suc.sucursal AS sucursal_nombre', 'suc.codigo AS sucursal_codigo', 'suc.empresa_id AS empresa_id'],
                type: 'INNER'
            },
            {
                table: 'empresas',
                alias: 'emp',
                onCondition: 'emp.empresa_id = suc.empresa_id',
                selectColumns: ['emp.empresa AS empresa_nombre', 'emp.codigo AS empresa_codigo'],
                type: 'INNER'
            },
            {
                table: 'razas',
                alias: 'rz',
                onCondition: 'rz.raza_id = t.raza_id',
                selectColumns: ['rz.raza AS raza_nombre'],
                type: 'INNER'
            },
            {
                table: 'categorias_vacuno',
                alias: 'cat',
                onCondition: 'cat.categoria_vacuno_id = t.categoria_vacuno_id',
                selectColumns: [
                    'cat.categoria AS categoria_vacuno_nombre',
                    'cat.edad_min_meses AS categoria_edad_min_meses',
                    'cat.edad_max_meses AS categoria_edad_max_meses',
                ],
                type: 'INNER'
            },
            {
                table: 'tipos_semovientes',
                alias: 'ts',
                onCondition: 'ts.tipo_id = t.tipo_semoviente_id',
                selectColumns: ['ts.semoviente AS tipo_semoviente_nombre'],
                type: 'INNER'
            },
            {
                table: 'vacunos',
                alias: 'pa',
                onCondition: 'pa.vacuno_id = t.padre_id AND t.padre_id > 1',
                selectColumns: [
                    'pa.arete AS padre_arete',
                    'pa.nombre AS padre_nombre',
                    'pa.estado_id AS padre_estado_id',
                    'pa.estado_vacuno_id AS padre_estado_vacuno_id',
                ],
                type: 'LEFT'
            },
            {
                table: 'vacunos',
                alias: 'ma',
                onCondition: 'ma.vacuno_id = t.madre_id AND t.madre_id > 1',
                selectColumns: [
                    'ma.arete AS madre_arete',
                    'ma.nombre AS madre_nombre',
                    'ma.estado_id AS madre_estado_id',
                    'ma.estado_vacuno_id AS madre_estado_vacuno_id',
                ],
                type: 'LEFT'
            },
        ],
        configuracionFiltros: [
            { nombreCampo: 'arete', nombreColumna: 'arete', tipoDatoFiltro: 'string', operador: 'eq' },
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
            },
            {
                nombreCampo: 'gestion_ingreso',
                handler: (value, _queryDto, alias, paramIndexRef, params) => {
                    params.push(`${value}-01-01`);
                    const pDesde = `$${paramIndexRef.current++}`;
                    params.push(`${value}-12-31`);
                    const pHasta = `$${paramIndexRef.current++}`;
                    return `${alias}.fecha_ingreso BETWEEN ${pDesde} AND ${pHasta}`;
                }
            },
            {
                nombreCampo: 'gestion_nacimiento',
                handler: (value, _queryDto, alias, paramIndexRef, params) => {
                    params.push(`${value}-01-01`);
                    const pDesde = `$${paramIndexRef.current++}`;
                    params.push(`${value}-12-31`);
                    const pHasta = `$${paramIndexRef.current++}`;
                    return `${alias}.fecha_nacimiento BETWEEN ${pDesde} AND ${pHasta}`;
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
        private readonly areteService: AreteService,
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
        } else if (estado === EstadoVacuno.FAENADO) {
            if (!data['fecha_salida'] || !data['motivo_salida'] || data['precio_venta'] == null) {
                throw new DomainException(
                    'Para el estado FAENADO, la fecha_salida, el motivo_salida y el precio_venta son obligatorios.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        } else {
            if (data['fecha_salida'] || data['motivo_salida'] || data['precio_venta'] != null || data['causa_muerte'] != null || data['peso_salida'] != null) {
                throw new DomainException(
                    'Los vacunos ACTIVO, PARA_FAENA o PARA_VENTA no pueden tener fecha_salida, motivo_salida, peso_salida, precio_venta ni causa_muerte.',
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

        if (data['fecha_ingreso'] && data['fecha_nacimiento']) {
            if (new Date(data['fecha_ingreso']) < new Date(data['fecha_nacimiento'])) {
                throw new DomainException(
                    'La fecha_ingreso no puede ser anterior a la fecha_nacimiento.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }
        }

        if (data['peso_nacimiento'] != null && data['peso_actual'] != null) {
            if (Number(data['peso_actual']) < Number(data['peso_nacimiento'])) {
                throw new DomainException(
                    'El peso_actual no puede ser menor que el peso_nacimiento.',
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
        fechaNacimiento: string | Date | null | undefined,
        manager: EntityManager
    ): Promise<void> {
        const rows = await manager.query(
            `SELECT categoria_vacuno_id, categoria, es_productor_leche, sexo_biologico_permitido_id, edad_min_meses, edad_max_meses
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

        if (sexoPermitido !== Number(sexoBiologicoId)) {
            throw new DomainException(
                `La categoría seleccionada no corresponde al sexo biológico del vacuno. ` +
                `La categoría permite sexo_biologico_id=${sexoPermitido}, pero se envió sexo_biologico_id=${sexoBiologicoId}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (fechaNacimiento) {
            const fechaNac = new Date(fechaNacimiento);
            const hoy = new Date();

            let meses = (hoy.getFullYear() - fechaNac.getFullYear()) * 12;
            meses -= fechaNac.getMonth();
            meses += hoy.getMonth();

            if (hoy.getDate() < fechaNac.getDate()) {
                meses--;
            }

            const min = categoria.edad_min_meses != null ? Number(categoria.edad_min_meses) : null;
            const max = categoria.edad_max_meses != null ? Number(categoria.edad_max_meses) : null;
            const nombreCat = categoria.categoria;

            if (min !== null && meses < min) {
                throw new DomainException(
                    `La categoría "${nombreCat}" requiere una edad mínima de ${min} meses. El vacuno tiene ${meses} meses.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
            if (max !== null && meses > max) {
                throw new DomainException(
                    `La categoría "${nombreCat}" permite una edad máxima de ${max} meses. El vacuno tiene ${meses} meses.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (vacunoId !== null && Number(esProductorLeche) === CondicionProductorLeche.NO_PRODUCTOR) {
            const detalles = await manager.query(
                `SELECT 1 FROM producciones_leche_detalle
                WHERE vacuno_id = $1 AND estado_id = $2 LIMIT 1`,
                [vacunoId, ESTADO_ACTIVO],
            );
            if (detalles?.length > 0) {
                throw new DomainException(
                    'No se puede cambiar a NO_PRODUCTOR a un vacuno con registros activos en producciones_leche_detalle.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (vacunoId !== null) {
            const esProductorCategoria = Number(categoria.es_productor_leche);
            if (Number(esProductorLeche) !== esProductorCategoria) {
                this.logger.warn(
                    `Incoherencia detectada en vacuno ID ${vacunoId}: ` +
                    `es_productor_leche=${esProductorLeche} vs categoría "${categoria.categoria}" ` +
                    `(es_productor_leche=${esProductorCategoria}). ` +
                    `El llamador debe sincronizar este campo.`,
                );
            }
        }
    }

    private async obtenerCategoriaPorEdad(
        sexoBiologicoId: number,
        fechaNacimiento: string | Date,
        esProductorLeche: number,
        manager: EntityManager
    ): Promise<number> {
        const fechaNac = new Date(fechaNacimiento);
        const hoy = new Date();

        let meses = (hoy.getFullYear() - fechaNac.getFullYear()) * 12;
        meses -= fechaNac.getMonth();
        meses += hoy.getMonth();
        if (hoy.getDate() < fechaNac.getDate()) meses--;

        if (meses < 0) meses = 0;

        if (Number(sexoBiologicoId) === SexoBiologico.HEMBRA &&
            Number(esProductorLeche) === CondicionProductorLeche.PRODUCTOR) {

            const catLechera = await manager.query(
                `SELECT categoria_vacuno_id, edad_min_meses, edad_max_meses
                FROM categorias_vacuno
                WHERE codigo = 'VLE' AND estado_id = $1 LIMIT 1`,
                [ESTADO_ACTIVO]
            );

            if (catLechera?.[0]) {
                const min = catLechera[0].edad_min_meses != null
                    ? Number(catLechera[0].edad_min_meses) : null;
                const max = catLechera[0].edad_max_meses != null
                    ? Number(catLechera[0].edad_max_meses) : null;

                const dentroDeRango =
                    (min === null || meses >= min) &&
                    (max === null || meses <= max);

                if (dentroDeRango) {
                    return Number(catLechera[0].categoria_vacuno_id);
                }
            }
        }

        const rows = await manager.query(
            `SELECT categoria_vacuno_id
            FROM categorias_vacuno
            WHERE estado_id = $1
            AND sexo_biologico_permitido_id = $2
            AND (edad_min_meses IS NULL OR edad_min_meses <= $3)
            AND (edad_max_meses IS NULL OR edad_max_meses >= $3)
            ORDER BY edad_min_meses DESC
            LIMIT 1`,
            [ESTADO_ACTIVO, sexoBiologicoId, meses]
        );

        if (!rows?.[0]) {
            throw new DomainException(
                `No se encontró una categoría válida para un vacuno de ${meses} meses con el sexo seleccionado.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        return Number(rows[0].categoria_vacuno_id);
    }

    private async validarCoherenciaTipoSemovienteRaza(
        tipoSemovienteId: number,
        razaId: number,
        manager: EntityManager,
    ): Promise<void> {
        const rows = await manager.query(
            `SELECT raza_id, tipo_semoviente_id
             FROM razas
             WHERE raza_id = $1 AND estado_id = $2
             LIMIT 1`,
            [razaId, ESTADO_ACTIVO],
        );

        if (!rows?.[0]) {
            throw new DomainException(
                `La raza con ID ${razaId} no existe o no está activa.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const tipoSemovienteRaza = Number(rows[0].tipo_semoviente_id);

        if (tipoSemovienteRaza !== Number(tipoSemovienteId)) {
            throw new DomainException(
                `La raza seleccionada no corresponde al tipo de semoviente. ` +
                `La raza permite tipo_semoviente_id=${tipoSemovienteRaza}, pero se envió tipo_semoviente_id=${tipoSemovienteId}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }
    }

    private async obtenerParametrosAmortizacion(
        tipoSemovienteId: number,
        manager: EntityManager,
    ): Promise<{ vida_util_anios: number; tasa_amortizacion: number }> {
        const rows = await manager.query(
            `SELECT vida_util_anios, tasa_amortizacion
             FROM tipos_semovientes
             WHERE tipo_id = $1 AND estado_id = $2
             LIMIT 1`,
            [tipoSemovienteId, ESTADO_ACTIVO],
        );

        if (!rows?.[0]) {
            throw new DomainException(
                `El tipo de semoviente con ID ${tipoSemovienteId} no existe o no está activo.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        return {
            vida_util_anios: Number(rows[0].vida_util_anios),
            tasa_amortizacion: Number(rows[0].tasa_amortizacion),
        };
    }

    private async validarProgenitores(
        padreId: number | null | undefined,
        madreId: number | null | undefined,
        vacunoIdActual: number | null,
        manager: EntityManager,
    ): Promise<void> {
        const padreIdFinal = padreId && Number(padreId) > 1 ? Number(padreId) : null;
        const madreIdFinal = madreId && Number(madreId) > 1 ? Number(madreId) : null;

        if (padreIdFinal && madreIdFinal && padreIdFinal === madreIdFinal) {
            throw new DomainException(
                'El padre_id y madre_id no pueden ser el mismo animal.',
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        if (vacunoIdActual) {
            if (padreIdFinal === vacunoIdActual) {
                throw new DomainException(
                    'Un vacuno no puede ser su propio padre.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
            if (madreIdFinal === vacunoIdActual) {
                throw new DomainException(
                    'Un vacuno no puede ser su propia madre.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (padreIdFinal) {
            const rows = await manager.query(
                `SELECT vacuno_id, sexo_biologico_id, estado_id
                 FROM vacunos
                 WHERE vacuno_id = $1 AND estado_id IN ($2, $3)
                 LIMIT 1`,
                [padreIdFinal, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            if (!rows?.[0]) {
                throw new DomainException(
                    `El padre con ID ${padreIdFinal} no existe o no está activo/histórico.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (Number(rows[0].sexo_biologico_id) !== SexoBiologico.MACHO) {
                throw new DomainException(
                    `El vacuno con ID ${padreIdFinal} no es MACHO. No puede registrarse como padre.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }

        if (madreIdFinal) {
            const rows = await manager.query(
                `SELECT vacuno_id, sexo_biologico_id, estado_id
                 FROM vacunos
                 WHERE vacuno_id = $1 AND estado_id IN ($2, $3)
                 LIMIT 1`,
                [madreIdFinal, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            if (!rows?.[0]) {
                throw new DomainException(
                    `La madre con ID ${madreIdFinal} no existe o no está activa/histórica.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (Number(rows[0].sexo_biologico_id) !== SexoBiologico.HEMBRA) {
                throw new DomainException(
                    `El vacuno con ID ${madreIdFinal} no es HEMBRA. No puede registrarse como madre.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }
        }
    }

    private async obtenerCotizacionUfv(
        fecha: string | Date,
        manager: EntityManager,
    ): Promise<{ factor_venta: number; fecha_cotizacion: string }> {
        const fechaStr = typeof fecha === 'string'
            ? fecha
            : fecha.toISOString().split('T')[0];

        const rows = await manager.query(
            `SELECT factor_venta, fecha_cotizacion
            FROM tipos_cambios
            WHERE origen_moneda_id = $1
            AND destino_moneda_id = $2
            AND estado_id = $3
            AND fecha_cotizacion <= $4
            ORDER BY fecha_cotizacion DESC
            LIMIT 1`,
            [TipoMoneda.BOLIVIANO, TipoMoneda.UFV, ESTADO_ACTIVO, fechaStr],
        );

        if (!rows?.[0]) {
            throw new DomainException(
                `No existe una cotización UFV ACTIVA para la fecha ${fechaStr}. ` +
                `Registre la tasa en el módulo de Tipos de Cambio antes de registrar el vacuno.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        return {
            factor_venta: Number(rows[0].factor_venta),
            fecha_cotizacion: rows[0].fecha_cotizacion,
        };
    }

    private calcularValorUfv(valorBob: number, factorVentaUfv: number): number {
        if (factorVentaUfv <= 0) {
            throw new DomainException(
                'La cotización UFV tiene un factor_venta inválido (<= 0).',
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
        return Math.round((valorBob / factorVentaUfv) * 100000) / 100000;
    }

    async create(dto: CreateVacunoDto, usuarioId: number): Promise<VacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const arete = await this.areteService.generarSiguienteArete(manager, dto.sucursal_id);

            this.validarReglasVacuno(dto);

            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);

            const categoriaCalculada = await this.obtenerCategoriaPorEdad(
                dto.sexo_biologico_id,
                dto.fecha_nacimiento || new Date(),
                dto.es_productor_leche,
                manager
            );

            await this.validarCoherenciaCategoria(null, categoriaCalculada, dto.sexo_biologico_id, dto.es_productor_leche, dto.fecha_nacimiento, manager);
            await this.validarCoherenciaTipoSemovienteRaza(dto.tipo_semoviente_id, dto.raza_id, manager);
            await this.validarProgenitores(dto.padre_id, dto.madre_id, null, manager);
            await this.unicidadValidador.validarUnicidad({
                tabla: this.nombreTabla,
                campos: [{ nombre: 'arete', valor: arete }],
                campoPk: this.campoPK,
                estadosValidos: [Estado.ACTIVO, Estado.BORRADO, Estado.HISTORICO],
                mensajePersonalizado: `Ya existe un vacuno registrado con el arete '${arete}'.`
            }, manager);

            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const fechaIngresoStr = (dto.fecha_ingreso ?? new Date().toISOString().split('T')[0]) as string;
            const fechaInicioAmortizacionStr = fechaIngresoStr;

            const paramsAmortizacion = await this.obtenerParametrosAmortizacion(dto.tipo_semoviente_id, manager);
            const cotizacion = await this.obtenerCotizacionUfv(fechaIngresoStr, manager);
            const valor_adquisicion_ufv = this.calcularValorUfv(dto.valor_adquisicion, cotizacion.factor_venta);
            const valor_residual_ufv = this.calcularValorUfv(dto.valor_residual, cotizacion.factor_venta);

            const catRows = await manager.query(
                `SELECT es_productor_leche FROM categorias_vacuno
                WHERE categoria_vacuno_id = $1 AND estado_id = $2 LIMIT 1`,
                [categoriaCalculada, ESTADO_ACTIVO],
            );
            const esProductorFinal = catRows?.[0]
                ? Number(catRows[0].es_productor_leche)
                : dto.es_productor_leche;

            if (esProductorFinal !== dto.es_productor_leche) {
                this.logger.warn(
                    `Vacuno creado con es_productor_leche=${dto.es_productor_leche} pero la categoría ` +
                    `${categoriaCalculada} requiere es_productor_leche=${esProductorFinal}. Se ajustó automáticamente. ` +
                    `El campo se actualizará a PRODUCTOR cuando la tarea programada lo pase a VACA_LECHERA.`,
                );
            }

            const vacuno = manager.create(Vacuno, {
                ...dto,
                es_productor_leche: esProductorFinal,
                categoria_vacuno_id: categoriaCalculada,
                arete,
                fecha_ingreso: fechaIngresoStr as any,
                fecha_inicio_amortizacion: fechaInicioAmortizacionStr as any,
                vida_util_anios: paramsAmortizacion.vida_util_anios,
                tasa_amortizacion: paramsAmortizacion.tasa_amortizacion,
                meses_amortizados: 0,
                amortizacion_acumulada: 0,
                valor_libro_actual: dto.valor_adquisicion,
                valor_adquisicion_ufv,
                valor_residual_ufv,
                usuario_id_registro: Number(usuarioId),
                estado_vacuno_id: EstadoVacuno.ACTIVO,
                fecha_salida: null,
                motivo_salida: null,
                peso_salida: null,
                precio_venta: null,
                causa_muerte: null,
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

            const merged: Record<string, any> = {
                ...vacunoActual,
                ...dto,
                estado_vacuno_id: vacunoActual.estado_vacuno_id
            };
            this.validarReglasVacuno(merged);

            const sexoFinal = dto.sexo_biologico_id ?? vacunoActual.sexo_biologico_id;
            const productorFinal = dto.es_productor_leche ?? vacunoActual.es_productor_leche;
            const fechaNacimientoFinal = dto.fecha_nacimiento ?? vacunoActual.fecha_nacimiento;

            let categoriaFinal: number;

            if (
                vacunoActual.estado_vacuno_id === EstadoVacuno.FAENADO ||
                vacunoActual.estado_vacuno_id === EstadoVacuno.VENDIDO ||
                vacunoActual.estado_vacuno_id === EstadoVacuno.MUERTO
            ) {
                categoriaFinal = vacunoActual.categoria_vacuno_id;
            } else if (fechaNacimientoFinal) {
                categoriaFinal = await this.obtenerCategoriaPorEdad(
                    Number(sexoFinal),
                    fechaNacimientoFinal,
                    Number(productorFinal),
                    manager
                );
            } else {
                categoriaFinal = vacunoActual.categoria_vacuno_id;
            }

            await this.validarCoherenciaCategoria(id, categoriaFinal, sexoFinal, productorFinal, fechaNacimientoFinal, manager);

            const razaFinal = dto.raza_id ?? vacunoActual.raza_id;
            const tipoSemovienteFinal = dto.tipo_semoviente_id ?? vacunoActual.tipo_semoviente_id;
            await this.validarCoherenciaTipoSemovienteRaza(tipoSemovienteFinal, razaFinal, manager);

            const padreFinal = dto.padre_id ?? vacunoActual.padre_id;
            const madreFinal = dto.madre_id ?? vacunoActual.madre_id;
            await this.validarProgenitores(padreFinal, madreFinal, id, manager);

            fotoAnterior = vacunoActual.foto ?? undefined;

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla, id, dto, FindVacunosQueryDto.getDependencias(),
                FindVacunosQueryDto.getCamposProtegidosConDependencias(), this.campoPK, usuarioId, manager
            );

            if (dtoProcesado.foto && dtoProcesado.foto === vacunoActual.foto) {
                delete dtoProcesado.foto;
            }

            delete (dtoProcesado as any).estado_vacuno_id;
            delete (dtoProcesado as any).arete;

            const cambioValoresUfv =
                dtoProcesado.valor_adquisicion !== undefined ||
                dtoProcesado.valor_residual !== undefined ||
                dtoProcesado.fecha_ingreso !== undefined;

            if (cambioValoresUfv) {
                const valorAdquisicionFinal = Number(
                    dtoProcesado.valor_adquisicion ?? vacunoActual.valor_adquisicion,
                );
                const valorResidualFinal = Number(
                    dtoProcesado.valor_residual ?? vacunoActual.valor_residual,
                );
                const fechaIngresoFinal = (dtoProcesado.fecha_ingreso ?? vacunoActual.fecha_ingreso) as any;

                const cotizacionUfv = await this.obtenerCotizacionUfv(fechaIngresoFinal, manager);

                const dtoConUfv = dtoProcesado as Record<string, any>;
                dtoConUfv['valor_adquisicion_ufv'] = this.calcularValorUfv(
                    valorAdquisicionFinal,
                    cotizacionUfv.factor_venta,
                );
                dtoConUfv['valor_residual_ufv'] = this.calcularValorUfv(
                    valorResidualFinal,
                    cotizacionUfv.factor_venta,
                );

                this.logger.debug(
                    `Recalculando UFV para vacuno ID:${id} con fecha_ingreso=${fechaIngresoFinal}, ` +
                    `factor_venta=${cotizacionUfv.factor_venta} → ` +
                    `adq_ufv=${dtoConUfv['valor_adquisicion_ufv']}, res_ufv=${dtoConUfv['valor_residual_ufv']}`,
                );
            }

            const dtoConSync = dtoProcesado as Record<string, any>;

            const catRows = await manager.query(
                `SELECT es_productor_leche FROM categorias_vacuno
                WHERE categoria_vacuno_id = $1 AND estado_id = $2 LIMIT 1`,
                [categoriaFinal, ESTADO_ACTIVO],
            );

            if (catRows?.[0]) {
                const esProductorCategoria = Number(catRows[0].es_productor_leche);
                if (Number(dtoProcesado.es_productor_leche ?? vacunoActual.es_productor_leche) !== esProductorCategoria) {
                    dtoConSync['es_productor_leche'] = esProductorCategoria;
                    this.logger.debug(
                        `Sincronizando es_productor_leche de vacuno ID:${id} ` +
                        `→ ${esProductorCategoria} (según categoría ${categoriaFinal}).`,
                    );
                }
            }

            if (
                dtoProcesado.tipo_semoviente_id !== undefined &&
                Number(dtoProcesado.tipo_semoviente_id) !== Number(vacunoActual.tipo_semoviente_id)
            ) {
                const nuevosParams = await this.obtenerParametrosAmortizacion(
                    dtoProcesado.tipo_semoviente_id,
                    manager,
                );
                dtoConSync['vida_util_anios'] = nuevosParams.vida_util_anios;
                dtoConSync['tasa_amortizacion'] = nuevosParams.tasa_amortizacion;
                this.logger.debug(
                    `Sincronizando snapshots de amortización de vacuno ID:${id} ` +
                    `→ vida_util=${nuevosParams.vida_util_anios}, tasa=${nuevosParams.tasa_amortizacion} ` +
                    `(tipo_semoviente_id=${dtoProcesado.tipo_semoviente_id}).`,
                );
            }

            if (
                dtoProcesado.fecha_ingreso !== undefined &&
                vacunoActual.meses_amortizados === 0
            ) {
                dtoConSync['fecha_inicio_amortizacion'] = dtoProcesado.fecha_ingreso;
                this.logger.debug(
                    `Sincronizando fecha_inicio_amortizacion de vacuno ID:${id} ` +
                    `→ ${dtoProcesado.fecha_ingreso}.`,
                );
            }

            manager.merge(Vacuno, vacunoActual, dtoProcesado);
            vacunoActual.categoria_vacuno_id = categoriaFinal;
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
                `SELECT vacuno_id, estado_vacuno_id, fecha_ingreso FROM vacunos
                WHERE vacuno_id = $1 AND estado_id = $2 FOR UPDATE`,
                [id, ESTADO_ACTIVO],
            );

            if (!rows?.[0]) {
                throw new DomainException('Vacuno no encontrado o inactivo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const estadoActual = Number(rows[0].estado_vacuno_id);

            if (estadoActual === EstadoVacuno.FAENADO || estadoActual === EstadoVacuno.VENDIDO || estadoActual === EstadoVacuno.MUERTO) {
                throw new DomainException(
                    'El vacuno está en un estado FINAL (FAENADO/VENDIDO/MUERTO) y no puede cambiar de estado.',
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
                if (estadoActual !== EstadoVacuno.PARA_VENTA) {
                    throw new DomainException(
                        'Solo se puede vender un vacuno que esté en estado PARA_VENTA (6403). Primero debe pasar por ese estado.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
                if (!dto.fecha_salida || !dto.motivo_salida || dto.precio_venta == null || dto.peso_salida == null) {
                    throw new DomainException(
                        'Para estado VENDIDO se requieren fecha_salida, motivo_salida, peso_salida y precio_venta.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            } else if (dto.estado_vacuno_id === EstadoVacuno.MUERTO) {
                if (!dto.fecha_salida || !dto.motivo_salida || !dto.causa_muerte || dto.peso_salida == null) {
                    throw new DomainException(
                        'Para estado MUERTO se requieren fecha_salida, motivo_salida, peso_salida y causa_muerte.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            } else if (dto.estado_vacuno_id === EstadoVacuno.FAENADO) {
                if (estadoActual !== EstadoVacuno.PARA_FAENA) {
                    throw new DomainException(
                        'Solo se puede faenar un vacuno que esté en estado PARA_FAENA (6401). Primero debe pasar por ese estado.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
                if (!dto.fecha_salida || !dto.motivo_salida || dto.precio_venta == null || dto.peso_salida == null) {
                    throw new DomainException(
                        'Para estado FAENADO se requieren fecha_salida, motivo_salida, peso_salida y precio_venta.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            } else {
                if (dto.fecha_salida != null || dto.motivo_salida != null || dto.precio_venta != null || dto.causa_muerte != null || dto.peso_salida != null) {
                    throw new DomainException(
                        'Para estados ACTIVO/PARA_FAENA/PARA_VENTA, fecha_salida, motivo_salida, peso_salida, precio_venta y causa_muerte deben estar vacíos.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            }

            if (dto.fecha_salida) {
                const fechaSalida = new Date(dto.fecha_salida);
                const fechaIngreso = new Date(rows[0].fecha_ingreso);
                if (fechaSalida < fechaIngreso) {
                    throw new DomainException(
                        'La fecha_salida no puede ser anterior a la fecha_ingreso.',
                        { httpStatus: HttpStatus.BAD_REQUEST },
                    );
                }
            }

            const estadoFinal = dto.estado_vacuno_id === EstadoVacuno.FAENADO ||
                                dto.estado_vacuno_id === EstadoVacuno.VENDIDO ||
                                dto.estado_vacuno_id === EstadoVacuno.MUERTO;

            if (estadoFinal) {
                await manager.query(
                    `UPDATE vacunos
                    SET estado_vacuno_id = $1,
                        fecha_salida = $2,
                        motivo_salida = $3,
                        peso_salida = $4,
                        precio_venta = $5,
                        causa_muerte = $6,
                        estado_id = $7,
                        usuario_id_actualizacion = $8,
                        fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE vacuno_id = $9 AND estado_id = $10`,
                    [
                        dto.estado_vacuno_id,
                        dto.fecha_salida ?? null,
                        dto.motivo_salida ?? null,
                        dto.peso_salida ?? null,
                        dto.precio_venta ?? null,
                        dto.causa_muerte ?? null,
                        Estado.HISTORICO,
                        usuarioId,
                        id,
                        ESTADO_ACTIVO,
                    ],
                );
            } else {
                await manager.query(
                    `UPDATE vacunos
                    SET estado_vacuno_id = $1,
                        fecha_salida = NULL,
                        motivo_salida = NULL,
                        peso_salida = NULL,
                        precio_venta = NULL,
                        causa_muerte = NULL,
                        usuario_id_actualizacion = $2,
                        fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE vacuno_id = $3 AND estado_id = $4`,
                    [
                        dto.estado_vacuno_id,
                        usuarioId,
                        id,
                        ESTADO_ACTIVO,
                    ],
                );
            }

            return this.findOne<VacunoResponseDto>(id, usuarioId, manager);
        });
    }

    async obtenerGestionesDisponibles(usuarioId: number): Promise<GestionesDisponiblesResult> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        try {
            const rowsIngreso = await this.dataSource.query(
                `SELECT DISTINCT EXTRACT(YEAR FROM fecha_ingreso)::int AS gestion
                 FROM vacunos
                 WHERE estado_id IN ($1, $2) AND fecha_ingreso IS NOT NULL
                 ORDER BY gestion DESC`,
                [ESTADO_ACTIVO, ESTADO_BORRADO]
            );

            const rowsNacimiento = await this.dataSource.query(
                `SELECT DISTINCT EXTRACT(YEAR FROM fecha_nacimiento)::int AS gestion
                 FROM vacunos
                 WHERE estado_id IN ($1, $2) AND fecha_nacimiento IS NOT NULL
                 ORDER BY gestion DESC`,
                [ESTADO_ACTIVO, ESTADO_BORRADO]
            );

            return {
                gestiones_ingreso: rowsIngreso.map((r: any) => Number(r.gestion)).filter(Boolean),
                gestiones_nacimiento: rowsNacimiento.map((r: any) => Number(r.gestion)).filter(Boolean),
            };
        } catch (error: unknown) {
            if (isDomainException(error)) throw error;
            const errorMessage = getErrorMessage(error);
            this.logger.error(`Error al obtener gestiones: ${errorMessage}`, getErrorStack(error));
            throw crearError(error, 'las gestiones disponibles', 'crear');
        }
    }

    async transferirSucursal(id: number, dto: TransferirVacunoDto, usuarioId: number): Promise<VacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'editar', manager);

            const vacunoActual = await manager.findOne(Vacuno, {
                where: { vacuno_id: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!vacunoActual) {
                throw new DomainException('Vacuno no encontrado o inactivo.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            const estadosFinales = [EstadoVacuno.FAENADO, EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO];
            if (estadosFinales.includes(vacunoActual.estado_vacuno_id)) {
                throw new DomainException(
                    'No se puede transferir un vacuno FAENADO, VENDIDO o MUERTO.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            if (vacunoActual.sucursal_id === dto.sucursal_destino_id) {
                throw new DomainException('El vacuno ya pertenece a la sucursal de destino.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            const sucursalDestino = await manager.query(
                `SELECT sucursal_id, empresa_id
                 FROM sucursales
                 WHERE sucursal_id = $1 AND estado_id = $2
                 LIMIT 1`,
                [dto.sucursal_destino_id, ESTADO_ACTIVO],
            );

            if (!sucursalDestino?.[0]) {
                throw new DomainException(
                    `La sucursal destino con ID ${dto.sucursal_destino_id} no existe o no está activa.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            const sucursalOrigen = await manager.query(
                `SELECT empresa_id FROM sucursales WHERE sucursal_id = $1 LIMIT 1`,
                [vacunoActual.sucursal_id],
            );

            if (Number(sucursalOrigen?.[0]?.empresa_id) !== Number(sucursalDestino[0].empresa_id)) {
                throw new DomainException(
                    'La sucursal destino pertenece a otra empresa. No se permite transferir vacunos entre empresas.',
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            const produccionHoy = await manager.query(
                `SELECT 1 FROM producciones_leche_detalle pld
                INNER JOIN producciones_leche pl ON pl.produccion_leche_id = pld.produccion_leche_id
                WHERE pld.vacuno_id = $1 AND pl.fecha_produccion = CURRENT_DATE AND pld.estado_id = $2 LIMIT 1`,
                [id, ESTADO_ACTIVO]
            );
            if (produccionHoy.length > 0) {
                throw new DomainException(
                    'No se puede transferir un vacuno que ya tiene producción de leche registrada hoy.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            vacunoActual.sucursal_id = dto.sucursal_destino_id;
            vacunoActual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(vacunoActual);
                return this.findOne<VacunoResponseDto>(saved.vacuno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error en transferirSucursal - vacunos ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'el vacuno', 'actualizar');
            }
        });
    }
}
