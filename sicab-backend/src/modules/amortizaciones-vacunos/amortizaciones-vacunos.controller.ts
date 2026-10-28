// C:\sistemas\sicab\sicab-backend\src\modules\amortizaciones-vacunos\amortizaciones-vacunos.controller.ts
import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAmortizacionVacunoDto } from './dto/create-amortizacion-vacuno.dto';
import { FindAmortizacionesVacunosQueryDto } from './dto/find-amortizaciones-vacunos-query.dto';
import { AmortizacionVacunoResponseDto } from './dto/amortizacion-vacuno-response.dto';
import { AmortizacionesVacunosService, BulkAmortizarResult, PeriodosDisponibles } from './amortizaciones-vacunos.service';
import { DeleteAmortizacionByGestionDto } from './dto/delete-amortizacion-by-gestion.dto';

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
        @Body(CustomValidationPipe({ concise: true })) dto: CreateAmortizacionVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<BulkAmortizarResult> {
        return this.amortizacionesVacunosService.bulkAmortizar(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindAmortizacionesVacunosQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<AmortizacionVacunoResponseDto>> {
        return this.amortizacionesVacunosService.findAll<AmortizacionVacunoResponseDto>(query, user.usuario_id);
    }

    @Get('periodos-disponibles')
    @FindAllRateLimit()
    getPeriodosDisponibles(
        @Query('empresa_id', new ParseIntPipe({ optional: true })) empresa_id: number | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<PeriodosDisponibles> {
        return this.amortizacionesVacunosService.getPeriodosDisponibles(user.usuario_id, empresa_id);
    }

    @Get('periodos-para-calcular')
    @FindAllRateLimit()
    getPeriodosParaCalcular(
        @Query('moneda_destino_id', ParseIntPipe) moneda_destino_id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<PeriodosDisponibles> {
        return this.amortizacionesVacunosService.getPeriodosParaCalcular(user.usuario_id, moneda_destino_id);
    }

    @Post('eliminar-por-gestion')
    @DeleteRateLimit()
    @InvalidateCache('amortizaciones_vacunos')
    eliminarPorGestion(
        @Body(CustomValidationPipe({ concise: true })) dto: DeleteAmortizacionByGestionDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<{ eliminados: number }> {
        return this.amortizacionesVacunosService.eliminarPorGestion(dto, user.usuario_id);
    }

    @Get('gestiones-amortizadas')
    @FindAllRateLimit()
    getGestionesAmortizadas(
        @Query('empresa_id', new ParseIntPipe({ optional: true })) empresa_id: number | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<PeriodosDisponibles> {
        return this.amortizacionesVacunosService.getGestionesAmortizadas(user.usuario_id, empresa_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<AmortizacionVacunoResponseDto> {
        return this.amortizacionesVacunosService.findOne<AmortizacionVacunoResponseDto>(id, user.usuario_id);
    }
}
