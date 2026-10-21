// C:\sistemas\sicab\sicab-backend\src\modules\parametros-globales\parametros-globales.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ESTADO_ACTIVO, TipoDato } from '../../common/constants/estados.constant';
import { DomainException } from '../../common/exceptions/domain.exception';
import { BaseService, BaseServiceConfig } from '../../common/services/base.service';
import { getErrorMessage, getErrorStack, isDomainException } from '../../common/utils/error.util';
import { runInTransaction } from '../../common/utils/transaction.helper';
import { TablaValidadorService } from '../../common/validators/tabla-validador.service';
import { FindParametrosGlobalesQueryDto } from './dto/find-parametros-globales-query.dto';
import { ParametroGlobalResponseDto } from './dto/parametro-global-response.dto';
import { UpdateParametroGlobalDto } from './dto/update-parametro-global.dto';
import { ParametroGlobal } from './entities/parametro-global.entity';

@Injectable()
export class ParametrosGlobalesService extends BaseService {
    protected config: BaseServiceConfig = {
        nombreTabla: 'parametros_globales',
        nombreEntidad: 'Parametro Global',
        campoPK: 'parametro_id',
        alias: 't',
        responseDto: ParametroGlobalResponseDto,
        camposBusquedaEnQ: FindParametrosGlobalesQueryDto.getCamposParaQ(),
        tablasDependientes: [],
        joins: [],
        configuracionFiltros: [
            {
                nombreCampo: 'tipo_dato_id',
                nombreColumna: 'tipo_dato_id',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
            {
                nombreCampo: 'editable',
                nombreColumna: 'editable',
                tipoDatoFiltro: 'number',
                operador: 'eq',
            },
            {
                nombreCampo: 'clave',
                nombreColumna: 'clave',
                tipoDatoFiltro: 'string',
                operador: 'ieq',
            },
        ],
        configuracionOrden: {
            campoOrdenPorDefecto: 'parametro_id',
            camposPermitidosParaOrdenar: FindParametrosGlobalesQueryDto.getCamposPermitidosParaOrdenar(),
            equivalenciasMapeo: FindParametrosGlobalesQueryDto.getEquivalenciasMapeo(),
        },
        getCamposProtegidosConDependencias: () => FindParametrosGlobalesQueryDto.getCamposProtegidosConDependencias(),
    };

    constructor(
        @InjectDataSource()
        dataSource: DataSource,
        tablaValidador: TablaValidadorService,
    ) {
        super(dataSource, tablaValidador);
    }

    private get nombreTabla(): string {
        return this.config.nombreTabla;
    }

    private get campoPK(): string {
        return this.config.campoPK;
    }

    async update(id: number, dto: UpdateParametroGlobalDto, usuarioId: number): Promise<ParametroGlobalResponseDto> {
        return runInTransaction(this.dataSource, async (manager) => {
            const dtoNormalizado = { ...dto };

            const hasFields = Object.values(dtoNormalizado).some(val => val !== undefined);
            if (!hasFields) {
                throw new DomainException(
                    'No se enviaron campos para actualizar.',
                    { httpStatus: HttpStatus.BAD_REQUEST }
                );
            }

            await this.tablaValidador.validarPreUpdate(
                this.nombreTabla, id, dtoNormalizado, this.campoPK, usuarioId, manager
            );

            const parametroActual = await manager.findOne(ParametroGlobal, {
                where: { [this.campoPK]: id, estado_id: ESTADO_ACTIVO },
                lock: { mode: 'pessimistic_write' }
            });

            if (!parametroActual) {
                throw new DomainException(
                    `Parámetro global no encontrado.`,
                    { httpStatus: HttpStatus.NOT_FOUND }
                );
            }

            if (parametroActual.editable === 0) {
                throw new DomainException(
                    `El parámetro "${parametroActual.clave}" no es editable.`,
                    { httpStatus: HttpStatus.FORBIDDEN }
                );
            }

            const dtoProcesado = await this.tablaValidador.procesarCamposProtegidos(
                this.nombreTabla,
                id,
                dtoNormalizado,
                FindParametrosGlobalesQueryDto.getDependencias(),
                FindParametrosGlobalesQueryDto.getCamposProtegidosConDependencias(),
                this.campoPK,
                usuarioId,
                manager
            );

            const { clave, tipo_dato_id, editable, ...camposPermitidos } = dtoProcesado;

            const tipoDato = parametroActual.tipo_dato_id;

            if (tipoDato === TipoDato.JSONB) {
                delete camposPermitidos.valor;

                if (camposPermitidos.datos_json !== undefined) {
                    if (
                        typeof camposPermitidos.datos_json !== 'object' ||
                        camposPermitidos.datos_json === null ||
                        Array.isArray(camposPermitidos.datos_json)
                    ) {
                        throw new DomainException(
                            `Para parámetros de tipo JSONB, "datos_json" debe ser un objeto JSON válido.`,
                            { httpStatus: HttpStatus.BAD_REQUEST }
                        );
                    }
                }
            } else {
                delete camposPermitidos.datos_json;

                if (camposPermitidos.valor !== undefined) {
                    const v = String(camposPermitidos.valor).trim();

                    if (v === '') {
                        throw new DomainException(
                            `El valor no puede estar vacío.`,
                            { httpStatus: HttpStatus.BAD_REQUEST }
                        );
                    }

                    const validaciones: Record<number, (v: string) => boolean> = {
                        [TipoDato.STRING]:    () => true,
                        [TipoDato.INTEGER]:   (v) => /^-?\d+$/.test(v),
                        [TipoDato.DECIMAL]:   (v) => /^-?\d+(\.\d+)?$/.test(v),
                        [TipoDato.BOOLEAN]:   (v) => ['0', '1', 'true', 'false'].includes(v.toLowerCase()),
                        [TipoDato.TIMESTAMP]: (v) => !isNaN(Date.parse(v)),
                    };

                    const validador = validaciones[tipoDato];
                    if (validador && !validador(v)) {
                        throw new DomainException(
                            `El valor "${v}" no es válido para un parámetro de tipo ${TipoDato[tipoDato]}.`,
                            { httpStatus: HttpStatus.BAD_REQUEST }
                        );
                    }
                }
            }

            Object.assign(parametroActual, camposPermitidos);
            parametroActual.marcarActualizacion(usuarioId);

            try {
                await manager.save(parametroActual);

                if (parametroActual.clave === 'gestion_activa') {
                    this.tablaValidador.invalidarCacheGestion();
                }

                return this.findOne(id, usuarioId, manager);
            } catch (error: unknown) {
                if (isDomainException(error)) {
                    throw error;
                }

                const errorMessage = getErrorMessage(error);
                this.logger.error(`Error inesperado en update: ${errorMessage}`, getErrorStack(error));
                throw new DomainException(
                    `No se pudo actualizar el parámetro global con ID ${id}.`,
                    {
                        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
                        id,
                        originalError: errorMessage,
                    }
                );
            }
        });
    }
}
