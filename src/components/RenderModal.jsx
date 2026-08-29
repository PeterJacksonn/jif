import { Download, Loader2, RotateCcw, X } from 'lucide-react'
import { formatBytes } from '../utils/image'

export default function RenderModal({
  open,
  phase,
  progress,
  result,
  error,
  outputWidth,
  outputHeight,
  onClose,
  onRenderAgain,
}) {
  if (!open) return null

  const isBusy = !result && !error
  const overallProgress =
    progress == null ? 0 : phase === 'preparing' ? progress * 0.3 : 0.3 + progress * 0.7

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={!isBusy ? onClose : undefined}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isBusy && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-soft">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                {phase === 'preparing' ? 'Preparing frames…' : 'Encoding GIF…'}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">This runs entirely on your device.</p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-150"
                style={{ width: `${Math.round(overallProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <h2 className="text-sm font-semibold text-red-400">Rendering failed</h2>
            <p className="text-xs text-zinc-500">{error}</p>
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onRenderAgain}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Your GIF is ready</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 hover:bg-white/10 hover:text-zinc-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img src={result.url} alt="Rendered GIF" className="w-full rounded-lg border border-white/10" />
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{formatBytes(result.size)}</span>
              <span>
                {outputWidth}×{outputHeight}
              </span>
            </div>
            <a
              href={result.url}
              download="jif-export.gif"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgb(108_99_255/0.6)] transition-transform hover:scale-[1.02] hover:bg-accent-strong active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download GIF
            </a>
            <button
              type="button"
              onClick={onRenderAgain}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Render again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
