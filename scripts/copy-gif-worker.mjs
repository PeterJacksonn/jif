// gif.js encodes GIFs in a Web Worker. It ships that worker as a plain file
// meant to be fetched at a URL rather than bundled, so Vite can't just
// import it — we copy it into public/ so it's served as a static asset in
// both dev and the production build.
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const src = join(root, 'node_modules/gif.js/dist/gif.worker.js')
const destDir = join(root, 'public')
const dest = join(destDir, 'gif.worker.js')

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log('Copied gif.worker.js -> public/gif.worker.js')
