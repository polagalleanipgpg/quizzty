'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, Target, Clock, TrendingUp, Award, ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface QuizStats {
  id: string
  title: string
  total_questions: number
  total_plays: number
  avg_score: number
  avg_time: number
}

export default function QuizAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [stats, setStats] = useState<QuizStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [topStudents, setTopStudents] = useState<any[]>([])
  const [allParticipants, setAllParticipants] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch quiz info
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('*, questions(count)')
        .eq('id', quizId)
        .single()

      if (!quiz) {
        router.push('/dashboard')
        return
      }

      // Fetch sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, game_mode')
        .eq('quiz_id', quizId)

      const sessionIds = sessions?.map(s => s.id) || []

      if (sessionIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch participants with scores
      const { data: participants } = await supabase
        .from('participants')
        .select(`
          id,
          nickname,
          avatar_color,
          scores:scores(total_points),
          answers:answers(is_correct, response_time_ms)
        `)
        .in('session_id', sessionIds)

      // Calculate stats
      const totalPlays = participants?.length || 0
      const avgScore = (participants || []).reduce((acc, p: any) => {
        return acc + (p.scores?.[0]?.total_points || 0)
      }, 0) / (totalPlays || 1)

      const avgTime = (participants || []).reduce((acc, p: any) => {
        const times = p.answers?.map((a: any) => a.response_time_ms || 0) || []
        return acc + (times.reduce((a: number, b: number) => a + b, 0) / (times.length || 1))
      }, 0) / (totalPlays || 1)

      setStats({
        id: quiz.id,
        title: quiz.title,
        total_questions: quiz.questions?.[0]?.count || 0,
        total_plays: totalPlays,
        avg_score: Math.round(avgScore),
        avg_time: Math.round(avgTime / 1000),
      })

      // Top students
      const sorted = [...(participants || [])].sort((a: any, b: any) => {
        return (b.scores?.[0]?.total_points || 0) - (a.scores?.[0]?.total_points || 0)
      }).slice(0, 5)

      setTopStudents(sorted.map((p: any) => ({
        id: p.id,
        nickname: p.nickname,
        avatar_color: p.avatar_color,
        score: p.scores?.[0]?.total_points || 0,
        accuracy: p.answers?.filter((a: any) => a.is_correct).length / (p.answers?.length || 1) * 100,
      })))

      setAllParticipants(participants?.map((p: any) => ({
        id: p.id,
        nickname: p.nickname,
        score: p.scores?.[0]?.total_points || 0,
        correct: p.answers?.filter((a: any) => a.is_correct).length || 0,
        total: p.answers?.length || 0,
        accuracy: p.answers?.filter((a: any) => a.is_correct).length / (p.answers?.length || 1) * 100,
      })) || [])

      setLoading(false)
    }

    fetchStats()
  }, [quizId, router])

  const handleExport = () => {
    // Crear CSV
    const headers = ['Ranking', 'Estudiante', 'Puntaje', 'Correctas', 'Total', 'Precisión']
    const rows = allParticipants.map((p, i) => [
      i + 1,
      p.nickname,
      p.score,
      p.correct,
      p.total,
      `${Math.round(p.accuracy)}%`,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n')

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-${stats?.title || 'quiz'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">⏳</div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-black text-white">Analytics</h1>
          </div>
          <button
            onClick={handleExport}
            disabled={allParticipants.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-white mb-2">{stats?.title}</h2>
          <p className="text-slate-400">Estadísticas de rendimiento</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-3xl"
          >
            <Users className="w-8 h-8 text-blue-500 mb-3" />
            <div className="text-3xl font-black text-white">{stats?.total_plays || 0}</div>
            <div className="text-sm text-blue-400">Participaciones</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-3xl"
          >
            <Trophy className="w-8 h-8 text-green-500 mb-3" />
            <div className="text-3xl font-black text-white">{stats?.avg_score || 0}</div>
            <div className="text-sm text-green-400">Puntaje Promedio</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-amber-600/20 to-amber-700/20 border border-amber-500/30 rounded-3xl"
          >
            <Clock className="w-8 h-8 text-amber-500 mb-3" />
            <div className="text-3xl font-black text-white">{stats?.avg_time || 0}s</div>
            <div className="text-sm text-amber-400">Tiempo Promedio</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-3xl"
          >
            <Target className="w-8 h-8 text-purple-500 mb-3" />
            <div className="text-3xl font-black text-white">{stats?.total_questions || 0}</div>
            <div className="text-sm text-purple-400">Preguntas</div>
          </motion.div>
        </div>

        {/* Top Students */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-black text-white">Top 5 Estudiantes</h3>
          </div>

          {topStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aún no hay participaciones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl ${
                    index === 0 ? 'bg-amber-500/10 border border-amber-500/30' :
                    index === 1 ? 'bg-slate-500/10 border border-slate-500/30' :
                    index === 2 ? 'bg-amber-900/20 border border-amber-700/30' :
                    'bg-slate-800/50 border border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8">
                    {index === 0 && <Trophy className="w-6 h-6 text-amber-400" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-slate-400" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-amber-700" />}
                    {index > 2 && <span className="text-lg font-bold text-slate-400">#{index + 1}</span>}
                  </div>

                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                    style={{ backgroundColor: student.avatar_color }}
                  >
                    {student.nickname.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-white">{student.nickname}</div>
                    <div className="text-sm text-slate-400">
                      Precisión: {Math.round(student.accuracy)}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-white">{student.score}</div>
                    <div className="text-xs text-slate-400">puntos</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-black text-white">Insights</h3>
          </div>

          <div className="space-y-3 text-slate-300">
            {stats && stats.total_plays > 0 && (
              <>
                <p>• El puntaje promedio es de <strong className="text-white">{stats.avg_score} puntos</strong></p>
                <p>• Los estudiantes tardan <strong className="text-white">{stats.avg_time} segundos</strong> en promedio</p>
                <p>• <strong className="text-white">{stats.total_plays} estudiantes</strong> han completado el quiz</p>
              </>
            )}
            {stats && stats.total_plays === 0 && (
              <p>• Aún no hay participaciones. ¡Compartí el PIN con tus estudiantes!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
