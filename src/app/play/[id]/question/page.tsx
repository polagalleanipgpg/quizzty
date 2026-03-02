'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { useRealtimeSession } from '@/hooks/useRealtime'
import { Gamepad2, Users, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import Leaderboard from '@/components/Leaderboard'
import CircularTimer from '@/components/CircularTimer'

export default function PlayQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const { participantId, nickname, currentQuestion, setCurrentQuestion } =
    useQuizStore()

  const sessionData = useRealtimeSession(sessionId)
  const [question, setQuestion] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [points, setPoints] = useState(0)

  useEffect(() => {
    if (!participantId) {
      router.push(`/join?pin=${sessionId}`)
    }
  }, [participantId, sessionId, router])

  useEffect(() => {
    // Fetch current question
    const fetchQuestion = async () => {
      const { data: session } = await supabase
        .from('sessions')
        .select('current_question_index, quiz_id')
        .eq('id', sessionId)
        .single()

      if (!session) return

      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', session.quiz_id)
        .order('sort_order', { ascending: true })

      if (questions && questions[session.current_question_index]) {
        const q = questions[session.current_question_index]
        setQuestion(q)
        setCurrentQuestion(q)
        setTimeLeft(q.time_limit)
      }
    }

    fetchQuestion()
  }, [sessionId, sessionData?.currentQuestionIndex])

  // Timer countdown
  useEffect(() => {
    if (!question || submitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(null) // Auto-submit when time runs out
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

    const isCorrect = answer === question.correct_answer
    setIsCorrect(isCorrect)

    // Calculate points based on time remaining
    const earnedPoints = isCorrect
      ? Math.round(question.points * (timeLeft / question.time_limit))
      : 0
    setPoints(earnedPoints)

    // Submit answer
    await supabase.from('answers').insert({
      participant_id: participantId,
      question_id: question.id,
      session_id: sessionId,
      answer_text: answer || '',
      is_correct: isCorrect,
      points_awarded: earnedPoints,
      response_time_ms: (question.time_limit - timeLeft) * 1000,
    })

    // Show result for 3 seconds then maybe redirect
    setTimeout(() => {
      // Will be redirected by teacher when ready
    }, 3000)
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Gamepad2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-white font-bold">Cargando pregunta...</p>
        </div>
      </div>
    )
  }

  const options = question.options ? JSON.parse(question.options) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-lg rounded-full border border-white/10">
              <span className="text-sm text-slate-400">Jugador:</span>
              <span className="ml-2 text-white font-bold">{nickname}</span>
            </div>
          </div>

          <CircularTimer timeLeft={timeLeft} totalTime={question.time_limit} />

          <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-lg rounded-full border border-white/10">
            <span className="text-sm text-slate-400">Puntos:</span>
            <span className="ml-2 text-amber-400 font-black">{points}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-8">
        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 mb-6 backdrop-blur-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full uppercase">
              {question.question_type.replace('_', ' ')}
            </span>
            <span className="text-slate-400 text-sm">
              {question.points} puntos • {question.time_limit}s
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mb-6">
            {question.question_text}
          </h2>

          {question.question_type === 'multiple_choice' && (
            <div className="grid grid-cols-2 gap-4">
              {options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSubmit(option)}
                  disabled={submitted}
                  className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${
                    submitted
                      ? option === question.correct_answer
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : option === selectedAnswer
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                      : 'bg-slate-800/50 border-slate-700 text-white hover:border-blue-500 hover:bg-blue-500/10'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.question_type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleSubmit('true')}
                disabled={submitted}
                className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${
                  submitted
                    ? question.correct_answer === 'true'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : selectedAnswer === 'true'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    : 'bg-slate-800/50 border-slate-700 text-white hover:border-green-500 hover:bg-green-500/10'
                }`}
              >
                ✓ Verdadero
              </button>
              <button
                onClick={() => handleSubmit('false')}
                disabled={submitted}
                className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${
                  submitted
                    ? question.correct_answer === 'false'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : selectedAnswer === 'false'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    : 'bg-slate-800/50 border-slate-700 text-white hover:border-red-500 hover:bg-red-500/10'
                }`}
              >
                ✗ Falso
              </button>
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
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu respuesta..."
              />
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
              >
                Enviar Respuesta
              </button>
            </form>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-6 rounded-2xl text-center ${
                isCorrect
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-red-500/20 border border-red-500/50'
              }`}
            >
              <div className="text-4xl mb-2">
                {isCorrect ? '🎉' : '😢'}
              </div>
              <p
                className={`text-xl font-black ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
              </p>
              {isCorrect && (
                <p className="text-amber-400 font-bold mt-2">
                  +{points} puntos
                </p>
              )}
              {!isCorrect && (
                <p className="text-slate-400 mt-2">
                  Respuesta: {question.correct_answer}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Live Leaderboard */}
        <Leaderboard sessionId={sessionId} currentParticipantId={participantId || undefined} compact />
      </main>

      {/* Waiting Message */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-lg border-t border-white/10"
        >
          <p className="text-center text-slate-400 text-sm">
            Esperando al profesor para continuar...
          </p>
        </motion.div>
      )}
    </div>
  )
}
