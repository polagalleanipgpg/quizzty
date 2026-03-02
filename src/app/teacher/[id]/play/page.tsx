'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { useRealtimeSession, useRealtimeParticipants } from '@/hooks/useRealtime'
import { Users, Copy, Check, QrCode, Play, Settings } from 'lucide-react'
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
    sessionId: storeSessionId,
    sessionPin,
    setSession,
    participants,
    setParticipants,
  } = useQuizStore()

  const sessionData = useRealtimeSession(sessionId)
  const realtimeParticipants = useRealtimeParticipants(sessionId)

  const [quiz, setQuiz] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    // Fetch quiz info
    supabase
      .from('sessions')
      .select('id, pin, status, game_mode, quiz_id, quizzes(title, description)')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => {
        if (data) {
          setQuiz(data.quizzes)
          setSession(data.id, data.pin || '', data.status, data.game_mode)
        }
      })
  }, [sessionId])

  useEffect(() => {
    if (realtimeParticipants) {
      setParticipants(
        realtimeParticipants.map((p: any) => ({
          id: p.id,
          session_id: p.session_id,
          nickname: p.nickname,
          avatar_color: p.avatar_color,
          score: p.score,
          team: p.team,
          is_eliminated: p.is_eliminated,
        }))
      )
    }
  }, [realtimeParticipants, setParticipants])

  useEffect(() => {
    // Redirect if session started
    if (sessionData?.status === 'active') {
      router.push(`/play/${sessionId}/question`)
    }
  }, [sessionData?.status, sessionId, router])

  const handleStart = async () => {
    // Redirigir a selección de modo de juego
    const quizId = quiz?.id
    if (!quizId) {
      toast.error('Quiz no encontrado')
      return
    }
    router.push(`/teacher/${quizId}/select-mode`)
  }

  const joinUrl = `${window.location.origin}/join?pin=${sessionPin}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    toast.success('¡Enlace copiado!')
    setTimeout(() => setCopied(false), 2000)
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

              <button
                onClick={() => setShowQR(!showQR)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
              >
                <QrCode className="w-5 h-5" />
                {showQR ? 'Ocultar QR' : 'Mostrar QR'}
              </button>

              <AnimatePresence>
                {showQR && sessionPin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <QRDisplay value={joinUrl} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* PIN Display */}
            {sessionPin && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-6 text-center"
              >
                <p className="text-sm text-slate-400 mb-2">PIN del Juego</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl font-black text-white tracking-widest">
                    {sessionPin}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}
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
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                      style={{ backgroundColor: participant.avatar_color }}
                    >
                      {participant.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 font-bold text-white">
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
                className="w-full mt-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
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
