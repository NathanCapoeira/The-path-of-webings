'use client'

import { useEffect, useState } from 'react'

export function ReelMedia({ reelId, media, topic }: { reelId: string; media: string[]; topic: string }) {
  const [frame, setFrame] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    setFrame(0)
    setLoaded(false)
    setFailed(new Set())
  }, [reelId])

  useEffect(() => {
    if (media.length < 2) return
    const timer = window.setInterval(() => {
      setLoaded(false)
      setFrame((current) => (current + 1) % media.length)
    }, 3800)
    return () => window.clearInterval(timer)
  }, [reelId, media.length])

  useEffect(() => {
    if (media.length < 2) return
    const next = (frame + 1) % media.length
    const image = new Image()
    image.decoding = 'async'
    image.src = media[next]
    return () => { image.src = '' }
  }, [frame, media])

  if (media.length === 0 || failed.size >= media.length) return null
  const src = media[frame]

  return <img
    key={`${reelId}-${frame}`}
    src={src}
    alt={`Cena do vídeo sobre ${topic}`}
    width={360}
    height={640}
    loading="eager"
    decoding="async"
    fetchPriority="high"
    onLoad={() => setLoaded(true)}
    onError={() => {
      setFailed((current) => new Set(current).add(frame))
      setLoaded(false)
      setFrame((current) => (current + 1) % media.length)
    }}
    className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
  />
}
