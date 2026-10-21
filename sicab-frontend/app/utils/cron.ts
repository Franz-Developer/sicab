// C:\sistemas\sicab\sicab-frontend\app\utils\cron.ts

export function interpretarCron(expr: string | null | undefined): string {
    if (!expr) return '—';

    const partes = String(expr).trim().split(/\s+/);
    if (partes.length !== 5) return expr;

    const [minStr = '*', horaStr = '*', diaStr = '*', mesStr = '*', diaSemStr = '*'] = partes;

    const min = Number(minStr);
    const hora = Number(horaStr);
    const dia = Number(diaStr);
    const mes = Number(mesStr);

    const diaSemanaNombre = (n: number): string | null => {
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        return dias[n] ?? null;
    };

    const mesNombre = (n: number): string | null => {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return meses[n - 1] ?? null;
    };

    const partes_: string[] = [];

    const horaValida = !isNaN(hora) && horaStr !== '*';
    const minValido = !isNaN(min) && minStr !== '*';

    if (horaValida && minValido) {
        partes_.push(`a las ${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    } else if (horaValida) {
        partes_.push(`cada minuto de la hora ${hora}`);
    } else if (minValido) {
        partes_.push(`en el minuto ${min}`);
    }

    if (diaStr === '*' && mesStr === '*' && diaSemStr === '*') {
        partes_.push('todos los días');
    } else if (diaStr === '*' && mesStr === '*' && diaSemStr !== '*') {
        const nombres = diaSemStr.split(',').map((d) => diaSemanaNombre(Number(d))).filter(Boolean);
        partes_.push(nombres.length ? `los ${nombres.join(', ')}` : `día de semana ${diaSemStr}`);
    } else if (diaStr !== '*' && mesStr === '*') {
        partes_.push(`el día ${dia} de cada mes`);
    } else if (diaStr === '*' && mesStr !== '*') {
        const nombres = mesStr.split(',').map((m) => mesNombre(Number(m))).filter(Boolean);
        partes_.push(nombres.length ? `en ${nombres.join(', ')}` : `en el mes ${mesStr}`);
    } else if (diaStr !== '*' && mesStr !== '*') {
        const nombreMes = mesNombre(mes);
        partes_.push(nombreMes ? `el ${dia} de ${nombreMes}` : `${dia}/${mesStr}`);
    }

    return partes_.length ? partes_.join(' ') : expr;
}
