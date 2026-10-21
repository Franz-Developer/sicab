// C:\sistemas\sicab\sicab-backend\src\modules\turnos-ordeno\turnos-ordeno.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, ArchiveRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTurnoOrdenoDto } from './dto/create-turno-ordeno.dto';
import { FindTurnosOrdenoQueryDto } from './dto/find-turnos-ordeno-query.dto';
import { TurnoOrdenoResponseDto } from './dto/turno-ordeno-response.dto';
import { UpdateTurnoOrdenoDto } from './dto/update-turno-ordeno.dto';
import { TurnosOrdenoService } from './turnos-ordeno.service';

@UseGuards(JwtAuthGuard)
@Controller('turnos-ordeno')
export class TurnosOrdenoController {
    constructor(
        private readonly turnosOrdenoService: TurnosOrdenoService,
    ) {}

    @Post()
    @CreateRateLimit()
    @InvalidateCache('turnos_ordeno')
    create(
        @Body() dto: CreateTurnoOrdenoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TurnoOrdenoResponseDto> {
        return this.turnosOrdenoService.create(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('turnos_ordeno', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindTurnosOrdenoQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<TurnoOrdenoResponseDto>> {
        return this.turnosOrdenoService.findAll<TurnoOrdenoResponseDto>(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('turnos_ordeno', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TurnoOrdenoResponseDto> {
        return this.turnosOrdenoService.findOne<TurnoOrdenoResponseDto>(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('turnos_ordeno')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTurnoOrdenoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TurnoOrdenoResponseDto> {
        return this.turnosOrdenoService.update(id, dto, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('turnos_ordeno')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TurnoOrdenoResponseDto> {
        return this.turnosOrdenoService.remove<TurnoOrdenoResponseDto>(id, user.usuario_id);
    }

    @Patch(':id/archivar')
    @ArchiveRateLimit()
    @InvalidateCache('turnos_ordeno')
    archivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TurnoOrdenoResponseDto> {
        return this.turnosOrdenoService.archivar<TurnoOrdenoResponseDto>(id, user.usuario_id);
    }

    @Patch(':id/desarchivar')
    @ArchiveRateLimit()
    @InvalidateCache('turnos_ordeno')
    desarchivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TurnoOrdenoResponseDto> {
        return this.turnosOrdenoService.desarchivar<TurnoOrdenoResponseDto>(id, user.usuario_id);
    }
}
