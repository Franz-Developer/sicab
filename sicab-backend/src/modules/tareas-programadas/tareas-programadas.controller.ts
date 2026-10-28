// C:\sistemas\sicab\sicab-backend\src\modules\tareas-programadas\tareas-programadas.controller.ts
import { Controller, Get, Post, Patch, Body, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { UpdateRateLimit, DeleteRateLimit, ArchiveRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FindTareasProgramadasQueryDto } from './dto/find-tareas-programadas-query.dto';
import { TareaProgramadaResponseDto } from './dto/tarea-programada-response.dto';
import { UpdateTareaProgramadaDto } from './dto/update-tarea-programada.dto';
import { TareasProgramadasService } from './tareas-programadas.service';
import { TareaDispatcherService } from './ejecutores/tarea-dispatcher.service'

@UseGuards(JwtAuthGuard)
@Controller('tareas-programadas')
export class TareasProgramadasController {
    constructor(
        private readonly tareasProgramadasService: TareasProgramadasService,
        private readonly tareaDispatcher: TareaDispatcherService,
    ) {}

    // GET /tareas-programadas - Listar tareas
    @Get()
    @FindAllRateLimit()
    findAll(
        @Query(CustomValidationPipe({ concise: true }))
        query: FindTareasProgramadasQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<TareaProgramadaResponseDto>> {
        return this.tareasProgramadasService.findAll(query, user.usuario_id);
    }

    // GET /tareas-programadas/:id - Obtener una tarea por ID
    @Get(':id')
    @FindOneRateLimit()
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TareaProgramadaResponseDto> {
        return this.tareasProgramadasService.findOne(id, user.usuario_id);
    }

    // PATCH /tareas-programadas/:id - Actualizar tarea
    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('tareas_programadas')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTareaProgramadaDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<TareaProgramadaResponseDto> {
        return this.tareasProgramadasService.update(id, dto, user.usuario_id);
    }

    // DELETE /tareas-programadas/:id - Eliminar tarea (borrado lógico)
    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('tareas_programadas')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TareaProgramadaResponseDto> {
        return this.tareasProgramadasService.remove<TareaProgramadaResponseDto>(id, user.usuario_id);
    }

    // PATCH /tareas-programadas/:id/archivar - Archivar tarea
    @Patch(':id/archivar')
    @ArchiveRateLimit()
    @InvalidateCache('tareas_programadas')
    archivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TareaProgramadaResponseDto> {
        return this.tareasProgramadasService.archivar<TareaProgramadaResponseDto>(id, user.usuario_id);
    }

    // PATCH /tareas-programadas/:id/desarchivar - Desarchivar tarea (volver a ACTIVO)
    @Patch(':id/desarchivar')
    @ArchiveRateLimit()
    @InvalidateCache('tareas_programadas')
    desarchivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<TareaProgramadaResponseDto> {
        return this.tareasProgramadasService.desarchivar<TareaProgramadaResponseDto>(id, user.usuario_id);
    }

    // =========================================================================
    // ⚠️ ENDPOINT TEMPORAL DE PRUEBA — BORRAR DESPUÉS DE USAR ⚠️
    // =========================================================================
    @Post('test-ejecutar/:codigo')
    async testEjecutar(@Param('codigo') codigo: string): Promise<{ ok: boolean; mensaje: string }> {
        await this.tareaDispatcher.ejecutar(codigo, {
            lote_size: 100,
            solo_activos: true,
            log_cambios: true,
        });
        return { ok: true, mensaje: `Tarea "${codigo}" ejecutada manualmente.` };
    }
}
