'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { Users, Copy, Check, QrCode, Play } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import QRDisplay from '@/components/QRDisplay'
import Leaderboard from '@/components/Leaderboard'

export default function SessionLobbyPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const {
    sessionPin,
    setSession,
    participants,
    setParticipants,
  } = useQuizStore()

  const [session, setSessionData] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      console.log('🔍 Fetching session:', sessionId)
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          pin,
          status,
          game_mode,
          quiz_id,
          quizzes (
            id,
            title,
            description,
            subject
          )
        `)
        .eq('id', sessionId)
        .single()

      if (sessionError) {
        console.error('❌ Error fetching session:', sessionError)
        toast.error('Error: ' + sessionError.message)
        setLoading(false)
        return
      }

      console.log('✅ Session found:', sessionData)
      setSessionData(sessionData)
      setQuiz(sessionData.quizzes)
      
      if (sessionData.pin) {
        setSession(sessionData.id, sessionData.pin, sessionData.status, sessionData.game_mode)
      }

      setLoading(false)
    }

    fetchSession()
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return

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
        async () => {
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
              score: p.scores?.[0]?.total_points || 0,
            }))
            setParticipants(withScores.sort((a: any, b: any) => b.score - a.score))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(participantsChannel)
    }
  }, [sessionId, setParticipants])

  useEffect(() => {
    if (session?.status === 'active') {
      router.push(`/play/${sessionId}/question`)
    }
  }, [session?.status, sessionId, router])

  const handleStart = async () => {
    const { error } = await supabase
      .from('sessions')
      .update({ 
        status: 'active', 
        started_at: new Date().toISOString(),
        current_question_index: 0,
      })
      .eq('id', sessionId)

    if (error) {
      toast.error('Error al iniciar: ' + error.message)
      return
    }

    toast.success('¡Juego iniciado!')
    router.push(`/play/${sessionId}/question`)
  }

  const joinUrl = `${window.location.origin}/join?pin=${sessionPin}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    toast.success('¡Enlace copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⏳</div>
          Cargando lobby...
        </div>
      </div>
    )
  }

  if (!session || !sessionPin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">❌</div>
          <p>Sesión no encontrada</p>
          <Link href="/dashboard" className="text-blue-500 hover:underline mt-4 block">
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Volver
            </Link>
            <h1 className="text-xl font-black text-white">
              Lobby del Juego
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - QR & Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-lg text-center"
            >
              <h2 className="text-lg font-black text-white mb-2">
                {quiz?.title || 'Cargando...'}
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                {quiz?.description || 'Sin descripción'}
              </p>

              {/* QR Display - Always Visible */}
              <div className="mb-6">
                <QRDisplay value={joinUrl} />
              </div>

              {/* PIN Display */}
              {sessionPin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50 rounded-3xl p-6 text-center"
                >
                  <p className="text-sm text-blue-400 mb-2 font-bold uppercase tracking-wider">PIN del Juego</p>
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-6xl font-black text-blue-500 tracking-widest">
                      {sessionPin}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-colors"
                      title="Copiar enlace"
                    >
                      {copied ? (
                        <Check className="w-6 h-6 text-green-400" />
                      ) : (
                        <Copy className="w-6 h-6 text-blue-400" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Participants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                <h2 className="text-lg font-black text-white">
                  Participantes ({participants.length})
                </h2>
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Esperando jugadores...</p>
                <p className="text-sm mt-2">
                  Comparte el QR o PIN para unirse
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ backgroundColor: participant.avatar_color }}
                    >
                      {participant.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 font-bold text-white truncate">
                      {participant.nickname}
                    </span>
                    {index === 0 && participants.length > 1 && (
                      <span className="text-xs text-amber-500 font-bold">
                        👑 Primero
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Start Button */}
            {participants.length > 0 && (
              <button
                onClick={handleStart}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-500/30"
              >
                <Play className="w-6 h-6" />
                ¡Comenzar Juego!
              </button>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
