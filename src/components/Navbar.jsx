import { useState, useEffect } from 'react'

const links = [
  { label: 'Piloto',   href: '#sobre' },
  { label: 'Missões',  href: '#projetos' },
  { label: 'Controle', href: '#contato' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [elapsed, setElapsed]     = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cronômetro de missão
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const missionTime = `T+${pad(h)}:${pad(m)}:${pad(s)}`

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#03030c]/90 backdrop-blur-md border-b border-[#ffffff08]' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo — identificação da nave */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316] group-hover:bg-[#6c63ff] group-hover:shadow-[0_0_8px_#6c63ff] transition-all" />
          <span
            className="text-white text-sm font-bold tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Prof. Física
          </span>
        </a>

        {/* Centro — cronômetro de missão */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-[#22d3ee] animate-pulse" />
          <span className="font-mono text-[10px] text-[#22d3ee]/60 tracking-[0.25em]">{missionTime}</span>
        </div>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="font-mono text-[11px] text-[#c8c8e8]/40 hover:text-white tracking-[0.25em] uppercase transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger mobile */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label="Menu"
        >
          <span className={`block w-5 h-px bg-[#c8c8e8] transition-transform duration-300 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-5 h-px bg-[#c8c8e8] transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-[#c8c8e8] transition-transform duration-300 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Menu mobile */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-[#03030c]/95 backdrop-blur-md ${menuOpen ? 'max-h-48 border-t border-[#ffffff08]' : 'max-h-0'}`}>
        <ul className="flex flex-col px-6 py-4 gap-4">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-mono text-xs text-[#c8c8e8]/50 hover:text-white tracking-widest uppercase transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
