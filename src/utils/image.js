// Decodes a File into a reusable <img> element. The object URL is revoked
// as soon as the browser has decoded the image — the element keeps its own
// decoded bitmap after that, so nothing breaks and we don't have to track
// URL lifetimes across frame duplication/deletion later on.
export function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ img, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Could not decode "${file.name}" as an image.`))
    }
    img.src = url
  })
}

export function makeThumbnail(img, width, height, maxSize = 200) {
  const scale = Math.min(maxSize / width, maxSize / height, 1)
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', 0.82)
}

export function formatBytes(bytes) {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
