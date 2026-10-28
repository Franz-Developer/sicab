// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\amortizaciones-vacunos.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { ESTADO_ACTIVO, ESTADO_BORRADO, ESTADO_HISTORICO, EstadoVacuno, TipoMoneda } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { getErrorMessage, isDomainException } from '../../common/utils/error.util';
import { CreateAmortizacionVacunoDto } from './dto/create-amortizacion-vacuno.dto';
import { AmortizacionVacunoResponseDto } from './dto/amortizacion-vacuno-response.dto';
import { FindAmortizacionesVacunosQueryDto } from './dto/find-amortizaciones-vacunos-query.dto';
import { DeleteAmortizacionByGestionDto } from './dto/delete-amortizacion-by-gestion.dto';
import { parseDateOnly } from '../../common/utils/date-formatter.util';

export interface BulkAmortizarResult {
    total_vacunos: number;
    insertados: number;
    omitidos: number;
    errores: Array<{ vacuno_id: number; arete: string; error: string }>;
}

export interface PeriodosDisponibles {
    anios: number[];
}

interface VacunoParaAmortizar {
    vacuno_id: number;
    arete: string;
    valor_adquisicion: number;
    valor_residual: number;
    valor_adquisicion_ufv: number | null;
    valor_residual_ufv: number | null;
    vida_util_anios: number;
    tasa_amortizacion: number;
    fecha_nacimiento: string | Date;
    fecha_inicio_amortizacion: string | Date;
    estado_vacuno_id: number;
}

