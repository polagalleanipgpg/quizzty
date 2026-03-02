'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeSession(sessionId: string | null) {
  const [sessionData, setSessionData] = useState<{
    status: string
    currentQuestionIndex: number
    gameMode: string
  } | null>(null)

  useEffect(() => {
    if (!sessionId) return

    // Fetch initial data
    supabase
      .from('sessions')
      .select('status, current_question_index, game_mode')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSessionData({
            status: data.status,
            currentQuestionIndex: data.current_question_index,
            gameMode: data.game_mode,
          })
        }
      })

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new) {
            setSessionData({
              status: (payload.new as any).status,
              currentQuestionIndex: (payload.new as any).current_question_index,
              gameMode: (payload.new as any).game_mode,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  return sessionData
}

export function useRealtimeParticipants(sessionId: string | null) {
  const [participants, setParticipants] = useState<Array<{
    id: string
    nickname: string
    avatar_color: string
    score: number
    team: string | null
    is_eliminated: boolean
  }>>([])

  useEffect(() => {
    if (!sessionId) return

    const fetchParticipants = async () => {
      const { data } = await supabase
        .from('participants')
        .select(`
          id,
          nickname,
          avatar_color,
          team,
          is_eliminated,
          scores:scores(total_points)
        `)
        .eq('session_id', sessionId)

      if (data) {
        const withScores = data.map((p: any) => ({
          ...p,
          score: p.scores?.[0]?.total_points ?? 0,
        }))
        setParticipants(withScores.sort((a: any, b: any) => b.score - a.score))
      }
    }

    fetchParticipants()

    const participantsChannel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchParticipants()
      )
      .subscribe()

    const scoresChannel = supabase
      .channel(`scores:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores',
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchParticipants()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(participantsChannel)
      supabase.removeChannel(scoresChannel)
    }
  }, [sessionId])

  return participants
}

export function useRealtimeAnswers(sessionId: string | null, questionId: string | null) {
  const [answers, setAnswers] = useState<Array<{
    id: string
    participant_id: string
    answer_text: string
    is_correct: boolean
    points_awarded: number
    response_time_ms: number | null
  }>>([])

  useEffect(() => {
    if (!sessionId || !questionId) return

    const fetchAnswers = async () => {
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', questionId)

      if (data) setAnswers(data)
    }

    fetchAnswers()

    const channel = supabase
      .channel(`answers:${sessionId}:${questionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `session_id=eq.${sessionId} AND question_id=eq.${questionId}`,
        },
        () => fetchAnswers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, questionId])

  return answers
}
