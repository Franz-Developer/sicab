// C:\sistemas\sicab\sicab-backend\src\app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { CommonModule } from './common/common.module';
import { ValidationLogInterceptor } from './common/decorators/validation-message.decorator';
import { UserValidationGuard } from './common/guards/user-validation.guard';
import { typeOrmConfig } from './config/database.config';
import { loggerConfig } from './config/logger.config';
import { AuthModule } from './modules/auth/auth.module';
import { ConstantesModule } from './modules/constantes/constantes.module';
import { BancosModule } from './modules/bancos/bancos.module';
import { TiposCambiosModule } from './modules/tipos-cambios/tipos-cambios.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { EmpresasNitsModule } from './modules/empresas-nits/empresas-nits.module';
import { EmpresasCuentasModule } from './modules/empresas-cuentas/empresas-cuentas.module';
import { SucursalesModule } from './modules/sucursales/sucursales.module';
import { CargosModule } from './modules/cargos/cargos.module';
import { TrabajadoresModule } from './modules/trabajadores/trabajadores.module';
import { TrabajadoresCargosModule } from './modules/trabajadores-cargos/trabajadores-cargos.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TablasModule } from './modules/tablas/tablas.module';
import { RolesPermisosTablasModule } from './modules/roles-permisos-tablas/roles-permisos-tablas.module';
import { MenusModule } from './modules/menus/menus.module';
import { RolesMenusModule } from './modules/roles-menus/roles-menus.module';
import { ParametrosGlobalesModule } from './modules/parametros-globales/parametros-globales.module';
import { RazasModule } from './modules/razas/razas.module';
import { CategoriasVacunoModule } from './modules/categorias-vacuno/categorias-vacuno.module';
import { VacunosModule } from './modules/vacunos/vacunos.module';
import { VacunosPesajesModule } from './modules/vacunos-pesajes/vacunos-pesajes.module';
import { TurnosOrdenoModule } from './modules/turnos-ordeno/turnos-ordeno.module';
import { ProduccionesLecheModule } from './modules/producciones-leche/producciones-leche.module';
import { AmortizacionesVacunosModule } from './modules/amortizaciones-vacunos/amortizaciones-vacunos.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { TiposSemovientesModule } from './modules/tipos-semovientes/tipos-semovientes.module';
import { VacunosFaenasModule } from './modules/vacunos-faenas/vacunos-faenas.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot(typeOrmConfig),

        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                throttlers: [
                    {
                        name: 'default',
                        ttl: config.get<number>('THROTTLE_TTL', 60),
                        limit: config.get<number>('THROTTLE_LIMIT', 100),
                    },
                ],
            }),
        }),
        LoggerModule.forRoot(loggerConfig),
        AuthModule,
        CommonModule,
        ConstantesModule,
        BancosModule,
        TiposCambiosModule,
        EmpresasModule,
        EmpresasNitsModule,
        EmpresasCuentasModule,
        SucursalesModule,
        CargosModule,
        TrabajadoresModule,
        TrabajadoresCargosModule,
        RolesModule,
        UsuariosModule,
        TablasModule,
        RolesPermisosTablasModule,
        MenusModule,
        RolesMenusModule,
        ParametrosGlobalesModule,
        RazasModule,
        CategoriasVacunoModule,
        VacunosModule,
        VacunosPesajesModule,
        TurnosOrdenoModule,
        ProduccionesLecheModule,
        AmortizacionesVacunosModule,
        ReportesModule,
        TiposSemovientesModule,
        VacunosFaenasModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_GUARD,
            useClass: UserValidationGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ValidationLogInterceptor,
        },
    ],
})
export class AppModule {}
