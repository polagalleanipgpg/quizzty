'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QrCode, ArrowLeft, Sparkles, Check, X, Loader } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const AVATAR_COLORS = [
  { name: 'Azul', color: '#3B82F6', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Violeta', color: '#8B5CF6', gradient: 'from-violet-500 to-violet-600' },
  { name: 'Rosa', color: '#EC4899', gradient: 'from-pink-500 to-pink-600' },
  { name: 'Naranja', color: '#F59E0B', gradient: 'from-amber-500 to-amber-600' },
  { name: 'Verde', color: '#10B981', gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'Rojo', color: '#EF4444', gradient: 'from-red-500 to-red-600' },
  { name: 'Cyan', color: '#06B6D4', gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'Lima', color: '#84CC16', gradient: 'from-lime-500 to-lime-600' },
]

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlPin = searchParams.get('pin')?.toUpperCase() || ''

  const [pin, setPin] = useState(urlPin)
  const [nickname, setNickname] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].color)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'pin' | 'nickname' | 'joining'>('pin')
  const [sessionId, setSessionId] = useState('')
  const [validating, setValidating] = useState(false)
  const [shake, setShake] = useState(false)

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
        setShake(true)
        setTimeout(() => setShake(false), 500)
        toast.error('PIN inválido')
        return
      }

      if (session.status !== 'waiting' && session.status !== 'active') {
        toast.error('Este juego ya comenzó o terminó')
        return
      }

      setSessionId(session.id)
      setStep('nickname')
      toast.success('¡Sesión encontrada!')
    } catch (error) {
      console.error('Error validating PIN:', error)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      toast.error('PIN inválido')
    } finally {
      setLoading(false)
      setValidating(false)
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length === 6) {
      await validatePin(pin)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStep('joining')

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
          setStep('nickname')
          setLoading(false)
          return
        }
        throw error
      }

      // Confetti effect
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [avatarColor, '#ffffff', '#FFD700'],
      })

      toast.success('¡Te uniste al juego!')

      // Store participant info
      const storeKey = 'quizzty-storage-v1'
      const stored = localStorage.getItem(storeKey)
      const parsed = stored ? JSON.parse(stored) : {}
      parsed.state = {
        ...parsed.state,
        participantId: participant.id,
        nickname: participant.nickname,
        avatarColor: avatarColor,
      }
      localStorage.setItem(storeKey, JSON.stringify(parsed))

      // Redirect
      window.location.href = `/play/${sessionId}/question`
    } catch (error: any) {
      console.error('Join error:', error)
      toast.error(error.message || 'Error al unirse')
      setStep('nickname')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </Link>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-4 shadow-2xl shadow-purple-500/50"
            >
              <QrCode className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-2">
              Unirse al Juego
            </h1>
            <p className="text-white/60 text-sm">
              {step === 'pin' && 'Ingresá el PIN de 6 dígitos'}
              {step === 'nickname' && 'Elegí tu nombre y avatar'}
              {step === 'joining' && 'Uniéndote al juego...'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'pin' && (
              <motion.form
                key="pin"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                onSubmit={handlePinSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                    PIN del Juego
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.toUpperCase().slice(0, 6))}
                    required
                    maxLength={6}
                    autoFocus
                    className={`w-full px-6 py-5 bg-white/10 border-2 ${
                      shake ? 'border-red-500' : 'border-white/20'
                    } rounded-2xl text-white text-center text-5xl font-black tracking-[0.5em] placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all ${
                      shake ? 'animate-shake' : ''
                    }`}
                    placeholder="000000"
                  />
                  {shake && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 text-center font-bold"
                    >
                      PIN inválido
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || pin.length !== 6}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-black text-lg rounded-2xl transition-all hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-purple-500/30"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Buscando...
                    </span>
                  ) : (
                    'CONTINUAR'
                  )}
                </button>
              </motion.form>
            )}

            {step === 'nickname' && (
              <motion.form
                key="nickname"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                onSubmit={handleJoin}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    minLength={2}
                    maxLength={20}
                    autoFocus
                    className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-white text-lg font-bold placeholder-white/20 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all"
                    placeholder="Tu nickname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                    Elegí tu Avatar
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATAR_COLORS.map((color) => (
                      <motion.button
                        key={color.color}
                        type="button"
                        onClick={() => setAvatarColor(color.color)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${color.gradient} transition-all ${
                          avatarColor === color.color
                            ? 'ring-4 ring-white scale-110 shadow-2xl'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={color.name}
                      >
                        {avatarColor === color.color && (
                          <Check className="w-6 h-6 text-white mx-auto" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('pin')}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !nickname.trim()}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-black text-lg rounded-2xl transition-all hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-xl shadow-purple-500/30"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        Uniéndote...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        ¡JUGAR!
                      </span>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'joining' && (
              <motion.div
                key="joining"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-20 h-20 border-4 border-white/20 border-t-blue-500 rounded-full mb-6"
                />
                <p className="text-white font-bold text-lg mb-2">
                  ¡Uniéndote al juego!
                </p>
                <p className="text-white/60 text-sm">
                  nickname: {nickname}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-white/40 text-sm">
          <p>¿Tenés el PIN? Escaneá el QR o ingresalo arriba</p>
        </div>
      </motion.div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-white font-bold">Cargando...</p>
        </div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  )
}
