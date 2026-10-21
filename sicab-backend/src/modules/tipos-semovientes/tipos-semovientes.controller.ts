// C:\sistemas\sicab\sicab-backend\src\modules\tipos-semovientes\tipos-semovientes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit, ArchiveRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTipoSemovienteDto } from './dto/create-tipo-semoviente.dto';
import { FindTiposSemovientesQueryDto } from './dto/find-tipos-semovientes-query.dto';
import { TipoSemovienteResponseDto } from './dto/tipo-semoviente-response.dto';
import { UpdateTipoSemovienteDto } from './dto/update-tipo-semoviente.dto';
import { TiposSemovientesService } from './tipos-semovientes.service';

@UseGuards(JwtAuthGuard)
@Controller('tipos-semovientes')
export class TiposSemovientesController {
    constructor(
        private readonly tiposSemovientesService: TiposSemovientesService,
    ) {}

    @Post()
    @CreateRateLimit()
    @InvalidateCache('tipos_semovientes')
    create(
        @Body() dto: CreateTipoSemovienteDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoSemovienteResponseDto> {
        return this.tiposSemovientesService.create(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('tipos_semovientes', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindTiposSemovientesQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<TipoSemovienteResponseDto>> {
        return this.tiposSemovientesService.findAll<TipoSemovienteResponseDto>(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('tipos_semovientes', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoSemovienteResponseDto> {
        return this.tiposSemovientesService.findOne<TipoSemovienteResponseDto>(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('tipos_semovientes')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTipoSemovienteDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoSemovienteResponseDto> {
        return this.tiposSemovientesService.update(id, dto, user.usuario_id);
    }

    @Patch(':id/archivar')
    @ArchiveRateLimit()
    @InvalidateCache('tipos_semovientes')
    archivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoSemovienteResponseDto> {
        return this.tiposSemovientesService.archivar<TipoSemovienteResponseDto>(id, user.usuario_id);
    }

    @Patch(':id/desarchivar')
    @ArchiveRateLimit()
    @InvalidateCache('tipos_semovientes')
    desarchivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoSemovienteResponseDto> {
        return this.tiposSemovientesService.desarchivar<TipoSemovienteResponseDto>(id, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('tipos_semovientes')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoSemovienteResponseDto> {
        return this.tiposSemovientesService.remove<TipoSemovienteResponseDto>(id, user.usuario_id);
    }
}
