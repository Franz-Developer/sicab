// C:\sistemas\sicab\sicab-backend\src\modules\roles-permisos-tablas\roles-permisos-tablas.controller.ts
import { Controller, Get, Body, Patch, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { UpdateRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateRolPermisoTablaDto } from './dto/update-rol-permiso-tabla.dto';
import { RolPermisoTablaResponseDto } from './dto/rol-permiso-tabla-response.dto';
import { FindRolesPermisosTablasQueryDto } from './dto/find-roles-permisos-tablas-query.dto';
import { RolesPermisosTablasService } from './roles-permisos-tablas.service';

@UseGuards(JwtAuthGuard)
@Controller('roles-permisos-tablas')
export class RolesPermisosTablasController {
    constructor(
        private readonly rolesPermisosTablasService: RolesPermisosTablasService,
    ) {}

    @Get()
    @FindAllRateLimit()
    @Cache('roles_permisos_tablas', CACHE_BASE)
    findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindRolesPermisosTablasQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<RolPermisoTablaResponseDto>> {
        return this.rolesPermisosTablasService.findAll(query, user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('roles_permisos_tablas', CACHE_BASE)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<RolPermisoTablaResponseDto> {
        return this.rolesPermisosTablasService.findOne(id, user.usuario_id);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @InvalidateCache('roles_permisos_tablas')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRolPermisoTablaDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<RolPermisoTablaResponseDto> {
        return this.rolesPermisosTablasService.update(id, dto, user.usuario_id);
    }

    @Patch(':id/habilitar')
    @UpdateRateLimit()
    @InvalidateCache('roles_permisos_tablas')
    habilitar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<RolPermisoTablaResponseDto> {
        return this.rolesPermisosTablasService.habilitar(id, user.usuario_id);
    }
}