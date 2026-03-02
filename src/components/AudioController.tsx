'use client'

import { useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useQuizStore } from '@/lib/store'

const SOUND_EFFECTS = {
  join: '/sounds/join.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  podium: '/sounds/podium.mp3',
  countdown: '/sounds/countdown.mp3',
}

export default function AudioController() {
  const { isMuted, toggleMute } = useQuizStore()
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

  useEffect(() => {
    // Preload sounds
    Object.entries(SOUND_EFFECTS).forEach(([key, src]) => {
      const audio = new Audio(src)
      audio.preload = 'auto'
      audio.volume = 0.5
      audioRefs.current[key] = audio
    })
  }, [])

  const playSound = (sound: keyof typeof SOUND_EFFECTS) => {
    if (isMuted) return
    const audio = audioRefs.current[sound]
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }

  useEffect(() => {
    // Expose playSound globally for components to use
    ;(window as any).playSound = playSound
  }, [isMuted])

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 p-3 bg-slate-900/90 backdrop-blur-lg rounded-full border border-white/10 hover:scale-110 transition-transform"
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-slate-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-blue-400" />
      )}
    </button>
  )
}
