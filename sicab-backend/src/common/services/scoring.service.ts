// C:\sistemas\sicab\sicab-backend\src\common\services\scoring.service.ts
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DomainException } from '../exceptions/domain.exception';
import { ConfiguracionService } from './configuracion.service';
import { Estado, Calificacion, PuntajeOrigen } from '../constants/estados.constant';


export interface ScoringAntecedenteResult {
    puntajeAplicado: number;
    puntajeAcumulado: number;
    categoriaCambiada: boolean;
    categoriaAnteriorId: number | null;
    categoriaNuevaId: number | null;
    antecedenteId: number | null;
}

@Injectable()
export class ScoringService {
    private readonly logger = new Logger(ScoringService.name);

    constructor(
        private readonly configuracionService: ConfiguracionService,
    ) {}

    /**
     * Procesa una calificación de cliente y, si aplica, ejecuta el flujo
     * completo de scoring descrito en R.6 de solicitudes_viaje:
     *
     *  1. Determinar si la calificación dispara un antecedente (negativo o positivo)
     *     según los umbrales configurados en parametros_globales.
     *  2. Insertar el antecedente en trabajador_antecedentes (con snapshot del puntaje).
     *  3. Recalcular trabajadores.puntaje_acumulado.
     *  4. Determinar la nueva categoría y actualizar conductores_categorias si cambia.
     *
     * IMPORTANTE: Este método DEBE ejecutarse dentro de una transacción existente.
     * El `manager` recibido debe ser un EntityManager transaccional.
     *
     * @param trabajadorId ID del conductor calificado.
     * @param solicitudViajeId ID del viaje que originó la calificación.
     * @param calificacionCliente ID de la calificación (5300-5304).
     * @param usuarioId Usuario que ejecuta la operación.
     * @param manager EntityManager transaccional (obligatorio).
     */
    async procesarCalificacion(
        trabajadorId: number,
        solicitudViajeId: number,
        calificacionCliente: number,
        usuarioId: number,
        manager: EntityManager,
    ): Promise<ScoringAntecedenteResult> {
        const resultado: ScoringAntecedenteResult = {
            puntajeAplicado: 0,
            puntajeAcumulado: 0,
            categoriaCambiada: false,
            categoriaAnteriorId: null,
            categoriaNuevaId: null,
            antecedenteId: null,
        };

        // ============================================================
        // PASO 1: Leer umbrales y tipos de antecedente desde parametros_globales
        // ============================================================
        const umbralNegativo = await this.configuracionService
            .obtenerValorTipado<number>('calificacion_umbral_antecedente_negativo');

        const umbralPositivo = await this.configuracionService
            .obtenerValorTipado<number>('calificacion_umbral_antecedente_positivo');

        if (umbralNegativo === null && umbralPositivo === null) {
            this.logger.warn(
                'No hay umbrales de calificación configurados. Se omite el scoring.',
            );
            return resultado;
        }

        // ============================================================
        // PASO 2: Determinar si la calificación dispara un antecedente
        // ============================================================
        let tipoAntecedenteDetalleId: number | null = null;

        if (
            umbralNegativo !== null &&
            calificacionCliente <= umbralNegativo &&
            calificacionCliente !== Calificacion.SIN_CALIFICAR
        ) {
            tipoAntecedenteDetalleId = await this.configuracionService
                .obtenerValorTipado<number>('calificacion_tipo_antecedente_negativo_id');
        } else if (
            umbralPositivo !== null &&
            calificacionCliente >= umbralPositivo
        ) {
            tipoAntecedenteDetalleId = await this.configuracionService
                .obtenerValorTipado<number>('calificacion_tipo_antecedente_positivo_id');
        }

        // Si no hay tipo de antecedente que aplicar, terminamos
        if (!tipoAntecedenteDetalleId) {
            this.logger.debug(
                `Calificación ${calificacionCliente} no dispara antecedente para trabajador ${trabajadorId}.`,
            );
            return resultado;
        }

        // ============================================================
        // PASO 3: Obtener el puntaje del catálogo (SNAPSHOT)
        // ============================================================
        const tipoDetalle = await manager.query(
            `SELECT puntaje, nombre, tipo_antecedente_id
             FROM tipos_antecedente_detalle
             WHERE tipo_antecedente_detalle_id = $1
               AND estado_id = $2`,
            [tipoAntecedenteDetalleId, Estado.ACTIVO],
        );

        if (!tipoDetalle?.[0]) {
            throw new DomainException(
                `El tipo de antecedente configurado (${tipoAntecedenteDetalleId}) no existe o no está activo.`,
                { httpStatus: HttpStatus.INTERNAL_SERVER_ERROR },
            );
        }

        const puntajeAplicado = Number(tipoDetalle[0].puntaje);
        const nombreAntecedente = tipoDetalle[0].nombre;

        // ============================================================
        // PASO 4: Pasar el ACTIVO anterior a HISTÓRICO (regla R.14)
        // ============================================================
        await manager.query(
            `UPDATE trabajador_antecedentes
             SET estado_id = 1002,
                 usuario_id_actualizacion = $1,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE trabajador_id = $2
               AND estado_id = 1000`,
            [usuarioId, trabajadorId],
        );

        // ============================================================
        // PASO 5: Insertar el nuevo antecedente (con snapshot del puntaje)
        // ============================================================
        const motivo = this.construirMotivo(
            nombreAntecedente,
            calificacionCliente,
            solicitudViajeId,
        );

        const insertResult = await manager.query(
            `INSERT INTO trabajador_antecedentes
                (trabajador_id, tipo_antecedente_detalle_id, puntaje_aplicado,
                 fecha_antecedente, motivo, estado_id, usuario_id_registro)
             VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6)
             RETURNING antecedente_id`,
            [
                trabajadorId,
                tipoAntecedenteDetalleId,
                puntajeAplicado,
                motivo,
                Estado.ACTIVO,
                usuarioId,
            ],
        );

        const antecedenteId = Number(insertResult[0].antecedente_id);
        resultado.antecedenteId = antecedenteId;
        resultado.puntajeAplicado = puntajeAplicado;

        // ============================================================
        // PASO 6: Recalcular puntaje_acumulado del trabajador
        // ============================================================
        const puntajeResult = await manager.query(
            `UPDATE trabajadores
             SET puntaje_acumulado = GREATEST(
                    COALESCE((
                        SELECT SUM(puntaje_aplicado)
                        FROM trabajador_antecedentes
                        WHERE trabajador_id = $1
                          AND estado_id = 1000
                          AND antecedente_id > 1
                    ), 0),
                    0
                 ),
                 fecha_ultimo_calculo_puntaje = CURRENT_TIMESTAMP,
                 usuario_id_actualizacion = $2,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE trabajador_id = $1
               AND estado_id = $3
             RETURNING puntaje_acumulado`,
            [trabajadorId, usuarioId, Estado.ACTIVO],
        );

        const puntajeAcumulado = Number(puntajeResult[0]?.puntaje_acumulado ?? 0);
        resultado.puntajeAcumulado = puntajeAcumulado;

        // ============================================================
        // PASO 7: Determinar la nueva categoría
        // ============================================================
        const nuevaCategoria = await this.obtenerCategoriaPorPuntaje(
            puntajeAcumulado,
            manager,
        );

        if (!nuevaCategoria) {
            this.logger.warn(
                `No se encontró categoría para puntaje ${puntajeAcumulado}. Se omite cambio de categoría.`,
            );
            return resultado;
        }

        // ============================================================
        // PASO 8: Comparar con la categoría vigente y actualizar si cambia
        // ============================================================
        const categoriaVigente = await manager.query(
            `SELECT conductor_categoria_id, categoria_conductor_id
             FROM conductores_categorias
             WHERE trabajador_id = $1
               AND es_activo = 1
               AND estado_id = $2
             LIMIT 1`,
            [trabajadorId, Estado.ACTIVO],
        );

        const categoriaAnteriorId = categoriaVigente?.[0]
            ? Number(categoriaVigente[0].categoria_conductor_id)
            : null;

        if (categoriaAnteriorId === Number(nuevaCategoria.categoria_conductor_id)) {
            this.logger.debug(
                `El conductor ${trabajadorId} mantiene su categoría ${categoriaAnteriorId}.`,
            );
            return resultado;
        }

        // Cambió la categoría → ejecutar transición
        resultado.categoriaCambiada = true;
        resultado.categoriaAnteriorId = categoriaAnteriorId;
        resultado.categoriaNuevaId = Number(nuevaCategoria.categoria_conductor_id);

        // 8.1. Cerrar la categoría vigente (si existe)
        if (categoriaVigente?.[0]) {
            await manager.query(
                `UPDATE conductores_categorias
                 SET es_activo = 0,
                     fecha_hasta = CURRENT_DATE,
                     estado_id = 1002,
                     usuario_id_actualizacion = $1,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE conductor_categoria_id = $2`,
                [usuarioId, categoriaVigente[0].conductor_categoria_id],
            );
        }

        // 8.2. Insertar la nueva categoría
        const esPrimeraAsignacion = categoriaAnteriorId === null ? 1 : 0;
        const puntajeAnterior = puntajeAcumulado - puntajeAplicado;

        await manager.query(
            `INSERT INTO conductores_categorias
                (trabajador_id, categoria_conductor_id, categoria_anterior_id,
                 puntaje_origen_id, antecedente_id, solicitud_viaje_id,
                 puntaje_anterior, puntaje_nuevo, puntaje_al_asignar,
                 puntaje_minimo_categoria, puntaje_maximo_categoria,
                 monto_frecuencia_categoria, es_primera_asignacion,
                 fecha_desde, fecha_hasta, es_activo, motivo_cambio,
                 estado_id, usuario_id_registro)
             VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $7, $8, $9, $10, $11,
                     CURRENT_DATE, NULL, 1, $12, $13, $14)`,
            [
                trabajadorId,
                nuevaCategoria.categoria_conductor_id,
                categoriaAnteriorId,
                PuntajeOrigen.ANTECEDENTE,
                antecedenteId,
                puntajeAnterior,
                puntajeAcumulado,
                nuevaCategoria.puntaje_minimo,
                nuevaCategoria.puntaje_maximo,
                nuevaCategoria.monto_frecuencia,
                esPrimeraAsignacion,
                `Cambio automático por calificación ${calificacionCliente} en viaje #${solicitudViajeId}`,
                Estado.ACTIVO,
                usuarioId,
            ],
        );

        this.logger.log(
            `Conductor ${trabajadorId} cambió de categoría ${categoriaAnteriorId ?? 'NULL'} → ${nuevaCategoria.categoria_conductor_id} (puntaje: ${puntajeAcumulado})`,
        );

        return resultado;
    }

