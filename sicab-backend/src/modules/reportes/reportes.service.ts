// C:\sistemas\sicab\sicab-backend\src\modules\reportes\reportes.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainException } from '../../common/exceptions/domain.exception';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { getErrorMessage } from '../../common/utils/error.util';
import { ProduccionQueryDto } from './dto/produccion-query.dto';
import { HatoQueryDto } from './dto/hato-query.dto';
import { AmortizacionesQueryDto } from './dto/amortizaciones-query.dto';
import { ProduccionResponse } from './interfaces/produccion-response.interface';
import { HatoResponse } from './interfaces/hato-response.interface';
import { AmortizacionesResponse } from './interfaces/amortizaciones-response.interface';

@Injectable()
export class ReportesService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly tablaValidador: TablaValidadorService,
    ) {}

    // ═══════════════════════════════════════════════════════════════════════
    // REPORTE DE PRODUCCIÓN
    // ═══════════════════════════════════════════════════════════════════════

    async produccion(query: ProduccionQueryDto, usuarioId: number): Promise<ProduccionResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'producciones_leche', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = ['pl.estado_id = 1000'];

            if (query.desde) {
                where.push(`pl.fecha_produccion >= $${pIdx++}`);
                params.push(query.desde);
            }
            if (query.hasta) {
                where.push(`pl.fecha_produccion <= $${pIdx++}`);
                params.push(query.hasta);
            }
            if (query.sucursal_id) {
                where.push(`pl.sucursal_id = $${pIdx++}`);
                params.push(query.sucursal_id);
            }
            if (query.turno_ordeno_id) {
                where.push(`pl.turno_ordeno_id = $${pIdx++}`);
                params.push(query.turno_ordeno_id);
            }

            const whereClause = `WHERE ${where.join(' AND ')}`;

            // 1. Resumen
            const resumenRows = await this.dataSource.query(
                `SELECT
                    COALESCE(SUM(pl.total_litros), 0) AS total_litros,
                    COALESCE(SUM(pl.total_descartado), 0) AS total_descartado,
                    COALESCE(SUM(pl.total_neto), 0) AS total_neto,
                    COUNT(DISTINCT pl.fecha_produccion) AS dias,
                    AVG(pl.temperatura_promedio) AS temperatura_promedio,
                    AVG(pl.densidad_promedio) AS densidad_promedio
                 FROM producciones_leche pl
                 ${whereClause}`,
                params,
            );

            const r = resumenRows[0] ?? {};
            const dias = Number(r.dias) || 1;
            const totalLitros = Number(r.total_litros || 0);
            const resumen = {
                total_litros: totalLitros,
                total_descartado: Number(r.total_descartado || 0),
                total_neto: Number(r.total_neto || 0),
                promedio_diario: Number((totalLitros / dias).toFixed(2)),
                temperatura_promedio: r.temperatura_promedio !== null ? Number(r.temperatura_promedio) : null,
                densidad_promedio: r.densidad_promedio !== null ? Number(r.densidad_promedio) : null,
            };

            // 2. Por turno
            const porTurnoRows = await this.dataSource.query(
                `SELECT
                    pl.turno_ordeno_id,
                    to2.turno,
                    COALESCE(SUM(pl.total_litros), 0) AS total_litros,
                    COALESCE(SUM(pl.total_descartado), 0) AS total_descartado,
                    COALESCE(SUM(pl.total_neto), 0) AS total_neto
                 FROM producciones_leche pl
                 INNER JOIN turnos_ordeno to2 ON to2.turno_ordeno_id = pl.turno_ordeno_id
                 ${whereClause}
                 GROUP BY pl.turno_ordeno_id, to2.turno
                 ORDER BY to2.turno`,
                params,
            );

            // 3. Por vaca
            const porVacaRows = await this.dataSource.query(
                `SELECT
                    pld.vacuno_id,
                    v.arete,
                    v.nombre,
                    COALESCE(SUM(pld.litros), 0) AS total_litros
                 FROM producciones_leche_detalle pld
                 INNER JOIN producciones_leche pl ON pl.produccion_leche_id = pld.produccion_leche_id
                 INNER JOIN vacunos v ON v.vacuno_id = pld.vacuno_id
                 ${whereClause}
                 AND pld.estado_id = 1000
                 GROUP BY pld.vacuno_id, v.arete, v.nombre
                 ORDER BY total_litros DESC`,
                params,
            );

            // 4. Por fecha
            const porFechaRows = await this.dataSource.query(
                `SELECT
                    pl.fecha_produccion AS fecha,
                    COALESCE(SUM(pl.total_litros), 0) AS total_litros,
                    COALESCE(SUM(pl.total_neto), 0) AS total_neto
                 FROM producciones_leche pl
                 ${whereClause}
                 GROUP BY pl.fecha_produccion
                 ORDER BY pl.fecha_produccion`,
                params,
            );

            return {
                resumen,
                por_turno: porTurnoRows.map((row: any) => ({
                    turno_ordeno_id: Number(row.turno_ordeno_id),
                    turno: row.turno,
                    total_litros: Number(row.total_litros || 0),
                    total_descartado: Number(row.total_descartado || 0),
                    total_neto: Number(row.total_neto || 0),
                })),
                por_vaca: porVacaRows.map((row: any) => ({
                    vacuno_id: Number(row.vacuno_id),
                    arete: row.arete,
                    nombre: row.nombre,
                    total_litros: Number(row.total_litros || 0),
                    promedio_diario: Number((Number(row.total_litros || 0) / dias).toFixed(2)),
                })),
                por_fecha: porFechaRows.map((row: any) => ({
                    fecha: row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : String(row.fecha),
                    total_litros: Number(row.total_litros || 0),
                    total_neto: Number(row.total_neto || 0),
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de producción: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REPORTE DE HATO
    // ═══════════════════════════════════════════════════════════════════════

    async hato(query: HatoQueryDto, usuarioId: number): Promise<HatoResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'vacunos', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = ['v.estado_id = 1000'];

            if (query.sucursal_id) {
                where.push(`v.sucursal_id = $${pIdx++}`);
                params.push(query.sucursal_id);
            }
            if (query.raza_id) {
                where.push(`v.raza_id = $${pIdx++}`);
                params.push(query.raza_id);
            }
            if (query.categoria_vacuno_id) {
                where.push(`v.categoria_vacuno_id = $${pIdx++}`);
                params.push(query.categoria_vacuno_id);
            }
            if (query.estado_vacuno_id) {
                where.push(`v.estado_vacuno_id = $${pIdx++}`);
                params.push(query.estado_vacuno_id);
            }
            if (query.es_productor_leche !== undefined) {
                where.push(`v.es_productor_leche = $${pIdx++}`);
                params.push(query.es_productor_leche);
            }

            const whereClause = `WHERE ${where.join(' AND ')}`;

            // 1. Resumen agregado
            const resumenRows = await this.dataSource.query(
                `SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(v.valor_adquisicion), 0) AS valor_adquisicion_total
                 FROM vacunos v
                 ${whereClause}`,
                params,
            );

            const r = resumenRows[0] ?? {};

            const porCategoriaRows = await this.dataSource.query(
                `SELECT cv.categoria, COUNT(*) AS total
                 FROM vacunos v
                 INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
                 ${whereClause}
                 GROUP BY cv.categoria
                 ORDER BY total DESC`,
                params,
            );

            const porRazaRows = await this.dataSource.query(
                `SELECT rz.raza, COUNT(*) AS total
                 FROM vacunos v
                 INNER JOIN razas rz ON rz.raza_id = v.raza_id
                 ${whereClause}
                 GROUP BY rz.raza
                 ORDER BY total DESC`,
                params,
            );

            const porEstadoRows = await this.dataSource.query(
                `SELECT v.estado_vacuno_id, COUNT(*) AS total
                 FROM vacunos v
                 ${whereClause}
                 GROUP BY v.estado_vacuno_id
                 ORDER BY v.estado_vacuno_id`,
                params,
            );

            const porSucursalRows = await this.dataSource.query(
                `SELECT s.sucursal, COUNT(*) AS total
                 FROM vacunos v
                 INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                 ${whereClause}
                 GROUP BY s.sucursal
                 ORDER BY total DESC`,
                params,
            );

            const valorLibroRows = await this.dataSource.query(
                `SELECT COALESCE(SUM(av.valor_libro), 0) AS valor_libro_total
                 FROM amortizaciones_vacunos av
                 INNER JOIN vacunos v ON v.vacuno_id = av.vacuno_id
                 ${whereClause}
                 AND av.estado_id = 1000`,
                params,
            );

            const resumen = {
                total: Number(r.total || 0),
                por_categoria: Object.fromEntries(porCategoriaRows.map((row: any) => [row.categoria, Number(row.total || 0)])),
                por_raza: Object.fromEntries(porRazaRows.map((row: any) => [row.raza, Number(row.total || 0)])),
                por_estado: Object.fromEntries(porEstadoRows.map((row: any) => [String(row.estado_vacuno_id), Number(row.total || 0)])),
                por_sucursal: Object.fromEntries(porSucursalRows.map((row: any) => [row.sucursal, Number(row.total || 0)])),
                valor_adquisicion_total: Number(r.valor_adquisicion_total || 0),
                valor_libro_total: Number(valorLibroRows[0]?.valor_libro_total || 0),
            };

            // 2. Detalle
            const detalleRows = await this.dataSource.query(
                `SELECT
                    v.vacuno_id, v.arete, v.nombre,
                    rz.raza, cv.categoria,
                    v.sexo,
                    CASE WHEN v.fecha_nacimiento IS NOT NULL
                         THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, v.fecha_nacimiento)) * 12
                              + EXTRACT(MONTH FROM AGE(CURRENT_DATE, v.fecha_nacimiento))
                         ELSE NULL END AS edad_meses,
                    v.peso_actual,
                    v.valor_adquisicion,
                    COALESCE(
                        (SELECT av.valor_libro
                         FROM amortizaciones_vacunos av
                         WHERE av.vacuno_id = v.vacuno_id AND av.estado_id = 1000
                         ORDER BY av.periodo DESC LIMIT 1),
                        v.valor_adquisicion
                    ) AS valor_libro,
                    v.estado_vacuno_id,
                    s.sucursal,
                    v.fecha_ingreso
                 FROM vacunos v
                 INNER JOIN razas rz ON rz.raza_id = v.raza_id
                 INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
                 INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                 ${whereClause}
                 ORDER BY v.arete`,
                params,
            );

            const ESTADO_VACUNO_LABEL: Record<number, string> = {
                1: 'ACTIVO', 2: 'EN TRATAMIENTO', 3: 'SECA', 4: 'DESCARTE', 5: 'VENDIDO', 6: 'MUERTO',
            };

            return {
                resumen,
                detalle: detalleRows.map((row: any) => ({
                    vacuno_id: Number(row.vacuno_id),
                    arete: row.arete,
                    nombre: row.nombre,
                    raza: row.raza,
                    categoria: row.categoria,
                    sexo: row.sexo,
                    edad_meses: row.edad_meses !== null ? Number(row.edad_meses) : null,
                    peso_actual: row.peso_actual !== null ? Number(row.peso_actual) : null,
                    valor_adquisicion: Number(row.valor_adquisicion || 0),
                    valor_libro: Number(row.valor_libro || 0),
                    estado_vacuno_id: Number(row.estado_vacuno_id),
                    estado_vacuno: ESTADO_VACUNO_LABEL[Number(row.estado_vacuno_id)] ?? 'DESCONOCIDO',
                    sucursal: row.sucursal,
                    fecha_ingreso: row.fecha_ingreso instanceof Date
                        ? row.fecha_ingreso.toISOString().split('T')[0]
                        : String(row.fecha_ingreso),
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de hato: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REPORTE DE AMORTIZACIONES (CORREGIDO Y CON TOTALES BLINDADOS)
    // ═══════════════════════════════════════════════════════════════════════

    async amortizaciones(query: AmortizacionesQueryDto, usuarioId: number): Promise<AmortizacionesResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'amortizaciones_vacunos', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = [];

            // 1. Estado (primero, para que ocupe el $1)
            if (query.estado_id) {
                where.push(`av.estado_id = $${pIdx++}`);
                params.push(query.estado_id);
            } else {
                where.push('av.estado_id = 1000');
            }

            // 2. Fechas
            if (query.desde) {
                where.push(`av.periodo >= $${pIdx++}`);
                params.push(query.desde);
            }
            if (query.hasta) {
                where.push(`av.periodo <= $${pIdx++}`);
                params.push(query.hasta);
            }

            // 3. Sucursal
            if (query.sucursal_id) {
                where.push(`v.sucursal_id = $${pIdx++}`);
                params.push(query.sucursal_id);
            }

            // 4. Vacuno
            if (query.vacuno_id) {
                where.push(`av.vacuno_id = $${pIdx++}`);
                params.push(query.vacuno_id);
            }

            const whereClause = `WHERE ${where.join(' AND ')}`;

            // 1. Resumen (TOTALES)
            const resumenRows = await this.dataSource.query(
                `SELECT
                    COUNT(av.amortizacion_vacuno_id) AS total_registros,
                    COALESCE(SUM(av.valor_inicial), 0) AS total_valor_inicial,
                    COALESCE(SUM(av.amortizacion_periodo), 0) AS total_amortizado_rango,
                    COALESCE(SUM(av.amortizacion_acumulada), 0) AS total_amort_acumulada,
                    COALESCE(SUM(av.valor_libro), 0) AS total_valor_libro,
                    COALESCE(SUM(av.valor_inicial_ufv), 0) AS total_valor_inicial_ufv,
                    COALESCE(SUM(av.amortizacion_periodo_ufv), 0) AS total_amortizado_rango_ufv,
                    COALESCE(SUM(av.amortizacion_acumulada_ufv), 0) AS total_amort_acumulada_ufv,
                    COALESCE(SUM(av.valor_libro_ufv), 0) AS total_valor_libro_ufv
                 FROM amortizaciones_vacunos av
                 INNER JOIN vacunos v ON v.vacuno_id = av.vacuno_id
                 ${whereClause}`,
                params,
            );

            const r = resumenRows[0] ?? {};

            const resumen = {
                total_registros: Number(r.total_registros || 0),
                total_valor_inicial: Number(r.total_valor_inicial || 0),
                total_amortizado_rango: Number(r.total_amortizado_rango || 0),
                total_amort_acumulada: Number(r.total_amort_acumulada || 0),
                total_valor_libro: Number(r.total_valor_libro || 0),
                total_valor_inicial_ufv: Number(r.total_valor_inicial_ufv || 0),
                total_amortizado_rango_ufv: Number(r.total_amortizado_rango_ufv || 0),
                total_amort_acumulada_ufv: Number(r.total_amort_acumulada_ufv || 0),
                total_valor_libro_ufv: Number(r.total_valor_libro_ufv || 0),
            };

            // 2. Detalle
            const detalleRows = await this.dataSource.query(
                `SELECT
                    av.amortizacion_vacuno_id, av.vacuno_id,
                    v.arete, v.nombre,
                    av.periodo,
                    av.valor_inicial, av.amortizacion_periodo, av.amortizacion_acumulada, av.valor_libro,
                    av.valor_inicial_ufv, av.amortizacion_periodo_ufv, av.amortizacion_acumulada_ufv, av.valor_libro_ufv,
                    av.cotizacion_ufv_aplicada,
                    av.estado_id,
                    s.sucursal, e.empresa
                 FROM amortizaciones_vacunos av
                 INNER JOIN vacunos v ON v.vacuno_id = av.vacuno_id
                 INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                 INNER JOIN empresas e ON e.empresa_id = s.empresa_id
                 ${whereClause}
                 ORDER BY av.periodo DESC, v.arete`,
                params,
            );

            const ESTADO_LABEL: Record<number, string> = {
                1000: 'ACTIVO', 1001: 'BORRADO', 1002: 'HISTORICO',
            };

            return {
                resumen,
                detalle: detalleRows.map((row: any) => ({
                    amortizacion_vacuno_id: Number(row.amortizacion_vacuno_id),
                    vacuno_id: Number(row.vacuno_id),
                    arete: row.arete,
                    nombre: row.nombre,
                    periodo: row.periodo instanceof Date ? row.periodo.toISOString().split('T')[0] : String(row.periodo),
                    valor_inicial: Number(row.valor_inicial || 0),
                    amortizacion_periodo: Number(row.amortizacion_periodo || 0),
                    amortizacion_acumulada: Number(row.amortizacion_acumulada || 0),
                    valor_libro: Number(row.valor_libro || 0),
                    valor_inicial_ufv: row.valor_inicial_ufv !== null ? Number(row.valor_inicial_ufv) : null,
                    amortizacion_periodo_ufv: row.amortizacion_periodo_ufv !== null ? Number(row.amortizacion_periodo_ufv) : null,
                    amortizacion_acumulada_ufv: row.amortizacion_acumulada_ufv !== null ? Number(row.amortizacion_acumulada_ufv) : null,
                    valor_libro_ufv: row.valor_libro_ufv !== null ? Number(row.valor_libro_ufv) : null,
                    cotizacion_ufv_aplicada: row.cotizacion_ufv_aplicada !== null ? Number(row.cotizacion_ufv_aplicada) : null,
                    estado_id: Number(row.estado_id),
                    estado_registro: ESTADO_LABEL[Number(row.estado_id)] ?? 'DESCONOCIDO',
                    sucursal: row.sucursal,
                    empresa: row.empresa,
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de amortizaciones: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }
}
