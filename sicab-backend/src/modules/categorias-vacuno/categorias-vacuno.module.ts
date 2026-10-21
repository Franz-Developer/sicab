// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\categorias-vacuno.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasVacunoController } from './categorias-vacuno.controller';
import { CategoriasVacunoService } from './categorias-vacuno.service';
import { CategoriaVacuno } from './entities/categoria-vacuno.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([CategoriaVacuno]),
    ],
    controllers: [CategoriasVacunoController],
    providers: [CategoriasVacunoService],
    exports: [CategoriasVacunoService],
})
export class CategoriasVacunoModule {}
