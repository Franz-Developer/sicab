// C:\sistemas\sicab\sicab-backend\src\modules\reportes\reportes.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { FindAllRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProduccionQueryDto } from './dto/produccion-query.dto';
import { HatoQueryDto } from './dto/hato-query.dto';
import { AmortizacionesQueryDto } from './dto/amortizaciones-query.dto';
import { ReportesService } from './reportes.service';
import { ProduccionResponse } from './interfaces/produccion-response.interface';
import { HatoResponse } from './interfaces/hato-response.interface';
import { AmortizacionesResponse } from './interfaces/amortizaciones-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) {}

    @Get('produccion')
    @FindAllRateLimit()
    @Cache('reportes', CACHE_BASE)
    produccion(
        @Query(CustomValidationPipe({ concise: true })) query: ProduccionQueryDto,
        @GetUser() user: AuthenticatedUser,
    ): Promise<ProduccionResponse> {
        return this.reportesService.produccion(query, user.usuario_id);
    }

    @Get('hato')
    @FindAllRateLimit()
    @Cache('reportes', CACHE_BASE)
    hato(
        @Query(CustomValidationPipe({ concise: true })) query: HatoQueryDto,
        @GetUser() user: AuthenticatedUser,
    ): Promise<HatoResponse> {
        return this.reportesService.hato(query, user.usuario_id);
    }

    @Get('amortizaciones')
    @FindAllRateLimit()
    @Cache('reportes', CACHE_BASE)
    amortizaciones(
        @Query(CustomValidationPipe({ concise: true })) query: AmortizacionesQueryDto,
        @GetUser() user: AuthenticatedUser,
    ): Promise<AmortizacionesResponse> {
        return this.reportesService.amortizaciones(query, user.usuario_id);
    }
}
