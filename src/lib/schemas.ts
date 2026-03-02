import { z } from 'zod'

export const quizSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  subject: z.string().optional(),
  grade_level: z.string().optional(),
})

export const questionSchema = z.object({
  question_text: z.string().min(1, 'La pregunta es requerida'),
  question_type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1, 'La respuesta correcta es requerida'),
  time_limit: z.number().min(5).max(300),
  points: z.number().min(100).max(10000),
  image_url: z.string().url().optional().or(z.literal('')),
})

export const sessionSchema = z.object({
  quiz_id: z.string().uuid(),
  game_mode: z.enum(['classic', 'teams', 'elimination', 'speed']).default('classic'),
})

export const participantSchema = z.object({
  session_id: z.string().uuid(),
  nickname: z.string().min(2, 'El nickname debe tener al menos 2 caracteres').max(20),
  avatar_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido'),
  team: z.string().optional(),
})

export const answerSchema = z.object({
  participant_id: z.string().uuid(),
  question_id: z.string().uuid(),
  session_id: z.string().uuid(),
  answer_text: z.string(),
  response_time_ms: z.number().optional(),
})

export type QuizFormData = z.infer<typeof quizSchema>
export type QuestionFormData = z.infer<typeof questionSchema>
export type SessionFormData = z.infer<typeof sessionSchema>
export type ParticipantFormData = z.infer<typeof participantSchema>
export type AnswerFormData = z.infer<typeof answerSchema>
