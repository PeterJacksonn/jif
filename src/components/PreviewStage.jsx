import { useEffect, useRef, useState } from 'react'
import { Pause, Pipette, Play, SkipBack, SkipForward } from 'lucide-react'
import { drawFrame } from '../utils/frameTransform'
import FrameTransformOverlay from './FrameTransformOverlay'

export default function PreviewStage({
  readyFrames,
  activeId,
  activeIndex,
  outputWidth,
  outputHeight,
  background,
  defaultFit,
  isPlaying,
  onTogglePlay,
  onStep,
  onScrub,
  onFrameTransformChange,
  eyedropping,
  onEyedropSample,
}) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const containerRef = useRef(null)
  const [canvasBox, setCanvasBox] = useState(null)

  const activeFrame = readyFrames.find((f) => f.id === activeId) ?? null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = Math.max(1, outputWidth)
    const h = Math.max(1, outputHeight)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!activeFrame) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, w, h)
      return
    }
    drawFrame(ctx, activeFrame, w, h, background, defaultFit)
  }, [activeFrame, outputWidth, outputHeight, background, defaultFit])

  // The overlay can't just be a CSS sibling sized like the canvas — a plain
  // div has no intrinsic size, so it collapses under aspect-ratio + flex
  // centering. Instead measure the canvas's actual rendered box (which does
  // size correctly, being a replaced element) and mirror it exactly.
  useEffect(() => {
    const canvasEl = canvasRef.current
    const stageEl = stageRef.current
    if (!canvasEl || !stageEl) return

    function measure() {
      const canvasRect = canvasEl.getBoundingClientRect()
      const stageRect = stageEl.getBoundingClientRect()
      setCanvasBox({
        left: canvasRect.left - stageRect.left,
        top: canvasRect.top - stageRect.top,
        width: canvasRect.width,
        height: canvasRect.height,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(canvasEl)
    ro.observe(stageEl)
    return () => ro.disconnect()
  }, [outputWidth, outputHeight])

  function handleCanvasClick(e) {
    if (!eyedropping) return
    const canvas = canvasRef.current
    if (!canvas) return
    const box = canvas.getBoundingClientRect()
    const x = Math.floor(((e.clientX - box.left) / box.width) * canvas.width)
    const y = Math.floor(((e.clientY - box.top) / box.height) * canvas.height)
    const [r, g, b] = canvas.getContext('2d').getImageData(x, y, 1, 1).data
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
    onEyedropSample(hex)
  }

  const count = readyFrames.length

  return (
    <div className="flex h-full min-h-0 min-w-[320px] flex-1 flex-col gap-3">
      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/40"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`max-h-full max-w-full rounded-lg shadow-[0_0_0_1px_rgba(255,255,255,0.04)] ${
            eyedropping ? 'cursor-crosshair' : ''
          }`}
          style={{ aspectRatio: `${outputWidth} / ${outputHeight}` }}
        />
        {eyedropping && (
          <div className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white shadow-lg">
            <Pipette className="h-3 w-3" />
            Click the frame to sample a color
          </div>
        )}
        {activeFrame && !activeFrame.locked && !eyedropping && canvasBox && (
          <div ref={containerRef} className="absolute" style={canvasBox}>
            <FrameTransformOverlay
              frame={activeFrame}
              containerRef={containerRef}
              canvasWidth={outputWidth}
              canvasHeight={outputHeight}
              defaultFit={defaultFit}
              onChange={(rect) => onFrameTransformChange(activeFrame.id, rect)}
            />
          </div>
        )}

        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur">
          {outputWidth}×{outputHeight}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={count === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 disabled:opacity-30"
          aria-label="Previous frame"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          disabled={count === 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white transition-transform hover:scale-105 hover:bg-accent-strong active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={count === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 disabled:opacity-30"
          aria-label="Next frame"
        >
          <SkipForward className="h-4 w-4" />
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(0, count - 1)}
          value={Math.max(0, activeIndex)}
          onChange={(e) => onScrub(Number(e.target.value))}
          disabled={count === 0}
          className="mx-1 flex-1 disabled:opacity-30"
        />

        <span className="w-16 shrink-0 text-right text-xs tabular-nums text-zinc-500">
          {count === 0 ? '0 / 0' : `${activeIndex + 1} / ${count}`}
        </span>
      </div>
    </div>
  )
}
