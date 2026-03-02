'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import {
  Gamepad2,
  Plus,
  FolderOpen,
  History,
  LogOut,
  Users,
  Play,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Quiz {
  id: string
  title: string
  description: string | null
  subject: string | null
  created_at: string
  questions_count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { resetStore } = useQuizStore()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/api/auth')
        return
      }
      setUser(data.user)
      fetchQuizzes(data.user.id)
    }
    checkAuth()
  }, [router])

  const fetchQuizzes = async (userId: string) => {
    try {
      console.log('🔍 Fetching quizzes for user:', userId)
      
      // Primero intentamos sin el join de questions
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false })

      if (quizzesError) {
        console.error('❌ Error fetching quizzes:', quizzesError)
        throw quizzesError
      }

      console.log('✅ Quizzes encontrados:', quizzesData?.length || 0)

      // Ahora obtenemos el count de questions para cada quiz
      const quizzesWithCount = await Promise.all(
        (quizzesData || []).map(async (quiz) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id)

          return {
            ...quiz,
            questions_count: count || 0,
          }
        })
      )

      setQuizzes(quizzesWithCount)
    } catch (error: any) {
      console.error('💥 Error en fetchQuizzes:', error)
      toast.error('Error cargando quizzes: ' + (error.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    resetStore()
    toast.success('Sesión cerrada')
    router.push('/')
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('¿Estás seguro de eliminar este quiz?')) return

    const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
    if (error) {
      toast.error('Error al eliminar: ' + error.message)
      return
    }

    setQuizzes(quizzes.filter((q) => q.id !== quizId))
    toast.success('Quiz eliminado')
  }

  // Debug: Test de inserción directa
  const handleTestInsert = async () => {
    console.log('🧪 INICIANDO TEST DE INSERCIÓN...')
    
    if (!user?.id) {
      console.error('❌ No hay user.id')
      toast.error('Error: Usuario no autenticado')
      return
    }

    console.log('👤 User ID:', user.id)

    const testTitle = `Quiz Test ${new Date().toLocaleTimeString()}`
    console.log('📝 Insertando quiz:', testTitle)

    const { data: testQuiz, error: testError } = await supabase
      .from('quizzes')
      .insert({
        title: testTitle,
        description: 'Este es un quiz de prueba para debuggear',
        teacher_id: user.id,
      })
      .select()
      .single()

    if (testError) {
      console.error('❌ ERROR EN INSERCIÓN:', testError)
      toast.error('Error: ' + testError.message)
      return
    }

    console.log('✅ QUIZ CREADO EXITOSAMENTE:', testQuiz)
    toast.success('¡Quiz de prueba creado! Recargando...')
    
    // Recargar quizzes
    await fetchQuizzes(user.id)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-black text-white">
                Quizz<span className="text-blue-500">ty</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            ¡Hola, Profesor! 👋
          </h1>
          <p className="text-slate-400">
            Crea y gestiona tus quizzes interactivos
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/teacher/create"
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all hover:scale-105 flex flex-col items-center gap-2"
          >
            <Plus className="w-8 h-8 text-white" />
            <span className="font-bold text-white text-sm">Nuevo Quiz</span>
          </Link>
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <FolderOpen className="w-8 h-8 text-slate-400" />
            <span className="font-bold text-slate-400 text-sm">Carpetas</span>
          </div>
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <History className="w-8 h-8 text-slate-400" />
            <span className="font-bold text-slate-400 text-sm">Historial</span>
          </div>
          <div className="p-4 bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col items-center gap-2">
            <Users className="w-8 h-8 text-slate-400" />
            <span className="font-bold text-slate-400 text-sm">Clases</span>
          </div>
        </div>

        {/* Quizzes List */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Mis Quizzes</h2>
            <Link
              href="/teacher/create"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">
              <div className="animate-pulse text-2xl mb-4">⏳</div>
              Cargando quizzes...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No tienes quizzes aún</p>
              <div className="text-sm text-slate-500 mb-6">
                Usuario: {user?.email || 'No disponible'}
                <br />
                User ID: {user?.id || 'No disponible'}
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/teacher/create"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Crear mi primer quiz
                </Link>
                <button
                  onClick={handleTestInsert}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                >
                  🧪 Crear Quiz de Test (Debug)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/50 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{quiz.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>
                    <div className="relative">
                      <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {quiz.questions_count} preguntas
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/teacher/${quiz.id}/select-mode`}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Jugar
                    </Link>
                    <Link
                      href={`/teacher/${quiz.id}/edit`}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Link>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
