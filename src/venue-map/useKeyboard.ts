import { useEffect, useRef } from 'react'

// Tracks which keys are currently pressed.
// Returns a ref — read it each animation frame without causing re-renders.
export function useKeyboard(): React.RefObject<Set<string>> {
  const keys = useRef<Set<string>>(new Set())

  useEffect(() => {
    function onDown(e: KeyboardEvent) {
      // Prevent arrow keys from scrolling the page when map is focused
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
      keys.current.add(e.key)
    }
    function onUp(e: KeyboardEvent) {
      keys.current.delete(e.key)
    }
    // Clear all keys when window loses focus (prevents stuck keys)
    function onBlur() {
      keys.current.clear()
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return keys
}
