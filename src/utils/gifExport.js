import GIF from 'gif.js'
import { drawFrame } from './frameTransform'

// Resizes/composites every frame onto a canvas at the target output size and
// feeds it to gif.js. Frame prep runs on the main thread (canvas drawing has
// to), so it's chunked with rAF yields to keep large batches from freezing
// the UI; the actual GIF encoding happens inside gif.js's own web workers.
export function renderGif({ frames, fps, quality, outputWidth, outputHeight, background, defaultFit, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    if (!frames.length) {
      reject(new Error('No frames to render.'))
      return
    }

    const gif = new GIF({
      workers: 2,
      quality,
      width: outputWidth,
      height: outputHeight,
      workerScript: '/gif.worker.js',
      background,
    })

    let settled = false
    const finish = (fn, arg) => {
      if (settled) return
      settled = true
      fn(arg)
    }

    gif.on('progress', (value) => {
      onProgress?.({ phase: 'encoding', value })
    })
    gif.on('finished', (blob) => finish(resolve, blob))
    gif.on('abort', () => finish(reject, new Error('Render was aborted.')))

    signal?.addEventListener('abort', () => {
      try {
        gif.abort()
      } catch {
        // gif.js can throw if aborted before workers spin up; safe to ignore.
      }
      finish(reject, new DOMException('Render cancelled.', 'AbortError'))
    })

    addFramesChunked({ gif, frames, outputWidth, outputHeight, background, defaultFit, fps, onProgress, signal })
      .then(() => {
        if (settled) return
        gif.render()
      })
      .catch((err) => finish(reject, err))
  })
}

async function addFramesChunked({ gif, frames, outputWidth, outputHeight, background, defaultFit, fps, onProgress, signal }) {
  const defaultDelay = 1000 / fps

  for (let i = 0; i < frames.length; i++) {
    if (signal?.aborted) return

    const frame = frames[i]
    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight
    const ctx = canvas.getContext('2d')
    drawFrame(ctx, frame, outputWidth, outputHeight, background, defaultFit)

    gif.addFrame(canvas, { delay: frame.duration ?? defaultDelay })
    onProgress?.({ phase: 'preparing', value: (i + 1) / frames.length })

    if (i % 3 === 2) {
      await new Promise((r) => requestAnimationFrame(r))
    }
  }
}
