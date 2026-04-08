import { useRef, useEffect, useState } from 'react'

/**
 * Retorna { ref, inView } — dispara uma vez quando o elemento entra na viewport.
 * @param {object} options
 * @param {number} options.threshold  – fração visível para disparar (padrão 0.15)
 * @param {string} options.rootMargin – margem negativa no bottom para disparar antes do fim (padrão '-60px')
 */
export function useInView({ threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref    = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}
