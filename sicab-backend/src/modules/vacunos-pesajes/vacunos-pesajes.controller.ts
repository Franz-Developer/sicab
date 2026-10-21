// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-pesajes\vacunos-pesajes.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVacunoPesajeDto } from './dto/create-vacuno-pesaje.dto';
import { FindVacunosPesajesQueryDto } from './dto/find-vacunos-pesajes-query.dto';
import { VacunoPesajeResponseDto } from './dto/vacuno-pesaje-response.dto';
import { UpdateVacunoPesajeDto } from './dto/update-vacuno-pesaje.dto';
import { VacunosPesajesService } from './vacunos-pesajes.service';

@UseGuards(JwtAuthGuard)
@Controller('vacunos-pesajes')
export class VacunosPesajesController {
    constructor(
        private readonly vacunosPesajesService: VacunosPesajesService,
    ) {}

    @Post()
    @CreateRateLimit()
    @InvalidateCache('vacunos_pesajes')
    create(
        @Body() dto: CreateVacunoPesajeDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoPesajeResponseDto> {
        return this.vacunosPesajesService.create(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('vacunos_pesajes', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindVacunosPesajesQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<VacunoPesajeResponseDto>> {
        return this.vacunosPesajesService.findAll<VacunoPesajeResponseDto>(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('vacunos_pesajes', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoPesajeResponseDto> {
        return this.vacunosPesajesService.findOne<VacunoPesajeResponseDto>(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('vacunos_pesajes')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVacunoPesajeDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoPesajeResponseDto> {
        return this.vacunosPesajesService.update(id, dto, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('vacunos_pesajes')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoPesajeResponseDto> {
        return this.vacunosPesajesService.remove<VacunoPesajeResponseDto>(id, user.usuario_id);
    }
}
