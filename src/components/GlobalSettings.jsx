import { ChevronDown, PanelRightClose, PanelRightOpen, RotateCcw, Sparkles } from 'lucide-react'
import { formatBytes } from '../utils/image'
import { estimateGifBytes } from '../utils/estimate'
import { ASPECT_RATIOS } from '../utils/canvasPresets'
import ColorPicker from './ColorPicker'
import DurationInput from './DurationInput'

function Field({ label, value, children, hint }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <span className="text-xs font-semibold tabular-nums text-zinc-200">{value}</span>
      </div>
      {children}
      {hint && <p className="mt-1 text-[11px] text-zinc-600">{hint}</p>}
    </div>
  )
}

const CANVAS_MODES = [
  { id: 'auto', label: 'Auto' },
  { id: 'ratio', label: 'Ratio' },
  { id: 'frame', label: 'Frame' },
]

const FIT_OPTIONS = [
  { id: 'contain', label: 'Fit' },
  { id: 'cover', label: 'Fill' },
  { id: 'stretch', label: 'Stretch' },
]

export default function GlobalSettings({
  fps,
  setFps,
  quality,
  setQuality,
  scale,
  setScale,
  canvasMode,
  setCanvasMode,
  canvasRatio,
  setCanvasRatio,
  canvasFrameId,
  setCanvasFrameId,
  defaultFit,
  setDefaultFit,
  background,
  setBackground,
  eyedropping,
  onStartEyedrop,
  baseWidth,
  baseHeight,
  outputWidth,
  outputHeight,
  frameCount,
  disabled,
  isRendering,
  onRender,
  advancedOpen,
  setAdvancedOpen,
  frames,
  onFrameDurationChange,
  collapsed,
  onToggleCollapse,
}) {
  const estimatedBytes = estimateGifBytes({ width: outputWidth, height: outputHeight, frameCount, quality })

  if (collapsed) {
    return (
      <div data-testid="global-settings" className="flex h-full flex-col items-center py-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
          aria-label="Expand global settings"
          title="Expand global settings"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div data-testid="global-settings" className="flex h-full flex-col gap-5 overflow-y-auto p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Global settings</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Applies to every frame, unless overridden per-frame.</p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          aria-label="Collapse global settings"
          title="Collapse global settings"
        >
          <PanelRightClose className="h-3.5 w-3.5" />
        </button>
      </div>

      <Field label="Frame rate" value={`${fps} fps`}>
        <input
          type="range"
          min={1}
          max={30}
          value={fps}
          onChange={(e) => setFps(Number(e.target.value))}
          className="w-full"
        />
      </Field>

      <Field
        label="Quality"
        value={quality <= 5 ? 'Best' : quality <= 12 ? 'Good' : quality <= 20 ? 'Fast' : 'Fastest'}
        hint="Better colors render slower."
      >
        <input
          type="range"
          min={1}
          max={30}
          value={31 - quality}
          onChange={(e) => setQuality(31 - Number(e.target.value))}
          className="w-full"
        />
      </Field>

      <div className="border-t border-white/5 pt-4">
        <label className="text-xs font-medium text-zinc-400">Canvas size</label>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-white/[0.03] p-1">
          {CANVAS_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setCanvasMode(m.id)}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                canvasMode === m.id ? 'bg-accent text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {canvasMode === 'ratio' && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setCanvasRatio(r.label)}
                className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  canvasRatio === r.label
                    ? 'border-accent bg-accent/10 text-accent-soft'
                    : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {canvasMode === 'frame' && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {frames.map((frame, i) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => setCanvasFrameId(frame.id)}
                className={`h-10 w-10 shrink-0 overflow-hidden rounded-md border-2 ${
                  canvasFrameId === frame.id ? 'border-accent' : 'border-transparent hover:border-white/20'
                }`}
                title={`Frame #${i + 1} — ${frame.width}×${frame.height}`}
              >
                <img src={frame.thumbnail} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <p className="mt-2 text-[11px] text-zinc-600">
          {canvasMode === 'auto' && 'Fits the largest uploaded frame.'}
          {canvasMode === 'ratio' && 'Locks the canvas to a fixed aspect ratio.'}
          {canvasMode === 'frame' && "Matches one frame's exact size."}
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-400">Default fit</label>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-white/[0.03] p-1">
          {FIT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setDefaultFit(opt.id)}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors ${
                defaultFit === opt.id ? 'bg-accent text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-600">
          How each frame fills the canvas — override per-frame in Frame settings.
        </p>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label className="text-xs font-medium text-zinc-400">Background</label>
        </div>
        <ColorPicker value={background} onChange={setBackground} onEyedrop={onStartEyedrop} eyedropping={eyedropping} />
        <p className="mt-1 text-[11px] text-zinc-600">
          {eyedropping ? 'Click anywhere on the frame preview to sample a color.' : 'Or eyedrop a color straight off a frame.'}
        </p>
      </div>

      <Field
        label="Output scale"
        value={`${Math.round(scale * 100)}%`}
        hint={`${outputWidth}×${outputHeight}px (from ${baseWidth}×${baseHeight}px canvas)`}
      >
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-full"
        />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 text-xs">
        <span className="text-zinc-500">Estimated size</span>
        <span className="font-semibold text-zinc-200">~{formatBytes(estimatedBytes)}</span>
      </div>

      <div className="border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="flex w-full items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-200"
        >
          <span>Per-frame duration overrides</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
        </button>
        {advancedOpen && (
          <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {frames.length === 0 && <p className="text-[11px] text-zinc-600">No frames yet.</p>}
            {frames.map((frame, i) => (
              <div key={frame.id} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
                <img src={frame.thumbnail} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
                <span className="w-10 shrink-0 text-[11px] text-zinc-500">#{i + 1}</span>
                <DurationInput
                  value={frame.duration}
                  defaultValue={Math.round(1000 / fps)}
                  onChange={(v) => onFrameDurationChange(frame.id, v)}
                  compact
                />
                <span className="text-[10px] text-zinc-600">ms</span>
                <button
                  type="button"
                  onClick={() => onFrameDurationChange(frame.id, null)}
                  aria-label="Reset to default duration"
                  className={`ml-auto text-zinc-600 hover:text-zinc-300 ${frame.duration == null ? 'invisible' : ''}`}
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={onRender}
          disabled={disabled || isRendering}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgb(108_99_255/0.6)] transition-transform hover:scale-[1.02] hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Sparkles className="h-4 w-4" />
          {isRendering ? 'Rendering…' : 'Render GIF'}
        </button>
      </div>
    </div>
  )
}
