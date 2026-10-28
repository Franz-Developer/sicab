// C:\sistemas\sicab\sicab-backend\src\modules\empresas\empresas.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, ArchiveRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { DomainException } from '../../common/exceptions/domain.exception';
import { FileUrlService } from '../../common/services/file-url.service';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { EmpresaResponseDto } from './dto/empresa-response.dto';
import { FindEmpresasQueryDto } from './dto/find-empresas-query.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresasService } from './empresas.service';

@UseGuards(JwtAuthGuard)
@Controller('empresas')
export class EmpresasController {
    constructor(
        private readonly empresasService: EmpresasService,
        private readonly fileUrlService: FileUrlService,
        private readonly imagenValidator: ImagenValidatorService,
    ) {}

    private transformarLogo(empresa: EmpresaResponseDto): EmpresaResponseDto {
        if (empresa?.logo) {
            empresa.logo = this.fileUrlService.getLogoUrl(empresa.logo) || '';
        }
        return empresa;
    }

    @Post()
    @CreateRateLimit()
    @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() }))
    @InvalidateCache('empresas')
    async create(
        @Body() dto: CreateEmpresaDto,
        @UploadedFile() file: Express.Multer.File | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<EmpresaResponseDto> {
        if (file || (dto.logo && dto.logo.trim() !== '')) {
            dto.logo = await this.imagenValidator.procesarImagen(file, dto.logo, 'logo_config', 'logos');
        }

        if (!dto.logo) {
            throw new DomainException(
                'Debe subir un logo. Toda empresa debe tener un logo.',
                { httpStatus: HttpStatus.BAD_REQUEST }
            );
        }

        const empresa = await this.empresasService.create(dto, user.usuario_id);
        return this.transformarLogo(empresa);
    }

    @Get()
    @FindAllRateLimit()
    async findAll(
        @Query(CustomValidationPipe({ concise: true }))
        query: FindEmpresasQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<EmpresaResponseDto>> {
        const result = await this.empresasService.findAll<EmpresaResponseDto>(
            query,
            user.usuario_id
        );

        result.data = result.data.map((empresa: EmpresaResponseDto) =>
            this.transformarLogo(empresa)
        );
        return result;
    }

    @Get(':id')
    @FindOneRateLimit()
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<EmpresaResponseDto> {
        const empresa = await this.empresasService.findOne<EmpresaResponseDto>(id, user.usuario_id);
        return this.transformarLogo(empresa);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @UseInterceptors(FileInterceptor('logo', { storage: memoryStorage() }))
    @InvalidateCache('empresas')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEmpresaDto,
        @UploadedFile() file: Express.Multer.File | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<EmpresaResponseDto> {
        if (file || (dto.logo && dto.logo.trim() !== '')) {
            dto.logo = await this.imagenValidator.procesarImagen(file, dto.logo, 'logo_config', 'logos');
        } else if (dto.logo === '') {
            delete dto.logo;
        }

        const empresa = await this.empresasService.update(id, dto, user.usuario_id);
        return this.transformarLogo(empresa);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('empresas')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<EmpresaResponseDto> {
        const empresa = await this.empresasService.remove<EmpresaResponseDto>(id, user.usuario_id);
        return this.transformarLogo(empresa);
    }

    @Patch(':id/archivar')
    @ArchiveRateLimit()
    @InvalidateCache('empresas')
    async archivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<EmpresaResponseDto> {
        const empresa = await this.empresasService.archivar<EmpresaResponseDto>(id, user.usuario_id);
        return this.transformarLogo(empresa);
    }

    @Patch(':id/desarchivar')
    @ArchiveRateLimit()
    @InvalidateCache('empresas')
    async desarchivar(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<EmpresaResponseDto> {
        const empresa = await this.empresasService.desarchivar<EmpresaResponseDto>(id, user.usuario_id);
        return this.transformarLogo(empresa);
    }
}
