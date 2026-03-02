-- Fix para Quizzes - Ejecutar en Supabase SQL Editor
-- Esto soluciona el problema de quizzes que no se ven

----------------------------------------------------------
-- 1. Verificar estado actual de políticas
----------------------------------------------------------

SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'quizzes';

----------------------------------------------------------
-- 2. Drop políticas viejas de quizzes
----------------------------------------------------------

DROP POLICY IF EXISTS "Teachers can CRUD own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view quizzes with active session" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Teachers manage own quizzes" ON public.quizzes;

----------------------------------------------------------
-- 3. Crear políticas nuevas SIMPLIFICADAS
----------------------------------------------------------

-- Política 1: Profesores pueden hacer CRUD en SUS propios quizzes
CREATE POLICY "Profesores gestionan sus quizzes"
    ON public.quizzes
    FOR ALL
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

-- Política 2: Cualquiera puede VER quizzes (para estudiantes en sesión)
CREATE POLICY "Cualquiera puede ver quizzes"
    ON public.quizzes
    FOR SELECT
    USING (true);

----------------------------------------------------------
-- 4. Verificar que las políticas se crearon
----------------------------------------------------------

SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'quizzes';

----------------------------------------------------------
-- 5. Test - Esto debería funcionar
----------------------------------------------------------

-- Un usuario autenticado debería poder ver SUS quizzes
-- SELECT * FROM public.quizzes WHERE teacher_id = auth.uid();

-- Cualquier usuario (autenticado o no) debería poder hacer SELECT
-- SELECT * FROM public.quizzes;
