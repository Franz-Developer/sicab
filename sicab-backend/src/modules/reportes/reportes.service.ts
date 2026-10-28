// C:\sistemas\sicab\sicab-backend\src\modules\reportes\reportes.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainException } from '../../common/exceptions/domain.exception';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { getErrorMessage } from '../../common/utils/error.util';
import { ESTADO_METADATA, ESTADO_VACUNO_METADATA, Estado, EstadoVacuno, SexoBiologico, SEXO_BIOLOGICO_METADATA, CondicionProductorLeche } from '../../common/constants/estados.constant';
import { ProduccionQueryDto } from './dto/produccion-query.dto';
import { HatoQueryDto } from './dto/hato-query.dto';
import { AmortizacionesQueryDto } from './dto/amortizaciones-query.dto';
import { FaenasQueryDto } from './dto/faenas-query.dto';
import { ProduccionResponse } from './interfaces/produccion-response.interface';
import { HatoResponse } from './interfaces/hato-response.interface';
import { AmortizacionesResponse } from './interfaces/amortizaciones-response.interface';
import { FaenasResponse } from './interfaces/faenas-response.interface';

@Injectable()
export class ReportesService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly tablaValidador: TablaValidadorService,
    ) {}

    private labelEstado(id: number): string {
        const meta = ESTADO_METADATA[id as Estado];
        return meta?.abreviatura ?? `DESCONOCIDO(${id})`;
    }

    private labelEstadoVacuno(id: number): string {
        const meta = ESTADO_VACUNO_METADATA[id as EstadoVacuno];
        return meta?.abreviatura ?? `DESCONOCIDO(${id})`;
    }

    private labelSexo(id: number): string {
        const meta = SEXO_BIOLOGICO_METADATA[id as SexoBiologico];
        return meta?.abreviatura ?? `DESCONOCIDO(${id})`;
    }

    private labelProductorLeche(valor: number): string {
        return valor === CondicionProductorLeche.PRODUCTOR ? 'PRODUCTOR' : 'NO_PRODUCTOR';
    }

    async produccion(query: ProduccionQueryDto, usuarioId: number): Promise<ProduccionResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'producciones_leche', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = [`pl.estado_id = $${pIdx++}`];
            params.push(Estado.ACTIVO);

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

            const resumenRows = await this.dataSource.query(
                `SELECT
                    COALESCE(SUM(pl.total_litros), 0) AS total_litros,
                    COALESCE(SUM(pl.total_descartado), 0) AS total_descartado,
                    COALESCE(SUM(pl.total_neto), 0) AS total_neto,
                    COUNT(DISTINCT pl.fecha_produccion) AS dias,
                    COUNT(DISTINCT pl.turno_ordeno_id) AS cantidad_turnos
                 FROM producciones_leche pl
                 ${whereClause}`,
                params,
            );

            const vacunosRows = await this.dataSource.query(
                `SELECT COUNT(DISTINCT pld.vacuno_id) AS cantidad_vacunos
                 FROM producciones_leche_detalle pld
                 INNER JOIN producciones_leche pl ON pl.produccion_leche_id = pld.produccion_leche_id
                 ${whereClause}
                 AND pld.estado_id = $${pIdx}`,
                [...params, Estado.ACTIVO],
            );

            const r = resumenRows[0] ?? {};
            const dias = Number(r.dias) || 0;
            const totalLitros = Number(r.total_litros || 0);

            const resumen = {
                total_litros: totalLitros,
                total_descartado: Number(r.total_descartado || 0),
                total_neto: Number(r.total_neto || 0),
                promedio_diario: dias > 0 ? Number((totalLitros / dias).toFixed(2)) : 0,
                dias_con_produccion: dias,
                cantidad_turnos: Number(r.cantidad_turnos || 0),
                cantidad_vacunos: Number(vacunosRows[0]?.cantidad_vacunos || 0),
            };

            const porTurnoRows = await this.dataSource.query(
                `SELECT
                    pl.turno_ordeno_id,
                    to2.turno,
                    to2.codigo,
                    COALESCE(SUM(pl.total_litros), 0) AS total_litros,
                    COALESCE(SUM(pl.total_descartado), 0) AS total_descartado,
                    COALESCE(SUM(pl.total_neto), 0) AS total_neto,
                    COUNT(*) AS cantidad_registros
                 FROM producciones_leche pl
                 INNER JOIN turnos_ordeno to2 ON to2.turno_ordeno_id = pl.turno_ordeno_id
                 ${whereClause}
                 GROUP BY pl.turno_ordeno_id, to2.turno, to2.codigo
                 ORDER BY to2.turno`,
                params,
            );

            const porVacaRows = await this.dataSource.query(
                `SELECT
                    pld.vacuno_id,
                    v.arete,
                    v.nombre,
                    rz.raza,
                    cv.categoria,
                    v.sucursal_id,
                    s.sucursal,
                    COALESCE(SUM(pld.litros), 0) AS total_litros,
                    COUNT(DISTINCT pl.fecha_produccion) AS dias_con_produccion
                 FROM producciones_leche_detalle pld
                 INNER JOIN producciones_leche pl ON pl.produccion_leche_id = pld.produccion_leche_id
                 INNER JOIN vacunos v ON v.vacuno_id = pld.vacuno_id
                 INNER JOIN razas rz ON rz.raza_id = v.raza_id
                 INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
                 INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                 ${whereClause}
                 AND pld.estado_id = $${pIdx}
                 GROUP BY pld.vacuno_id, v.arete, v.nombre, rz.raza, cv.categoria, v.sucursal_id, s.sucursal
                 ORDER BY total_litros DESC`,
                [...params, Estado.ACTIVO],
            );

            const porFechaRows = await this.dataSource.query(
                `SELECT
                    pl.fecha_produccion AS fecha,
                    pl.sucursal_id,
                    s.sucursal,
                    pl.turno_ordeno_id,
                    to2.turno,
                    COALESCE(SUM(pl.total_litros), 0) AS total_litros,
                    COALESCE(SUM(pl.total_descartado), 0) AS total_descartado,
                    COALESCE(SUM(pl.total_neto), 0) AS total_neto,
                    MIN(pl.estado_id) AS estado_id
                 FROM producciones_leche pl
                 INNER JOIN sucursales s ON s.sucursal_id = pl.sucursal_id
                 INNER JOIN turnos_ordeno to2 ON to2.turno_ordeno_id = pl.turno_ordeno_id
                 ${whereClause}
                 GROUP BY pl.fecha_produccion, pl.sucursal_id, s.sucursal, pl.turno_ordeno_id, to2.turno
                 ORDER BY pl.fecha_produccion, pl.turno_ordeno_id`,
                params,
            );

            return {
                resumen,
                por_turno: porTurnoRows.map((row: any) => ({
                    turno_ordeno_id: Number(row.turno_ordeno_id),
                    turno: row.turno,
                    codigo: row.codigo,
                    total_litros: Number(row.total_litros || 0),
                    total_descartado: Number(row.total_descartado || 0),
                    total_neto: Number(row.total_neto || 0),
                    cantidad_registros: Number(row.cantidad_registros || 0),
                })),
                por_vaca: porVacaRows.map((row: any) => {
                    const totalLitrosVaca = Number(row.total_litros || 0);
                    const diasVaca = Number(row.dias_con_produccion) || 1;
                    return {
                        vacuno_id: Number(row.vacuno_id),
                        arete: row.arete,
                        nombre: row.nombre,
                        raza: row.raza,
                        categoria: row.categoria,
                        sucursal_id: Number(row.sucursal_id),
                        sucursal: row.sucursal,
                        total_litros: totalLitrosVaca,
                        promedio_diario: Number((totalLitrosVaca / diasVaca).toFixed(2)),
                        dias_con_produccion: diasVaca,
                    };
                }),
                por_fecha: porFechaRows.map((row: any) => ({
                    fecha: row.fecha instanceof Date
                        ? row.fecha.toISOString().split('T')[0]
                        : String(row.fecha),
                    sucursal_id: Number(row.sucursal_id),
                    sucursal: row.sucursal,
                    turno_ordeno_id: Number(row.turno_ordeno_id),
                    turno: row.turno,
                    total_litros: Number(row.total_litros || 0),
                    total_descartado: Number(row.total_descartado || 0),
                    total_neto: Number(row.total_neto || 0),
                    estado_id: Number(row.estado_id),
                    estado_registro: this.labelEstado(Number(row.estado_id)),
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de producción: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

    async hato(query: HatoQueryDto, usuarioId: number): Promise<HatoResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'vacunos', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = [`v.estado_id = $${pIdx++}`];
            params.push(Estado.ACTIVO);

            if (query.empresa_id) {
                where.push(`s.empresa_id = $${pIdx++}`);
                params.push(query.empresa_id);
            }
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
            const fromJoins = `
                FROM vacunos v
                INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                INNER JOIN empresas e ON e.empresa_id = s.empresa_id
            `;

            const resumenRows = await this.dataSource.query(
                `SELECT
                    COUNT(*) AS total,
                    COALESCE(SUM(v.valor_adquisicion), 0) AS valor_adquisicion_total,
                    COALESCE(SUM(v.valor_residual), 0) AS valor_residual_total,
                    COALESCE(SUM(v.amortizacion_acumulada), 0) AS amortizacion_acumulada_total,
                    COALESCE(SUM(v.valor_libro_actual), 0) AS valor_libro_total,
                    AVG(v.peso_actual) AS peso_promedio,
                    AVG(CASE WHEN v.fecha_nacimiento IS NOT NULL
                             THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, v.fecha_nacimiento)) * 12
                                  + EXTRACT(MONTH FROM AGE(CURRENT_DATE, v.fecha_nacimiento))
                             ELSE NULL END) AS edad_promedio_meses
                 ${fromJoins}
                 ${whereClause}`,
                params,
            );

            const porCategoriaRows = await this.dataSource.query(
                `SELECT cv.categoria, COUNT(*) AS total
                 ${fromJoins}
                 INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
                 ${whereClause}
                 GROUP BY cv.categoria
                 ORDER BY total DESC`,
                params,
            );

            const porRazaRows = await this.dataSource.query(
                `SELECT rz.raza, COUNT(*) AS total
                 ${fromJoins}
                 INNER JOIN razas rz ON rz.raza_id = v.raza_id
                 ${whereClause}
                 GROUP BY rz.raza
                 ORDER BY total DESC`,
                params,
            );

            const porEstadoRows = await this.dataSource.query(
                `SELECT v.estado_vacuno_id, COUNT(*) AS total
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY v.estado_vacuno_id
                 ORDER BY v.estado_vacuno_id`,
                params,
            );

            const porSexoRows = await this.dataSource.query(
                `SELECT v.sexo_biologico_id, COUNT(*) AS total
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY v.sexo_biologico_id`,
                params,
            );

            const porSucursalRows = await this.dataSource.query(
                `SELECT s.sucursal, COUNT(*) AS total
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY s.sucursal
                 ORDER BY total DESC`,
                params,
            );

            const porProductorRows = await this.dataSource.query(
                `SELECT v.es_productor_leche, COUNT(*) AS total
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY v.es_productor_leche`,
                params,
            );

            const r = resumenRows[0] ?? {};

            const resumen = {
                total: Number(r.total || 0),
                por_categoria: Object.fromEntries(porCategoriaRows.map((row: any) => [row.categoria, Number(row.total || 0)])),
                por_raza: Object.fromEntries(porRazaRows.map((row: any) => [row.raza, Number(row.total || 0)])),
                por_estado_vacuno: Object.fromEntries(porEstadoRows.map((row: any) => [this.labelEstadoVacuno(Number(row.estado_vacuno_id)), Number(row.total || 0)])),
                por_sexo: Object.fromEntries(porSexoRows.map((row: any) => [this.labelSexo(Number(row.sexo_biologico_id)), Number(row.total || 0)])),
                por_sucursal: Object.fromEntries(porSucursalRows.map((row: any) => [row.sucursal, Number(row.total || 0)])),
                por_es_productor_leche: Object.fromEntries(porProductorRows.map((row: any) => [this.labelProductorLeche(Number(row.es_productor_leche)), Number(row.total || 0)])),
                valor_adquisicion_total: Number(r.valor_adquisicion_total || 0),
                valor_residual_total: Number(r.valor_residual_total || 0),
                amortizacion_acumulada_total: Number(r.amortizacion_acumulada_total || 0),
                valor_libro_total: Number(r.valor_libro_total || 0),
                peso_promedio: r.peso_promedio !== null ? Number(r.peso_promedio) : null,
                edad_promedio_meses: r.edad_promedio_meses !== null ? Number(r.edad_promedio_meses) : null,
            };

            const detalleRows = await this.dataSource.query(
                `SELECT
                    v.vacuno_id, v.arete, v.nombre,
                    e.empresa_id, e.empresa,
                    s.sucursal_id, s.sucursal,
                    rz.raza_id, rz.raza,
                    cv.categoria_vacuno_id, cv.categoria,
                    ts.tipo_id AS tipo_semoviente_id, ts.semoviente AS tipo_semoviente,
                    v.sexo_biologico_id,
                    v.color,
                    v.fecha_nacimiento,
                    CASE WHEN v.fecha_nacimiento IS NOT NULL
                         THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, v.fecha_nacimiento)) * 12
                              + EXTRACT(MONTH FROM AGE(CURRENT_DATE, v.fecha_nacimiento))
                         ELSE NULL END AS edad_meses,
                    v.peso_nacimiento, v.peso_actual,
                    v.valor_adquisicion, v.valor_residual,
                    v.valor_libro_actual, v.amortizacion_acumulada, v.meses_amortizados,
                    v.es_productor_leche,
                    v.estado_vacuno_id,
                    v.fecha_ingreso,
                    v.estado_id,
                    u.login AS usuario_operacion,
                    v.fecha_registro,
                    v.fecha_actualizacion
                 ${fromJoins}
                 INNER JOIN razas rz ON rz.raza_id = v.raza_id
                 INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
                 INNER JOIN tipos_semovientes ts ON ts.tipo_id = v.tipo_semoviente_id
                 LEFT JOIN usuarios u ON u.usuario_id = COALESCE(v.usuario_id_actualizacion, v.usuario_id_registro)
                 ${whereClause}
                 ORDER BY v.arete`,
                params,
            );

            return {
                resumen,
                detalle: detalleRows.map((row: any) => ({
                    vacuno_id: Number(row.vacuno_id),
                    arete: row.arete,
                    nombre: row.nombre,
                    empresa_id: Number(row.empresa_id),
                    empresa: row.empresa,
                    sucursal_id: Number(row.sucursal_id),
                    sucursal: row.sucursal,
                    raza_id: Number(row.raza_id),
                    raza: row.raza,
                    categoria_vacuno_id: Number(row.categoria_vacuno_id),
                    categoria: row.categoria,
                    tipo_semoviente_id: Number(row.tipo_semoviente_id),
                    tipo_semoviente: row.tipo_semoviente,
                    sexo_biologico_id: Number(row.sexo_biologico_id),
                    sexo: this.labelSexo(Number(row.sexo_biologico_id)),
                    color: row.color ?? null,
                    fecha_nacimiento: row.fecha_nacimiento instanceof Date
                        ? row.fecha_nacimiento.toISOString().split('T')[0]
                        : (row.fecha_nacimiento ?? null),
                    edad_meses: row.edad_meses !== null ? Number(row.edad_meses) : null,
                    peso_nacimiento: row.peso_nacimiento !== null ? Number(row.peso_nacimiento) : null,
                    peso_actual: row.peso_actual !== null ? Number(row.peso_actual) : null,
                    valor_adquisicion: Number(row.valor_adquisicion || 0),
                    valor_residual: Number(row.valor_residual || 0),
                    valor_libro_actual: row.valor_libro_actual !== null ? Number(row.valor_libro_actual) : null,
                    amortizacion_acumulada: Number(row.amortizacion_acumulada || 0),
                    meses_amortizados: Number(row.meses_amortizados || 0),
                    es_productor_leche: Number(row.es_productor_leche),
                    estado_vacuno_id: Number(row.estado_vacuno_id),
                    estado_vacuno: this.labelEstadoVacuno(Number(row.estado_vacuno_id)),
                    fecha_ingreso: row.fecha_ingreso instanceof Date
                        ? row.fecha_ingreso.toISOString().split('T')[0]
                        : String(row.fecha_ingreso),
                    estado_id: Number(row.estado_id),
                    estado_registro: this.labelEstado(Number(row.estado_id)),
                    usuario_operacion: row.usuario_operacion ?? null,
                    fecha_registro: row.fecha_registro instanceof Date
                        ? row.fecha_registro.toISOString()
                        : String(row.fecha_registro),
                    fecha_actualizacion: row.fecha_actualizacion instanceof Date
                        ? row.fecha_actualizacion.toISOString()
                        : (row.fecha_actualizacion ?? null),
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de hato: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

    async amortizaciones(query: AmortizacionesQueryDto, usuarioId: number): Promise<AmortizacionesResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'amortizaciones_vacunos', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = [];

            if (query.estado_id) {
                where.push(`av.estado_id = $${pIdx++}`);
                params.push(query.estado_id);
            } else {
                where.push(`av.estado_id = $${pIdx++}`);
                params.push(Estado.ACTIVO);
            }

            if (query.gestion) {
                where.push(`av.gestion = $${pIdx++}`);
                params.push(query.gestion);
            }

            if (query.empresa_id) {
                where.push(`s.empresa_id = $${pIdx++}`);
                params.push(query.empresa_id);
            }
            if (query.sucursal_id) {
                where.push(`v.sucursal_id = $${pIdx++}`);
                params.push(query.sucursal_id);
            }
            if (query.vacuno_id) {
                where.push(`av.vacuno_id = $${pIdx++}`);
                params.push(query.vacuno_id);
            }

            const whereClause = `WHERE ${where.join(' AND ')}`;
            const fromJoins = `
                FROM amortizaciones_vacunos av
                INNER JOIN vacunos v ON v.vacuno_id = av.vacuno_id
                INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                INNER JOIN empresas e ON e.empresa_id = s.empresa_id
            `;

            const resumenRows = await this.dataSource.query(
                `SELECT
                    COUNT(av.amortizacion_vacuno_id) AS cantidad_registros,
                    COUNT(DISTINCT av.vacuno_id) AS cantidad_vacunos,
                    COALESCE(SUM(av.valor_inicial), 0) AS total_valor_inicial,
                    COALESCE(SUM(av.amortizacion_gestion), 0) AS total_amortizado_rango,
                    COALESCE(SUM(av.amortizacion_acumulada), 0) AS total_amort_acumulada,
                    COALESCE(SUM(av.valor_libro), 0) AS total_valor_libro,
                    COALESCE(SUM(av.valor_inicial_ufv), 0) AS total_valor_inicial_ufv,
                    COALESCE(SUM(av.amortizacion_gestion_ufv), 0) AS total_amortizado_rango_ufv,
                    COALESCE(SUM(av.amortizacion_acumulada_ufv), 0) AS total_amort_acumulada_ufv,
                    COALESCE(SUM(av.valor_libro_ufv), 0) AS total_valor_libro_ufv
                ${fromJoins}
                ${whereClause}`,
                params,
            );

            const r = resumenRows[0] ?? {};

            const resumen = {
                cantidad_registros: Number(r.cantidad_registros || 0),
                cantidad_vacunos: Number(r.cantidad_vacunos || 0),
                total_valor_inicial: Number(r.total_valor_inicial || 0),
                total_amortizado_rango: Number(r.total_amortizado_rango || 0),
                total_amort_acumulada: Number(r.total_amort_acumulada || 0),
                total_valor_libro: Number(r.total_valor_libro || 0),
                total_valor_inicial_ufv: Number(r.total_valor_inicial_ufv || 0),
                total_amortizado_rango_ufv: Number(r.total_amortizado_rango_ufv || 0),
                total_amort_acumulada_ufv: Number(r.total_amort_acumulada_ufv || 0),
                total_valor_libro_ufv: Number(r.total_valor_libro_ufv || 0),
            };

            const detalleRows = await this.dataSource.query(
                `SELECT
                    av.amortizacion_vacuno_id, av.vacuno_id,
                    v.arete, v.nombre,
                    av.gestion,
                    e.empresa_id, e.empresa,
                    s.sucursal_id, s.sucursal,
                    rz.raza,
                    cv.categoria,
                    av.valor_inicial, av.amortizacion_gestion, av.amortizacion_acumulada, av.valor_libro,
                    av.valor_inicial_ufv, av.amortizacion_gestion_ufv, av.amortizacion_acumulada_ufv, av.valor_libro_ufv,
                    av.cotizacion_ufv_aplicada, av.fecha_cotizacion_ufv,
                    av.vida_util_anios, av.tasa_amortizacion,
                    av.estado_id,
                    u.login AS usuario_operacion,
                    av.fecha_registro, av.fecha_actualizacion
                ${fromJoins}
                INNER JOIN razas rz ON rz.raza_id = v.raza_id
                INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
                LEFT JOIN usuarios u ON u.usuario_id = COALESCE(av.usuario_id_actualizacion, av.usuario_id_registro)
                ${whereClause}
                ORDER BY av.gestion DESC, v.arete`,
                params,
            );

            return {
                resumen,
                detalle: detalleRows.map((row: any) => ({
                    amortizacion_vacuno_id: Number(row.amortizacion_vacuno_id),
                    vacuno_id: Number(row.vacuno_id),
                    arete: row.arete,
                    nombre: row.nombre,
                    periodo: String(row.gestion),
                    gestion: Number(row.gestion),
                    empresa_id: Number(row.empresa_id),
                    empresa: row.empresa,
                    sucursal_id: Number(row.sucursal_id),
                    sucursal: row.sucursal,
                    raza: row.raza,
                    categoria: row.categoria,
                    valor_inicial: Number(row.valor_inicial || 0),
                    amortizacion_periodo: Number(row.amortizacion_gestion || 0),
                    amortizacion_acumulada: Number(row.amortizacion_acumulada || 0),
                    valor_libro: Number(row.valor_libro || 0),
                    valor_inicial_ufv: row.valor_inicial_ufv !== null ? Number(row.valor_inicial_ufv) : null,
                    amortizacion_periodo_ufv: row.amortizacion_gestion_ufv !== null ? Number(row.amortizacion_gestion_ufv) : null,
                    amortizacion_acumulada_ufv: row.amortizacion_acumulada_ufv !== null ? Number(row.amortizacion_acumulada_ufv) : null,
                    valor_libro_ufv: row.valor_libro_ufv !== null ? Number(row.valor_libro_ufv) : null,
                    cotizacion_ufv_aplicada: row.cotizacion_ufv_aplicada !== null ? Number(row.cotizacion_ufv_aplicada) : null,
                    fecha_cotizacion_ufv: row.fecha_cotizacion_ufv instanceof Date
                        ? row.fecha_cotizacion_ufv.toISOString().split('T')[0]
                        : (row.fecha_cotizacion_ufv ?? null),
                    vida_util_anios: row.vida_util_anios !== null ? Number(row.vida_util_anios) : null,
                    tasa_amortizacion: row.tasa_amortizacion !== null ? Number(row.tasa_amortizacion) : null,
                    estado_id: Number(row.estado_id),
                    estado_registro: this.labelEstado(Number(row.estado_id)),
                    usuario_operacion: row.usuario_operacion ?? null,
                    fecha_registro: row.fecha_registro instanceof Date
                        ? row.fecha_registro.toISOString()
                        : String(row.fecha_registro),
                    fecha_actualizacion: row.fecha_actualizacion instanceof Date
                        ? row.fecha_actualizacion.toISOString()
                        : (row.fecha_actualizacion ?? null),
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de amortizaciones: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }

    async faenas(query: FaenasQueryDto, usuarioId: number): Promise<FaenasResponse> {
        await this.tablaValidador.validarPermisoTabla(usuarioId, 'vacunos_faenas', 'leer');

        try {
            const params: any[] = [];
            let pIdx = 1;
            const where: string[] = [];

            if (query.estado_id) {
                where.push(`f.estado_id = $${pIdx++}`);
                params.push(query.estado_id);
            } else {
                where.push(`f.estado_id IN ($${pIdx++}, $${pIdx++})`);
                params.push(Estado.ACTIVO, Estado.HISTORICO);
            }

            if (query.desde) {
                where.push(`f.fecha_faena >= $${pIdx++}`);
                params.push(query.desde);
            }
            if (query.hasta) {
                where.push(`f.fecha_faena <= $${pIdx++}`);
                params.push(query.hasta);
            }
            if (query.empresa_id) {
                where.push(`e.empresa_id = $${pIdx++}`);
                params.push(query.empresa_id);
            }
            if (query.sucursal_id) {
                where.push(`s.sucursal_id = $${pIdx++}`);
                params.push(query.sucursal_id);
            }
            if (query.vacuno_id) {
                where.push(`f.vacuno_id = $${pIdx++}`);
                params.push(query.vacuno_id);
            }

            const whereClause = `WHERE ${where.join(' AND ')}`;
            const fromJoins = `
                FROM vacunos_faenas f
                INNER JOIN vacunos v ON v.vacuno_id = f.vacuno_id
                INNER JOIN sucursales s ON s.sucursal_id = v.sucursal_id
                INNER JOIN empresas e ON e.empresa_id = s.empresa_id
                INNER JOIN razas rz ON rz.raza_id = v.raza_id
                INNER JOIN categorias_vacuno cv ON cv.categoria_vacuno_id = v.categoria_vacuno_id
            `;

            const resumenRows = await this.dataSource.query(
                `SELECT
                    COUNT(*) AS total_faenas,
                    COALESCE(SUM(f.peso_vivo_faena), 0) AS total_peso_vivo,
                    COALESCE(SUM(f.peso_canal_caliente), 0) AS total_peso_canal_caliente,
                    COALESCE(SUM(f.peso_canal_fria), 0) AS total_peso_canal_fria,
                    AVG(f.rendimiento_canal) AS rendimiento_canal_promedio,
                    MIN(f.rendimiento_canal) AS rendimiento_canal_minimo,
                    MAX(f.rendimiento_canal) AS rendimiento_canal_maximo
                 ${fromJoins}
                 ${whereClause}`,
                params,
            );

            const porMataderoRows = await this.dataSource.query(
                `SELECT
                    COALESCE(f.matadero, 'SIN MATADERO') AS matadero,
                    COUNT(*) AS total_faenas,
                    COALESCE(SUM(f.peso_vivo_faena), 0) AS total_peso_vivo,
                    COALESCE(SUM(f.peso_canal_caliente), 0) AS total_peso_canal_caliente,
                    AVG(f.rendimiento_canal) AS rendimiento_canal_promedio
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY COALESCE(f.matadero, 'SIN MATADERO')
                 ORDER BY total_faenas DESC`,
                params,
            );

            const porSucursalRows = await this.dataSource.query(
                `SELECT
                    s.sucursal_id, s.sucursal,
                    COUNT(*) AS total_faenas,
                    COALESCE(SUM(f.peso_vivo_faena), 0) AS total_peso_vivo,
                    COALESCE(SUM(f.peso_canal_caliente), 0) AS total_peso_canal_caliente,
                    AVG(f.rendimiento_canal) AS rendimiento_canal_promedio
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY s.sucursal_id, s.sucursal
                 ORDER BY total_faenas DESC`,
                params,
            );

            const porCategoriaRows = await this.dataSource.query(
                `SELECT cv.categoria, COUNT(*) AS total
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY cv.categoria
                 ORDER BY total DESC`,
                params,
            );

            const porRazaRows = await this.dataSource.query(
                `SELECT rz.raza, COUNT(*) AS total
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY rz.raza
                 ORDER BY total DESC`,
                params,
            );

            const porFechaRows = await this.dataSource.query(
                `SELECT
                    f.fecha_faena AS fecha,
                    COUNT(*) AS total_faenas,
                    COALESCE(SUM(f.peso_vivo_faena), 0) AS total_peso_vivo,
                    COALESCE(SUM(f.peso_canal_caliente), 0) AS total_peso_canal_caliente,
                    COALESCE(SUM(f.peso_canal_fria), 0) AS total_peso_canal_fria,
                    AVG(f.rendimiento_canal) AS rendimiento_canal_promedio
                 ${fromJoins}
                 ${whereClause}
                 GROUP BY f.fecha_faena
                 ORDER BY f.fecha_faena`,
                params,
            );

            const detalleRows = await this.dataSource.query(
                `SELECT
                    f.faena_id, f.vacuno_id,
                    v.arete, v.nombre,
                    e.empresa_id, e.empresa,
                    s.sucursal_id, s.sucursal,
                    rz.raza_id, rz.raza,
                    cv.categoria_vacuno_id, cv.categoria,
                    f.fecha_faena,
                    f.peso_vivo_faena, f.peso_canal_caliente, f.peso_canal_fria, f.rendimiento_canal,
                    f.matadero, f.numero_guia, f.observaciones,
                    f.estado_id,
                    u.login AS usuario_operacion,
                    f.fecha_registro, f.fecha_actualizacion
                 ${fromJoins}
                 LEFT JOIN usuarios u ON u.usuario_id = COALESCE(f.usuario_id_actualizacion, f.usuario_id_registro)
                 ${whereClause}
                 ORDER BY f.fecha_faena DESC, v.arete`,
                params,
            );

            const r = resumenRows[0] ?? {};

            const resumen = {
                total_faenas: Number(r.total_faenas || 0),
                total_peso_vivo: Number(r.total_peso_vivo || 0),
                total_peso_canal_caliente: Number(r.total_peso_canal_caliente || 0),
                total_peso_canal_fria: r.total_peso_canal_fria !== null ? Number(r.total_peso_canal_fria) : null,
                rendimiento_canal_promedio: r.rendimiento_canal_promedio !== null ? Number(r.rendimiento_canal_promedio) : null,
                rendimiento_canal_minimo: r.rendimiento_canal_minimo !== null ? Number(r.rendimiento_canal_minimo) : null,
                rendimiento_canal_maximo: r.rendimiento_canal_maximo !== null ? Number(r.rendimiento_canal_maximo) : null,
                por_matadero: Object.fromEntries(porMataderoRows.map((row: any) => [row.matadero, Number(row.total_faenas || 0)])),
                por_sucursal: Object.fromEntries(porSucursalRows.map((row: any) => [row.sucursal, Number(row.total_faenas || 0)])),
                por_categoria: Object.fromEntries(porCategoriaRows.map((row: any) => [row.categoria, Number(row.total || 0)])),
                por_raza: Object.fromEntries(porRazaRows.map((row: any) => [row.raza, Number(row.total || 0)])),
            };

            return {
                resumen,
                detalle: detalleRows.map((row: any) => ({
                    faena_id: Number(row.faena_id),
                    vacuno_id: Number(row.vacuno_id),
                    arete: row.arete,
                    nombre: row.nombre,
                    empresa_id: Number(row.empresa_id),
                    empresa: row.empresa,
                    sucursal_id: Number(row.sucursal_id),
                    sucursal: row.sucursal,
                    raza_id: Number(row.raza_id),
                    raza: row.raza,
                    categoria_vacuno_id: Number(row.categoria_vacuno_id),
                    categoria: row.categoria,
                    fecha_faena: row.fecha_faena instanceof Date
                        ? row.fecha_faena.toISOString().split('T')[0]
                        : String(row.fecha_faena),
                    peso_vivo_faena: Number(row.peso_vivo_faena || 0),
                    peso_canal_caliente: Number(row.peso_canal_caliente || 0),
                    peso_canal_fria: row.peso_canal_fria !== null ? Number(row.peso_canal_fria) : null,
                    rendimiento_canal: row.rendimiento_canal !== null ? Number(row.rendimiento_canal) : null,
                    matadero: row.matadero ?? null,
                    numero_guia: row.numero_guia ?? null,
                    observaciones: row.observaciones ?? null,
                    estado_id: Number(row.estado_id),
                    estado_registro: this.labelEstado(Number(row.estado_id)),
                    usuario_operacion: row.usuario_operacion ?? null,
                    fecha_registro: row.fecha_registro instanceof Date
                        ? row.fecha_registro.toISOString()
                        : String(row.fecha_registro),
                    fecha_actualizacion: row.fecha_actualizacion instanceof Date
                        ? row.fecha_actualizacion.toISOString()
                        : (row.fecha_actualizacion ?? null),
                })),
                por_matadero: porMataderoRows.map((row: any) => ({
                    matadero: row.matadero,
                    total_faenas: Number(row.total_faenas || 0),
                    total_peso_vivo: Number(row.total_peso_vivo || 0),
                    total_peso_canal_caliente: Number(row.total_peso_canal_caliente || 0),
                    rendimiento_canal_promedio: row.rendimiento_canal_promedio !== null ? Number(row.rendimiento_canal_promedio) : null,
                })),
                por_fecha: porFechaRows.map((row: any) => ({
                    fecha: row.fecha instanceof Date
                        ? row.fecha.toISOString().split('T')[0]
                        : String(row.fecha),
                    total_faenas: Number(row.total_faenas || 0),
                    total_peso_vivo: Number(row.total_peso_vivo || 0),
                    total_peso_canal_caliente: Number(row.total_peso_canal_caliente || 0),
                    total_peso_canal_fria: row.total_peso_canal_fria !== null ? Number(row.total_peso_canal_fria) : null,
                    rendimiento_canal_promedio: row.rendimiento_canal_promedio !== null ? Number(row.rendimiento_canal_promedio) : null,
                })),
                por_sucursal: porSucursalRows.map((row: any) => ({
                    sucursal_id: Number(row.sucursal_id),
                    sucursal: row.sucursal,
                    total_faenas: Number(row.total_faenas || 0),
                    total_peso_vivo: Number(row.total_peso_vivo || 0),
                    total_peso_canal_caliente: Number(row.total_peso_canal_caliente || 0),
                    rendimiento_canal_promedio: row.rendimiento_canal_promedio !== null ? Number(row.rendimiento_canal_promedio) : null,
                })),
            };
        } catch (error: unknown) {
            throw new DomainException(
                `Error al generar el reporte de faenas: ${getErrorMessage(error)}`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }
    }
}
