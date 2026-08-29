import { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../components/Nav'
import Dropzone from '../components/Dropzone'
import DragOverlay from '../components/DragOverlay'
import PreviewStage from '../components/PreviewStage'
import FrameSettings from '../components/FrameSettings'
import Timeline from '../components/Timeline'
import GlobalSettings from '../components/GlobalSettings'
import RenderModal from '../components/RenderModal'
import { useWindowDrop } from '../hooks/useWindowDrop'
import { usePlayback } from '../hooks/usePlayback'
import { uid } from '../utils/id'
import { loadImageFile, makeThumbnail } from '../utils/image'
import { renderGif } from '../utils/gifExport'
import { ASPECT_RATIOS } from '../utils/canvasPresets'

const DEFAULT_BASE = { width: 480, height: 360 }

export default function Studio() {
  const [frames, setFrames] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [fps, setFps] = useState(10)
  const [quality, setQuality] = useState(10)
  const [scale, setScale] = useState(1)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const [canvasMode, setCanvasMode] = useState('auto') // 'auto' | 'ratio' | 'frame'
  const [canvasRatio, setCanvasRatio] = useState('1:1')
  const [canvasFrameId, setCanvasFrameId] = useState(null)
  const [background, setBackground] = useState('#000000')
  const [defaultFit, setDefaultFit] = useState('contain') // 'contain' | 'cover' | 'stretch'
  const [eyedropping, setEyedropping] = useState(false)
  const [globalSettingsCollapsed, setGlobalSettingsCollapsed] = useState(false)

  const [showRenderModal, setShowRenderModal] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(null)
  const [renderError, setRenderError] = useState(null)
  const [result, setResult] = useState(null)
  const abortRef = useRef(null)

  const lastIndexRef = useRef(0)
  const autoScaledRef = useRef(false)

  const readyFrames = useMemo(() => frames.filter((f) => f.status === 'ready'), [frames])

  const { baseWidth, baseHeight } = useMemo(() => {
    if (readyFrames.length === 0) return { baseWidth: DEFAULT_BASE.width, baseHeight: DEFAULT_BASE.height }

    if (canvasMode === 'frame') {
      const f = readyFrames.find((fr) => fr.id === canvasFrameId) ?? readyFrames[0]
      return { baseWidth: f.width, baseHeight: f.height }
    }

    if (canvasMode === 'ratio') {
      const preset = ASPECT_RATIOS.find((r) => r.label === canvasRatio) ?? ASPECT_RATIOS[0]
      const longEdge = Math.max(...readyFrames.flatMap((f) => [f.width, f.height]))
      if (preset.w >= preset.h) {
        return { baseWidth: longEdge, baseHeight: Math.round((longEdge * preset.h) / preset.w) }
      }
      return { baseWidth: Math.round((longEdge * preset.w) / preset.h), baseHeight: longEdge }
    }

    return {
      baseWidth: Math.max(...readyFrames.map((f) => f.width)),
      baseHeight: Math.max(...readyFrames.map((f) => f.height)),
    }
  }, [readyFrames, canvasMode, canvasRatio, canvasFrameId])

  const outputWidth = Math.max(1, Math.round(baseWidth * scale))
  const outputHeight = Math.max(1, Math.round(baseHeight * scale))
  const activeIndex = readyFrames.findIndex((f) => f.id === activeId)

  usePlayback({ frames: readyFrames, fps, activeId, setActiveId, isPlaying })

  // Keep a valid selection as frames are added/removed/reordered, preferring
  // to stay at the same index (so deleting a frame selects its replacement).
  useEffect(() => {
    const idx = readyFrames.findIndex((f) => f.id === activeId)
    if (idx !== -1) {
      lastIndexRef.current = idx
      return
    }
    if (readyFrames.length === 0) {
      if (activeId !== null) setActiveId(null)
      return
    }
    const nextIdx = Math.min(lastIndexRef.current, readyFrames.length - 1)
    setActiveId(readyFrames[nextIdx].id)
  }, [readyFrames, activeId])

  // Default (and re-pick if deleted) which frame defines the canvas in "frame" mode.
  useEffect(() => {
    if (canvasMode !== 'frame') return
    if (readyFrames.some((f) => f.id === canvasFrameId)) return
    setCanvasFrameId(readyFrames[0]?.id ?? null)
  }, [canvasMode, readyFrames, canvasFrameId])

  // One-time smart default: downscale large source photos so a first render
  // doesn't produce an enormous GIF by surprise.
  useEffect(() => {
    if (autoScaledRef.current || readyFrames.length === 0) return
    autoScaledRef.current = true
    if (baseWidth > 480) {
      const fit = Math.round((480 / baseWidth) / 0.05) * 0.05
      setScale(Math.min(1, Math.max(0.1, fit)))
    }
  }, [readyFrames.length, baseWidth])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
      if (activeId) {
        e.preventDefault()
        removeFrame(activeId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    if (!eyedropping) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setEyedropping(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [eyedropping])

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return

    const placeholders = files.map((file) => ({ id: uid(), name: file.name, status: 'loading' }))
    setFrames((prev) => [...prev, ...placeholders])

    placeholders.forEach((placeholder, i) => {
      const file = files[i]
      loadImageFile(file)
        .then(({ img, width, height }) => {
          const thumbnail = makeThumbnail(img, width, height)
          setFrames((prev) =>
            prev.map((f) =>
              f.id === placeholder.id
                ? {
                    id: placeholder.id,
                    name: file.name,
                    status: 'ready',
                    img,
                    width,
                    height,
                    thumbnail,
                    duration: null,
                    locked: true,
                    transform: null,
                    fit: null,
                  }
                : f,
            ),
          )
        })
        .catch((err) => {
          console.error(err)
          setFrames((prev) => prev.filter((f) => f.id !== placeholder.id))
        })
    })
  }

  const isDraggingOver = useWindowDrop(addFiles)

  function removeFrame(id) {
    setFrames((prev) => prev.filter((f) => f.id !== id))
  }

  function duplicateFrame(id) {
    setFrames((prev) => {
      const idx = prev.findIndex((f) => f.id === id)
      if (idx === -1) return prev
      const copy = { ...prev[idx], id: uid() }
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }

  function reorderFrames(from, to) {
    setFrames((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function stepFrame(dir) {
    if (readyFrames.length === 0) return
    setIsPlaying(false)
    const idx = activeIndex === -1 ? 0 : activeIndex
    const nextIdx = (idx + dir + readyFrames.length) % readyFrames.length
    setActiveId(readyFrames[nextIdx].id)
  }

  function scrubTo(index) {
    if (!readyFrames[index]) return
    setIsPlaying(false)
    setActiveId(readyFrames[index].id)
  }

  function selectFrame(id) {
    setIsPlaying(false)
    setActiveId(id)
  }

  function setFrameDuration(id, ms) {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, duration: ms } : f)))
  }

  function toggleFrameLock(id) {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, locked: !f.locked } : f)))
  }

  function setFrameTransform(id, transform) {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, transform } : f)))
  }

  function resetFrameTransform(id) {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, transform: null } : f)))
  }

  function setFrameFit(id, fit) {
    setFrames((prev) => prev.map((f) => (f.id === id ? { ...f, fit } : f)))
  }

  function handleEyedropSample(hex) {
    setBackground(hex)
    setEyedropping(false)
  }

  async function handleRender() {
    if (readyFrames.length === 0 || isRendering) return
    setIsPlaying(false)
    setShowRenderModal(true)
    setIsRendering(true)
    setRenderError(null)
    setRenderProgress(null)
    if (result) {
      URL.revokeObjectURL(result.url)
      setResult(null)
    }
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const blob = await renderGif({
        frames: readyFrames,
        fps,
        quality,
        outputWidth,
        outputHeight,
        background,
        defaultFit,
        onProgress: setRenderProgress,
        signal: controller.signal,
      })
      const url = URL.createObjectURL(blob)
      setResult({ url, size: blob.size })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('GIF render failed', err)
        setRenderError(err.message || 'Rendering failed.')
      }
    } finally {
      setIsRendering(false)
      setRenderProgress(null)
      abortRef.current = null
    }
  }

  function closeRenderModal() {
    if (isRendering) abortRef.current?.abort()
    setShowRenderModal(false)
  }

  const hasFrames = frames.length > 0

  return (
    <div className="flex h-screen flex-col bg-canvas text-zinc-100">
      <DragOverlay visible={isDraggingOver} />
      <Nav
        right={
          readyFrames.length > 0 && (
            <span>
              <span className="font-medium text-zinc-300">{readyFrames.length}</span>{' '}
              {readyFrames.length === 1 ? 'frame' : 'frames'}
            </span>
          )
        }
      />

      {!hasFrames ? (
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="h-full max-h-[560px] w-full max-w-xl">
            <Dropzone onFiles={addFiles} />
          </div>
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 gap-4 overflow-auto p-4 sm:p-6">
          <div className="flex h-full flex-1 flex-col gap-4">
            <div className="flex min-h-0 flex-1 gap-4">
              <PreviewStage
                readyFrames={readyFrames}
                activeId={activeId}
                activeIndex={activeIndex}
                outputWidth={outputWidth}
                outputHeight={outputHeight}
                background={background}
                defaultFit={defaultFit}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                onStep={stepFrame}
                onScrub={scrubTo}
                onFrameTransformChange={setFrameTransform}
                eyedropping={eyedropping}
                onEyedropSample={handleEyedropSample}
              />
              <div className="h-full w-64 shrink-0">
                <FrameSettings
                  frame={activeIndex !== -1 ? readyFrames[activeIndex] : null}
                  index={activeIndex}
                  fps={fps}
                  onToggleLock={toggleFrameLock}
                  onFitChange={setFrameFit}
                  onResetTransform={resetFrameTransform}
                  onDurationChange={setFrameDuration}
                />
              </div>
            </div>
            <Timeline
              frames={frames}
              activeId={activeId}
              onSelect={selectFrame}
              onDelete={removeFrame}
              onDuplicate={duplicateFrame}
              onReorder={reorderFrames}
              onFiles={addFiles}
            />
          </div>

          <aside
            className={`flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015] transition-[width] ${
              globalSettingsCollapsed ? 'w-12' : 'w-80'
            }`}
          >
            <GlobalSettings
              fps={fps}
              setFps={setFps}
              quality={quality}
              setQuality={setQuality}
              scale={scale}
              setScale={setScale}
              canvasMode={canvasMode}
              setCanvasMode={setCanvasMode}
              canvasRatio={canvasRatio}
              setCanvasRatio={setCanvasRatio}
              canvasFrameId={canvasFrameId}
              setCanvasFrameId={setCanvasFrameId}
              defaultFit={defaultFit}
              setDefaultFit={setDefaultFit}
              background={background}
              setBackground={setBackground}
              eyedropping={eyedropping}
              onStartEyedrop={() => setEyedropping(true)}
              baseWidth={baseWidth}
              baseHeight={baseHeight}
              outputWidth={outputWidth}
              outputHeight={outputHeight}
              frameCount={readyFrames.length}
              disabled={readyFrames.length === 0}
              isRendering={isRendering}
              onRender={handleRender}
              advancedOpen={advancedOpen}
              setAdvancedOpen={setAdvancedOpen}
              frames={readyFrames}
              onFrameDurationChange={setFrameDuration}
              collapsed={globalSettingsCollapsed}
              onToggleCollapse={() => setGlobalSettingsCollapsed((c) => !c)}
            />
          </aside>
        </main>
      )}

      <RenderModal
        open={showRenderModal}
        phase={renderProgress?.phase}
        progress={renderProgress?.value}
        result={result}
        error={renderError}
        outputWidth={outputWidth}
        outputHeight={outputHeight}
        onClose={closeRenderModal}
        onRenderAgain={handleRender}
      />
    </div>
  )
}
