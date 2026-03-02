import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type QuestionData = {
  id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false' | 'short_answer'
  options: string[] | null
  time_limit: number
  points: number
  sort_order: number
}

export type SessionState = 'waiting' | 'active' | 'finished'

export type ParticipantData = {
  id: string
  session_id: string
  nickname: string
  avatar_color: string
  score: number
  team: string | null
  is_eliminated: boolean
}

export type GameMode = 'classic' | 'teams' | 'elimination' | 'blitz' | 'speed'

interface QuizState {
  // Session
  sessionId: string | null
  sessionPin: string | null
  sessionStatus: SessionState
  gameMode: GameMode
  setSession: (id: string, pin: string, status: SessionState, mode?: GameMode) => void
  setSessionStatus: (status: SessionState) => void

  // Question
  currentQuestion: QuestionData | null
  currentQuestionIndex: number
  setCurrentQuestion: (question: QuestionData | null) => void
  setCurrentQuestionIndex: (index: number) => void

  // Participants
  participants: ParticipantData[]
  setParticipants: (participants: ParticipantData[]) => void
  addParticipant: (participant: ParticipantData) => void
  updateParticipantScore: (participantId: string, score: number) => void

  // User state
  participantId: string | null
  nickname: string | null
  avatarColor: string | null
  setParticipantInfo: (id: string, nickname: string) => void
  setAvatarColor: (color: string) => void
  isEliminated: boolean
  setIsEliminated: (eliminated: boolean) => void
  team: string | null
  setTeam: (team: string | null) => void
  lastPoints: number
  setLastPoints: (points: number) => void
  lastCorrect: boolean | null
  setLastCorrect: (correct: boolean | null) => void
  streak: number
  setStreak: (streak: number) => void

  // Audio
  isMuted: boolean
  toggleMute: () => void

  // Reset
  resetStore: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      sessionPin: null,
      sessionStatus: 'waiting',
      gameMode: 'classic',
      setSession: (id, pin, status, mode = 'classic') =>
        set({ sessionId: id, sessionPin: pin, sessionStatus: status, gameMode: mode }),
      setSessionStatus: (status) => set({ sessionStatus: status }),

      currentQuestion: null,
      currentQuestionIndex: 0,
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),

      participants: [],
      setParticipants: (participants) => set({ participants }),
      addParticipant: (participant) =>
        set((state) => {
          if (state.participants.some((p) => p.id === participant.id)) return state
          return { participants: [...state.participants, participant] }
        }),
      updateParticipantScore: (participantId, score) =>
        set((state) => ({
          participants: state.participants
            .map((p) => (p.id === participantId ? { ...p, score } : p))
            .sort((a, b) => b.score - a.score),
        })),

      participantId: null,
      nickname: null,
      avatarColor: null,
      setParticipantInfo: (id, nickname) => set({ participantId: id, nickname }),
      setAvatarColor: (color) => set({ avatarColor: color }),
      isEliminated: false,
      setIsEliminated: (eliminated) => set({ isEliminated: eliminated }),
      team: null,
      setTeam: (team) => set({ team }),
      lastPoints: 0,
      setLastPoints: (points) => set({ lastPoints: points }),
      lastCorrect: null,
      setLastCorrect: (correct) => set({ lastCorrect: correct }),
      streak: 0,
      setStreak: (streak) => set({ streak }),

      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      resetStore: () => {
        const current = get()
        set({
          sessionId: null,
          sessionPin: null,
          sessionStatus: 'waiting',
          gameMode: 'classic',
          currentQuestion: null,
          currentQuestionIndex: 0,
          participants: [],
          participantId: current.participantId,
          nickname: current.nickname,
          isEliminated: false,
          team: null,
          lastPoints: 0,
          lastCorrect: null,
          streak: 0,
        })
      },
    }),
    {
      name: 'quizzty-storage-v1',
    }
  )
)
