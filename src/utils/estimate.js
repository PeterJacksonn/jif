// Very rough pre-render size hint — GIF/LZW compression ratios vary wildly
// with image content, so this is only meant to make the quality/scale
// tradeoff visible before committing to a render, not to be accurate.
export function estimateGifBytes({ width, height, frameCount, quality }) {
  if (!width || !height || !frameCount) return 0
  const q = Math.min(30, Math.max(1, quality))
  const qualityFactor = (31 - q) / 30 // 0..1, higher = better color sampling = bigger file
  const bytesPerPixel = 0.05 + qualityFactor * 0.22
  return Math.round(width * height * frameCount * bytesPerPixel * 0.35)
}
