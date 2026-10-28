// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\scheduler\cron-resolver.util.ts
import { Frecuencia } from '../../../common/constants/estados.constant';

export function resolverCron(
    frecuenciaId: number,
    cronExpresion: string | null,
): string | null {
    if (frecuenciaId === Frecuencia.CRON) {
        return cronExpresion && cronExpresion.trim() !== '' ? cronExpresion.trim() : null;
    }

    const map: Record<number, string | null> = {
        [Frecuencia.MINUTOS]: '* * * * *',
        [Frecuencia.HORAS]: '0 * * * *',
        [Frecuencia.DIARIO]: '0 2 * * *',
        [Frecuencia.SEMANAL]: '0 2 * * 1',
        [Frecuencia.MENSUAL]: '0 2 1 * *',
        [Frecuencia.ANUAL]: '0 2 1 1 *',
        [Frecuencia.CONTINUA]: null,
        [Frecuencia.TRIGGER_EVENTO]: null,
        [Frecuencia.NINGUNO]: null,
    };

    return map[frecuenciaId] ?? null;
}
