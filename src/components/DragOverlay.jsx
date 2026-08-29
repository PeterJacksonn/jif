import { UploadCloud } from 'lucide-react'

export default function DragOverlay({ visible }) {
  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-accent/60 px-16 py-14">
        <UploadCloud className="h-10 w-10 text-accent-soft" />
        <p className="text-lg font-semibold text-zinc-100">Drop to add frames</p>
      </div>
    </div>
  )
}
