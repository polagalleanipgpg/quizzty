'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQuizStore } from '@/lib/store'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Image,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface Question {
  id?: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: string[]
  correct_answer: string
  time_limit: number
  points: number
  image_url?: string
  sort_order: number
}

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string
  const isEdit = quizId && quizId !== 'create'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Si es edición, cargar datos del quiz
  useEffect(() => {
    if (!isEdit) return

    const fetchQuiz = async () => {
      setFetching(true)
      try {
        const { data: quizData, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single()

        if (error || !quizData) {
          console.error('❌ Error loading quiz:', error)
          toast.error('Quiz no encontrado')
          router.push('/dashboard')
          return
        }

        setTitle(quizData.title || '')
        setDescription(quizData.description || '')
        setSubject(quizData.subject || '')

        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('sort_order')

        if (questionsData) {
          const formatted = questionsData.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options ? JSON.parse(q.options) : [],
            correct_answer: q.correct_answer,
            time_limit: q.time_limit,
            points: q.points,
            sort_order: q.sort_order,
          }))
          setQuestions(formatted)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setFetching(false)
      }
    }

    fetchQuiz()
  }, [quizId, isEdit, router])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
        time_limit: 30,
        points: 1000,
        sort_order: questions.length,
      },
    ])
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Ingresa un tema para generar preguntas')
      return
    }

    setGenerating(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_KEY
      
      if (!apiKey) {
        throw new Error('Falta la API Key de Google. Configura NEXT_PUBLIC_GOOGLE_AI_KEY en Vercel')
      }

      const prompt = `Genera exactamente 5 preguntas de quiz sobre: ${aiPrompt}.
Devuelve SOLO JSON válido sin texto adicional, sin markdown:
{
  "questions": [
    {
      "question_text": "texto de la pregunta",
      "question_type": "multiple_choice",
      "options": ["opcion1", "opcion2", "opcion3", "opcion4"],
      "correct_answer": "opcion1",
      "time_limit": 30,
      "points": 1000
    }
  ]
}`

      // Función con retry logic (reintentos exponenciales)
      const fetchWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
            
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                }
              })
            })

            if (!response.ok) {
              const error = await response.json()
              
              // Si es error 429 (rate limit), esperar más antes de reintentar
              if (error.error?.code === 429 && i < retries - 1) {
                const waitTime = Math.pow(2, i) * 2000 // 2s, 4s, 8s
                await new Promise(r => setTimeout(r, waitTime))
                continue
              }
              
              throw new Error(error.error?.message || 'Error en la API')
            }

            return await response.json()
          } catch (err: any) {
            if (i === retries - 1) throw err
            await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
          }
        }
      }

      const data = await fetchWithRetry()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!text) {
        throw new Error('La IA no devolvió contenido válido')
      }

      // Limpiar respuesta
      const cleanText = text.replace(/```json\s*|```/g, '').trim()
      const parsed = JSON.parse(cleanText)

      if (parsed.questions && Array.isArray(parsed.questions)) {
        setQuestions([...questions, ...parsed.questions])
        toast.success(`¡${parsed.questions.length} preguntas generadas!`)
        setShowAIModal(false)
        setAiPrompt('')
      } else {
        throw new Error('La IA no devolvió el formato esperado')
      }
    } catch (error: any) {
      console.error('AI Error:', error)
      let msg = 'Error generando preguntas. '
      if (error.message?.includes('API Key')) {
        msg += 'Verifica tu API Key en Vercel (Settings → Environment Variables)'
      } else if (error.message?.includes('403')) {
        msg += 'API Key inválida. Creá una nueva en Google AI Studio'
      } else if (error.message?.includes('429') || error.message?.includes('quota')) {
        msg += 'Límite alcanzado. Esperá 1-2 minutos o usá otra API Key'
      } else if (error.message?.includes('404')) {
        msg += 'Modelo no disponible. Reintentando...'
      } else {
        msg += error.message
      }
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  const saveQuiz = async () => {
    if (!title.trim()) {
      toast.error('El título es requerido')
      return
    }

    if (questions.length === 0) {
      toast.error('Agrega al menos una pregunta')
      return
    }

    // Validar que cada pregunta tenga texto y respuesta correcta
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) {
        toast.error(`La pregunta ${i + 1} está vacía`)
        return
      }
      if (!q.correct_answer) {
        toast.error(`La pregunta ${i + 1} no tiene respuesta correcta`)
        return
      }
    }

    setLoading(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('No autenticado')

      console.log('📝 Saving quiz...', { title, questionsCount: questions.length, isEdit, quizId })

      // Si es edición, validar que quizId existe
      if (isEdit && !quizId) {
        throw new Error('Quiz ID no válido para edición')
      }

      let quizIdToUse = quizId

      if (isEdit) {
        console.log('✏️ Updating existing quiz:', quizId)
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({ title, description, subject })
          .eq('id', quizId)

        if (updateError) {
          console.error('❌ Error updating quiz:', updateError)
          throw updateError
        }
      } else {
        console.log('➕ Creating new quiz for teacher:', user.user.id)
        const { data: newQuiz, error: insertError } = await supabase
          .from('quizzes')
          .insert({
            title,
            description,
            subject,
            teacher_id: user.user.id,
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error creating quiz:', insertError)
          throw insertError
        }

        quizIdToUse = newQuiz.id
        console.log('✅ Quiz created:', newQuiz.id)
      }

      // Delete existing questions if editing
      if (isEdit) {
        console.log('🗑️ Deleting old questions...')
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('quiz_id', quizId)

        if (deleteError) throw deleteError
      }

      // Insert questions
      console.log('📝 Inserting', questions.length, 'questions...')
      const questionsToInsert = questions.map((q, i) => {
        const questionData = {
          quiz_id: quizIdToUse,
          question_text: q.question_text,
          question_type: q.question_type,
          options: JSON.stringify(q.options),
          correct_answer: q.correct_answer,
          time_limit: q.time_limit,
          points: q.points,
          sort_order: i,
        }
        console.log(`  Question ${i + 1}:`, {
          text: q.question_text.substring(0, 30) + '...',
          type: q.question_type,
          correct: q.correct_answer,
        })
        return questionData
      })

      const { data: insertedQuestions, error: insertQuestionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select()

      if (insertQuestionsError) {
        console.error('❌ Error inserting questions:', insertQuestionsError)
        throw insertQuestionsError
      }

      console.log('✅ Questions inserted:', insertedQuestions?.length)

      toast.success(`¡Quiz guardado con ${questions.length} preguntas!`)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('💥 Save error:', error)
      toast.error(error.message || 'Error guardando quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {fetching ? (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">⏳</div>
            <p>Cargando quiz...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                IA
              </button>
              <button
                onClick={saveQuiz}
                disabled={loading || fetching}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : fetching ? 'Cargando...' : isEdit ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Info */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 mb-6">
          <h1 className="text-2xl font-black text-white mb-6">
            {isEdit ? 'Editar Quiz' : 'Nuevo Quiz'}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Matemáticas - Fracciones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Descripción opcional del quiz..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Materia
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Matemáticas"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              Preguntas ({questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-white/10 rounded-3xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-bold text-blue-500">
                  Pregunta {index + 1}
                </span>
                <button
                  onClick={() => removeQuestion(index)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pregunta
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) =>
                      updateQuestion(index, 'question_text', e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Escribe tu pregunta..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tipo
                    </label>
                    <select
                      value={question.question_type}
                      onChange={(e) =>
                        updateQuestion(index, 'question_type', e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="multiple_choice">Opción Múltiple</option>
                      <option value="true_false">Verdadero/Falso</option>
                      <option value="short_answer">Respuesta Corta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tiempo (segundos)
                    </label>
                    <input
                      type="number"
                      value={question.time_limit}
                      onChange={(e) =>
                        updateQuestion(index, 'time_limit', parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {question.question_type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Opciones (marca la correcta)
                    </label>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={question.correct_answer === option}
                          onChange={() =>
                            updateQuestion(index, 'correct_answer', option)
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options]
                            newOptions[optIndex] = e.target.value
                            updateQuestion(index, 'options', newOptions)
                          }}
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Opción ${optIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === 'true_false' && (
                  <div className="flex gap-4">
                    {['true', 'false'].map((value) => (
                      <label
                        key={value}
                        className="flex-1 p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          value={value}
                          checked={question.correct_answer === value}
                          onChange={() =>
                            updateQuestion(index, 'correct_answer', value)
                          }
                          className="sr-only"
                        />
                        <span className="text-white font-medium">
                          {value === 'true' ? 'Verdadero' : 'Falso'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === 'short_answer' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Respuesta Correcta
                    </label>
                    <input
                      type="text"
                      value={question.correct_answer}
                      onChange={(e) =>
                        updateQuestion(index, 'correct_answer', e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Respuesta correcta"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-black text-white">
                  Generar con IA
                </h2>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-slate-400 mb-4">
              Describe el tema y la IA generará preguntas automáticamente
            </p>

            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-4"
              placeholder="Ej: 5 preguntas sobre fracciones para 5to grado de primaria..."
            />

            <button
              onClick={generateWithAI}
              disabled={generating || !aiPrompt.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {generating ? 'Generando...' : 'Generar Preguntas'}
            </button>
          </motion.div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
