'use client'

import Link from 'next/link'
import { Gamepad2, Users, Trophy, LogIn } from 'lucide-react'

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-black text-white tracking-tight">
              Quizz<span className="text-blue-500">ty</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:text-blue-400 transition-colors"
            >
              <Users className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all hover:scale-105"
            >
              <LogIn className="w-4 h-4" />
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
