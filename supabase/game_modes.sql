-- Nuevos Modos de Juego para Quizzty
-- Ejecutar en Supabase SQL Editor

----------------------------------------------------------
-- 1. BLITZ MODE - 10 segundos por pregunta
----------------------------------------------------------

-- El modo blitz ya está soportado por el schema existente
-- Solo necesitamos actualizar la UI para permitir seleccionarlo

-- Actualizar sesiones para soportar blitz
-- game_mode: 'classic', 'teams', 'blitz', 'elimination'

----------------------------------------------------------
-- 2. ELIMINATION MODE - Último lugar sale cada ronda
----------------------------------------------------------

-- El schema ya soporta is_eliminated en participants
-- La lógica se implementa en el frontend

----------------------------------------------------------
-- 3. Función para verificar modo blitz
----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_game_mode_info(mode TEXT)
RETURNS TABLE (
    mode_name TEXT,
    description TEXT,
    time_limit INT,
    icon TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE mode
            WHEN 'classic' THEN 'Clásico'
            WHEN 'teams' THEN 'Equipos'
            WHEN 'blitz' THEN 'Blitz'
            WHEN 'elimination' THEN 'Eliminación'
            ELSE mode
        END as mode_name,
        CASE mode
            WHEN 'classic' THEN 'Todos contra todos, acumula puntos'
            WHEN 'teams' THEN 'Equipos compiten juntos'
            WHEN 'blitz' THEN '¡10 segundos por pregunta!'
            WHEN 'elimination' THEN 'Último lugar es eliminado'
            ELSE 'Modo de juego'
        END as description,
        CASE mode
            WHEN 'blitz' THEN 10
            ELSE 30
        END as time_limit,
        CASE mode
            WHEN 'classic' THEN '🏆'
            WHEN 'teams' THEN '👥'
            WHEN 'blitz' THEN '⚡'
            WHEN 'elimination' THEN '💀'
            ELSE '🎮'
        END as icon;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------------------
-- 4. Vista de modos disponibles
----------------------------------------------------------

-- Ver modos de juego soportados
SELECT * FROM public.get_game_mode_info('classic');
SELECT * FROM public.get_game_mode_info('blitz');
SELECT * FROM public.get_game_mode_info('elimination');
SELECT * FROM public.get_game_mode_info('teams');
