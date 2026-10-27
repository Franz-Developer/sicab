// C:\sistemas\sicab\sicab-backend\src\modules\categorias-vacuno\entities\categoria-vacuno.entity.ts
import { Entity, Column, PrimaryColumn, Index, Check, Generated } from 'typeorm';
import { BaseAuditEntity } from '../../../common/base/base-audit.entity';
import { bigintTransformer } from '../../../common/utils/typeorm-transformers.util';

@Entity({ name: 'categorias_vacuno' })
@Check('chk_categoriasvacuno_estadoid', 'estado_id IN (1000, 1001, 1002)')
@Check('chk_categoriasvacuno_baja', `
    (estado_id IN (1000, 1002) AND usuario_id_baja IS NULL AND fecha_baja IS NULL)
    OR
    (estado_id = 1001 AND usuario_id_baja IS NOT NULL AND fecha_baja IS NOT NULL)
`)
@Check('chk_categoriasvacuno_actualizacion', `
    (estado_id = 1002 AND usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    OR
    (estado_id IN (1000, 1001) AND (
        (usuario_id_actualizacion IS NULL AND fecha_actualizacion IS NULL)
        OR
        (usuario_id_actualizacion IS NOT NULL AND fecha_actualizacion IS NOT NULL)
    ))
`)
@Check('chk_categoriasvacuno_sexo_productor', 'sexo_biologico_permitido_id = 6301 OR es_productor_leche = 6350')
@Check('chk_categoriasvacuno_categoria_notempty', "TRIM(categoria) <> ''")
@Check('chk_categoriasvacuno_categoria_minlength', 'LENGTH(TRIM(categoria)) >= 3')
@Check('chk_categoriasvacuno_categoria_mayusculas', 'categoria = UPPER(categoria)')
@Check('chk_categoriasvacuno_codigo_notempty', "TRIM(codigo) <> ''")
@Check('chk_categoriasvacuno_codigo_minlength', 'LENGTH(TRIM(codigo)) >= 2')
@Check('chk_categoriasvacuno_codigo_mayusculas', 'codigo = UPPER(codigo)')
@Check('chk_categoriasvacuno_codigo_formato', "codigo ~ '^[A-Z0-9_-]+$'")
@Check('chk_categoriasvacuno_esproductor', 'es_productor_leche IN (6350, 6351)')
@Check('chk_categoriasvacuno_sexobiologico', 'sexo_biologico_permitido_id IN (6300, 6301)')
@Check('chk_categoriasvacuno_edades', 'edad_min_meses IS NULL OR edad_max_meses IS NULL OR edad_min_meses <= edad_max_meses')
@Check('chk_categoriasvacuno_descripcion_notempty', "descripcion IS NULL OR TRIM(descripcion) <> ''")
@Index('uix_categoriasvacuno_codigo', ['codigo'], { unique: true, where: 'estado_id IN (1000, 1002)' })
@Index('uix_categoriasvacuno_categoria', ['categoria'], { unique: true, where: 'estado_id IN (1000, 1002)' })
export class CategoriaVacuno extends BaseAuditEntity {
    @PrimaryColumn({ name: 'categoria_vacuno_id', type: 'bigint', transformer: bigintTransformer })
    @Generated('increment')
    categoria_vacuno_id!: number;

    @Column({ name: 'categoria', type: 'varchar', length: 100, nullable: false })
    categoria!: string;

    @Column({ name: 'codigo', type: 'varchar', length: 30, nullable: false })
    codigo!: string;

    @Column({ name: 'descripcion', type: 'varchar', length: 500, nullable: true })
    descripcion?: string | null;

    @Column({ name: 'edad_min_meses', type: 'integer', nullable: true })
    edad_min_meses?: number | null;

    @Column({ name: 'edad_max_meses', type: 'integer', nullable: true })
    edad_max_meses?: number | null;

    @Column({ name: 'es_productor_leche', type: 'smallint', nullable: false, default: 6350 })
    es_productor_leche!: number;

    @Column({ name: 'sexo_biologico_permitido_id', type: 'smallint', nullable: false, default: 6300 })
    sexo_biologico_permitido_id!: number;
}
