'use client'

import { motion } from 'framer-motion'

interface CircularTimerProps {
  timeLeft: number
  totalTime: number
}

export default function CircularTimer({ timeLeft, totalTime }: CircularTimerProps) {
  const percentage = (timeLeft / totalTime) * 100
  const circumference = 2 * Math.PI * 45 // r = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage > 50) return '#22c55e' // green
    if (percentage > 25) return '#eab308' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx="32"
          cy="32"
          r="45"
          stroke={getColor()}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: 'linear' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-xl font-black ${
            timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'
          }`}
        >
          {timeLeft}
        </span>
      </div>
    </div>
  )
}
