// C:\sistemas\sicab\sicab-backend\src\modules\tipos-cambios\tipos-cambios.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTipoCambioDto } from './dto/create-tipo-cambio.dto';
import { FindTiposCambiosQueryDto } from './dto/find-tipos-cambios-query.dto';
import { TipoCambioResponseDto } from './dto/tipo-cambio-response.dto';
import { UpdateTipoCambioDto } from './dto/update-tipo-cambio.dto';
import { TiposCambiosService, GestionesDisponiblesResult, ValoresInicialesResult } from './tipos-cambios.service';
import { UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportarExcelResponseDto } from './dto/importar-excel-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('tipos-cambios')
export class TiposCambiosController {
    constructor(
        private readonly tiposCambiosService: TiposCambiosService,
    ) {}

    @Post()
    @CreateRateLimit()
    @InvalidateCache('tipos_cambios')
    create(
        @Body() dto: CreateTipoCambioDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoCambioResponseDto> {
        return this.tiposCambiosService.create(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('tipos_cambios', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindTiposCambiosQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<TipoCambioResponseDto>> {
        return this.tiposCambiosService.findAll(query, user.usuario_id);
    }

    @Get('gestiones')
    @FindAllRateLimit()
    @Cache('tipos_cambios', CACHE_BASE)
    obtenerGestiones(
        @GetUser() user: AuthenticatedUser,
    ): Promise<GestionesDisponiblesResult> {
        return this.tiposCambiosService.obtenerGestionesDisponibles(user.usuario_id);
    }

    @Get('valores-iniciales')
    @FindAllRateLimit()
    @Cache('tipos_cambios', CACHE_BASE)
    obtenerValoresIniciales(
        @GetUser() user: AuthenticatedUser,
    ): Promise<ValoresInicialesResult> {
        return this.tiposCambiosService.obtenerValoresIniciales(user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('tipos_cambios', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoCambioResponseDto> {
        return this.tiposCambiosService.findOne(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('tipos_cambios')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTipoCambioDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoCambioResponseDto> {
        return this.tiposCambiosService.update(id, dto, user.usuario_id);
    }

    @Delete('borrar-gestion/:gestion')
    @DeleteRateLimit()
    @InvalidateCache('tipos_cambios')
    borrarGestion(
        @Param('gestion', ParseIntPipe) gestion: number,
        @GetUser() user: AuthenticatedUser,
    ): Promise<{
        total: number;
        borradas: number;
        reactivadas: number;
        omitidasPorUso: number;
    }> {
        return this.tiposCambiosService.borrarGestion(gestion, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('tipos_cambios')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TipoCambioResponseDto> {
        return this.tiposCambiosService.remove(id, user.usuario_id);
    }

    @Post('importar-excel')
    @UseInterceptors(FileInterceptor('file'))
    @CreateRateLimit()
    @InvalidateCache('tipos_cambios')
    async importarExcel(
        @UploadedFile() file: Express.Multer.File,
        @GetUser() user: AuthenticatedUser,
    ): Promise<ImportarExcelResponseDto> {
        if (!file) {
            throw new BadRequestException('No se envió ningún archivo.');
        }
        return this.tiposCambiosService.importarDesdeExcel(file, user.usuario_id);
    }
}
