/*
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;
*/


/*
-- TABLAS DEPENDIENTES.
SELECT
    kcu.table_name AS tabla_dependiente,
    kcu.column_name AS columna_fk,
    ccu.table_name AS tabla_referenciada,
    ccu.column_name AS columna_pk
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = ccu.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'vehiculos_ubicaciones'
ORDER BY kcu.table_name;
*/

SELECT
    v.arete,
    p.fecha_pesaje,
    p.peso,
    p.pesaje_id,
    v.sucursal_id,
    s.empresa_id,
    p.estado_id,
    v.estado_vacuno_id
FROM
    vacunos_pesajes p
INNER JOIN
    vacunos v ON v.vacuno_id = p.vacuno_id
INNER JOIN
    sucursales s ON s.sucursal_id = v.sucursal_id
ORDER BY
    p.pesaje_id DESC
LIMIT 15;
