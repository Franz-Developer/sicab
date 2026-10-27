// C:\sistemas\sicab\sicab-backend\src\modules\vacunos\vacunos.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { InvalidateCache } from '../../common/decorators/invalidate-cache.decorator';
import { CreateRateLimit, UpdateRateLimit, DeleteRateLimit, FindAllRateLimit, FindOneRateLimit } from '../../common/decorators/rate-limit.decorator';
import { CustomValidationPipe } from '../../common/decorators/validation-message.decorator';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { FileUrlService } from '../../common/services/file-url.service';
import { ImagenValidatorService } from '../../common/validators/imagen-validator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVacunoDto } from './dto/create-vacuno.dto';
import { FindVacunosQueryDto } from './dto/find-vacunos-query.dto';
import { VacunoResponseDto } from './dto/vacuno-response.dto';
import { UpdateVacunoDto } from './dto/update-vacuno.dto';
import { CambiarEstadoVacunoDto } from './dto/cambiar-estado-vacuno.dto';
import { VacunosService, GestionesDisponiblesResult } from './vacunos.service';
import { TransferirVacunoDto } from './dto/transferir-vacuno.dto';

@UseGuards(JwtAuthGuard)
@Controller('vacunos')
export class VacunosController {
    constructor(
        private readonly vacunosService: VacunosService,
        private readonly fileUrlService: FileUrlService,
        private readonly imagenValidator: ImagenValidatorService,
    ) {}

    private transformarFoto(vacuno: VacunoResponseDto): VacunoResponseDto {
        if (vacuno?.foto) {
            vacuno.foto = this.fileUrlService.getFileUrl(vacuno.foto, 'vacunos_fotos') || '';
        }
        return vacuno;
    }

    @Post()
    @CreateRateLimit()
    @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
    @InvalidateCache('vacunos')
    async create(
        @Body() dto: CreateVacunoDto,
        @UploadedFile() file: Express.Multer.File | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoResponseDto> {
        const fotoActual = dto.foto ?? undefined;

        if (file || (fotoActual && fotoActual.trim() !== '')) {
            dto.foto = await this.imagenValidator.procesarImagen(file, fotoActual, 'foto_vacuno_config', 'vacunos_fotos');
        }

        const vacuno = await this.vacunosService.create(dto, user.usuario_id);
        return this.transformarFoto(vacuno);
    }

    @Get()
    @FindAllRateLimit()
    @Cache('vacunos', CACHE_BASE)
    async findAll(
        @Query(CustomValidationPipe({ concise: true })) query: FindVacunosQueryDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<PaginatedResult<VacunoResponseDto>> {
        const result = await this.vacunosService.findAll<VacunoResponseDto>(query, user.usuario_id);
        result.data = result.data.map((v: VacunoResponseDto) => this.transformarFoto(v));
        return result;
    }

    @Get('gestiones')
    @FindAllRateLimit()
    @Cache('vacunos', CACHE_BASE)
    obtenerGestiones(
        @GetUser() user: AuthenticatedUser,
    ): Promise<GestionesDisponiblesResult> {
        return this.vacunosService.obtenerGestionesDisponibles(user.usuario_id);
    }

    @Get(':id')
    @FindOneRateLimit()
    @Cache('vacunos', CACHE_BASE)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoResponseDto> {
        const vacuno = await this.vacunosService.findOne<VacunoResponseDto>(id, user.usuario_id);
        return this.transformarFoto(vacuno);
    }

    @Patch(':id')
    @UpdateRateLimit()
    @UseInterceptors(FileInterceptor('foto', { storage: memoryStorage() }))
    @InvalidateCache('vacunos')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVacunoDto,
        @UploadedFile() file: Express.Multer.File | undefined,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoResponseDto> {
        const fotoActual = dto.foto ?? undefined;

        if (file || (fotoActual && fotoActual.trim() !== '')) {
            dto.foto = await this.imagenValidator.procesarImagen(file, fotoActual, 'foto_vacuno_config', 'vacunos_fotos');
        } else if (dto.foto === '') {
            delete dto.foto;
        }

        const vacuno = await this.vacunosService.update(id, dto, user.usuario_id);
        return this.transformarFoto(vacuno);
    }

    @Patch(':id/estado')
    @UpdateRateLimit()
    @InvalidateCache('vacunos')
    async cambiarEstado(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CambiarEstadoVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoResponseDto> {
        const vacuno = await this.vacunosService.cambiarEstado(id, dto, user.usuario_id);
        return this.transformarFoto(vacuno);
    }

    @Patch(':id/transferir')
    @UpdateRateLimit()
    @InvalidateCache('vacunos')
    async transferir(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: TransferirVacunoDto,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoResponseDto> {
        const vacuno = await this.vacunosService.transferirSucursal(id, dto, user.usuario_id);
        return this.transformarFoto(vacuno);
    }

    @Delete(':id')
    @DeleteRateLimit()
    @InvalidateCache('vacunos')
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: AuthenticatedUser
    ): Promise<VacunoResponseDto> {
        const vacuno = await this.vacunosService.remove<VacunoResponseDto>(id, user.usuario_id);
        return this.transformarFoto(vacuno);
    }
}
