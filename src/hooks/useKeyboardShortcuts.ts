'use client'

import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
  onAnswer?: (index: number) => void
  onNext?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onAnswer,
  onNext,
  enabled = true,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevenir comportamiento por defecto en el juego
      if (['Space', 'ArrowUp', 'ArrowDown', 'Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        e.preventDefault()
      }

      // Atajos para responder (1-4 o A-D)
      if (onAnswer) {
        if (e.code === 'Digit1' || e.code === 'KeyA') {
          onAnswer(0)
        } else if (e.code === 'Digit2' || e.code === 'KeyB') {
          onAnswer(1)
        } else if (e.code === 'Digit3' || e.code === 'KeyC') {
          onAnswer(2)
        } else if (e.code === 'Digit4' || e.code === 'KeyD') {
          onAnswer(3)
        }
      }

      // Espacio para continuar
      if (e.code === 'Space' && onNext) {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onAnswer, onNext, enabled])
}

export default useKeyboardShortcuts
