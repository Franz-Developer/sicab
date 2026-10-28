// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\dto\update-tarea-programada.dto.ts
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsInt, IsIn, IsObject, MaxLength } from 'class-validator';
import { Frecuencia } from '@/common/constants/estados.constant';
import { emptyToUndefined } from '@/common/utils/transform.helper';

export class UpdateTareaProgramadaDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'descripcion no puede exceder los 500 caracteres.' })
  @Transform(emptyToUndefined)
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'frecuencia_id debe ser un número entero.' })
  @IsIn([Frecuencia.MINUTOS, Frecuencia.HORAS, Frecuencia.DIARIO, Frecuencia.SEMANAL, Frecuencia.MENSUAL, Frecuencia.ANUAL, Frecuencia.CRON, Frecuencia.CONTINUA, Frecuencia.TRIGGER_EVENTO, Frecuencia.NINGUNO], { message: 'frecuencia_id no es un valor permitido.' })
  frecuencia_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'cron_expresion no puede exceder los 100 caracteres.' })
  @Transform(emptyToUndefined)
  cron_expresion?: string;

  @IsOptional()
  @IsObject({ message: 'parametros debe ser un objeto JSON.' })
  parametros?: Record<string, any>;

  @IsOptional()
  @IsInt({ message: 'notificar_admin debe ser 0 o 1.' })
  @IsIn([0, 1], { message: 'notificar_admin solo admite 0 o 1.' })
  notificar_admin?: number;
}