    /**
     * Recalcula el puntaje acumulado del trabajador y actualiza su categoría
     * si corresponde. Reutilizable desde cualquier módulo que inserte
     * antecedentes manualmente (ej. trabajador-antecedentes.service.ts).
     *
     * IMPORTANTE: Este método DEBE ejecutarse dentro de una transacción existente.
     *
     * @param trabajadorId ID del trabajador.
     * @param antecedenteId ID del antecedente recién insertado.
     * @param puntajeAplicado Puntaje aplicado por el antecedente.
     * @param usuarioId Usuario que ejecuta la operación.
     * @param manager EntityManager transaccional (obligatorio).
     * @param motivoCambio Texto descriptivo para el registro en conductores_categorias.
     */
    async recalcularPuntajeYCategoria(
        trabajadorId: number,
        antecedenteId: number,
        puntajeAplicado: number,
        usuarioId: number,
        manager: EntityManager,
        motivoCambio: string,
    ): Promise<ScoringAntecedenteResult> {
        const resultado: ScoringAntecedenteResult = {
            puntajeAplicado,
            puntajeAcumulado: 0,
            categoriaCambiada: false,
            categoriaAnteriorId: null,
            categoriaNuevaId: null,
            antecedenteId,
        };

        // Recalcular puntaje acumulado
        const puntajeResult = await manager.query(
            `UPDATE trabajadores
             SET puntaje_acumulado = GREATEST(
                    COALESCE((
                        SELECT SUM(puntaje_aplicado)
                        FROM trabajador_antecedentes
                        WHERE trabajador_id = $1
                          AND estado_id = 1000
                          AND antecedente_id > 1
                    ), 0),
                    0
                 ),
                 fecha_ultimo_calculo_puntaje = CURRENT_TIMESTAMP,
                 usuario_id_actualizacion = $2,
                 fecha_actualizacion = CURRENT_TIMESTAMP
             WHERE trabajador_id = $1
               AND estado_id = $3
             RETURNING puntaje_acumulado`,
            [trabajadorId, usuarioId, Estado.ACTIVO],
        );

        const puntajeAcumulado = Number(puntajeResult[0]?.puntaje_acumulado ?? 0);
        resultado.puntajeAcumulado = puntajeAcumulado;

        // Determinar nueva categoría
        const nuevaCategoria = await this.obtenerCategoriaPorPuntaje(
            puntajeAcumulado,
            manager,
        );

        if (!nuevaCategoria) {
            this.logger.warn(
                `No se encontró categoría para puntaje ${puntajeAcumulado}. Se omite cambio de categoría.`,
            );
            return resultado;
        }

        // Comparar con categoría vigente
        const categoriaVigente = await manager.query(
            `SELECT conductor_categoria_id, categoria_conductor_id
             FROM conductores_categorias
             WHERE trabajador_id = $1
               AND es_activo = 1
               AND estado_id = $2
             LIMIT 1`,
            [trabajadorId, Estado.ACTIVO],
        );

        const categoriaAnteriorId = categoriaVigente?.[0]
            ? Number(categoriaVigente[0].categoria_conductor_id)
            : null;

        if (categoriaAnteriorId === Number(nuevaCategoria.categoria_conductor_id)) {
            return resultado;
        }

        resultado.categoriaCambiada = true;
        resultado.categoriaAnteriorId = categoriaAnteriorId;
        resultado.categoriaNuevaId = Number(nuevaCategoria.categoria_conductor_id);

        // Cerrar categoría vigente
        if (categoriaVigente?.[0]) {
            await manager.query(
                `UPDATE conductores_categorias
                 SET es_activo = 0,
                     fecha_hasta = CURRENT_DATE,
                     estado_id = 1002,
                     usuario_id_actualizacion = $1,
                     fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE conductor_categoria_id = $2`,
                [usuarioId, categoriaVigente[0].conductor_categoria_id],
            );
        }

        // Insertar nueva categoría
        const esPrimeraAsignacion = categoriaAnteriorId === null ? 1 : 0;
        const puntajeAnterior = puntajeAcumulado - puntajeAplicado;

        await manager.query(
            `INSERT INTO conductores_categorias
                (trabajador_id, categoria_conductor_id, categoria_anterior_id,
                 puntaje_origen_id, antecedente_id, solicitud_viaje_id,
                 puntaje_anterior, puntaje_nuevo, puntaje_al_asignar,
                 puntaje_minimo_categoria, puntaje_maximo_categoria,
                 monto_frecuencia_categoria, es_primera_asignacion,
                 fecha_desde, fecha_hasta, es_activo, motivo_cambio,
                 estado_id, usuario_id_registro)
             VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $7, $8, $9, $10, $11,
                     CURRENT_DATE, NULL, 1, $12, $13, $14)`,
            [
                trabajadorId,
                nuevaCategoria.categoria_conductor_id,
                categoriaAnteriorId,
                PuntajeOrigen.ANTECEDENTE,
                antecedenteId,
                puntajeAnterior,
                puntajeAcumulado,
                nuevaCategoria.puntaje_minimo,
                nuevaCategoria.puntaje_maximo,
                nuevaCategoria.monto_frecuencia,
                esPrimeraAsignacion,
                motivoCambio,
                Estado.ACTIVO,
                usuarioId,
            ],
        );

        this.logger.log(
            `Conductor ${trabajadorId} cambió de categoría ${categoriaAnteriorId ?? 'NULL'} → ${nuevaCategoria.categoria_conductor_id} (puntaje: ${puntajeAcumulado})`,
        );

        return resultado;
    }

