-- Supabase Schema for Quizzty - Juegos Interactivos Didácticos en Tiempo Real

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------------
-- 1. TABLES
----------------------------------------------------------

-- Teachers (extends auth.users)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    grade_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'multiple_choice',
    options JSONB,
    correct_answer TEXT NOT NULL,
    time_limit INT NOT NULL DEFAULT 30,
    points INT NOT NULL DEFAULT 1000,
    image_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sessions (Active game instances)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    pin VARCHAR(6) UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    game_mode TEXT NOT NULL DEFAULT 'classic',
    current_question_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Participants (Students who join a session)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    avatar_color TEXT NOT NULL DEFAULT '#3B82F6',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_eliminated BOOLEAN NOT NULL DEFAULT FALSE,
    team TEXT,
    UNIQUE(session_id, nickname)
);

-- Answers (Student submissions)
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded INT NOT NULL DEFAULT 0,
    response_time_ms INT,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(participant_id, question_id)
);

-- Scores (Aggregated scores per participant per session)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    total_points INT NOT NULL DEFAULT 0,
    streak INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(participant_id, session_id)
);

-- Reactions (Real-time emoji reactions during game)
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

----------------------------------------------------------
-- 2. REALTIME CONFIGURATION
----------------------------------------------------------

DO $$
BEGIN
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
-- 3. ROW LEVEL SECURITY (RLS)
----------------------------------------------------------

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Teachers policies
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
CREATE POLICY "Teachers can view own profile"
    ON public.teachers FOR SELECT
    USING (auth.uid() = id);

-- Quizzes policies
DROP POLICY IF EXISTS "Teachers can CRUD own quizzes" ON public.quizzes;
CREATE POLICY "Teachers can CRUD own quizzes"
    ON public.quizzes FOR ALL
    USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Anyone can view quizzes with active session" ON public.quizzes;
CREATE POLICY "Anyone can view quizzes with active session"
    ON public.quizzes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.quiz_id = quizzes.id
            AND sessions.status IN ('waiting', 'active')
        )
    );

-- Questions policies
DROP POLICY IF EXISTS "Teachers can CRUD questions for their quizzes" ON public.questions;
CREATE POLICY "Teachers can CRUD questions for their quizzes"
    ON public.questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE quizzes.id = questions.quiz_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Anyone can view questions during active session" ON public.questions;
CREATE POLICY "Anyone can view questions during active session"
    ON public.questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.quiz_id = questions.quiz_id
            AND sessions.status = 'active'
        )
    );

-- Sessions policies
DROP POLICY IF EXISTS "Teachers can CRUD own sessions" ON public.sessions;
CREATE POLICY "Teachers can CRUD own sessions"
    ON public.sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE quizzes.id = sessions.quiz_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Anyone can view sessions" ON public.sessions;
CREATE POLICY "Anyone can view sessions"
    ON public.sessions FOR SELECT
    USING (true);

-- Participants policies
DROP POLICY IF EXISTS "Teachers can view participants of their sessions" ON public.participants;
CREATE POLICY "Teachers can view participants of their sessions"
    ON public.participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            JOIN public.quizzes ON sessions.quiz_id = quizzes.id
            WHERE sessions.id = participants.session_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Anyone can insert participant" ON public.participants;
CREATE POLICY "Anyone can insert participant"
    ON public.participants FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = session_id AND status IN ('waiting', 'active')
        )
    );

DROP POLICY IF EXISTS "Participants can view same session participants" ON public.participants;
CREATE POLICY "Participants can view same session participants"
    ON public.participants FOR SELECT
    USING (true);

-- Answers policies
DROP POLICY IF EXISTS "Teachers can view all answers" ON public.answers;
CREATE POLICY "Teachers can view all answers"
    ON public.answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            JOIN public.quizzes ON sessions.quiz_id = quizzes.id
            WHERE sessions.id = answers.session_id
            AND quizzes.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Participants can insert answers" ON public.answers;
CREATE POLICY "Participants can insert answers"
    ON public.answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = session_id AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Anyone can view answers in active session" ON public.answers;
CREATE POLICY "Anyone can view answers in active session"
    ON public.answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE sessions.id = answers.session_id
            AND sessions.status IN ('active', 'finished')
        )
    );

-- Scores policies
DROP POLICY IF EXISTS "Anyone can view scores" ON public.scores;
CREATE POLICY "Anyone can view scores"
    ON public.scores FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "System can update scores" ON public.scores;
CREATE POLICY "System can update scores"
    ON public.scores FOR ALL
    USING (true)
    WITH CHECK (true);

-- Reactions policies
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.reactions;
CREATE POLICY "Anyone can insert reactions"
    ON public.reactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sessions
            WHERE id = session_id AND status IN ('waiting', 'active')
        )
    );

DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;
CREATE POLICY "Anyone can view reactions"
    ON public.reactions FOR SELECT
    USING (true);

----------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
----------------------------------------------------------

-- Auto-create teacher profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.teachers (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update score when an answer is inserted
CREATE OR REPLACE FUNCTION public.update_participant_score()
RETURNS TRIGGER AS $$
DECLARE
    current_streak INT;
BEGIN
    -- Get current streak
    SELECT COALESCE(streak, 0) INTO current_streak
    FROM public.scores
    WHERE participant_id = NEW.participant_id AND session_id = NEW.session_id;
    
    -- Update streak based on correctness
    IF NEW.is_correct THEN
        current_streak := current_streak + 1;
    ELSE
        current_streak := 0;
    END IF;
    
    INSERT INTO public.scores (participant_id, session_id, total_points, streak)
    VALUES (NEW.participant_id, NEW.session_id, NEW.points_awarded, current_streak)
    ON CONFLICT (participant_id, session_id)
    DO UPDATE SET
        total_points = public.scores.total_points + NEW.points_awarded,
        streak = current_streak,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_answer_inserted ON public.answers;
CREATE TRIGGER on_answer_inserted
    AFTER INSERT ON public.answers
    FOR EACH ROW EXECUTE PROCEDURE public.update_participant_score();

-- Generate unique PIN for session
CREATE OR REPLACE FUNCTION public.generate_session_pin()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pin := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_session_pin_trigger ON public.sessions;
CREATE TRIGGER generate_session_pin_trigger
    BEFORE INSERT ON public.sessions
    FOR EACH ROW
    WHEN (NEW.pin IS NULL)
    EXECUTE PROCEDURE public.generate_session_pin();

-- Cleanup old reactions (auto-delete after 5 seconds)
CREATE OR REPLACE FUNCTION public.cleanup_old_reactions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.reactions
    WHERE created_at < NOW() - INTERVAL '5 seconds';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_reactions_trigger ON public.reactions;
CREATE TRIGGER cleanup_reactions_trigger
    AFTER INSERT ON public.reactions
    EXECUTE PROCEDURE public.cleanup_old_reactions();

----------------------------------------------------------
-- 5. INDEXES FOR PERFORMANCE
----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_sessions_pin ON public.sessions(pin);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_participants_session ON public.participants(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON public.answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_participant ON public.answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_scores_session ON public.scores(session_id);
CREATE INDEX IF NOT EXISTS idx_reactions_session ON public.reactions(session_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON public.quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.questions(quiz_id);
