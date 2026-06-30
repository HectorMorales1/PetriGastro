import { useState, useEffect, useRef } from 'react'

const FPS = 24

export default function ScrollVideo() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const lastFrameRef = useRef(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || !videoRef.current) return
    const video = videoRef.current
    const onCanPlay = () => {
      video.play().then(() => video.pause()).catch(() => {})
      setLoaded(true)
    }
    video.addEventListener('canplay', onCanPlay)
    if (video.readyState >= 3) {
      video.play().then(() => video.pause()).catch(() => {})
      setLoaded(true)
    }
    return () => video.removeEventListener('canplay', onCanPlay)
  }, [isVisible])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setLoaded(true)
      setProgress(1)
      if (videoRef.current) videoRef.current.currentTime = 0
      return
    }

    const handleScroll = () => {
      if (!sectionRef.current || !videoRef.current) return
      const video = videoRef.current
      if (!video.duration) return

      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const calcProgress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (sectionHeight + viewportHeight)))

      const targetFrame = Math.round(calcProgress * video.duration * FPS)
      if (targetFrame === lastFrameRef.current) return
      lastFrameRef.current = targetFrame

      video.currentTime = targetFrame / FPS
      setProgress(calcProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <video
          ref={videoRef}
          src="/Video/video_croqueta.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />

        {!loaded && (
          <div className="bg-accent absolute inset-0 flex items-center justify-center" role="status" aria-live="polite">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p>Cargando animación...</p>
            </div>
          </div>
        )}

        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
            progress > 0.7 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold font-heading mb-4" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              La magia de la cocina
            </h2>
            <p className="text-xl md:text-2xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Cada plato cuenta una historia
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
