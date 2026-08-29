import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export default function Nav({ right }) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
      <Link to="/" className="group flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white transition-transform group-hover:scale-105">
          <Film className="h-4.5 w-4.5" />
        </div>
        <h1 className="font-display text-[15px] font-semibold tracking-tight text-zinc-50">jif</h1>
      </Link>
      <div className="text-xs text-zinc-500">{right}</div>
    </header>
  )
}
