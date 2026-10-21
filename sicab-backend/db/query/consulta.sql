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

UPDATE menus
SET
    estado_id = 1001,
    usuario_id_baja = 2,
    fecha_baja = CURRENT_TIMESTAMP
WHERE menu_id IN (10, 30, 34, 38)
	AND estado_id = 1000;

WHERE raza_id IN (1, 2, 3, 4);

SELECT *
FROM menus