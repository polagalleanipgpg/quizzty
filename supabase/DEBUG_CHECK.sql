-- ═══════════════════════════════════════════════════════════════
-- DEBUG: Verificar estado de la BD
-- Ejecutar en Supabase SQL Editor para debuggear
-- ═══════════════════════════════════════════════════════════════

-- 1. Verificar tablas
SELECT 'TABLAS:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar políticas de quizzes
SELECT 'POLÍTICAS DE QUIZZES:' as info;
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'quizzes';

-- 3. Verificar si hay quizzes
SELECT 'QUIZZES EXISTENTES:' as info;
SELECT id, title, teacher_id, created_at 
FROM public.quizzes 
LIMIT 10;

-- 4. Verificar teachers
SELECT 'TEACHERS EXISTENTES:' as info;
SELECT id, email, created_at 
FROM public.teachers 
LIMIT 10;

-- 5. Test de inserción manual
SELECT 'TEST DE INSERCIÓN:' as info;

-- Esto es solo informativo, NO ejecutar
-- INSERT INTO public.quizzes (title, teacher_id) 
-- VALUES ('Test Manual', 'TU-TEACHER-ID-AQUI');

-- 6. Verificar índices
SELECT 'ÍNDICES:' as info;
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('quizzes', 'questions', 'sessions')
ORDER BY tablename, indexname;
