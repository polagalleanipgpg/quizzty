'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gamepad2, QrCode, Trophy, Users, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
import { useQuizStore } from '@/lib/store'

const steps = [
  {
    icon: Gamepad2,
    title: '¡Bienvenido a Quizzty!',
    description: 'La plataforma de juegos didácticos en tiempo real para tu clase',
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: QrCode,
    title: 'Conexión Instantánea',
    description: 'Tus estudiantes se unen escaneando un QR o ingresando un PIN de 6 dígitos',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'IA Integrada',
    description: 'Generá preguntas automáticamente describiendo el tema. ¡Ahorrá horas de preparación!',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Multijugador en Vivo',
    description: 'Hasta 100 estudiantes pueden jugar simultáneamente sin lag',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Trophy,
    title: 'Competencia Sana',
    description: 'Leaderboard en tiempo real que se actualiza con cada respuesta',
    color: 'from-amber-500 to-yellow-500',
  },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('quizzty_onboarding_seen')
    if (!hasSeenOnboarding) {
      setIsVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    localStorage.setItem('quizzty_onboarding_seen', 'true')
    setIsVisible(false)
  }

  const skipOnboarding = () => {
    localStorage.setItem('quizzty_onboarding_seen', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative"
      >
        <button
          onClick={skipOnboarding}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-blue-500'
                  : index < currentStep
                  ? 'w-2 bg-blue-500/50'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl mb-6 shadow-2xl`}>
              <Icon className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-4">
              {step.title}
            </h2>

            <p className="text-slate-400 text-lg mb-8">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Atrás
          </button>

          <button
            onClick={handleNext}
            className={`px-8 py-3 bg-gradient-to-r ${step.color} text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg`}
          >
            {currentStep === steps.length - 1 ? 'Comenzar' : 'Continuar'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
