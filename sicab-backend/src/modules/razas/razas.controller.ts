// C:\sistemas\sicab\sicab-backend\src\modules\razas\razas.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, ArchiveRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { FileUrlService } from '../../common/services/file-url.service';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRazaDto } from './dto/create-raza.dto';
import { FindRazasQueryDto } from './dto/find-razas-query.dto';
import { RazaResponseDto } from './dto/raza-response.dto';
import { UpdateRazaDto } from './dto/update-raza.dto';
import { RazasService } from './razas.service';

@UseGuards(JwtAuthGuard)
@Controller('razas')
export class RazasController {
    constructor(
        private readonly razasService: RazasService,
        private readonly fileUrlService: FileUrlService,
        private readonly imagenValidator: ImagenValidatorService,
    ) {}

    private transformarFoto(raza: RazaResponseDto): RazaResponseDto {
        if (raza?.foto) {
            raza.foto = this.fileUrlService.getFileUrl(raza.foto, 'razas_fotos') || '';
        }
        return raza;
    }

    @Post()
    @CreateRateLimit()
    @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
    @InvalidateCache('razas')
    async create(
        @Body() dto: CreateRazaDto,
        @UploadedFile() file: Express.Multer.File | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<RazaResponseDto> {
        const fotoActual = dto.foto ?? undefined;

        if (file || (fotoActual && fotoActual.trim() !== '')) {
            dto.foto = await this.imagenValidator.procesarImagen(
                file,
                fotoActual,
                'foto_raza_config',
                'razas_fotos',
            );
        }

        const raza = await this.razasService.create(dto, user.usuario_id);
        return this.transformarFoto(raza);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('razas', CACHE_BASE)
    async findAll(
        @Query(CustomValidationPipe({ concise: true }))
        query: FindRazasQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<RazaResponseDto>> {
        const result = await this.razasService.findAll<RazaResponseDto>(query, user.usuario_id);
        result.data = result.data.map((raza: RazaResponseDto) => this.transformarFoto(raza));
        return result;
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('razas', CACHE_BASE)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<RazaResponseDto> {
        const raza = await this.razasService.findOne<RazaResponseDto>(id, user.usuario_id);
        return this.transformarFoto(raza);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
    @InvalidateCache('razas')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRazaDto,
        @UploadedFile() file: Express.Multer.File | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<RazaResponseDto> {
        const fotoActual = dto.foto ?? undefined;

        if (file || (fotoActual && fotoActual.trim() !== '')) {
            dto.foto = await this.imagenValidator.procesarImagen(
                file,
                fotoActual,
                'foto_raza_config',
                'razas_fotos',
            );
        } else if (dto.foto === '') {
            delete dto.foto;
        }

        const raza = await this.razasService.update(id, dto, user.usuario_id);
        return this.transformarFoto(raza);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('razas')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<RazaResponseDto> {
        const raza = await this.razasService.remove<RazaResponseDto>(id, user.usuario_id);
        return this.transformarFoto(raza);
    }

    @Patch(':id/archivar')
    @ArchiveRateLimit()
    @InvalidateCache('razas')
    async archivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<RazaResponseDto> {
        const raza = await this.razasService.archivar<RazaResponseDto>(id, user.usuario_id);
        return this.transformarFoto(raza);
    }

    @Patch(':id/desarchivar')
    @ArchiveRateLimit()
    @InvalidateCache('razas')
    async desarchivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<RazaResponseDto> {
        const raza = await this.razasService.desarchivar<RazaResponseDto>(id, user.usuario_id);
        return this.transformarFoto(raza);
    }
}
