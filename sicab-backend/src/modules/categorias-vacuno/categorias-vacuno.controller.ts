// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\categorias-vacuno.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, ArchiveRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { CategoriasVacunoService } from './categorias-vacuno.service';
import { CategoriaVacunoResponseDto } from './dto/categoria-vacuno-response.dto';
import { CreateCategoriaVacunoDto } from './dto/create-categoria-vacuno.dto';
import { FindCategoriasVacunoQueryDto } from './dto/find-categorias-vacuno-query.dto';
import { UpdateCategoriaVacunoDto } from './dto/update-categoria-vacuno.dto';

@Controller('categorias-vacuno')
export class CategoriasVacunoController {
    constructor(
        private readonly categoriasVacunoService: CategoriasVacunoService,
    ) {}

    @Get()
    @FindAllRateLimit()
    findAll(
        @Query(CustomValidationPipe({ concise: true }))
        query: FindCategoriasVacunoQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<CategoriaVacunoResponseDto>> {
        return this.categoriasVacunoService.findAll(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<CategoriaVacunoResponseDto> {
        return this.categoriasVacunoService.findOne(id, user.usuario_id);
    }

    @Post()
    @CreateRateLimit()
    @InvalidateCache('categorias_vacuno')
    create(
        @Body(CustomValidationPipe({ concise: true })) dto: CreateCategoriaVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<CategoriaVacunoResponseDto> {
        return this.categoriasVacunoService.create(dto, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('categorias_vacuno')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(CustomValidationPipe({ concise: true })) dto: UpdateCategoriaVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<CategoriaVacunoResponseDto> {
        return this.categoriasVacunoService.update(id, dto, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('categorias_vacuno')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<CategoriaVacunoResponseDto> {
        return this.categoriasVacunoService.remove<CategoriaVacunoResponseDto>(id, user.usuario_id);
    }

    @Patch(':id/archivar')
    @ArchiveRateLimit()
    @InvalidateCache('categorias_vacuno')
    archivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<CategoriaVacunoResponseDto> {
        return this.categoriasVacunoService.archivar<CategoriaVacunoResponseDto>(id, user.usuario_id);
    }

    @Patch(':id/desarchivar')
    @ArchiveRateLimit()
    @InvalidateCache('categorias_vacuno')
    desarchivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<CategoriaVacunoResponseDto> {
        return this.categoriasVacunoService.desarchivar<CategoriaVacunoResponseDto>(id, user.usuario_id);
    }
}
