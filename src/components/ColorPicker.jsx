import { useEffect, useRef, useState } from 'react'
import { Pipette } from 'lucide-react'
import { hexToRgb, hsvToRgb, rgbToHex, rgbToHsv } from '../utils/color'

const PRESETS = ['#000000', '#ffffff', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

// A fully custom, in-page color picker (saturation/value square + hue
// slider + hex input + presets) so choosing the canvas background never
// hands off to the browser's native OS color dialog.
export default function ColorPicker({ value, onChange, onEyedrop, eyedropping }) {
  const [open, setOpen] = useState(false)
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 })
  const [hexInput, setHexInput] = useState(value)
  const rootRef = useRef(null)
  const svRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const rgb = hexToRgb(value)
    if (rgb) setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b))
    setHexInput(value)
    // Only resync from the outer `value` when the popover opens — while it's
    // open, our own hsv state is the source of truth for the live drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDocDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDocDown)
    return () => document.removeEventListener('pointerdown', onDocDown)
  }, [open])

  function commit(nextHsv) {
    setHsv(nextHsv)
    const rgb = hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexInput(hex)
    onChange(hex)
  }

  function dragWindow(onMove) {
    function move(e) {
      onMove(e)
    }
    function up() {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  function handleSvPointer(e) {
    const box = svRef.current.getBoundingClientRect()
    function update(ev) {
      const s = clamp((ev.clientX - box.left) / box.width, 0, 1)
      const v = 1 - clamp((ev.clientY - box.top) / box.height, 0, 1)
      commit({ h: hsv.h, s, v })
    }
    update(e)
    dragWindow(update)
  }

  function handleHuePointer(e) {
    const box = e.currentTarget.getBoundingClientRect()
    function update(ev) {
      const frac = clamp((ev.clientX - box.left) / box.width, 0, 1)
      commit({ ...hsv, h: frac * 360 })
    }
    update(e)
    dragWindow(update)
  }

  function handleHexInput(e) {
    const v = e.target.value
    setHexInput(v)
    const rgb = hexToRgb(v)
    if (rgb) {
      setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b))
      onChange(v.startsWith('#') ? v : `#${v}`)
    }
  }

  function pickPreset(hex) {
    const rgb = hexToRgb(hex)
    if (rgb) setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b))
    setHexInput(hex)
    onChange(hex)
  }

  function handleEyedropClick() {
    setOpen(false)
    onEyedrop()
  }

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 items-center gap-2 rounded-lg border border-white/10 px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20"
      >
        <span className="h-4 w-4 rounded border border-white/20" style={{ background: value }} />
        {value}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-surface p-3 shadow-2xl animate-fade-in">
          <div
            ref={svRef}
            onPointerDown={handleSvPointer}
            className="relative h-32 w-full cursor-crosshair rounded-lg"
            style={{
              backgroundColor: hueColor,
              backgroundImage:
                'linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0))',
            }}
          >
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
            />
          </div>

          <div
            onPointerDown={handleHuePointer}
            className="relative mt-3 h-3 w-full cursor-pointer rounded-full"
            style={{
              background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            }}
          >
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${(hsv.h / 360) * 100}%`, background: hueColor }}
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInput}
              spellCheck={false}
              className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-accent/60"
            />
            <button
              type="button"
              onClick={handleEyedropClick}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
                eyedropping
                  ? 'border-accent bg-accent/20 text-accent-soft'
                  : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
              }`}
              title="Pick a color from a frame"
            >
              <Pipette className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-9 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => pickPreset(p)}
                className="aspect-square rounded border border-white/10"
                style={{ background: p }}
                aria-label={`Use ${p}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
