// C:\sistemas\sicab\sicab-backend\src\modules\vacunos-faenas\vacunos-faenas.controller.ts
import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, FindAllRateLimit, FindOneRateLimit, UpdateRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVacunoFaenaDto } from './dto/create-vacuno-faena.dto';
import { UpdateVacunoFaenaDto } from './dto/update-vacuno-faena.dto';
import { FindVacunosFaenasQueryDto } from './dto/find-vacunos-faenas-query.dto';
import { VacunoFaenaResponseDto } from './dto/vacuno-faena-response.dto';
import { VacunosFaenasService } from './vacunos-faenas.service';

@UseGuards(JwtAuthGuard)
@Controller('vacunos-faenas')
export class VacunosFaenasController {
    constructor(private readonly vacunosFaenasService: VacunosFaenasService) {}

    @Get()
    @FindAllRateLimit()
    @Cache('vacunos_faenas', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindVacunosFaenasQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<VacunoFaenaResponseDto>> {
        return this.vacunosFaenasService.findAll(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('vacunos_faenas', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoFaenaResponseDto> {
        return this.vacunosFaenasService.findOne(id, user.usuario_id);
    }

    @Post()
    @CreateRateLimit()
    @InvalidateCache(['vacunos_faenas', 'vacunos'])
    create(
        @Body() dto: CreateVacunoFaenaDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoFaenaResponseDto> {
        return this.vacunosFaenasService.create(dto, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('vacunos_faenas')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVacunoFaenaDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoFaenaResponseDto> {
        return this.vacunosFaenasService.update(id, dto, user.usuario_id);
    }
}
