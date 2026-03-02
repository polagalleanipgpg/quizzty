'use client'

import { Gamepad2, Users, Trophy, Zap, QrCode, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Onboarding from '@/components/Onboarding'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Onboarding />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-black text-white tracking-tight">
                Quizz<span className="text-blue-500">ty</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all hover:scale-105"
              >
                Comenzar
              </Link>
            </motion.div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl sm:text-7xl font-black text-white mb-6 leading-tight">
              Juegos Didácticos
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                en Tiempo Real
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Conecta con tu clase mediante QR, crea quizzes interactivos y mira
              cómo aprenden jugando
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all hover:scale-105 text-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Crear Quiz Gratis
              </Link>
              <Link
                href="/join"
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all hover:scale-105 text-lg flex items-center justify-center gap-2 backdrop-blur-lg"
              >
                <QrCode className="w-5 h-5" />
                Unirse con PIN
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-lg"
          >
            <QrCode className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">
              Conexión Instantánea
            </h3>
            <p className="text-slate-400">
              Escanea un QR o ingresa un PIN de 6 dígitos para unirte al juego
              en segundos
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-lg"
          >
            <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">
              IA Integrada
            </h3>
            <p className="text-slate-400">
              Genera preguntas automáticamente con IA. Ahorra tiempo y crea
              contenido único
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-lg"
          >
            <Trophy className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">
              Ranking en Vivo
            </h3>
            <p className="text-slate-400">
              Leaderboard en tiempo real que se actualiza con cada respuesta
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-12">
            Perfecto para cualquier clase
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '∞', label: 'Quizzes' },
              { number: '100+', label: 'Estudiantes' },
              { number: '4', label: 'Modos de Juego' },
              { number: '0', label: 'Costo' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-black text-blue-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-white">
                Quizz<span className="text-blue-500">ty</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Hecho con ❤️ para educación
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
