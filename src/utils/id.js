let counter = 0

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  counter += 1
  return `id-${Date.now()}-${counter}`
}
