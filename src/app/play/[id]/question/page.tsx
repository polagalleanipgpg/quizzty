'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { Check, X, Clock, Trophy, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Leaderboard from '@/components/Leaderboard'
import CircularTimer from '@/components/CircularTimer'

export default function StudentQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const { participantId, nickname, avatarColor, streak, setStreak } = useQuizStore()

  const [question, setQuestion] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [points, setPoints] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (!participantId) {
      router.push(`/join?pin=${sessionId}`)
    }
  }, [participantId, sessionId, router])

  useEffect(() => {
    const fetchQuestion = async () => {
      const { data: session } = await supabase
        .from('sessions')
        .select('current_question_index, quiz_id, status')
        .eq('id', sessionId)
        .single()

      if (!session) return

      if (session.status === 'finished') {
        router.push(`/teacher/${sessionId}/results`)
        return
      }

      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', session.quiz_id)
        .order('sort_order')

      if (questions && questions[session.current_question_index]) {
        const q = questions[session.current_question_index]
        setQuestion(q)
        setTimeLeft(q.time_limit)
      }
    }

    fetchQuestion()
  }, [sessionId])

  // Timer
  useEffect(() => {
    if (!question || submitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [question, submitted])

  const handleSubmit = async (answer: string | null) => {
    if (submitted || !question || !participantId) return

    setSubmitted(true)
    setSelectedAnswer(answer)

    const correctAnswer = question.correct_answer
    const options = question.options ? JSON.parse(question.options) : []
    
    let userAnswer = answer
    
    // Para true_false, convertir a string
    if (question.question_type === 'true_false') {
      if (answer === 'true') userAnswer = 'true'
      else if (answer === 'false') userAnswer = 'false'
    }

    const isCorrectAnswer = userAnswer === correctAnswer
    setIsCorrect(isCorrectAnswer)

    // Calcular puntos
    const earnedPoints = isCorrectAnswer
      ? Math.round(question.points * (timeLeft / question.time_limit))
      : 0
    
    setPoints(earnedPoints)
    setShowResult(true)

    // Actualizar streak
    if (isCorrectAnswer) {
      setStreak((streak || 0) + 1)
      if (earnedPoints > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#FFD700', '#FFA500', '#ffffff'],
        })
      }
    } else {
      setStreak(0)
    }

    // Guardar respuesta
    await supabase.from('answers').insert({
      participant_id: participantId,
      question_id: question.id,
      session_id: sessionId,
      answer_text: userAnswer || '',
      is_correct: isCorrectAnswer,
      points_awarded: earnedPoints,
      response_time_ms: (question.time_limit - timeLeft) * 1000,
    })

    // Esperar y mostrar leaderboard
    setTimeout(() => {
      // El leaderboard se muestra automáticamente
    }, 3000)
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold">Cargando pregunta...</p>
        </div>
      </div>
    )
  }

  const options = question.options ? JSON.parse(question.options) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 bg-slate-900/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg"
              style={{ backgroundColor: avatarColor || '#3B82F6' }}
            >
              {nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold">{nickname}</p>
              {streak > 1 && (
                <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Racha: x{streak}
                </p>
              )}
            </div>
          </div>

          <CircularTimer timeLeft={timeLeft} totalTime={question.time_limit} />

          <div className="text-right">
            <p className="text-slate-400 text-xs font-bold uppercase">Puntos</p>
            <p className="text-2xl font-black text-amber-400">{points}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-8">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-[2.5rem] p-8 shadow-2xl"
            >
              {/* Question Header */}
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-black rounded-full uppercase tracking-wider border border-blue-500/30">
                  {question.question_type.replace('_', ' ')}
                </span>
                <span className="text-slate-400 text-sm font-bold">
                  {question.points} pts • {question.time_limit}s
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-3xl font-black text-white mb-8 leading-tight">
                {question.question_text}
              </h2>

              {/* Answer Options */}
              {question.question_type === 'multiple_choice' && (
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option: string, index: number) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSubmit(option)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={submitted}
                      className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-blue-600 hover:to-blue-700 border-2 border-slate-700 hover:border-blue-500 rounded-2xl transition-all disabled:cursor-not-allowed group"
                    >
                      <span className="text-white font-bold text-lg group-hover:text-white">
                        {option}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {question.question_type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => handleSubmit('true')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitted}
                    className="p-6 bg-gradient-to-br from-green-600/20 to-green-700/20 hover:from-green-600 hover:to-green-700 border-2 border-green-500/30 hover:border-green-500 rounded-2xl transition-all disabled:cursor-not-allowed"
                  >
                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <span className="text-white font-bold text-lg">Verdadero</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleSubmit('false')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitted}
                    className="p-6 bg-gradient-to-br from-red-600/20 to-red-700/20 hover:from-red-600 hover:to-red-700 border-2 border-red-500/30 hover:border-red-500 rounded-2xl transition-all disabled:cursor-not-allowed"
                  >
                    <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <span className="text-white font-bold text-lg">Falso</span>
                  </motion.button>
                </div>
              )}

              {question.question_type === 'short_answer' && !submitted && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleSubmit(formData.get('answer') as string)
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    name="answer"
                    required
                    autoFocus
                    className="w-full px-6 py-5 bg-slate-800 border-2 border-slate-700 rounded-2xl text-white text-lg font-bold focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Tu respuesta..."
                  />
                  <button
                    type="submit"
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-lg rounded-2xl transition-all hover:scale-[1.02]"
                  >
                    ENVIAR RESPUESTA
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`bg-slate-900/50 backdrop-blur-lg border-2 rounded-[2.5rem] p-8 text-center shadow-2xl ${
                isCorrect ? 'border-green-500/50' : 'border-red-500/50'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                {isCorrect ? (
                  <Check className="w-12 h-12 text-green-400" />
                ) : (
                  <X className="w-12 h-12 text-red-400" />
                )}
              </motion.div>

              <h2 className={`text-4xl font-black mb-4 ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}
              </h2>

              {isCorrect && points > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <p className="text-slate-400 text-sm font-bold uppercase mb-2">Puntos ganados</p>
                  <p className="text-5xl font-black text-amber-400">+{points}</p>
                </motion.div>
              )}

              {!isCorrect && (
                <div className="mb-6">
                  <p className="text-slate-400 text-sm font-bold uppercase mb-2">Respuesta correcta</p>
                  <p className="text-2xl font-black text-green-400">{question.correct_answer}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock className="w-5 h-5" />
                <p className="font-bold">Esperando al profesor para continuar...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaderboard */}
        <div className="mt-8">
          <Leaderboard sessionId={sessionId} currentParticipantId={participantId || undefined} compact />
        </div>
      </main>
    </div>
  )
}
