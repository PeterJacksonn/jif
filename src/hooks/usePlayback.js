import { useEffect, useRef } from 'react'

// Cycles through `frames` on a rAF loop, advancing activeId once each
// frame's duration has elapsed. This is pure playback bookkeeping — it
// never touches the canvas or gif.js.
export function usePlayback({ frames, fps, activeId, setActiveId, isPlaying }) {
  const indexRef = useRef(0)

  useEffect(() => {
    const idx = frames.findIndex((f) => f.id === activeId)
    if (idx !== -1) indexRef.current = idx
  }, [activeId, frames])

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return undefined

    let raf
    let lastTime = performance.now()
    let elapsed = 0

    function tick(now) {
      const dt = now - lastTime
      lastTime = now
      elapsed += dt
      const frame = frames[indexRef.current]
      const duration = frame?.duration ?? 1000 / fps
      if (elapsed >= duration) {
        elapsed = 0
        indexRef.current = (indexRef.current + 1) % frames.length
        setActiveId(frames[indexRef.current].id)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isPlaying, frames, fps, setActiveId])
}