    /**
     * Obtiene la categoría activa cuyo rango contiene el puntaje dado.
     * Excluye el comodín (categoria_conductor_id = 1, codigo = 'N').
     */
    private async obtenerCategoriaPorPuntaje(
        puntaje: number,
        manager: EntityManager,
    ): Promise<{
        categoria_conductor_id: number;
        puntaje_minimo: number;
        puntaje_maximo: number;
        monto_frecuencia: number;
    } | null> {
        const result = await manager.query(
            `SELECT categoria_conductor_id, puntaje_minimo, puntaje_maximo, monto_frecuencia
             FROM categorias_conductores
             WHERE estado_id = $1
               AND categoria_conductor_id > 1
               AND $2 BETWEEN puntaje_minimo AND puntaje_maximo
             ORDER BY nivel ASC
             LIMIT 1`,
            [Estado.ACTIVO, puntaje],
        );

        if (!result?.[0]) return null;

        return {
            categoria_conductor_id: Number(result[0].categoria_conductor_id),
            puntaje_minimo: Number(result[0].puntaje_minimo),
            puntaje_maximo: Number(result[0].puntaje_maximo),
            monto_frecuencia: Number(result[0].monto_frecuencia),
        };
    }

    private construirMotivo(
        nombreAntecedente: string,
        calificacion: number,
        solicitudViajeId: number,
    ): string {
        return `${nombreAntecedente} - Calificación ${calificacion}★ en viaje #${solicitudViajeId}`;
    }
}
