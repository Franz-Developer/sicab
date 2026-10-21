// C:\sistemas\sicab\sicab-backend\src\modules\roles-permisos-tablas\dto\update-rol-permiso-tabla.dto.ts
import { IsInt, IsIn, IsOptional, Min } from 'class-validator';

export class UpdateRolPermisoTablaDto {
    @IsOptional()
    @IsInt({ message: 'rol_id debe ser un número entero.' })
    @Min(1, { message: 'rol_id debe ser mayor a 0.' })
    rol_id?: number;

    @IsOptional()
    @IsInt({ message: 'tabla_id debe ser un número entero.' })
    @Min(1, { message: 'tabla_id debe ser mayor a 0.' })
    tabla_id?: number;

    @IsOptional()
    @IsInt({ message: 'leer debe ser un número entero.' })
    @IsIn([0, 1], { message: 'leer debe ser 0 o 1.' })
    leer?: number;

    @IsOptional()
    @IsInt({ message: 'crear debe ser un número entero.' })
    @IsIn([0, 1], { message: 'crear debe ser 0 o 1.' })
    crear?: number;

    @IsOptional()
    @IsInt({ message: 'editar debe ser un número entero.' })
    @IsIn([0, 1], { message: 'editar debe ser 0 o 1.' })
    editar?: number;

    @IsOptional()
    @IsInt({ message: 'eliminar debe ser un número entero.' })
    @IsIn([0, 1], { message: 'eliminar debe ser 0 o 1.' })
    eliminar?: number;

    @IsOptional()
    @IsInt({ message: 'anular debe ser un número entero.' })
    @IsIn([0, 1], { message: 'anular debe ser 0 o 1.' })
    anular?: number;

    @IsOptional()
    @IsInt({ message: 'archivar debe ser un número entero.' })
    @IsIn([0, 1], { message: 'archivar debe ser 0 o 1.' })
    archivar?: number;

    @IsOptional()
    @IsInt({ message: 'desarchivar debe ser un número entero.' })
    @IsIn([0, 1], { message: 'desarchivar debe ser 0 o 1.' })
    desarchivar?: number;

    @IsOptional()
    @IsInt({ message: 'estado_id debe ser un número entero.' })
    @IsIn([1000, 1002], { message: 'estado_id debe ser 1000 (ACTIVO) o 1002 (HISTÓRICO).' })
    estado_id?: number;
}
