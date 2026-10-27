// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\amortizaciones-vacunos.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_HISTORICO, EstadoVacuno, TipoMoneda } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { crearError, getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { CreateAmortizacionVacunoDto } from './dto/create-amortizacion-vacuno.dto';
import { AmortizacionVacunoResponseDto } from './dto/amortizacion-vacuno-response.dto';
import { FindAmortizacionesVacunosQueryDto } from './dto/find-amortizaciones-vacunos-query.dto';
import { UpdateAmortizacionVacunoDto } from './dto/update-amortizacion-vacuno.dto';
import { AmortizacionVacuno } from './entities/amortizacion-vacuno.entity';

export interface BulkAmortizarResult {
    total_vacunos: number;
    insertados: number;
    cerrados: number;
    omitidos: number;
    errores: Array<{ vacuno_id: number; arete: string; error: string }>;
}

export interface PeriodosDisponibles {
    anios: number[];
    anioActual: number;
}

interface VacunoParaAmortizar {
    vacuno_id: number;
    arete: string;
    valor_adquisicion: string | number;
    valor_residual: string | number;
    tasa_amortizacion: string | number;
    fecha_inicio_amortizacion: string | Date;
    estado_vacuno_id: number;
}

interface ProcesarPeriodoResult {
    insertado: boolean;
    cerrado: boolean;
    omitido: boolean;
    error?: string;
}

