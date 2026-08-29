import { useRef } from 'react'
import { fitFraction } from '../utils/frameTransform'

const HANDLES = ['nw', 'ne', 'sw', 'se']
const MIN_SIZE = 0.05

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

// Lets the user drag/resize/rotate the active frame's image within the
// canvas. Positions are stored as fractions of the canvas (see
// utils/frameTransform), so this overlay just needs to sit exactly on top
// of the rendered canvas and translate pointer pixels into fraction deltas.
export default function FrameTransformOverlay({ frame, containerRef, canvasWidth, canvasHeight, defaultFit, onChange }) {
  const dragRef = useRef(null)

  const fitRect = fitFraction(frame.width, frame.height, canvasWidth, canvasHeight, frame.fit ?? defaultFit)
  const rect = frame.transform ?? { ...fitRect, rotation: 0 }
  const rotation = rect.rotation || 0
  const aspect = frame.width / frame.height

  function beginDrag(e, mode, handle) {
    e.preventDefault()
    e.stopPropagation()
    const box = containerRef.current.getBoundingClientRect()
    dragRef.current = {
      mode,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      containerW: box.width,
      containerH: box.height,
      containerLeft: box.left,
      containerTop: box.top,
      startRect: rect,
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp, { once: true })
  }

  function onPointerMove(e) {
    const ds = dragRef.current
    if (!ds) return
    const { startRect } = ds

    if (ds.mode === 'move') {
      const dxFrac = (e.clientX - ds.startX) / ds.containerW
      const dyFrac = (e.clientY - ds.startY) / ds.containerH
      const x = clamp(startRect.x + dxFrac, -startRect.w + 0.05, 1 - 0.05)
      const y = clamp(startRect.y + dyFrac, -startRect.h + 0.05, 1 - 0.05)
      onChange({ ...startRect, x, y })
      return
    }

    if (ds.mode === 'rotate') {
      const cx = ds.containerLeft + (startRect.x + startRect.w / 2) * ds.containerW
      const cy = ds.containerTop + (startRect.y + startRect.h / 2) * ds.containerH
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
      onChange({ ...startRect, rotation: angle + 90 })
      return
    }

    // Corner resize: project the screen-space drag into the box's own
    // (possibly rotated) coordinate frame, then scale uniformly from the
    // center — resizing from center keeps the math correct regardless of
    // rotation, since the center's screen position never changes.
    const dxPx = e.clientX - ds.startX
    const dyPx = e.clientY - ds.startY
    const rad = (-(startRect.rotation || 0) * Math.PI) / 180
    const localDx = dxPx * Math.cos(rad) - dyPx * Math.sin(rad)

    const grows = ds.handle === 'se' || ds.handle === 'ne'
    const deltaWpx = grows ? localDx : -localDx
    const startWpx = startRect.w * ds.containerW
    const newWpx = clamp(startWpx + deltaWpx * 2, MIN_SIZE * ds.containerW, 4 * ds.containerW)
    const newHpx = newWpx / aspect
    const w = newWpx / ds.containerW
    const h = newHpx / ds.containerH
    const cx = startRect.x + startRect.w / 2
    const cy = startRect.y + startRect.h / 2

    onChange({ x: cx - w / 2, y: cy - h / 2, w, h, rotation: startRect.rotation })
  }

  function onPointerUp() {
    dragRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
  }

  const style = {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.w * 100}%`,
    height: `${rect.h * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
  }

  const cursors = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize' }
  const pos = {
    nw: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
    ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
    sw: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
    se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
  }

  return (
    <div
      className="absolute cursor-move border-2 border-accent shadow-[0_0_0_2000px_rgba(0,0,0,0.35)]"
      style={style}
      onPointerDown={(e) => beginDrag(e, 'move')}
    >
      {HANDLES.map((handle) => (
        <div
          key={handle}
          onPointerDown={(e) => beginDrag(e, 'resize', handle)}
          className={`absolute h-3.5 w-3.5 rounded-full border-2 border-accent bg-white ${pos[handle]}`}
          style={{ cursor: cursors[handle] }}
        />
      ))}

      <div
        className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 -translate-y-full bg-accent"
        aria-hidden
      />
      <div
        onPointerDown={(e) => beginDrag(e, 'rotate')}
        className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-[calc(100%+0.75rem)] rounded-full border-2 border-accent bg-white"
        style={{ cursor: 'grab' }}
        title="Drag to rotate"
      />
    </div>
  )
}
