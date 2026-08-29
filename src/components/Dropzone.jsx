import { useRef } from 'react'
import { ImagePlus, Film } from 'lucide-react'

export default function Dropzone({ onFiles, compact = false }) {
  const inputRef = useRef(null)

  function handleChange(e) {
    if (e.target.files?.length) onFiles(e.target.files)
    e.target.value = ''
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/10 text-zinc-500 transition-colors hover:border-accent/50 hover:text-accent-soft"
      >
        <ImagePlus className="h-5 w-5 transition-transform group-hover:scale-110" />
        <span className="text-[11px] font-medium">Add frames</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={handleChange}
          className="hidden"
        />
      </button>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] px-8 py-16 text-center transition-colors">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent-soft">
        <Film className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-100">Drop some images to get started</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Drag &amp; drop a batch of JPG, PNG, or WebP images anywhere on this page, or browse your
        files. We'll turn them into frames you can reorder, preview, and export.
      </p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgb(108_99_255/0.6)] transition-transform hover:scale-[1.03] hover:bg-accent-strong active:scale-[0.98]"
      >
        <ImagePlus className="h-4 w-4" />
        Browse images
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