@Injectable()
export class AmortizacionesVacunosService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'amortizaciones_vacunos',
        nombreEntidad: 'AmortizacionVacuno',
        campoPK: 'amortizacion_vacuno_id',
        alias: 't',
        responseDto: AmortizacionVacunoResponseDto,
        camposBusquedaEnQ: FindAmortizacionesVacunosQueryDto.getCamposParaQ(),
        tablasDependientes: FindAmortizacionesVacunosQueryDto.getDependencias(),
        joins: [
            {
                table: 'vacunos',
                alias: 'v',
                onCondition: 'v.vacuno_id = t.vacuno_id',
                selectColumns: [
                    'v.arete AS vacuno_arete',
                    'v.nombre AS vacuno_nombre',
                    'v.sucursal_id AS sucursal_id'
                ],
                type: 'INNER'
            },
            {
                table: 'sucursales',
                alias: 'suc',
                onCondition: 'suc.sucursal_id = v.sucursal_id',
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
            { nombreCampo: 'vacuno_id', nombreColumna: 'vacuno_id', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'gestion', nombreColumna: 'gestion', tipoDatoFiltro: 'number', operador: 'eq' },
            { nombreCampo: 'gestion_desde', nombreColumna: 'gestion', tipoDatoFiltro: 'number', operador: 'gte' },
            { nombreCampo: 'gestion_hasta', nombreColumna: 'gestion', tipoDatoFiltro: 'number', operador: 'lte' },
        ],
        camposFiltroEspecial: [
            {
                nombreCampo: 'sucursal_id',
                handler: (value, _queryDto, _alias, paramIndexRef, params) => {
                    params.push(value);
                    return `v.sucursal_id = $${paramIndexRef.current++}`;
                }
            },
            {
                nombreCampo: 'empresa_id',
                handler: (value, _queryDto, _alias, paramIndexRef, params) => {
                    params.push(value);
                    return `suc.empresa_id = $${paramIndexRef.current++}`;
                }
            }
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'amortizacion_vacuno_id',
            camposPermitidosParaOrdenar: FindAmortizacionesVacunosQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindAmortizacionesVacunosQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindAmortizacionesVacunosQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }
    private get campoPK(): string { return this.config.campoPK; }

    private async calcularAmortizacion(
        vacunoId: number,
        gestion: number,
        manager: EntityManager,
    ): Promise<{
        valor_inicial: number;
        amortizacion_gestion: number;
        amortizacion_acumulada: number;
        valor_libro: number;
        valor_adquisicion: number;
        tasa_amortizacion: number;
    }> {
        const vacunos = await manager.query(
            `SELECT vacuno_id, arete, valor_adquisicion, valor_residual, tasa_amortizacion,
                    vida_util_anios, fecha_inicio_amortizacion, estado_vacuno_id
             FROM vacunos
             WHERE vacuno_id = $1
               AND estado_id = $2
             LIMIT 1`,
            [vacunoId, ESTADO_ACTIVO],
        );

        if (!vacunos?.[0]) {
            throw new DomainException(
                `El vacuno con ID ${vacunoId} no existe o no está ACTIVO.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const v = vacunos[0];

        if (!v.fecha_inicio_amortizacion) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) no tiene fecha_inicio_amortizacion. No se puede amortizar.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        if ([EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO].includes(Number(v.estado_vacuno_id))) {
            throw new DomainException(
                `El vacuno ${v.arete} (ID ${vacunoId}) está VENDIDO o MUERTO y no se puede amortizar.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const valorAdquisicion = Number(v.valor_adquisicion);
        const valorResidual = Number(v.valor_residual);
        const tasa = Number(v.tasa_amortizacion);

        if (tasa <= 0 || tasa > 100) {
            throw new DomainException(
                `El vacuno ${v.arete} tiene tasa_amortizacion inválida (${tasa}). Debe estar entre 0 y 100.`,
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const prevRows = await manager.query(
            `SELECT COALESCE(SUM(amortizacion_gestion), 0) AS acumulada_previa
             FROM amortizaciones_vacunos
             WHERE vacuno_id = $1
               AND gestion < $2
               AND estado_id IN ($3, $4)`,
            [vacunoId, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
        );

        const amortizacionAcumuladaPrevia = Number(prevRows?.[0]?.acumulada_previa ?? 0);

        const valorInicial = Math.max(
            Number((valorAdquisicion - amortizacionAcumuladaPrevia).toFixed(2)),
            0,
        );

        let amortizacionGestion = Number(
            (valorInicial * (tasa / 100)).toFixed(2),
        );

        const valorLibroProyectado = valorInicial - amortizacionGestion;
        if (valorLibroProyectado < valorResidual) {
            amortizacionGestion = Math.max(0, Number((valorInicial - valorResidual).toFixed(2)));
        }

        const amortizacionAcumulada = Number(
            (amortizacionAcumuladaPrevia + amortizacionGestion).toFixed(2),
        );

        const valorLibro = Math.max(
            Number((valorAdquisicion - amortizacionAcumulada).toFixed(2)),
            0,
        );

        return {
            valor_inicial: valorInicial,
            amortizacion_gestion: amortizacionGestion,
            amortizacion_acumulada: amortizacionAcumulada,
            valor_libro: valorLibro,
            valor_adquisicion: valorAdquisicion,
            tasa_amortizacion: tasa,
        };
    }

    private async procesarGestion(
        manager: EntityManager,
        vacuno: VacunoParaAmortizar,
        gestion: number,
        usuarioId: number,
        recalcular: boolean,
        cotizacionUfv: number,
        fechaCotizacionUfv: string | Date,
    ): Promise<ProcesarPeriodoResult> {
        try {
            const activas = await manager.query(
                `SELECT amortizacion_vacuno_id, estado_id
                 FROM amortizaciones_vacunos
                 WHERE vacuno_id = $1
                   AND gestion = $2
                   AND estado_id IN ($3, $4)
                 LIMIT 1`,
                [vacuno.vacuno_id, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            let cerrado = false;

            if (activas?.[0]) {
                if (activas[0].estado_id === ESTADO_HISTORICO) {
                    return { insertado: false, cerrado: false, omitido: true, error: 'Gestión histórica (1002) no modificable.' };
                }

                if (!recalcular) {
                    return { insertado: false, cerrado: false, omitido: true };
                }

                await manager.query(
                    `UPDATE amortizaciones_vacunos
                     SET estado_id = 1002,
                         usuario_id_actualizacion = $1,
                         fecha_actualizacion = CURRENT_TIMESTAMP,
                         usuario_id_baja = NULL,
                         fecha_baja = NULL
                     WHERE amortizacion_vacuno_id = $2`,
                    [usuarioId, activas[0].amortizacion_vacuno_id],
                );
                cerrado = true;
            }

            const calculo = await this.calcularAmortizacion(
                vacuno.vacuno_id,
                gestion,
                manager,
            );

            const valorInicialUfv = Number((calculo.valor_inicial / cotizacionUfv).toFixed(4));
            const amortGestionUfv = Number((calculo.amortizacion_gestion / cotizacionUfv).toFixed(4));
            const amortAcumuladaUfv = Number((calculo.amortizacion_acumulada / cotizacionUfv).toFixed(4));
            const valorLibroUfv = Number((valorInicialUfv - amortGestionUfv).toFixed(4));

            await manager.query(
                `INSERT INTO amortizaciones_vacunos
                    (vacuno_id, gestion,
                     valor_inicial, valor_residual, amortizacion_gestion, amortizacion_acumulada, valor_libro,
                     valor_inicial_ufv, valor_residual_ufv, amortizacion_gestion_ufv, amortizacion_acumulada_ufv, valor_libro_ufv,
                     cotizacion_ufv_aplicada, fecha_cotizacion_ufv, vida_util_anios, tasa_amortizacion,
                     estado_id, usuario_id_registro)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
                [
                    vacuno.vacuno_id, gestion,
                    calculo.valor_inicial, vacuno.valor_residual, calculo.amortizacion_gestion,
                    calculo.amortizacion_acumulada, calculo.valor_libro,
                    valorInicialUfv, Number((Number(vacuno.valor_residual) / cotizacionUfv).toFixed(4)), amortGestionUfv, amortAcumuladaUfv, valorLibroUfv,
                    cotizacionUfv, fechaCotizacionUfv, 7, calculo.tasa_amortizacion,
                    ESTADO_ACTIVO, usuarioId,
                ],
            );

            await manager.query(
                `UPDATE vacunos
                 SET amortizacion_acumulada = $1,
                     valor_libro_actual = $2,
                     fecha_ultima_amortizacion = CURRENT_DATE
                 WHERE vacuno_id = $3`,
                [calculo.amortizacion_acumulada, calculo.valor_libro, vacuno.vacuno_id]
            );

            return { insertado: true, cerrado, omitido: false };
        } catch (err) {
            return { insertado: false, cerrado: false, omitido: false, error: getErrorMessage(err) };
        }
    }

    async bulkAmortizar(
        dto: CreateAmortizacionVacunoDto,
        usuarioId: number,
    ): Promise<BulkAmortizarResult> {
        const gestion = dto.gestion;

        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);
            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const fechaUfvBuscada = `${gestion}-01-01`;

            const ufvRows = await manager.query(
                `SELECT factor_compra AS valor, fecha_cotizacion
                FROM tipos_cambios
                WHERE origen_moneda_id = $1
                AND destino_moneda_id = $2
                AND estado_id = ANY($3::int[])
                AND fecha_cotizacion = $4
                LIMIT 1`,
                [TipoMoneda.BOLIVIANO, TipoMoneda.UFV, [ESTADO_ACTIVO, ESTADO_HISTORICO], fechaUfvBuscada],
            );

            if (!ufvRows?.[0]) {
                throw new DomainException(
                    `No hay cotización UFV oficial para el inicio del periodo ${gestion} (${fechaUfvBuscada}). ` +
                    `Cargue primero la UFV en tipos_cambios antes de amortizar.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            const cotizacionUfv = Number(ufvRows[0].valor);
            const fechaCotizacionUfv = ufvRows[0].fecha_cotizacion;

            const vacunos: VacunoParaAmortizar[] = await manager.query(
                `SELECT v.vacuno_id, v.arete, v.valor_adquisicion, v.valor_residual,
                        v.tasa_amortizacion, v.fecha_inicio_amortizacion, v.estado_vacuno_id
                FROM vacunos v
                WHERE v.estado_id = $1
                AND v.fecha_inicio_amortizacion IS NOT NULL
                AND v.fecha_inicio_amortizacion <= $2
                AND v.vacuno_id > 1
                AND v.estado_vacuno_id IN ($3, $4, $5, $6)
                ORDER BY v.vacuno_id`,
                [
                    ESTADO_ACTIVO,
                    `${gestion}-12-31`,
                    EstadoVacuno.ACTIVO,
                  /*  EstadoVacuno.EN_TRATAMIENTO,
                    EstadoVacuno.SECA,
                    EstadoVacuno.DESCARTE*/
                ],
            );

            const totalVacunos = vacunos.length;
            let insertados = 0;
            let cerrados = 0;
            let omitidos = 0;
            const errores: Array<{ vacuno_id: number; arete: string; error: string }> = [];

            for (const v of vacunos) {
                const r = await this.procesarGestion(
                    manager, v, gestion, usuarioId, dto.recalcular,
                    cotizacionUfv, fechaCotizacionUfv,
                );
                if (r.error) {
                    errores.push({ vacuno_id: Number(v.vacuno_id), arete: v.arete, error: r.error });
                } else {
                    if (r.insertado) insertados++;
                    if (r.cerrado) cerrados++;
                    if (r.omitido) omitidos++;
                }
            }

            this.logger.log(
                `Bulk amortización Año ${gestion}: ` +
                `total=${totalVacunos}, insertados=${insertados}, cerrados=${cerrados}, ` +
                `omitidos=${omitidos}, errores=${errores.length}`,
            );

            if (errores.length > 0) {
                const detalle = errores
                    .slice(0, 3)
                    .map(e => `${e.arete}: ${e.error}`)
                    .join(' | ');

                throw new DomainException(
                    `El proceso de amortización del año ${gestion} falló en ${errores.length} de ${totalVacunos} vacunos. ` +
                    `No se guardó ningún registro. Detalles: ${detalle}`,
                    {
                        httpStatus: HttpStatus.CONFLICT,
                        errores,
                    },
                );
            }

            return { total_vacunos: totalVacunos, insertados, cerrados, omitidos, errores };
        });
    }

    async getPeriodosDisponibles(usuarioId: number): Promise<PeriodosDisponibles> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        const anioActual = new Date().getFullYear();

        const aniosRows = await this.dataSource.query(
            `SELECT DISTINCT EXTRACT(YEAR FROM fecha_inicio_amortizacion)::int AS anio
             FROM vacunos
             WHERE estado_id = $1
               AND fecha_inicio_amortizacion IS NOT NULL
               AND vacuno_id > 1
               AND estado_vacuno_id IN ($2, $3, $4, $5)
             ORDER BY anio`,
            [
                ESTADO_ACTIVO,
                EstadoVacuno.ACTIVO,
                /*EstadoVacuno.EN_TRATAMIENTO,
                EstadoVacuno.SECA,
                EstadoVacuno.DESCARTE*/
            ],
        );

        const aniosSet = new Set<number>();
        aniosSet.add(anioActual);

        aniosRows.forEach((r: any) => {
            const anio = Number(r.anio);
            if (anio <= anioActual) {
                aniosSet.add(anio);
            }
        });

        const anios = Array.from(aniosSet).sort((a, b) => a - b);

        return { anios, anioActual };
    }

    async update(id: number, dto: UpdateAmortizacionVacunoDto, usuarioId: number): Promise<AmortizacionVacunoResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const hasFields = Object.values(dto).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException('No se enviaron campos para actualizar.', { httpStatus: HttpStatus.BAD_REQUEST });
            }

            await this.tablaValidador.validarPreUpdate(this.nombreTabla, id, dto, this.campoPK, usuarioId, manager);

            const actual = await manager.findOne(AmortizacionVacuno, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!actual) {
                throw new DomainException('Amortización no encontrada o inactiva.', { httpStatus: HttpStatus.NOT_FOUND });
            }

            manager.merge(AmortizacionVacuno, actual, dto);
            actual.marcarActualizacion(usuarioId);

            try {
                const saved = await manager.save(actual);
                return this.findOne<AmortizacionVacunoResponseDto>(saved.amortizacion_vacuno_id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) throw error;
                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update - amortizaciones-vacunos ID:${id}: ${errorMessage}`, getErrorStack(error));
                throw crearError(error, 'la amortización del vacuno', 'actualizar');
            }
        });
    }

    override async remove<T>(id: number, usuarioId: number): Promise<T> {
        return runInTransaction(this.dataSource, async (manager) => {
            const reg = await manager.query(
                `SELECT vacuno_id, gestion
                 FROM amortizaciones_vacunos
                 WHERE amortizacion_vacuno_id = $1
                   AND estado_id = $2
                 LIMIT 1`,
                [id, ESTADO_ACTIVO],
            );

            if (!reg?.[0]) {
                throw new DomainException(
                    'La amortización no existe o no está ACTIVA.',
                    { httpStatus: HttpStatus.NOT_FOUND },
                );
            }

            const posteriores = await manager.query(
                `SELECT COUNT(*) AS total
                 FROM amortizaciones_vacunos
                 WHERE vacuno_id = $1
                   AND gestion > $2
                   AND estado_id = $3`,
                [reg[0].vacuno_id, reg[0].gestion, ESTADO_ACTIVO],
            );

            if (Number(posteriores[0]?.total) > 0) {
                throw new DomainException(
                    `No se puede eliminar la amortización del año ${reg[0].gestion} porque hay amortizaciones ACTIVAS en años posteriores del mismo vacuno. ` +
                    `Elimine primero los periodos posteriores o recalcúlelos.`,
                    { httpStatus: HttpStatus.CONFLICT },
                );
            }

            return super.remove<T>(id, usuarioId);
        });
    }
}
