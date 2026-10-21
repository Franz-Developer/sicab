import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCategoriaVacunoDto } from './create-categoria-vacuno.dto';
import { CondicionProductorLeche, SexoBiologico } from '../../../common/constants/estados.constant';

export class UpdateCategoriaVacunoDto extends PartialType(
    OmitType(CreateCategoriaVacunoDto, ['es_productor_leche', 'sexo_biologico_permitido_id'] as const)
) {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo es_productor_leche debe ser un número entero.' })
    @IsIn([CondicionProductorLeche.NO_PRODUCTOR, CondicionProductorLeche.PRODUCTOR])
    es_productor_leche?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El campo sexo_biologico_permitido_id debe ser un número entero.' })
    @IsIn([SexoBiologico.MACHO, SexoBiologico.HEMBRA])
    sexo_biologico_permitido_id?: number;
}
