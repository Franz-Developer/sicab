// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\amortizaciones-vacunos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAmortizacionVacunoDto } from './dto/create-amortizacion-vacuno.dto';
import { FindAmortizacionesVacunosQueryDto } from './dto/find-amortizaciones-vacunos-query.dto';
import { AmortizacionVacunoResponseDto } from './dto/amortizacion-vacuno-response.dto';
import { UpdateAmortizacionVacunoDto } from './dto/update-amortizacion-vacuno.dto';
import { AmortizacionesVacunosService, BulkAmortizarResult, PeriodosDisponibles } from './amortizaciones-vacunos.service';

@UseGuards(JwtAuthGuard)
@Controller('amortizaciones-vacunos')
export class AmortizacionesVacunosController {
    constructor(
        private readonly amortizacionesVacunosService: AmortizacionesVacunosService,
    ) {}

    @Post()
    @CreateRateLimit()
    @InvalidateCache('amortizaciones_vacunos')
    create(
        @Body() dto: CreateAmortizacionVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<BulkAmortizarResult> {
        return this.amortizacionesVacunosService.bulkAmortizar(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('amortizaciones_vacunos', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindAmortizacionesVacunosQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<AmortizacionVacunoResponseDto>> {
        return this.amortizacionesVacunosService.findAll<AmortizacionVacunoResponseDto>(query, user.usuario_id);
    }

    @Get('periodos-disponibles')
    @FindAllRateLimit()
    @Cache('amortizaciones_vacunos', CACHE_BASE)
    getPeriodosDisponibles(
        @GetUser() user: AuthenticatedUser
    ): Promise<PeriodosDisponibles> {
        return this.amortizacionesVacunosService.getPeriodosDisponibles(user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('amortizaciones_vacunos', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<AmortizacionVacunoResponseDto> {
        return this.amortizacionesVacunosService.findOne<AmortizacionVacunoResponseDto>(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('amortizaciones_vacunos')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAmortizacionVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<AmortizacionVacunoResponseDto> {
        return this.amortizacionesVacunosService.update(id, dto, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('amortizaciones_vacunos')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<AmortizacionVacunoResponseDto> {
        return this.amortizacionesVacunosService.remove<AmortizacionVacunoResponseDto>(id, user.usuario_id);
    }
}
