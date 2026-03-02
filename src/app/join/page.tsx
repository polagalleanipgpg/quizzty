'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QrCode, ArrowLeft, User, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

const AVATAR_COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#EF4444',
  '#06B6D4',
  '#84CC16',
]

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlPin = searchParams.get('pin')?.toUpperCase() || ''

  const [pin, setPin] = useState(urlPin)
  const [nickname, setNickname] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'pin' | 'nickname'>('pin')
  const [sessionId, setSessionId] = useState('')
  const [validating, setValidating] = useState(false)

  // Si viene PIN por URL, validar automáticamente
  useEffect(() => {
    if (urlPin && urlPin.length === 6) {
      setPin(urlPin)
      validatePin(urlPin)
    }
  }, [urlPin])

  const validatePin = async (pinCode: string) => {
    if (validating || pinCode.length !== 6) return
    
    setValidating(true)
    setLoading(true)

    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select('id, status, quiz_id')
        .eq('pin', pinCode.toUpperCase())
        .single()

      if (error || !session) {
        toast.error('PIN inválido o sesión no encontrada')
        setStep('pin')
        return
      }

      if (session.status !== 'waiting' && session.status !== 'active') {
        toast.error('Este juego ya comenzó o terminó')
        setStep('pin')
        return
      }

      setSessionId(session.id)
      setStep('nickname')
      toast.success('¡Sesión encontrada! Elegí tu avatar')
    } catch (error) {
      console.error('Error validating PIN:', error)
      toast.error('Error buscando la sesión')
      setStep('pin')
    } finally {
      setLoading(false)
      setValidating(false)
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await validatePin(pin)
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: participant, error } = await supabase
        .from('participants')
        .insert({
          session_id: sessionId,
          nickname: nickname.trim(),
          avatar_color: avatarColor,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('Este nombre ya está en uso')
        } else {
          toast.error('Error al unirse')
        }
        return
      }

      // Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [avatarColor, '#ffffff'],
      })

      toast.success('¡Te uniste al juego!')

      // Store participant info in store (localStorage)
      const storeKey = 'quizzty-storage-v1'
      const stored = localStorage.getItem(storeKey)
      const parsed = stored ? JSON.parse(stored) : {}
      parsed.state = {
        ...parsed.state,
        participantId: participant.id,
        nickname: participant.nickname,
      }
      localStorage.setItem(storeKey, JSON.stringify(parsed))

      // Redirect to play page
      router.push(`/play/${sessionId}`)
    } catch (error) {
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
              <QrCode className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">
              Unirse al Juego
            </h1>
            <p className="text-slate-400">
              {step === 'pin'
                ? 'Ingresa el PIN de 6 dígitos'
                : 'Elige tu nombre y avatar'}
            </p>
          </div>

          {step === 'pin' ? (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  PIN del Juego
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.toUpperCase().slice(0, 6))
                  }
                  required
                  maxLength={6}
                  className="w-full px-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-3xl font-black tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC123"
                />
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] disabled:scale-100 text-lg"
              >
                {loading ? 'Buscando...' : 'Continuar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tu Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    minLength={2}
                    maxLength={20}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nickname"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Elige tu Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-12 h-12 rounded-xl transition-all ${
                        avatarColor === color
                          ? 'ring-4 ring-white scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('pin')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading || !nickname.trim()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {loading ? 'Uniéndose...' : 'Jugar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⏳</div>
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  )
}
