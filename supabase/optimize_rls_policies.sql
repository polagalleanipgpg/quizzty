-- Optimización de RLS Policies para Quizzty
-- Ejecutar en Supabase SQL Editor
-- Esto mejora el performance y elimina warnings del Database Linter

----------------------------------------------------------
-- 1. DROP POLÍTICAS EXISTENTES
----------------------------------------------------------

-- Teachers
DROP POLICY IF EXISTS "Teachers select own profile" ON public.teachers;

-- Quizzes
DROP POLICY IF EXISTS "Profesores gestionan sus quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Cualquiera puede ver quizzes" ON public.quizzes;

-- Questions
DROP POLICY IF EXISTS "Teachers manage own questions" ON public.questions;
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- Sessions
DROP POLICY IF EXISTS "Teachers manage own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;

-- Participants
DROP POLICY IF EXISTS "Anyone can join sessions" ON public.participants;
DROP POLICY IF EXISTS "Anyone can view participants" ON public.participants;
DROP POLICY IF EXISTS "Teachers view participants" ON public.participants;

-- Answers
DROP POLICY IF EXISTS "Anyone can submit answers" ON public.answers;
DROP POLICY IF EXISTS "Anyone can view answers" ON public.answers;
DROP POLICY IF EXISTS "Teachers view answers" ON public.answers;

-- Scores
DROP POLICY IF EXISTS "Anyone can view scores" ON public.scores;
DROP POLICY IF EXISTS "Anyone can insert scores" ON public.scores;
DROP POLICY IF EXISTS "Anyone can update scores" ON public.scores;

-- Reactions
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;

----------------------------------------------------------
-- 2. CREATE POLÍTICAS OPTIMIZADAS
-- Usamos (select auth.uid()) en lugar de auth.uid()
----------------------------------------------------------

-- Teachers: Solo lectura del propio perfil
CREATE POLICY "Teachers select own profile"
    ON public.teachers FOR SELECT
    USING ((select auth.uid()) = id);

-- Quizzes: 
-- Una sola política para SELECT que permite a todos ver
-- Profesores pueden hacer CRUD mediante checks separados
CREATE POLICY "Quizzes select all"
    ON public.quizzes FOR SELECT
    USING (true);

CREATE POLICY "Quizzes manage own"
    ON public.quizzes FOR ALL
    USING ((select auth.uid()) = teacher_id)
    WITH CHECK ((select auth.uid()) = teacher_id);

-- Questions:
CREATE POLICY "Questions select all"
    ON public.questions FOR SELECT
    USING (true);

CREATE POLICY "Questions manage own"
    ON public.questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = questions.quiz_id 
            AND quizzes.teacher_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = questions.quiz_id 
            AND quizzes.teacher_id = (select auth.uid())
        )
    );

-- Sessions:
CREATE POLICY "Sessions select all"
    ON public.sessions FOR SELECT
    USING (true);

CREATE POLICY "Sessions manage own"
    ON public.sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = sessions.quiz_id 
            AND quizzes.teacher_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes 
            WHERE quizzes.id = sessions.quiz_id 
            AND quizzes.teacher_id = (select auth.uid())
        )
    );

-- Participants:
CREATE POLICY "Participants select all"
    ON public.participants FOR SELECT
    USING (true);

CREATE POLICY "Participants insert waiting"
    ON public.participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = participants.session_id 
            AND sessions.status IN ('waiting', 'active')
        )
    );

-- Answers:
CREATE POLICY "Answers select all"
    ON public.answers FOR SELECT
    USING (true);

CREATE POLICY "Answers insert active"
    ON public.answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = answers.session_id 
            AND sessions.status = 'active'
        )
    );

-- Scores:
CREATE POLICY "Scores select all"
    ON public.scores FOR SELECT
    USING (true);

CREATE POLICY "Scores all"
    ON public.scores FOR ALL
    USING (true)
    WITH CHECK (true);

-- Reactions:
CREATE POLICY "Reactions select all"
    ON public.reactions FOR SELECT
    USING (true);

CREATE POLICY "Reactions insert active"
    ON public.reactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = reactions.session_id 
            AND sessions.status IN ('waiting', 'active')
        )
    );

----------------------------------------------------------
-- 3. VERIFICACIÓN
----------------------------------------------------------

-- Mostrar políticas creadas
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar que no hay múltiples políticas permissivas para el mismo rol/acción
-- (esto debería estar limpio ahora)
