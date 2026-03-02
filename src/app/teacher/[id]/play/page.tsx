'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { Users, Copy, Check, QrCode, Play } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import QRDisplay from '@/components/QRDisplay'

export default function SessionLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string // ESTE ES EL SESSION_ID REAL

  const { sessionPin, setSession, participants, setParticipants } = useQuizStore()

  const [session, setSessionData] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 Loading lobby for session:', sessionId)
    
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id, pin, status, game_mode, quiz_id,
          quizzes (id, title, description)
        `)
        .eq('id', sessionId)
        .single()

      if (error || !data) {
        console.error('❌ Error:', error)
        toast.error('Sesión no encontrada')
        setLoading(false)
        return
      }

      console.log('✅ Session loaded:', data)
      setSessionData(data)
      setQuiz(data.quizzes)
      setSession(data.id, data.pin, data.status, data.game_mode)
      setLoading(false)
    }

    fetchSession()
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`participants:${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `session_id=eq.${sessionId}`,
      }, async () => {
        const { data } = await supabase
          .from('participants')
          .select(`id, nickname, avatar_color, team, is_eliminated, scores:scores(total_points)`)
          .eq('session_id', sessionId)

        if (data) {
          const withScores = data.map((p: any) => ({ ...p, score: p.scores?.[0]?.total_points || 0 }))
          setParticipants(withScores.sort((a: any, b: any) => b.score - a.score))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, setParticipants])

  const handleStart = async () => {
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (error) {
      toast.error('Error: ' + error.message)
      return
    }

    router.push(`/play/${sessionId}/question`)
  }

  const joinUrl = sessionPin ? `${window.location.origin}/join?pin=${sessionPin}` : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || !quiz) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">❌</div>
          <p>Sesión no encontrada</p>
          <Link href="/dashboard" className="text-blue-500 underline mt-4">Volver</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">← Volver</Link>
          <h1 className="text-xl font-black text-white">Lobby del Juego</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Column */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 text-center">
              <h2 className="text-lg font-black text-white mb-2">{quiz.title}</h2>
              <p className="text-slate-400 text-sm mb-6">{quiz.description || ''}</p>
              
              {sessionPin && <QRDisplay value={joinUrl} />}
              
              {sessionPin && (
                <div className="mt-6 bg-blue-500/10 border-2 border-blue-500/30 rounded-3xl p-6">
                  <p className="text-sm text-blue-400 font-bold uppercase mb-2">PIN del Juego</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-6xl font-black text-blue-500">{sessionPin}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(joinUrl)
                        setCopied(true)
                        toast.success('¡Copiado!')
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="p-3 bg-blue-500/20 rounded-xl"
                    >
                      {copied ? <Check className="w-6 h-6 text-green-400" /> : <Copy className="w-6 h-6 text-blue-400" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants Column */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-black text-white">Participantes ({participants.length})</h2>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Esperando jugadores...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: p.avatar_color }}>
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 font-bold text-white">{p.nickname}</span>
                    {i === 0 && participants.length > 1 && <span className="text-xs">👑</span>}
                  </div>
                ))}
              </div>
            )}

            {participants.length > 0 && (
              <button
                onClick={handleStart}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <Play className="w-6 h-6" />
                ¡Comenzar!
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
