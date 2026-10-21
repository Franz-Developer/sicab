// C:\sistemas\sicab\sicab-backend\src\modules\parametros-globales\parametros-globales.controller.ts
import { Controller, Get, Body, Patch, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { UpdateRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FindParametrosGlobalesQueryDto } from './dto/find-parametros-globales-query.dto';
import { ParametroGlobalResponseDto } from './dto/parametro-global-response.dto';
import { UpdateParametroGlobalDto } from './dto/update-parametro-global.dto';
import { ParametrosGlobalesService } from './parametros-globales.service';

@UseGuards(JwtAuthGuard)
@Controller('parametros-globales')
export class ParametrosGlobalesController {
    constructor(
        private readonly parametrosGlobalesService: ParametrosGlobalesService,
    ) {}

    // GET /parametros_globales - Listar parámetros
    @Get()
    @FindAllRateLimit()
    @Cache('parametros_globales', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true }))
        query: FindParametrosGlobalesQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<ParametroGlobalResponseDto>> {
        return this.parametrosGlobalesService.findAll(query, user.usuario_id);
    }

    // GET /parametros_globales/:id - Obtener un parámetro
    @Get(':id')
    @FindOneRateLimit()
    @Cache('parametros_globales', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<ParametroGlobalResponseDto> {
        return this.parametrosGlobalesService.findOne(id, user.usuario_id);
    }

    // PATCH /parametros_globales/:id - Actualizar parámetro
    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('parametros_globales')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateParametroGlobalDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<ParametroGlobalResponseDto> {
        return this.parametrosGlobalesService.update(id, dto, user.usuario_id);
    }
}
