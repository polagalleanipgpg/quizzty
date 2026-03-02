'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-800'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    rounded: 'rounded-xl',
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    />
  )
}

export function QuizCardSkeleton() {
  return (
    <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" variant="rounded" />
          <Skeleton className="h-4 w-full mb-1" variant="text" />
          <Skeleton className="h-4 w-2/3" variant="text" />
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-4 w-20" variant="text" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 flex-1" variant="rounded" />
        <Skeleton className="h-10 w-10" variant="rounded" />
        <Skeleton className="h-10 w-10" variant="rounded" />
      </div>
    </div>
  )
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
          <Skeleton className="w-6 h-6" variant="circular" />
          <Skeleton className="w-10 h-10" variant="circular" />
          <Skeleton className="flex-1 h-4" variant="text" />
          <Skeleton className="w-16 h-4" variant="text" />
        </div>
      ))}
    </div>
  )
}

export function QuestionSkeleton() {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8">
      <Skeleton className="h-8 w-full mb-4" variant="rounded" />
      <Skeleton className="h-8 w-3/4 mb-8" variant="rounded" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16" variant="rounded" />
        ))}
      </div>
    </div>
  )
}
