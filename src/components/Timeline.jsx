import { useRef, useState } from 'react'
import { Copy, Loader2, X } from 'lucide-react'
import Dropzone from './Dropzone'

export default function Timeline({ frames, activeId, onSelect, onDelete, onDuplicate, onReorder, onFiles }) {
  const dragIndex = useRef(null)
  const [overIndex, setOverIndex] = useState(null)

  function handleDragStart(e, index) {
    dragIndex.current = index
    e.dataTransfer.effectAllowed = 'move'
    // Firefox requires data to be set for drag to start.
    e.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIndex !== index) setOverIndex(index)
  }

  function handleDrop(e, index) {
    e.preventDefault()
    const from = dragIndex.current
    setOverIndex(null)
    dragIndex.current = null
    if (from === null || from === index) return
    onReorder(from, index)
  }

  function handleDragEnd() {
    dragIndex.current = null
    setOverIndex(null)
  }

  return (
    <div className="flex h-32 w-fit max-w-full shrink-0 self-start gap-2.5 overflow-x-auto overflow-y-hidden rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
      {frames.map((frame, index) => (
        <div
          key={frame.id}
          draggable={frame.status === 'ready'}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onClick={() => frame.status === 'ready' && onSelect(frame.id)}
          className={`group relative h-full w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-zinc-900 transition-all ${
            activeId === frame.id
              ? 'border-accent shadow-[0_0_0_3px_rgb(108_99_255/0.18)]'
              : 'border-transparent hover:border-white/15'
          } ${overIndex === index ? 'translate-x-1' : ''}`}
        >
          {frame.status === 'loading' ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="w-full truncate text-center text-[10px]">{frame.name}</span>
            </div>
          ) : (
            <>
              <img
                src={frame.thumbnail}
                alt={frame.name}
                draggable={false}
                className="h-full w-full select-none object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="pointer-events-none absolute bottom-1 left-1.5 text-[10px] font-medium text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                #{index + 1}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(frame.id)
                }}
                className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                aria-label="Delete frame"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(frame.id)
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                aria-label="Duplicate frame"
              >
                <Copy className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      ))}
      <div className="h-full w-24 shrink-0">
        <Dropzone onFiles={onFiles} compact />
      </div>
    </div>
  )
}
