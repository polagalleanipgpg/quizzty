'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import { Clock, ChevronRight, Trophy, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Leaderboard from '@/components/Leaderboard'

export default function TeacherQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const { participants, currentQuestionIndex, setCurrentQuestionIndex } =
    useQuizStore()

  const [question, setQuestion] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  const fetchQuestion = useCallback(async () => {
    const { data: session } = await supabase
      .from('sessions')
      .select('quiz_id, current_question_index')
      .eq('id', sessionId)
      .single()

    if (!session) return

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', session.quiz_id)
      .order('sort_order')

    if (questions) {
      setTotalQuestions(questions.length)
      const currentQ = questions[session.current_question_index]
      setQuestion(currentQ)
      setTimeLeft(currentQ?.time_limit || 30)

      // Fetch quiz info
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', session.quiz_id)
        .single()
      setQuiz(quizData)
    }
  }, [sessionId])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  // Timer
  useEffect(() => {
    if (!question || showResults) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleShowResults()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [question, showResults])

  // Fetch answers in real-time
  useEffect(() => {
    if (!question) return

    const fetchAnswers = async () => {
      const { data } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', question.id)
        .eq('session_id', sessionId)

      if (data) setAnswers(data)
    }

    fetchAnswers()

    const channel = supabase
      .channel(`answers:${sessionId}:${question.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${question.id} AND session_id=eq.${sessionId}`,
        },
        () => fetchAnswers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [question, sessionId])

  const handleShowResults = () => {
    setShowResults(true)
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      // End game
      await supabase
        .from('sessions')
        .update({
          status: 'finished',
          finished_at: new Date().toISOString(),
        })
        .eq('id', sessionId)

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      })

      router.push(`/teacher/${sessionId}/results`)
    } else {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      await supabase
        .from('sessions')
        .update({ current_question_index: nextIndex })
        .eq('id', sessionId)

      setShowResults(false)
      fetchQuestion()
    }
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">Cargando...</div>
      </div>
    )
  }

  const correctCount = answers.filter((a) => a.is_correct).length
  const responseRate = Math.round(
    (answers.length / (participants.length || 1)) * 100
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 bg-slate-900/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
              {question.question_type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span
                className={`text-2xl font-black ${
                  timeLeft <= 10 ? 'text-red-500' : 'text-white'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
            <div className="text-sm text-slate-400">
              {answers.length}/{participants.length} respondieron
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {/* Question Preview */}
              <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-lg">
                <h2 className="text-2xl font-black text-white mb-6">
                  {question.question_text}
                </h2>

                {question.options && (
                  <div className="space-y-3">
                    {JSON.parse(question.options).map(
                      (option: string, index: number) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-800/50 rounded-xl text-slate-300"
                        >
                          {option}
                        </div>
                      )
                    )}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-2 text-slate-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">
                    Respuesta correcta: {question.correct_answer}
                  </span>
                </div>
              </div>

              {/* Live Stats */}
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-lg">
                  <h3 className="text-lg font-black text-white mb-4">
                    Progreso en Vivo
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Respuestas</span>
                        <span className="text-white font-bold">
                          {responseRate}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${responseRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                        <div className="text-2xl font-black text-white">
                          {answers.length}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Respondieron
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-500/20 rounded-xl">
                        <div className="text-2xl font-black text-green-400">
                          {correctCount}
                        </div>
                        <div className="text-xs text-green-400/80 mt-1">
                          Correctas
                        </div>
                      </div>
                      <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                        <div className="text-2xl font-black text-white">
                          {participants.length}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Total
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Leaderboard
                  sessionId={sessionId}
                  variant="compact"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-lg text-center"
            >
              <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-white mb-2">
                ¡Tiempo Terminado!
              </h2>
              <p className="text-slate-400 mb-8">
                {correctCount} de {answers.length} respuestas correctas
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-green-500/20 rounded-2xl">
                  <div className="text-3xl font-black text-green-400">
                    {correctCount}
                  </div>
                  <div className="text-sm text-green-400/80 mt-1">
                    Correctas
                  </div>
                </div>
                <div className="p-4 bg-red-500/20 rounded-2xl">
                  <div className="text-3xl font-black text-red-400">
                    {answers.length - correctCount}
                  </div>
                  <div className="text-sm text-red-400/80 mt-1">
                    Incorrectas
                  </div>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <div className="text-3xl font-black text-blue-400">
                    {responseRate}%
                  </div>
                  <div className="text-sm text-blue-400/80 mt-1">
                    Participación
                  </div>
                </div>
                <div className="p-4 bg-amber-500/20 rounded-2xl">
                  <div className="text-3xl font-black text-amber-400">
                    {question.points}
                  </div>
                  <div className="text-sm text-amber-400/80 mt-1">
                    Puntos Máx
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-105 inline-flex items-center gap-2 text-lg"
              >
                {currentQuestionIndex + 1 >= totalQuestions
                  ? 'Ver Resultados Finales'
                  : 'Siguiente Pregunta'}
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
