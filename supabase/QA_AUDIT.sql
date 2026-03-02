-- ═══════════════════════════════════════════════════════════════
-- QA AUDIT SQL - Verificar estado de la BD
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Verificar tablas existentes
SELECT '═══════════════════════════════════════' as '';
SELECT '📊 TABLAS EXISTENTES:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns c 
        WHERE c.table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar cantidad de datos
SELECT '═══════════════════════════════════════' as '';
SELECT '📈 CANTIDAD DE DATOS:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT 'teachers' as tabla, COUNT(*) as cantidad FROM public.teachers
UNION ALL
SELECT 'quizzes', COUNT(*) FROM public.quizzes
UNION ALL
SELECT 'questions', COUNT(*) FROM public.questions
UNION ALL
SELECT 'sessions', COUNT(*) FROM public.sessions
UNION ALL
SELECT 'participants', COUNT(*) FROM public.participants
UNION ALL
SELECT 'answers', COUNT(*) FROM public.answers
UNION ALL
SELECT 'scores', COUNT(*) FROM public.scores;

-- 3. Verificar RLS policies
SELECT '═══════════════════════════════════════' as '';
SELECT '🔒 RLS POLICIES:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Verificar índices
SELECT '═══════════════════════════════════════' as '';
SELECT '📑 ÍNDICES:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('quizzes', 'questions', 'sessions', 'participants', 'answers', 'scores')
ORDER BY tablename, indexname;

-- 5. Verificar triggers
SELECT '═══════════════════════════════════════' as '';
SELECT '⚙️ TRIGGERS:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 6. Verificar funciones
SELECT '═══════════════════════════════════════' as '';
SELECT '🔧 FUNCIONES:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- 7. Test: Verificar integridad de datos
SELECT '═══════════════════════════════════════' as '';
SELECT '✅ INTEGRIDAD DE DATOS:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';

-- Quizzes sin teacher
SELECT 'Quizzes sin teacher:' as test, 
       COUNT(*) as cantidad 
FROM public.quizzes q
LEFT JOIN public.teachers t ON t.id = q.teacher_id
WHERE t.id IS NULL;

-- Questions sin quiz
SELECT 'Questions sin quiz:' as test, 
       COUNT(*) as cantidad 
FROM public.questions q
LEFT JOIN public.quizzes qz ON qz.id = q.quiz_id
WHERE qz.id IS NULL;

-- Sessions sin quiz
SELECT 'Sessions sin quiz:' as test, 
       COUNT(*) as cantidad 
FROM public.sessions s
LEFT JOIN public.quizzes qz ON qz.id = s.quiz_id
WHERE qz.id IS NULL;

-- Participants sin session
SELECT 'Participants sin session:' as test, 
       COUNT(*) as cantidad 
FROM public.participants p
LEFT JOIN public.sessions s ON s.id = p.session_id
WHERE s.id IS NULL;

-- 8. Últimos quizzes creados
SELECT '═══════════════════════════════════════' as '';
SELECT '📝 ÚLTIMOS QUIZZES:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT id, title, subject, created_at, 
       (SELECT COUNT(*) FROM public.questions q WHERE q.quiz_id = quizzes.id) as questions_count
FROM public.quizzes 
ORDER BY created_at DESC 
LIMIT 10;

-- 9. Últimas sesiones
SELECT '═══════════════════════════════════════' as '';
SELECT '🎮 ÚLTIMAS SESIONES:' as AUDITORIA;
SELECT '═══════════════════════════════════════' as '';
SELECT id, pin, status, game_mode, created_at,
       (SELECT COUNT(*) FROM public.participants p WHERE p.session_id = sessions.id) as participants_count
FROM public.sessions 
ORDER BY created_at DESC 
LIMIT 10;

-- ═══════════════════════════════════════════════════════════════
-- FIN DEL AUDIT
-- ═══════════════════════════════════════════════════════════════
