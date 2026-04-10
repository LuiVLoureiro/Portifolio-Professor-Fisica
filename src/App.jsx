import { useRef, useEffect } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import './App.css'

function App() {
  // scrollRef compartilhado: t = scrollY / innerHeight — usado pelo Hero para animar o voo
  const scrollRef = useRef(0)

  useEffect(() => {
    // Lenis interpola o scroll nativo — dispara o evento 'scroll' normalmente
    const lenis = new Lenis({
      duration:  1.4,
      easing:    t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Atualiza scrollRef via Lenis (já é o valor suavizado)
    lenis.on('scroll', ({ scroll }) => {
      scrollRef.current = scroll / (window.innerHeight || 1)
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero scrollRef={scrollRef} />
        <About scrollRef={scrollRef} />
        <Projects />
        <Contact />
      </main>
    </>
  )
}

export default App
