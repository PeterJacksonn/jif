import { ChevronDown, ChevronUp } from 'lucide-react'

// A number input for frame duration that's unambiguous about whether a
// value is a real override or just showing the inherited default: empty +
// placeholder when unset, real text once overridden. Custom step buttons
// (rather than the native spinner) always step from the *effective* value
// (override, or the default when unset) so the first click never jumps
// from 0.
export default function DurationInput({ value, defaultValue, onChange, compact = false }) {
  function commit(raw) {
    const digits = raw.replace(/[^\d]/g, '')
    onChange(digits === '' ? null : Number(digits))
  }

  function step(delta) {
    const base = value ?? defaultValue
    onChange(Math.max(10, base + delta))
  }

  return (
    <div
      className={`flex items-center overflow-hidden rounded-md border border-white/10 bg-black/30 ${
        compact ? 'w-16' : 'w-full'
      }`}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder={`${defaultValue}`}
        value={value ?? ''}
        onChange={(e) => commit(e.target.value)}
        className={`min-w-0 flex-1 bg-transparent text-zinc-200 outline-none placeholder:text-zinc-600 ${
          compact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1.5 text-xs'
        }`}
      />
      <div className="flex shrink-0 flex-col border-l border-white/10">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => step(10)}
          aria-label="Increase duration"
          className={`flex items-center justify-center text-zinc-500 hover:bg-white/5 hover:text-zinc-200 ${
            compact ? 'h-2.5 w-4' : 'h-3.5 w-5'
          }`}
        >
          <ChevronUp className={compact ? 'h-2 w-2' : 'h-2.5 w-2.5'} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => step(-10)}
          aria-label="Decrease duration"
          className={`flex items-center justify-center border-t border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-200 ${
            compact ? 'h-2.5 w-4' : 'h-3.5 w-5'
          }`}
        >
          <ChevronDown className={compact ? 'h-2 w-2' : 'h-2.5 w-2.5'} />
        </button>
      </div>
    </div>
  )
}
