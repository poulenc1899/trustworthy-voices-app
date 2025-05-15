import { useEffect } from 'react'

type ShortcutHandler = () => void

interface ShortcutMap {
  [key: string]: ShortcutHandler
}

export const useKeyboardShortcuts = (shortcuts: ShortcutMap) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Handle spacebar specially
      if (event.key === ' ' && shortcuts[' ']) {
        event.preventDefault()
        shortcuts[' ']()
        return
      }

      const handler = shortcuts[event.key.toLowerCase()]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shortcuts])
} 