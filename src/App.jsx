import { useRef, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import './App.css'

function App() {
  // scrollRef compartilhado: t = scrollY / innerHeight
  // Hero usa para animar o voo; About usa para controlar entrada do foguete em órbita
  const scrollRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY / (window.innerHeight || 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
