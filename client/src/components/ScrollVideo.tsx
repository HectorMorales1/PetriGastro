import { useState, useEffect, useRef } from 'react'

const TOTAL_FRAMES = 40

export default function ScrollVideo() {
  const sectionRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
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
    if (!isVisible) return
    let loadedCount = 0
    const images: HTMLImageElement[] = []

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      const frameNum = (i * 3).toString().padStart(3, '0')
      img.src = `/Fotogramas/frame_${frameNum}.jpg`

      img.onload = () => {
        loadedCount++
        if (loadedCount >= 20) setLoaded(true)
      }

      img.onerror = () => {
        loadedCount++
        if (loadedCount >= 20) setLoaded(true)
      }

      images.push(img)
    }

    const checkLoaded = () => images.filter(img => img.complete).length >= 20
    const preloadImages = setInterval(() => {
      if (checkLoaded()) {
        setLoaded(true)
        clearInterval(preloadImages)
      }
    }, 100)

    if (checkLoaded()) {
      setLoaded(true)
      clearInterval(preloadImages)
    }

    return () => clearInterval(preloadImages)
  }, [isVisible])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCurrentFrame(0)
      setLoaded(true)
      setProgress(1)
      return
    }

    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const calcProgress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (sectionHeight + viewportHeight)))
      const animatedFrames = 25
      const pausedProgress = Math.min(calcProgress / 0.75, 1)
      let frameIndex = Math.round(pausedProgress * animatedFrames)
      if (calcProgress > 0.75) {
        frameIndex = TOTAL_FRAMES - 1
      }

      if (frameIndex !== lastFrameRef.current) {
        setCurrentFrame(frameIndex)
        lastFrameRef.current = frameIndex
      }
      setProgress(calcProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <img
          src={`/Fotogramas/frame_${(currentFrame * 3).toString().padStart(3, '0')}.jpg`}
          alt=""
          className="w-full h-full object-cover"
          key={currentFrame}
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
