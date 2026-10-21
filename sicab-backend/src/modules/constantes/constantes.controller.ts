// C:\sistemas\sicab\sicab-backend\src\modules\constantes\constantes.controller.ts
import { Controller, Get, Query, ValidationPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { Cache, CACHE_BASE } from '../../common/decorators/cache.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ConstantesRateLimit } from '../../common/decorators/rate-limit.decorator';
import { AuthenticatedUser } from '../../common/interfaces/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConstantesService } from './constantes.service';
import { FindConstantesQueryDto } from './dto/find-constantes-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('constantes')
export class ConstantesController {
    constructor(private readonly constantesService: ConstantesService) {}

    @Get()
    @ConstantesRateLimit()
    @Cache('constantes:findAll', CACHE_BASE)
    findAll(
        @Query(new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => {
                const wrongProps = errors.map(err => err.property);
                return new BadRequestException({
                    message: `Parámetros inválidos: ${wrongProps.join(', ')}. Parámetros permitidos: tipo, q, estado_id, id, offset, limit, sortField, sortOrder.`,
                    error: 'Bad Request',
                    statusCode: 400,
                });
            },
        })) query: FindConstantesQueryDto,
        @GetUser() user: AuthenticatedUser
    ) {
        return this.constantesService.findAll(query, user.usuario_id);
    }

    @Get('tipos')
    @ConstantesRateLimit()
    @Cache('constantes:tipos', CACHE_BASE)
    getTipos() {
        return this.constantesService.getTipos();
    }

    @Get('estados')
    @ConstantesRateLimit()
    @Cache('constantes:estados', CACHE_BASE)
    getEstados() {
        return this.constantesService.getEstados();
    }

    @Get('monedas')
    @ConstantesRateLimit()
    @Cache('constantes:monedas', CACHE_BASE)
    getMonedas() {
        return this.constantesService.getMonedas();
    }

    @Get('generos')
    @ConstantesRateLimit()
    @Cache('constantes:generos', CACHE_BASE)
    getGeneros() {
        return this.constantesService.getGeneros();
    }

    @Get('tipos-pago')
    @ConstantesRateLimit()
    @Cache('constantes:tipos-pago', CACHE_BASE)
    getTiposPago() {
        return this.constantesService.getTiposPago();
    }

    @Get('tipos-venta')
    @ConstantesRateLimit()
    @Cache('constantes:tipos-venta', CACHE_BASE)
    getTiposVenta() {
        return this.constantesService.getTiposVenta();
    }

    @Get('tipos-documento')
    @ConstantesRateLimit()
    @Cache('constantes:tipos-documento', CACHE_BASE)
    getTiposDocumento() {
        return this.constantesService.getTiposDocumento();
    }

    @Get('eventos')
    @ConstantesRateLimit()
    @Cache('constantes:eventos', CACHE_BASE)
    getEventos() {
        return this.constantesService.getEventos();
    }
}