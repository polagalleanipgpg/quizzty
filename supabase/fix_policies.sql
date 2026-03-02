-- Supabase Schema for Quizzty - FIXED VERSION
-- Ejecuta este SQL en tu proyecto Supabase para corregir los errores

----------------------------------------------------------
-- 1. DROP EXISTING POLICIES (para evitar recursión)
----------------------------------------------------------

-- Drop todas las políticas existentes
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can CRUD own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can view quizzes with active session" ON public.quizzes;
DROP POLICY IF EXISTS "Teachers can CRUD questions for their quizzes" ON public.questions;
DROP POLICY IF EXISTS "Anyone can view questions during active session" ON public.questions;
DROP POLICY IF EXISTS "Teachers can CRUD own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Teachers can view participants of their sessions" ON public.participants;
DROP POLICY IF EXISTS "Anyone can insert participant" ON public.participants;
DROP POLICY IF EXISTS "Participants can view same session participants" ON public.participants;
DROP POLICY IF EXISTS "Teachers can view all answers" ON public.answers;
DROP POLICY IF EXISTS "Participants can insert answers" ON public.answers;
DROP POLICY IF EXISTS "Anyone can view answers in active session" ON public.answers;
DROP POLICY IF EXISTS "Anyone can view scores" ON public.scores;
DROP POLICY IF EXISTS "System can update scores" ON public.scores;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;

----------------------------------------------------------
-- 2. RECREATE POLICIES (simplificadas para evitar recursión)
----------------------------------------------------------

-- Teachers: Solo lectura del propio perfil
CREATE POLICY "Teachers select own profile"
    ON public.teachers FOR SELECT
    USING (auth.uid() = id);

-- Quizzes: 
-- - Profesores autenticados pueden hacer CRUD en sus propios quizzes
-- - Cualquiera puede ver quizzes si tienen una sesión activa (sin subquery compleja)
CREATE POLICY "Teachers manage own quizzes"
    ON public.quizzes FOR ALL
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Anyone can view quizzes"
    ON public.quizzes FOR SELECT
    USING (true);

-- Questions:
-- - Profesores pueden gestionar preguntas de sus quizzes
-- - Cualquiera puede leer preguntas
CREATE POLICY "Teachers manage own questions"
    ON public.questions FOR ALL
    USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view questions"
    ON public.questions FOR SELECT
    USING (true);

-- Sessions:
-- - Profesores gestionan sus sesiones
-- - Cualquiera puede ver sesiones
CREATE POLICY "Teachers manage own sessions"
    ON public.sessions FOR ALL
    USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()
        )
    )
    WITH CHECK (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view sessions"
    ON public.sessions FOR SELECT
    USING (true);

-- Participants:
-- - Cualquiera puede unirse a sesiones waiting/active
-- - Todos pueden ver participantes de una sesión
CREATE POLICY "Anyone can join sessions"
    ON public.participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = session_id 
            AND status IN ('waiting', 'active')
        )
    );

CREATE POLICY "Anyone can view participants"
    ON public.participants FOR SELECT
    USING (true);

-- Teachers can view all participants in their sessions
CREATE POLICY "Teachers view participants"
    ON public.participants FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.sessions 
            WHERE quiz_id IN (
                SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()
            )
        )
    );

-- Answers:
-- - Solo insertar en sesiones activas
-- - Todos pueden ver respuestas
CREATE POLICY "Anyone can submit answers"
    ON public.answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = session_id 
            AND status = 'active'
        )
    );

CREATE POLICY "Anyone can view answers"
    ON public.answers FOR SELECT
    USING (true);

-- Teachers can view all answers in their sessions
CREATE POLICY "Teachers view answers"
    ON public.answers FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM public.sessions 
            WHERE quiz_id IN (
                SELECT id FROM public.quizzes WHERE teacher_id = auth.uid()
            )
        )
    );

-- Scores:
-- - Todos pueden ver scores
-- - Insert/Update permitido para todos (controlado por triggers)
CREATE POLICY "Anyone can view scores"
    ON public.scores FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert scores"
    ON public.scores FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update scores"
    ON public.scores FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Reactions:
-- - Todos pueden insertar y ver reactions
CREATE POLICY "Anyone can insert reactions"
    ON public.reactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = session_id 
            AND status IN ('waiting', 'active')
        )
    );

CREATE POLICY "Anyone can view reactions"
    ON public.reactions FOR SELECT
    USING (true);

----------------------------------------------------------
-- 3. ENABLE REALTIME (asegurar que esté habilitado)
----------------------------------------------------------

-- Habilitar realtime si no está habilitado
DO $$
BEGIN
    -- Verificar y habilitar realtime para cada tabla
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sessions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'participants') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE participants;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'answers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE answers;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'scores') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE scores;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reactions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
    END IF;
END $$;

----------------------------------------------------------
-- 4. VERIFICACIÓN
----------------------------------------------------------

-- Este script muestra las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
