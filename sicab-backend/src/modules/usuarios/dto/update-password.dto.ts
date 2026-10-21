// C:\sistemas\sicab\sicab-backend\src\modules\usuarios\dto\update-password.dto.ts
import { IsString, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';

export class UpdatePasswordDto {
    @IsString({ message: 'La contraseña actual debe ser texto.' })
    @IsNotEmpty({ message: 'La contraseña actual es obligatoria.' })
    contrasenaActual!: string;

    @IsString({ message: 'La nueva contraseña debe ser texto.' })
    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria.' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres.' })
    @MaxLength(20, { message: 'La nueva contraseña no debe exceder los 20 caracteres.' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>\/?\\|`~]).+$/, {
        message: 'La nueva contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo.'
    })
    nuevaContrasena!: string;

    @IsString({ message: 'La confirmación de contraseña debe ser texto.' })
    @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria.' })
    confirmarContrasena!: string;
}
