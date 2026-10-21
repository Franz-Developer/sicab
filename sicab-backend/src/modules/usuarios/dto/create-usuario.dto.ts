// C:\sistemas\sicab\sicab-backend\src\modules\usuarios\dto\create-usuario.dto.ts
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, MinLength, Matches, IsPositive } from 'class-validator';
import { IsSafeText } from '../../../common/decorators/safe-text.decorator';
import { IsOptionalImage } from '../../../common/decorators/image.decorator';

export class CreateUsuarioDto {
    @IsInt({ message: 'trabajador_id debe ser un número entero.' })
    @IsPositive({ message: 'trabajador_id debe ser un número positivo.' })
    trabajador_id: number;

    @IsInt({ message: 'rol_id debe ser un número entero.' })
    @IsPositive({ message: 'rol_id debe ser un número positivo.' })
    rol_id: number;

    @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
    @IsString({ message: 'login debe ser un texto.' })
    @IsNotEmpty({ message: 'login es obligatorio.' })
    @MinLength(4, { message: 'login debe tener al menos 4 caracteres.' })
    @MaxLength(10, { message: 'login no puede exceder los 10 caracteres.' })
    @Matches(/^[A-Z0-9._-]+$/, { message: 'login contiene caracteres no permitidos.' })
    @IsSafeText()
    login: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString({ message: 'contrasena debe ser un texto.' })
    @IsNotEmpty({ message: 'contrasena es obligatoria.' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    @MaxLength(20, { message: 'La contraseña no debe exceder los 20 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>\/?\\|`~]).+$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo.'
    })
    contrasena: string;

    @IsOptionalImage()
    avatar?: string;
}
