'use client'

import { useEffect, useRef } from 'react'

interface Props {
  src: string
  className?: string
}

export default function SeamlessVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const restart = () => {
      video.currentTime = 0
      video.play().catch(() => {})
    }

    // Restart slightly before the end to avoid the black frame
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.15) {
        video.currentTime = 0
      }
    }

    video.addEventListener('ended', restart)
    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      video.removeEventListener('ended', restart)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      autoPlay
      muted
      playsInline
    />
  )
}
