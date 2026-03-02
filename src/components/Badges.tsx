'use client'

import { Trophy, Star, Zap, Crown, Medal, Target, Flame, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (stats: any) => boolean
  unlocked: boolean
  color: string
}

const achievementIcons: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  crown: Crown,
  medal: Medal,
  target: Target,
  flame: Flame,
  clock: Clock,
}

interface BadgesProps {
  achievements: Achievement[]
}

export default function Badges({ achievements }: BadgesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {achievements.map((achievement) => {
        const Icon = achievementIcons[achievement.icon] || Star
        
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: achievement.unlocked ? 1 : 0.4, 
              scale: achievement.unlocked ? 1 : 0.9 
            }}
            whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
            className={`p-4 rounded-2xl border-2 transition-all ${
              achievement.unlocked
                ? `bg-gradient-to-br ${achievement.color} border-white/20 shadow-lg`
                : 'bg-slate-900/50 border-slate-700 grayscale'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-3 rounded-xl mb-2 ${
                achievement.unlocked ? 'bg-white/20' : 'bg-slate-800'
              }`}>
                <Icon className={`w-8 h-8 ${
                  achievement.unlocked ? 'text-white' : 'text-slate-500'
                }`} />
              </div>
              
              <h4 className="font-bold text-white text-sm mb-1">
                {achievement.name}
              </h4>
              
              <p className="text-xs text-slate-400">
                {achievement.description}
              </p>
              
              {achievement.unlocked && (
                <div className="mt-2 text-[10px] text-white/80 font-medium uppercase tracking-wider">
                  ✓ Desbloqueado
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Función para calcular logros desbloqueados
export function calculateAchievements(stats: any): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: 'first_game',
      name: 'Primera Vez',
      description: 'Jugá tu primer juego',
      icon: 'star',
      condition: (s) => s.gamesPlayed >= 1,
      unlocked: stats.gamesPlayed >= 1,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'first_win',
      name: '¡Campeón!',
      description: 'Ganá tu primer juego',
      icon: 'trophy',
      condition: (s) => s.gamesWon >= 1,
      unlocked: stats.gamesWon >= 1,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'perfect_score',
      name: 'Perfección',
      description: 'Respondé todo correctamente',
      icon: 'target',
      condition: (s) => s.perfectGames >= 1,
      unlocked: stats.perfectGames >= 1,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'speed_demon',
      name: 'Velocista',
      description: 'Respondé en menos de 3 segundos',
      icon: 'zap',
      condition: (s) => s.fastAnswers >= 5,
      unlocked: stats.fastAnswers >= 5,
      color: 'from-yellow-400 to-amber-500',
    },
    {
      id: 'streak_master',
      name: 'Racha ÉPICA',
      description: '10 respuestas correctas seguidas',
      icon: 'flame',
      condition: (s) => s.maxStreak >= 10,
      unlocked: stats.maxStreak >= 10,
      color: 'from-red-500 to-rose-500',
    },
    {
      id: 'podium_regular',
      name: 'Podio Fijo',
      description: 'Terminá en top 3 cinco veces',
      icon: 'medal',
      condition: (s) => s.podiumFinishes >= 5,
      unlocked: stats.podiumFinishes >= 5,
      color: 'from-slate-400 to-slate-600',
    },
    {
      id: 'king',
      name: 'Rey del Quiz',
      description: 'Ganá 10 juegos',
      icon: 'crown',
      condition: (s) => s.gamesWon >= 10,
      unlocked: stats.gamesWon >= 10,
      color: 'from-amber-400 to-yellow-500',
    },
    {
      id: 'marathon',
      name: 'Maratonista',
      description: 'Jugá 20 juegos',
      icon: 'clock',
      condition: (s) => s.gamesPlayed >= 20,
      unlocked: stats.gamesPlayed >= 20,
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return achievements
}
