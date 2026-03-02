'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Crown, Star, Share2, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface FinalScore {
  id: string
  nickname: string
  avatar_color: string
  total_points: number
  correct_answers: number
  team: string | null
}

export default function FinalResultsPage() {
  const params = useParams()
  const sessionId = params.id as string
  const [scores, setScores] = useState<FinalScore[]>([])
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResults = async () => {
      // Fetch quiz info
      const { data: session } = await supabase
        .from('sessions')
        .select('quiz_id, quizzes(title)')
        .eq('id', sessionId)
        .single()

      if (session) {
        setQuiz(session.quizzes)
      }

      // Fetch final scores
      const { data } = await supabase
        .from('participants')
        .select(`
          id,
          nickname,
          avatar_color,
          team,
          scores:scores(total_points),
          answers:answers(is_correct)
        `)
        .eq('session_id', sessionId)
        .order('scores.total_points', { ascending: false, foreignTable: 'scores' })

      if (data) {
        const withStats = data.map((p: any) => ({
          id: p.id,
          nickname: p.nickname,
          avatar_color: p.avatar_color,
          total_points: p.scores?.[0]?.total_points || 0,
          correct_answers: p.answers?.filter((a: any) => a.is_correct).length || 0,
          team: p.team,
        }))
        setScores(withStats)
      }

      setLoading(false)

      // Confetti for top 3
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
        })
      }, 500)
    }

    fetchResults()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">Cargando resultados...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-2">
            ¡Juego Terminado!
          </h1>
          <p className="text-slate-400 text-lg">{quiz?.title}</p>
        </motion.div>

        {/* Podium */}
        {scores.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-end justify-center gap-4 mb-12"
          >
            {/* 2nd Place */}
            <div className="text-center">
              <div className="mb-2">
                <Medal className="w-12 h-12 text-slate-400 mx-auto" />
              </div>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-2"
                style={{ backgroundColor: scores[1].avatar_color }}
              >
                {scores[1].nickname.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold truncate max-w-[120px]">
                {scores[1].nickname}
              </p>
              <p className="text-slate-400 text-sm">
                {scores[1].total_points.toLocaleString()} pts
              </p>
              <div className="mt-3 h-32 bg-slate-700/50 rounded-t-2xl flex items-end justify-center pb-4">
                <span className="text-4xl font-black text-slate-400">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="mb-2">
                <Crown className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
              </div>
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center text-white font-black text-3xl mx-auto mb-2 ring-4 ring-amber-400"
                style={{ backgroundColor: scores[0].avatar_color }}
              >
                {scores[0].nickname.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold text-lg truncate max-w-[140px]">
                {scores[0].nickname}
              </p>
              <p className="text-amber-400 font-black text-lg">
                {scores[0].total_points.toLocaleString()} pts
              </p>
              <div className="mt-3 h-40 bg-amber-500/20 rounded-t-2xl flex items-end justify-center pb-4 border-t-4 border-amber-500">
                <span className="text-5xl font-black text-amber-400">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="mb-2">
                <Medal className="w-12 h-12 text-amber-700 mx-auto" />
              </div>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-2"
                style={{ backgroundColor: scores[2].avatar_color }}
              >
                {scores[2].nickname.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold truncate max-w-[120px]">
                {scores[2].nickname}
              </p>
              <p className="text-slate-400 text-sm">
                {scores[2].total_points.toLocaleString()} pts
              </p>
              <div className="mt-3 h-24 bg-amber-900/30 rounded-t-2xl flex items-end justify-center pb-4">
                <span className="text-4xl font-black text-amber-700">3</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-lg"
        >
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Clasificación Final
          </h2>

          <div className="space-y-3">
            {scores.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl ${
                  index < 3
                    ? index === 0
                      ? 'bg-amber-500/10 border border-amber-500/50'
                      : index === 1
                      ? 'bg-slate-500/10 border border-slate-500/50'
                      : 'bg-amber-900/20 border border-amber-700/50'
                    : 'bg-slate-800/50 border border-white/5'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                  {index === 0 && <Crown className="w-6 h-6 text-amber-400" />}
                  {index === 1 && <Medal className="w-6 h-6 text-slate-400" />}
                  {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                  {index > 2 && (
                    <span className="text-lg font-black text-slate-400">
                      {index + 1}
                    </span>
                  )}
                </div>

                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ backgroundColor: score.avatar_color }}
                >
                  {score.nickname.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <p className="text-white font-bold">{score.nickname}</p>
                  {score.team && (
                    <p className="text-xs text-slate-400">{score.team}</p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-white">
                    {score.total_points.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {score.correct_answers} correctas
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartir
          </button>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </motion.div>
      </div>
    </div>
  )
}
