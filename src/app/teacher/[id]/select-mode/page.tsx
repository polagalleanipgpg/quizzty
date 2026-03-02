'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { Zap, Users, Trophy, Skull, Clock, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const gameModes = [
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Todos contra todos, acumula puntos',
    icon: Trophy,
    color: 'from-amber-500 to-orange-500',
    timeLimit: 30,
  },
  {
    id: 'blitz',
    name: 'Blitz',
    description: '¡10 segundos por pregunta!',
    icon: Zap,
    color: 'from-yellow-400 to-amber-500',
    timeLimit: 10,
    popular: true,
  },
  {
    id: 'teams',
    name: 'Equipos',
    description: 'Equipos compiten juntos',
    icon: Users,
    color: 'from-blue-500 to-purple-500',
    timeLimit: 30,
  },
  {
    id: 'elimination',
    name: 'Eliminación',
    description: 'Último lugar es eliminado',
    icon: Skull,
    color: 'from-red-500 to-rose-500',
    timeLimit: 30,
  },
]

export default function SelectGameModePage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const { setSession } = useQuizStore()
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleStart = async (mode: string) => {
    setSelectedMode(mode)
    setLoading(true)

    try {
      // Create session
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          quiz_id: quizId,
          game_mode: mode,
          status: 'waiting',
          current_question_index: 0,
        })
        .select()
        .single()

      if (error) throw error

      setSession(session.id, session.pin, session.status, mode as any)

      toast.success('¡Sesión creada!')
      router.push(`/teacher/${session.id}/play`)
    } catch (error: any) {
      console.error('Error creating session:', error)
      toast.error(error.message || 'Error al crear sesión')
    } finally {
      setLoading(false)
      setSelectedMode(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-4xl font-black text-white mb-2">
            Elige el Modo de Juego
          </h1>
          <p className="text-slate-400 text-lg">
            Seleccioná cómo quieres que jueguen tus estudiantes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {gameModes.map((mode) => {
            const Icon = mode.icon
            return (
              <motion.button
                key={mode.id}
                onClick={() => handleStart(mode.id)}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-3xl border-2 transition-all text-left group ${
                  selectedMode === mode.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 bg-slate-900/50 hover:border-white/30'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {mode.popular && (
                  <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                    ⭐ Popular
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-4 bg-gradient-to-br ${mode.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-1">
                      {mode.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">
                      {mode.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{mode.timeLimit} segundos por pregunta</span>
                    </div>
                  </div>
                </div>

                {loading && selectedMode === mode.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
                    <div className="text-white font-bold">Creando...</div>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
