// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\ejecutores\calculo-categorias.ejecutor.ts
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TareaEjecutor } from './tarea-ejecutor.interface';
import { EstadoVacuno, SexoBiologico, ESTADO_ACTIVO } from '../../../common/constants/estados.constant';

interface VacunoAEvaluar {
    vacuno_id: number;
    arete: string;
    sexo_biologico_id: number;
    categoria_vacuno_id: number;
    edad_meses: number;
}

interface CategoriaCandidata {
    categoria_vacuno_id: number;
    categoria: string;
    codigo: string;
    edad_min_meses: number | null;
    edad_max_meses: number | null;
    sexo_biologico_permitido_id: number;
}

interface CategoriaResuelta {
    categoria_vacuno_id: number;
    categoria: string;
    codigo: string;
}

@Injectable()
export class CalculoCategoriasEjecutor implements TareaEjecutor {
    readonly codigo = 'CALCULO_CATEGORIAS_DIARIO';
    private readonly logger = new Logger(CalculoCategoriasEjecutor.name);

    async ejecutar(manager: EntityManager, parametros: Record<string, any> | null): Promise<void> {
        const loteSize = Number(parametros?.['lote_size'] ?? 100);
        const soloActivos = parametros?.['solo_activos'] !== false;
        const logCambios = parametros?.['log_cambios'] === true;

        const params: any[] = [ESTADO_ACTIVO];
        let filtroActivos = '';

        if (soloActivos) {
            filtroActivos = `AND v.estado_vacuno_id NOT IN ($2, $3, $4)`;
            params.push(EstadoVacuno.FAENADO, EstadoVacuno.VENDIDO, EstadoVacuno.MUERTO);
        }

        const vacunos: VacunoAEvaluar[] = await manager.query(
            `SELECT v.vacuno_id, v.arete, v.sexo_biologico_id, v.categoria_vacuno_id,
                    EXTRACT(YEAR FROM AGE(CURRENT_DATE, v.fecha_nacimiento)) * 12
                    + EXTRACT(MONTH FROM AGE(CURRENT_DATE, v.fecha_nacimiento)) AS edad_meses
            FROM vacunos v
            WHERE v.estado_id = $1
                ${filtroActivos}
                AND v.fecha_nacimiento IS NOT NULL
                AND v.vacuno_id <> 1`,
            params,
        );

        if (vacunos.length === 0) {
            this.logger.log('No hay vacunos activos para evaluar.');
            return;
        }

        const categorias: CategoriaCandidata[] = await manager.query(
            `SELECT categoria_vacuno_id, categoria, codigo, edad_min_meses, edad_max_meses, sexo_biologico_permitido_id
             FROM categorias_vacuno
             WHERE estado_id = $1
               AND categoria_vacuno_id > 1`,
            [ESTADO_ACTIVO],
        );

        let totalCambiados = 0;

        for (let i = 0; i < vacunos.length; i += loteSize) {
            const lote = vacunos.slice(i, i + loteSize);

            for (const v of lote) {
                const nuevaCategoria = this.resolverCategoria(v, categorias);

                if (
                    nuevaCategoria &&
                    Number(nuevaCategoria.categoria_vacuno_id) !== Number(v.categoria_vacuno_id)
                ) {
                    await manager.query(
                        `UPDATE vacunos
                        SET categoria_vacuno_id = $1,
                            usuario_id_actualizacion = 1,
                            fecha_actualizacion = CURRENT_TIMESTAMP
                        WHERE vacuno_id = $2`,
                        [nuevaCategoria.categoria_vacuno_id, v.vacuno_id],
                    );

                    totalCambiados++;

                    if (logCambios) {
                        const sexoLabel = v.sexo_biologico_id === SexoBiologico.MACHO ? 'MACHO' : 'HEMBRA';

                        this.logger.debug(
                            `Vacuno ${v.arete} (ID ${v.vacuno_id}): categoría ${v.categoria_vacuno_id} → ` +
                            `${nuevaCategoria.categoria_vacuno_id} (${nuevaCategoria.codigo}) ` +
                            `por edad ${v.edad_meses} meses y sexo ${sexoLabel}.`,
                        );
                    }
                }
            }
        }

        this.logger.log(
            `Recategorización finalizada: ${totalCambiados} de ${vacunos.length} vacunos actualizados.`,
        );
    }

    private resolverCategoria(
        vacuno: VacunoAEvaluar,
        categorias: CategoriaCandidata[],
    ): CategoriaResuelta | null {
        const candidatas = categorias
            .filter(
                (c) =>
                    c.sexo_biologico_permitido_id === vacuno.sexo_biologico_id &&
                    (c.edad_min_meses === null || c.edad_min_meses <= vacuno.edad_meses) &&
                    (c.edad_max_meses === null || c.edad_max_meses >= vacuno.edad_meses),
            )
            .sort((a, b) => {
                const aMin = a.edad_min_meses ?? -Infinity;
                const bMin = b.edad_min_meses ?? -Infinity;
                if (bMin !== aMin) return bMin - aMin;

                const aMax = a.edad_max_meses ?? Infinity;
                const bMax = b.edad_max_meses ?? Infinity;
                if (aMax !== bMax) return aMax - bMax;

                return a.categoria_vacuno_id - b.categoria_vacuno_id;
            });

        if (candidatas.length === 0) {
            this.logger.warn(
                `No se encontró categoría para el vacuno ${vacuno.arete} (ID ${vacuno.vacuno_id}) ` +
                `con sexo ${vacuno.sexo_biologico_id} y edad ${vacuno.edad_meses} meses.`,
            );
            return null;
        }

        const c = candidatas[0]!;
        return {
            categoria_vacuno_id: c.categoria_vacuno_id,
            categoria: c.categoria,
            codigo: c.codigo,
        };
    }
}