interface CalculoAmortizacion {
    valor_inicial: number;
    valor_residual: number;
    amortizacion_gestion: number;
    amortizacion_acumulada: number;
    valor_libro: number;
    valor_inicial_ufv: number | null;
    valor_residual_ufv: number | null;
    amortizacion_gestion_ufv: number | null;
    amortizacion_acumulada_ufv: number | null;
    valor_libro_ufv: number | null;
    cotizacion_ufv_aplicada: number | null;
    fecha_cotizacion_ufv: string | null;
    vida_util_anios: number;
    tasa_amortizacion: number;
    meses_amortizados: number;
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
                    'v.sucursal_id AS sucursal_id',
                ],
                type: 'INNER',
            },
            {
                table: 'sucursales',
                alias: 'suc',
                onCondition: 'suc.sucursal_id = v.sucursal_id',
                selectColumns: [
                    'suc.sucursal AS sucursal_nombre',
                    'suc.codigo AS sucursal_codigo',
                    'suc.empresa_id AS empresa_id',
                ],
                type: 'INNER',
            },
            {
                table: 'empresas',
                alias: 'emp',
                onCondition: 'emp.empresa_id = suc.empresa_id',
                selectColumns: [
                    'emp.empresa AS empresa_nombre',
                    'emp.codigo AS empresa_codigo',
                ],
                type: 'INNER',
            },
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
                handler: (value, _q, _a, ref, params) => {
                    params.push(value);
                    return `v.sucursal_id = $${ref.current++}`;
                },
            },
            {
                nombreCampo: 'empresa_id',
                handler: (value, _q, _a, ref, params) => {
                    params.push(value);
                    return `suc.empresa_id = $${ref.current++}`;
                },
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'amortizacion_vacuno_id',
            camposPermitidosParaOrdenar: FindAmortizacionesVacunosQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindAmortizacionesVacunosQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () =>
            FindAmortizacionesVacunosQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource() dataSource: DataSource,
        tablaValidador: TablaValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string { return this.config.nombreTabla; }

    private redondear2(n: number | string): number {
        return Number(Number(n).toFixed(2));
    }

    private redondear5(n: number | string): number {
        return Number(Number(n).toFixed(5));
    }

    private calcularMesesAmortizables(
        fechaInicioAmortizacion: string | Date,
        gestion: number,
    ): number {
        const inicio = parseDateOnly(fechaInicioAmortizacion);
        if (!inicio) return 0;

        const inicioGestion = new Date(Date.UTC(gestion, 0, 1));
        const finGestion = new Date(Date.UTC(gestion, 11, 31));

        if (inicio > finGestion) return 0;
        if (inicio <= inicioGestion) return 12;

        const mesesDesdeInicio =
            (finGestion.getUTCFullYear() - inicio.getUTCFullYear()) * 12
            + (finGestion.getUTCMonth() - inicio.getUTCMonth())
            + 1;

        return Math.min(12, Math.max(0, mesesDesdeInicio));
    }

    private async obtenerCotizacionUfv(
        manager: EntityManager,
        fecha: string,
    ): Promise<{ valor: number; fecha: string } | null> {
        const rows = await manager.query(
            `SELECT factor_venta AS valor, fecha_cotizacion
             FROM tipos_cambios
             WHERE origen_moneda_id = $1
               AND destino_moneda_id = $2
               AND estado_id IN ($3, $4)
               AND fecha_cotizacion <= $5
             ORDER BY fecha_cotizacion DESC
             LIMIT 1`,
            [TipoMoneda.BOLIVIANO, TipoMoneda.UFV, ESTADO_ACTIVO, ESTADO_HISTORICO, fecha],
        );
        if (!rows?.[0]?.valor) return null;
        return { valor: Number(rows[0].valor), fecha: rows[0].fecha_cotizacion };
    }

    private async validarContinuidadGestiones(
        manager: EntityManager,
        vacunoId: number,
        arete: string,
        gestion: number,
    ): Promise<{ amortAcumuladaPrevia: number; totalPrevias: number }> {
        const prev = await manager.query(
            `SELECT COALESCE(SUM(amortizacion_gestion), 0) AS acumulada_previa,
                    COUNT(*) AS total_previas
             FROM amortizaciones_vacunos
             WHERE vacuno_id = $1
               AND gestion < $2
               AND estado_id IN ($3, $4)`,
            [vacunoId, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
        );
        const amortAcumuladaPrevia = Number(prev?.[0]?.acumulada_previa ?? 0);
        const totalPrevias = Number(prev?.[0]?.total_previas ?? 0);

        if (gestion === 2024) {
            return { amortAcumuladaPrevia, totalPrevias };
        }

        const gestionesRows: Array<{ gestion: number }> = await manager.query(
            `SELECT DISTINCT gestion
             FROM amortizaciones_vacunos
             WHERE vacuno_id = $1
               AND gestion < $2
               AND estado_id IN ($3, $4)
             ORDER BY gestion`,
            [vacunoId, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
        );
        const setPrevias = new Set(gestionesRows.map(r => Number(r.gestion)));

        const faltantes: number[] = [];
        for (let g = 2024; g < gestion; g++) {
            if (!setPrevias.has(g)) faltantes.push(g);
        }

        if (faltantes.length > 0) {
            throw new DomainException(
                `Falta amortizar la(s) gestión(es) ${faltantes.join(', ')} antes de la gestión ${gestion} ` +
                `para el vacuno ${arete}. Debe amortizar en orden cronológico.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        return { amortAcumuladaPrevia, totalPrevias };
    }

    private async calcularAmortizacion(
        manager: EntityManager,
        vacuno: VacunoParaAmortizar,
        gestion: number,
    ): Promise<CalculoAmortizacion> {
        const mesesAmortizables = this.calcularMesesAmortizables(
            vacuno.fecha_inicio_amortizacion,
            gestion,
        );
        if (mesesAmortizables <= 0) {
            throw new DomainException(
                `El vacuno ${vacuno.arete} no tiene meses amortizables en la gestión ${gestion}.`,
                { httpStatus: HttpStatus.BAD_REQUEST },
            );
        }

        const { amortAcumuladaPrevia } = await this.validarContinuidadGestiones(
            manager, vacuno.vacuno_id, vacuno.arete, gestion,
        );

        const valorInicial = this.redondear2(Number(vacuno.valor_adquisicion));
        const valorResidual = this.redondear2(Number(vacuno.valor_residual));
        const vidaUtilNum = Number(vacuno.vida_util_anios);
        const tasaNum = Number(vacuno.tasa_amortizacion);
        const baseAmortizable = this.redondear2(valorInicial - valorResidual);

        if (baseAmortizable <= 0) {
            return {
                valor_inicial: valorInicial,
                valor_residual: valorResidual,
                amortizacion_gestion: 0,
                amortizacion_acumulada: amortAcumuladaPrevia,
                valor_libro: this.redondear2(valorInicial - amortAcumuladaPrevia),
                valor_inicial_ufv: null,
                valor_residual_ufv: null,
                amortizacion_gestion_ufv: null,
                amortizacion_acumulada_ufv: null,
                valor_libro_ufv: null,
                cotizacion_ufv_aplicada: null,
                fecha_cotizacion_ufv: null,
                vida_util_anios: vidaUtilNum,
                tasa_amortizacion: tasaNum,
                meses_amortizados: mesesAmortizables,
            };
        }

        const cuotaMensual = baseAmortizable / (vidaUtilNum * 12);
        let amortGestion = this.redondear2(cuotaMensual * mesesAmortizables);

        const disponible = this.redondear2(baseAmortizable - amortAcumuladaPrevia);
        if (amortGestion > disponible) {
            amortGestion = Math.max(0, disponible);
        }

        const amortAcumulada = this.redondear2(amortAcumuladaPrevia + amortGestion);
        const valorLibro = this.redondear2(valorInicial - amortAcumulada);

        const cotizacion = await this.obtenerCotizacionUfv(manager, `${gestion}-12-31`);
        let valorInicialUfv: number | null = null;
        let valorResidualUfv: number | null = null;
        let amortGestionUfv: number | null = null;
        let amortAcumuladaUfv: number | null = null;
        let valorLibroUfv: number | null = null;
        let cotizacionAplicada: number | null = null;
        let fechaCotizacionUfv: string | null = null;

        if (cotizacion) {
            const cotizacionNum = Number(cotizacion.valor);
            cotizacionAplicada = this.redondear5(cotizacionNum);
            fechaCotizacionUfv = cotizacion.fecha;

            const tieneUfvVacuno = vacuno.valor_adquisicion_ufv !== null
                && vacuno.valor_residual_ufv !== null;

            const baseUfv = tieneUfvVacuno
                ? Number(vacuno.valor_adquisicion_ufv)
                : valorInicial / cotizacionNum;
            const residualUfv = tieneUfvVacuno
                ? Number(vacuno.valor_residual_ufv)
                : valorResidual / cotizacionNum;

            valorInicialUfv = this.redondear5(baseUfv);
            valorResidualUfv = this.redondear5(residualUfv);
            amortGestionUfv = this.redondear5(amortGestion / cotizacionNum);
            amortAcumuladaUfv = this.redondear5(amortAcumulada / cotizacionNum);
            valorLibroUfv = this.redondear5(valorInicialUfv - amortAcumuladaUfv);

            if (valorLibroUfv < 0) valorLibroUfv = 0;
        }

        return {
            valor_inicial: valorInicial,
            valor_residual: valorResidual,
            amortizacion_gestion: amortGestion,
            amortizacion_acumulada: amortAcumulada,
            valor_libro: valorLibro,
            valor_inicial_ufv: valorInicialUfv,
            valor_residual_ufv: valorResidualUfv,
            amortizacion_gestion_ufv: amortGestionUfv,
            amortizacion_acumulada_ufv: amortAcumuladaUfv,
            valor_libro_ufv: valorLibroUfv,
            cotizacion_ufv_aplicada: cotizacionAplicada,
            fecha_cotizacion_ufv: fechaCotizacionUfv,
            vida_util_anios: vidaUtilNum,
            tasa_amortizacion: tasaNum,
            meses_amortizados: mesesAmortizables,
        };
    }

    private async procesarGestion(
        manager: EntityManager,
        vacuno: VacunoParaAmortizar,
        gestion: number,
        usuarioId: number,
    ): Promise<{ insertado: boolean; omitido: boolean }> {
        const existentes: Array<{ amortizacion_vacuno_id: number; estado_id: number }> =
            await manager.query(
                `SELECT amortizacion_vacuno_id, estado_id
                 FROM amortizaciones_vacunos
                 WHERE vacuno_id = $1
                   AND gestion = $2
                   AND estado_id IN ($3, $4)
                 LIMIT 1`,
                [vacuno.vacuno_id, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

        if (existentes?.[0]) {
            return { insertado: false, omitido: true };
        }

        const calculo = await this.calcularAmortizacion(manager, vacuno, gestion);

        await manager.query(
            `UPDATE amortizaciones_vacunos
             SET estado_id = $1,
                 usuario_id_actualizacion = $2,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE vacuno_id = $3
               AND estado_id = $4
               AND gestion < $5`,
            [ESTADO_HISTORICO, usuarioId, vacuno.vacuno_id, ESTADO_ACTIVO, gestion],
        );

        await manager.query(
            `INSERT INTO amortizaciones_vacunos
                (vacuno_id, gestion,
                 valor_inicial, valor_residual, amortizacion_gestion, amortizacion_acumulada, valor_libro,
                 valor_inicial_ufv, valor_residual_ufv, amortizacion_gestion_ufv, amortizacion_acumulada_ufv, valor_libro_ufv,
                 cotizacion_ufv_aplicada, fecha_cotizacion_ufv,
                 vida_util_anios, tasa_amortizacion,
                 estado_id, usuario_id_registro)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
            [
                vacuno.vacuno_id, gestion,
                calculo.valor_inicial, calculo.valor_residual,
                calculo.amortizacion_gestion, calculo.amortizacion_acumulada, calculo.valor_libro,
                calculo.valor_inicial_ufv, calculo.valor_residual_ufv,
                calculo.amortizacion_gestion_ufv, calculo.amortizacion_acumulada_ufv, calculo.valor_libro_ufv,
                calculo.cotizacion_ufv_aplicada, calculo.fecha_cotizacion_ufv,
                calculo.vida_util_anios, calculo.tasa_amortizacion,
                ESTADO_ACTIVO, usuarioId,
            ],
        );

        await this.sincronizarVacuno(manager, vacuno.vacuno_id, calculo, usuarioId);
        return { insertado: true, omitido: false };
    }

    private async sincronizarVacuno(
        manager: EntityManager,
        vacunoId: number,
        calculo: CalculoAmortizacion,
        usuarioId: number,
    ): Promise<void> {
        const gestiones = await manager.query(
            `SELECT a.gestion
             FROM amortizaciones_vacunos a
             WHERE a.vacuno_id = $1
             AND a.estado_id IN ($2, $3)`,
            [vacunoId, ESTADO_ACTIVO, ESTADO_HISTORICO],
        );

        const vacunoRow = await manager.query(`SELECT fecha_inicio_amortizacion FROM vacunos WHERE vacuno_id = $1`, [vacunoId]);
        const fechaInicio = vacunoRow[0]?.fecha_inicio_amortizacion;

        let totalMeses = 0;
        for (const row of gestiones) {
            if (row.gestion === 2024 && fechaInicio) {
                const inicio = new Date(fechaInicio + 'T00:00:00Z');
                if (inicio > new Date(Date.UTC(2024, 0, 1))) {
                    const meses = (11 - inicio.getUTCMonth()) + 1;
                    totalMeses += Math.min(12, Math.max(0, meses));
                    continue;
                }
            }
            totalMeses += 12;
        }

        await manager.query(
            `UPDATE vacunos v
            SET amortizacion_acumulada    = $1,
                valor_libro_actual        = $2,
                meses_amortizados         = $3,
                fecha_ultima_amortizacion = CURRENT_DATE,
                usuario_id_actualizacion  = $4,
                fecha_actualizacion       = CURRENT_TIMESTAMP
            WHERE v.vacuno_id = $5
            AND v.estado_id = $6`,
            [
                calculo.amortizacion_acumulada,
                calculo.valor_libro,
                totalMeses,
                usuarioId,
                vacunoId,
                ESTADO_ACTIVO,
            ],
        );
    }

    async bulkAmortizar(
        dto: CreateAmortizacionVacunoDto,
        usuarioId: number,
    ): Promise<BulkAmortizarResult> {
        const { gestion, empresa_id } = dto;

        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'crear', manager);
            await this.tablaValidador.validarRegistrosActivos('usuarios', 'usuario_id', usuarioId, undefined, manager);

            const empresa = await manager.query(
                `SELECT 1 FROM empresas WHERE empresa_id = $1 AND estado_id = $2 LIMIT 1`,
                [empresa_id, ESTADO_ACTIVO],
            );
            if (!empresa?.[0]) {
                throw new DomainException(
                    `La empresa ${empresa_id} no existe o no está ACTIVA.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            const vacunos: VacunoParaAmortizar[] = await manager.query(
                `SELECT v.vacuno_id, v.arete,
                        v.valor_adquisicion, v.valor_residual,
                        v.valor_adquisicion_ufv, v.valor_residual_ufv,
                        v.vida_util_anios, v.tasa_amortizacion,
                        v.fecha_nacimiento, v.fecha_inicio_amortizacion,
                        v.estado_vacuno_id
                 FROM vacunos v
                 JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                 WHERE v.estado_id = $1
                   AND v.vacuno_id > 1
                   AND v.estado_vacuno_id NOT IN ($2, $3, $4)
                   AND v.fecha_nacimiento IS NOT NULL
                   AND v.fecha_inicio_amortizacion IS NOT NULL
                   AND v.fecha_inicio_amortizacion <= $5
                   AND v.fecha_nacimiento <= ($5::date - INTERVAL '12 months')
                   AND v.vida_util_anios IS NOT NULL
                   AND v.tasa_amortizacion IS NOT NULL
                   AND s.empresa_id = $6
                 ORDER BY v.vacuno_id`,
                [
                    ESTADO_ACTIVO,
                    EstadoVacuno.FAENADO,
                    EstadoVacuno.VENDIDO,
                    EstadoVacuno.MUERTO,
                    `${gestion}-12-31`,
                    empresa_id,
                ],
            );

            if (vacunos.length === 0) {
                throw new DomainException(
                    `No hay vacunos elegibles para amortizar en la empresa ${empresa_id} para la gestión ${gestion}. ` +
                    `Recuerde: solo se amortizan vacunos ACTIVOS/PARA_FAENA/PARA_VENTA con al menos 12 meses de nacidos y con fecha_inicio_amortizacion definida.`,
                    { httpStatus: HttpStatus.BAD_REQUEST },
                );
            }

            let insertados = 0;
            let omitidos = 0;
            const errores: Array<{ vacuno_id: number; arete: string; error: string }> = [];

            for (const v of vacunos) {
                try {
                    const r = await this.procesarGestion(manager, v, gestion, usuarioId);
                    if (r.insertado) insertados++;
                    if (r.omitido) omitidos++;
                } catch (err) {
                    if (isDomainException(err)) {
                        errores.push({ vacuno_id: v.vacuno_id, arete: v.arete, error: err.message });
                    } else {
                        errores.push({ vacuno_id: v.vacuno_id, arete: v.arete, error: getErrorMessage(err) });
                    }
                }
            }

            if (errores.length > 0) {
                const detalle = errores.slice(0, 3)
                    .map(e => `${e.arete}: ${e.error}`)
                    .join(' | ');
                throw new DomainException(
                    `La amortización de la gestión ${gestion} falló en ${errores.length} de ${vacunos.length} vacunos. ` +
                    `No se guardó ningún registro. Detalles: ${detalle}`,
                    { httpStatus: HttpStatus.CONFLICT, errores },
                );
            }

            this.logger.log(
                `Bulk amortización ${gestion} empresa ${empresa_id}: ` +
                `total=${vacunos.length}, insertados=${insertados}, omitidos=${omitidos}`,
            );

            return {
                total_vacunos: vacunos.length,
                insertados,
                omitidos,
                errores,
            };
        });
    }

    async getPeriodosDisponibles(usuarioId: number, empresaId?: number): Promise<PeriodosDisponibles> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        const params: any[] = [ESTADO_ACTIVO, ESTADO_HISTORICO];
        let empresaWhere = '';

        if (empresaId !== undefined && empresaId !== null) {
            params.push(empresaId);
            empresaWhere = `AND s.empresa_id = $${params.length}`;
        }

        const rows = await this.dataSource.query(
            `SELECT a.gestion AS anio
                FROM amortizaciones_vacunos a
                JOIN vacunos v ON v.vacuno_id = a.vacuno_id
                JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                WHERE a.amortizacion_vacuno_id > 1
                AND a.estado_id IN ($1, $2)
                ${empresaWhere}
                ORDER BY a.gestion DESC
                LIMIT 1
            `,
            params,
        );

        const anios = rows.length > 0 ? [Number(rows[0].anio)] : [];

        return {
            anios: anios,
        };
    }

    async eliminarPorGestion(dto: DeleteAmortizacionByGestionDto, usuarioId: number): Promise<{ eliminados: number }> {
        const { gestion, empresa_id } = dto;

        return runInTransaction(this.dataSource, async (manager) => {
            await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'eliminar', manager);

            let whereClause = `a.gestion = $1 AND a.estado_id = $2`;
            const params: any[] = [gestion, ESTADO_ACTIVO];
            let paramIndex = 3;

            if (empresa_id) {
                params.push(empresa_id);
                whereClause += ` AND s.empresa_id = $${paramIndex++}`;
            }

            const activas = await manager.query(
                `SELECT a.amortizacion_vacuno_id, a.vacuno_id
                 FROM amortizaciones_vacunos a
                 JOIN vacunos v ON v.vacuno_id = a.vacuno_id
                 JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                 WHERE ${whereClause}`,
                params
            );

            if (!activas || activas.length === 0) {
                throw new DomainException(
                    `No existen amortizaciones ACTIVAS para la gestión ${gestion}${empresa_id ? ` en la empresa ${empresa_id}` : ''}.`,
                    { httpStatus: HttpStatus.NOT_FOUND },
                );
            }

            const ids = activas.map((a: any) => Number(a.amortizacion_vacuno_id));
            const vacunoIds = [...new Set(activas.map((a: any) => Number(a.vacuno_id)))];

            const posteriores = await manager.query(
                `SELECT COUNT(*) AS total
                FROM amortizaciones_vacunos
                WHERE vacuno_id = ANY($1::bigint[])
                AND gestion > $2
                AND estado_id IN ($3, $4)`,
                [`{${vacunoIds.join(',')}}`, gestion, ESTADO_ACTIVO, ESTADO_HISTORICO],
            );

            if (Number(posteriores[0]?.total) > 0) {
                throw new DomainException(
                    `No se puede eliminar la gestión ${gestion} porque algunos vacunos ya tienen amortizaciones ACTIVAS en años posteriores. ` +
                    `Elimine primero las gestiones más recientes.`,
                    { httpStatus: HttpStatus.CONFLICT },
                );
            }

            await manager.query(
                `UPDATE amortizaciones_vacunos
                 SET estado_id = $1,
                     usuario_id_baja = $2,
                     fecha_baja = CURRENT_TIMESTAMP,
                     usuario_id_actualizacion = NULL,
                     fecha_actualizacion = NULL
                 WHERE amortizacion_vacuno_id = ANY($3::bigint[])`,
                [ESTADO_BORRADO, usuarioId, `{${ids.join(',')}}`],
            );

            for (const vacunoId of vacunoIds) {
                const historicaReciente = await manager.query(
                    `SELECT amortizacion_vacuno_id,
                            gestion,
                            amortizacion_acumulada,
                            valor_libro,
                            fecha_registro
                    FROM amortizaciones_vacunos
                    WHERE vacuno_id = $1
                    AND estado_id = $2
                    ORDER BY gestion DESC
                    LIMIT 1`,
                    [vacunoId, ESTADO_HISTORICO],
                );

                if (historicaReciente?.[0]) {
                    await manager.query(
                        `UPDATE amortizaciones_vacunos
                        SET estado_id = $1, usuario_id_actualizacion = NULL, fecha_actualizacion = NULL, usuario_id_baja = NULL, fecha_baja = NULL
                        WHERE amortizacion_vacuno_id = $2`,
                        [ESTADO_ACTIVO, historicaReciente[0].amortizacion_vacuno_id],
                    );

                    const gestiones = await manager.query(
                        `SELECT a.gestion
                         FROM amortizaciones_vacunos a
                         WHERE a.vacuno_id = $1
                           AND a.estado_id IN ($2, $3)
                           AND a.gestion <= $4`,
                        [vacunoId, ESTADO_ACTIVO, ESTADO_HISTORICO, historicaReciente[0].gestion],
                    );

                    const vacunoRow = await manager.query(`SELECT fecha_inicio_amortizacion FROM vacunos WHERE vacuno_id = $1`, [vacunoId]);
                    const fechaInicio = vacunoRow[0]?.fecha_inicio_amortizacion;

                    let totalMeses = 0;
                    for (const row of gestiones) {
                        if (row.gestion === 2024 && fechaInicio) {
                            const inicio = new Date(fechaInicio + 'T00:00:00Z');
                            if (inicio > new Date(Date.UTC(2024, 0, 1))) {
                                const meses = (11 - inicio.getUTCMonth()) + 1;
                                totalMeses += Math.min(12, Math.max(0, meses));
                                continue;
                            }
                        }
                        totalMeses += 12;
                    }

                    await manager.query(
                        `UPDATE vacunos
                        SET amortizacion_acumulada   = $1,
                            valor_libro_actual       = $2,
                            meses_amortizados        = $3,
                            fecha_ultima_amortizacion = GREATEST(
                                $4::date,
                                COALESCE(fecha_inicio_amortizacion, $4::date)
                            ),
                            usuario_id_actualizacion = $5,
                            fecha_actualizacion      = CURRENT_TIMESTAMP
                        WHERE vacuno_id = $6
                        AND estado_id = $7`,
                        [
                            historicaReciente[0].amortizacion_acumulada,
                            historicaReciente[0].valor_libro,
                            totalMeses,
                            historicaReciente[0].fecha_registro,
                            usuarioId,
                            vacunoId,
                            ESTADO_ACTIVO,
                        ],
                    );
                } else {
                    await manager.query(
                        `UPDATE vacunos
                         SET amortizacion_acumulada = 0,
                             valor_libro_actual = valor_adquisicion,
                             meses_amortizados = 0,
                             fecha_ultima_amortizacion = NULL,
                             usuario_id_actualizacion = $1,
                             fecha_actualizacion = CURRENT_TIMESTAMP
                         WHERE vacuno_id = $2 AND estado_id = $3`,
                        [usuarioId, vacunoId, ESTADO_ACTIVO],
                    );
                }
            }

            this.logger.log(`Eliminación masiva de amortizaciones: gestión=${gestion}, empresa=${empresa_id ?? 'TODAS'}, eliminados=${ids.length}`);

            return { eliminados: ids.length };
        });
    }

    async getPeriodosParaCalcular(usuarioId: number, moneda_destino_id: number): Promise<PeriodosDisponibles> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        const params: any[] = [
            TipoMoneda.BOLIVIANO,
            moneda_destino_id,
            ESTADO_ACTIVO,
            ESTADO_HISTORICO
        ];

        const rows = await this.dataSource.query(
            `SELECT DISTINCT EXTRACT(YEAR FROM fecha_cotizacion)::int AS anio
             FROM tipos_cambios
             WHERE origen_moneda_id = $1
               AND destino_moneda_id = $2
               AND estado_id IN ($3, $4)
               AND tipo_cambio_id > 1             ORDER BY anio ASC`,
            params
        );

        const aniosCandidatos = rows.map((r: any) => Number(r.anio));
        const aniosCompletos: number[] = [];

        for (const gestion of aniosCandidatos) {
            const esBisiesto = (gestion % 4 === 0 && gestion % 100 !== 0) || (gestion % 400 === 0);
            const totalDiasEsperados = esBisiesto ? 366 : 365;

            const countRows = await this.dataSource.query(
                `SELECT COUNT(DISTINCT fecha_cotizacion)::int AS total
                 FROM tipos_cambios
                 WHERE EXTRACT(YEAR FROM fecha_cotizacion) = $1
                   AND origen_moneda_id = $2
                   AND destino_moneda_id = $3
                   AND estado_id IN ($4, $5)`,
                [
                    gestion,
                    TipoMoneda.BOLIVIANO,
                    moneda_destino_id,
                    ESTADO_ACTIVO,
                    ESTADO_HISTORICO,
                ],
            );

            const totalDiasRegistrados = Number(countRows[0]?.total ?? 0);

            if (totalDiasRegistrados >= totalDiasEsperados) {
                aniosCompletos.push(gestion);
            }
        }

        if (aniosCompletos.length === 0) {
            return { anios: [] };
        }

        const gestionesAmortizadasRows = await this.dataSource.query(
            `SELECT DISTINCT gestion
             FROM amortizaciones_vacunos
             WHERE estado_id IN ($1, $2)
               AND amortizacion_vacuno_id > 1
             ORDER BY gestion ASC`,
            [ESTADO_ACTIVO, ESTADO_HISTORICO]
        );

        const gestionesAmortizadas = gestionesAmortizadasRows.map((r: any) => Number(r.gestion));

        let siguienteGestionAmortizar: number | null = null;

        for (const anio of aniosCompletos) {
            if (!gestionesAmortizadas.includes(anio)) {
                siguienteGestionAmortizar = anio;
                break;
            }
        }

        if (siguienteGestionAmortizar) {
            return { anios: [siguienteGestionAmortizar] };
        }

        return { anios: [] };
    }

    async getGestionesAmortizadas(
        usuarioId: number,
        empresaId?: number,
    ): Promise<PeriodosDisponibles> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, this.nombreTabla, 'leer');

        const params: any[] = [ESTADO_ACTIVO, ESTADO_HISTORICO];
        let empresaJoin = '';
        let empresaWhere = '';

        if (empresaId !== undefined && empresaId !== null) {
            empresaJoin = `
                JOIN vacunos v ON v.vacuno_id = a.vacuno_id
                JOIN sucursales s ON s.sucursal_id = v.sucursal_id
            `;
            params.push(empresaId);
            empresaWhere = `AND s.empresa_id = $${params.length}`;
        }

        const rows = await this.dataSource.query(
            `SELECT DISTINCT a.gestion AS anio
            FROM amortizaciones_vacunos a
            ${empresaJoin}
            WHERE a.amortizacion_vacuno_id > 1
            AND a.estado_id IN ($1, $2)
            ${empresaWhere}
            ORDER BY a.gestion DESC`,
            params,
        );

        return { anios: rows.map((r: any) => Number(r.anio)) };
    }
}
