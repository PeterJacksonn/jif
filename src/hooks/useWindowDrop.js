import { useEffect, useRef, useState } from 'react'

// Tracks drag-over state for the whole window so files can be dropped
// anywhere, not just on the initial empty-state dropzone, and calls
// onDrop with the FileList once released.
export function useWindowDrop(onDrop) {
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const dragDepth = useRef(0)

  useEffect(() => {
    function hasFiles(e) {
      return e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')
    }

    function onDragEnter(e) {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragDepth.current += 1
      setIsDraggingOver(true)
    }

    function onDragOver(e) {
      if (!hasFiles(e)) return
      e.preventDefault()
    }

    function onDragLeave(e) {
      if (!hasFiles(e)) return
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setIsDraggingOver(false)
    }

    function onDropWindow(e) {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragDepth.current = 0
      setIsDraggingOver(false)
      if (e.dataTransfer.files?.length) onDrop(e.dataTransfer.files)
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDropWindow)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDropWindow)
    }
  }, [onDrop])

  return isDraggingOver
}
