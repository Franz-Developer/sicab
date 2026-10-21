// C:\sistemas\sicab\sicab-backend\src\modules\producciones-leche\producciones-leche.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DTOs de Cabecera
import { CreateProduccionLecheDto } from './dto/create-produccion-leche.dto';
import { FindProduccionesLecheQueryDto } from './dto/find-producciones-leche-query.dto';
import { ProduccionLecheResponseDto } from './dto/produccion-leche-response.dto';
import { UpdateProduccionLecheDto } from './dto/update-produccion-leche.dto';

// DTOs de Detalle
import { CreateProduccionLecheDetalleDto } from './dto/create-produccion-leche-detalle.dto';
import { UpdateProduccionLecheDetalleDto } from './dto/update-produccion-leche-detalle.dto';
import { FindProduccionesLecheDetalleQueryDto } from './dto/find-producciones-leche-detalle-query.dto';
import { ProduccionLecheDetalleResponseDto } from './dto/produccion-leche-detalle-response.dto';

import { ProduccionesLecheService } from './producciones-leche.service';
import { ProduccionLecheDetalleService } from './producciones-leche-detalle.service';

@UseGuards(JwtAuthGuard)
@Controller('producciones-leche')
export class ProduccionesLecheController {
    constructor(
        private readonly produccionesLecheService: ProduccionesLecheService,
        private readonly detalleService: ProduccionLecheDetalleService,
    ) {}

    // ========================================================================
    // ENDPOINTS DE CABECERA
    // ========================================================================

    @Post()
    @CreateRateLimit()
    @InvalidateCache(['producciones_leche', 'producciones_leche_detalle'])
    create(
        @Body() dto: CreateProduccionLecheDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheResponseDto> {
        return this.produccionesLecheService.create(dto, user.usuario_id);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('producciones_leche', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindProduccionesLecheQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<ProduccionLecheResponseDto>> {
        return this.produccionesLecheService.findAll<ProduccionLecheResponseDto>(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('producciones_leche', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheResponseDto> {
        return this.produccionesLecheService.findOne<ProduccionLecheResponseDto>(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache(['producciones_leche', 'producciones_leche_detalle'])
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProduccionLecheDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheResponseDto> {
        return this.produccionesLecheService.update(id, dto, user.usuario_id);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache(['producciones_leche', 'producciones_leche_detalle'])
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheResponseDto> {
        return this.produccionesLecheService.remove<ProduccionLecheResponseDto>(id, user.usuario_id);
    }

    // ========================================================================
    // ENDPOINTS DE DETALLE (Anidados a la cabecera)
    // ========================================================================

    @Get(':id/detalles')
    @FindAllRateLimit()
    @Cache('producciones_leche_detalle', CACHE_BASE)
    findAllDetalles(
        @Param('id', ParseIntPipe) id: number,
        @Query(CustomValidationPipe({ concise: true })) query: FindProduccionesLecheDetalleQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<ProduccionLecheDetalleResponseDto>> {
        return this.detalleService.findAllByProduccion(id, query, user.usuario_id);
    }

    @Get(':id/detalles/:detalleId')
    @FindOneRateLimit()
    @Cache('producciones_leche_detalle', CACHE_BASE)
    findOneDetalle(
        @Param('id', ParseIntPipe) id: number,
        @Param('detalleId', ParseIntPipe) detalleId: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return this.detalleService.findOneDetalle(id, detalleId, user.usuario_id);
    }

    @Post(':id/detalles')
    @CreateRateLimit()
    @InvalidateCache(['producciones_leche', 'producciones_leche_detalle'])
    createDetalle(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateProduccionLecheDetalleDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return this.detalleService.create(id, dto, user.usuario_id);
    }

    @Patch(':id/detalles/:detalleId')
    @UpdateRateLimit()
    @InvalidateCache(['producciones_leche', 'producciones_leche_detalle'])
    updateDetalle(
        @Param('id', ParseIntPipe) id: number,
        @Param('detalleId', ParseIntPipe) detalleId: number,
        @Body() dto: UpdateProduccionLecheDetalleDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return this.detalleService.update(id, detalleId, dto, user.usuario_id);
    }

    @Delete(':id/detalles/:detalleId')
    @DeleteRateLimit()
    @InvalidateCache(['producciones_leche', 'producciones_leche_detalle'])
    removeDetalle(
        @Param('id', ParseIntPipe) id: number,
        @Param('detalleId', ParseIntPipe) detalleId: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<ProduccionLecheDetalleResponseDto> {
        return this.detalleService.removeDetalle(id, detalleId, user.usuario_id);
    }
}
