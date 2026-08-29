import { Lock, MousePointerClick, RotateCcw, Unlock } from 'lucide-react'
import DurationInput from './DurationInput'

const FIT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'contain', label: 'Fit' },
  { id: 'cover', label: 'Fill' },
  { id: 'stretch', label: 'Stretch' },
]

export default function FrameSettings({ frame, index, fps, onToggleLock, onFitChange, onResetTransform, onDurationChange }) {
  if (!frame) {
    return (
      <div
        data-testid="frame-settings"
        className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.015] p-5 text-center"
      >
        <MousePointerClick className="h-5 w-5 text-zinc-600" />
        <p className="text-xs text-zinc-600">Select a frame to edit its settings.</p>
      </div>
    )
  }

  const activeFit = frame.fit ?? 'default'
  const globalDefaultMs = Math.round(1000 / fps)

  return (
    <div
      data-testid="frame-settings"
      className="flex h-full flex-col gap-5 overflow-y-auto rounded-2xl border border-white/5 bg-white/[0.015] p-5"
    >
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Frame settings</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          #{index + 1} · {frame.width}×{frame.height}px
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-zinc-300">
        <span className="flex items-center gap-2">
          {frame.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5 text-accent-soft" />}
          Lock position on canvas
        </span>
        <input
          type="checkbox"
          checked={frame.locked}
          onChange={() => onToggleLock(frame.id)}
          className="h-4 w-4 rounded accent-accent"
        />
      </label>

      <div>
        <label className="text-xs font-medium text-zinc-400">Fit override</label>
        <div className={`mt-2 grid grid-cols-2 gap-1 rounded-lg bg-white/[0.03] p-1 ${frame.transform ? 'opacity-40' : ''}`}>
          {FIT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={Boolean(frame.transform)}
              onClick={() => onFitChange(frame.id, opt.id === 'default' ? null : opt.id)}
              className={`rounded-md py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                activeFit === opt.id ? 'bg-accent text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-zinc-600">
          {frame.transform
            ? 'This frame has a custom position, so fit mode is unused.'
            : activeFit === 'default'
              ? 'Uses the global default fit.'
              : 'Overrides the global default for this frame.'}
        </p>
      </div>

      {frame.transform && (
        <button
          type="button"
          onClick={() => onResetTransform(frame.id)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to fit mode
        </button>
      )}

      <div className="border-t border-white/5 pt-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <label className="text-xs font-medium text-zinc-400">Duration override</label>
          <span
            className={`text-xs font-semibold tabular-nums ${
              frame.duration != null ? 'text-accent-soft' : 'text-zinc-600'
            }`}
          >
            {frame.duration ?? globalDefaultMs} ms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DurationInput
            value={frame.duration}
            defaultValue={globalDefaultMs}
            onChange={(v) => onDurationChange(frame.id, v)}
          />
          <button
            type="button"
            onClick={() => onDurationChange(frame.id, null)}
            aria-label="Reset to default duration"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 ${
              frame.duration == null ? 'invisible' : ''
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        {frame.duration != null && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
            Global default <span className="text-zinc-100">{globalDefaultMs} ms</span>
          </div>
        )}
        <p className="mt-2 text-[11px] text-zinc-600">Also editable in Global settings for all frames at once.</p>
      </div>
    </div>
  )
}
