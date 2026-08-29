// A frame's placement on the canvas is stored as fractions of the canvas
// size (x, y, w, h all 0..1-ish, can go negative/over 1 to crop or overflow)
// plus a rotation in degrees around its own center, so it stays valid no
// matter how the canvas size/aspect ratio changes later. `frame.transform`
// is null until the user drags/resizes/rotates it by hand — until then its
// rect comes from the fit mode (frame.fit, or the global default) with no
// rotation.

export const FIT_MODES = ['contain', 'cover', 'stretch']

export function fitFraction(imgW, imgH, canvasW, canvasH, fit) {
  if (fit === 'stretch') {
    return { x: 0, y: 0, w: 1, h: 1 }
  }
  const ratio = fit === 'cover' ? Math.max(canvasW / imgW, canvasH / imgH) : Math.min(canvasW / imgW, canvasH / imgH)
  const w = imgW * ratio
  const h = imgH * ratio
  const x = (canvasW - w) / 2
  const y = (canvasH - h) / 2
  return { x: x / canvasW, y: y / canvasH, w: w / canvasW, h: h / canvasH }
}

export function resolveFrameRect(frame, canvasW, canvasH, defaultFit = 'contain') {
  if (frame.transform) {
    const t = frame.transform
    return { x: t.x * canvasW, y: t.y * canvasH, w: t.w * canvasW, h: t.h * canvasH, rotation: t.rotation || 0 }
  }
  const frac = fitFraction(frame.width, frame.height, canvasW, canvasH, frame.fit ?? defaultFit)
  return { x: frac.x * canvasW, y: frac.y * canvasH, w: frac.w * canvasW, h: frac.h * canvasH, rotation: 0 }
}

export function drawFrame(ctx, frame, canvasW, canvasH, background = '#000000', defaultFit = 'contain') {
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvasW, canvasH)
  const rect = resolveFrameRect(frame, canvasW, canvasH, defaultFit)
  if (rect.rotation) {
    const cx = rect.x + rect.w / 2
    const cy = rect.y + rect.h / 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((rect.rotation * Math.PI) / 180)
    ctx.drawImage(frame.img, -rect.w / 2, -rect.h / 2, rect.w, rect.h)
    ctx.restore()
  } else {
    ctx.drawImage(frame.img, rect.x, rect.y, rect.w, rect.h)
  }
}
