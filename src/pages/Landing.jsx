import { Link } from 'react-router-dom'
import { ArrowRight, Download, ImagePlus, MousePointerClick } from 'lucide-react'
import Nav from '../components/Nav'

const features = [
    {
        icon: ImagePlus,
        title: 'Bulk upload',
        description: 'Drag in a whole batch of photos at once.',
    },
    {
        icon: MousePointerClick,
        title: 'Drag to reorder',
        description: 'Arrange, duplicate, and trim the sequence.',
    },
    {
        icon: Download,
        title: 'Instant export',
        description: 'Tune size and quality, then download.',
    },
]

export default function Landing() {
    return (
        <div className="relative flex h-screen flex-col overflow-hidden bg-canvas text-zinc-100">
            <Nav />

            <main className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]"
                />

                <div className="relative animate-fade-in">


                    <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
                        Turn your images
                        <br />
                        into a{' '}
                        <span className="bg-gradient-to-r from-accent-soft to-accent bg-clip-text text-transparent">
                            GIF
                        </span>
                        .
                    </h1>

                    <p className="mx-auto mt-5 max-w-md text-balance text-base text-zinc-400 sm:text-lg">
                        No accounts. No server uploads. Nothing to install.
                    </p>

                    <Link
                        to="/studio"
                        className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgb(108_99_255/0.6)] transition-transform hover:scale-[1.03] hover:bg-accent-strong active:scale-[0.98]"
                    >
                        Make a GIF
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-12">
                    {features.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="flex flex-col items-center gap-2 sm:items-start sm:text-left">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-accent-soft">
                                <Icon className="h-4.5 w-4.5" />
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
                            <p className="max-w-[16rem] text-sm text-zinc-500">{description}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
