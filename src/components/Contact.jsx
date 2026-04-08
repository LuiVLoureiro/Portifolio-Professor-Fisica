import { useState } from 'react'

const channels = [
  {
    label: 'E-mail',
    value: 'professor@email.com',
    href: 'mailto:professor@email.com',
    freq: '2.4 GHz',
    status: 'ATIVO',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/prof-fisica',
    href: '#',
    freq: '5.0 GHz',
    status: 'ATIVO',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.869 0-2.155 1.46-2.155 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.844-1.563 3.042 0 3.604 2.003 3.604 4.608v5.588z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    value: 'github.com/prof-fisica',
    href: '#',
    freq: '1.2 GHz',
    status: 'ATIVO',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    value: 'youtube.com/@prof-fisica',
    href: '#',
    freq: '3.6 GHz',
    status: 'ATIVO',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

const INITIAL = { name: '', email: '', subject: '', message: '' }

function Field({ label, name, type, placeholder, value, onChange, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[9px] text-[#f97316]/40 tracking-[0.35em] uppercase">{label}</label>
      <input
        type={type} name={name} placeholder={placeholder}
        value={value} onChange={onChange} required={required}
        className="w-full rounded border border-[#ffffff08] bg-[#060613] px-4 py-3 font-mono text-xs text-[#c8c8e8] placeholder-[#c8c8e8]/12 focus:outline-none focus:border-[#f97316]/30 transition-colors"
      />
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL)
  const [status, setStatus] = useState('idle')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    setTimeout(() => { setStatus('sent'); setForm(INITIAL) }, 1500)
  }

  return (
    <section id="contato" className="relative py-32 px-6 bg-[#04040f] overflow-hidden">

      {/* Separador de fase */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, #f9731620, transparent)' }} />

      {/* Glow laranja de reentrada — voltando para a Terra */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 100%, #f9731608, transparent)' }} />

      {/* Grade de fundo */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="max-w-5xl mx-auto">

        {/* Cabeçalho de fase */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
            <span className="font-mono text-[10px] text-[#f97316]/60 tracking-[0.3em] uppercase">Fase 03 — Reentrada & Retorno</span>
          </div>
          <h2
            className="text-4xl md:text-6xl font-bold text-white uppercase leading-none"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Central de Missões
          </h2>
          <p className="font-mono text-xs text-[#c8c8e8]/20 mt-3 tracking-widest">
            Sinal: FORTE · Latência: 250ms · Protocolo: TRANSMISSÃO ABERTA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

          {/* Canais de comunicação */}
          <div className="lg:col-span-2 space-y-10">
            <p className="text-[#c8c8e8]/40 text-sm leading-relaxed border-l-2 border-[#f97316]/20 pl-4">
              Missão concluída. Canais de comunicação abertos para debriefing,
              parcerias ou qualquer transmissão que queira enviar de volta à base.
            </p>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[9px] text-[#f97316]/40 tracking-[0.3em] uppercase">Canais de Comunicação</span>
                <div className="h-px flex-1 bg-[#ffffff06]" />
              </div>
              <div className="space-y-2">
                {channels.map(({ label, value, href, freq, status: chStatus, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="group flex items-center gap-3 p-3 rounded border border-[#ffffff06] bg-[#060613] hover:border-[#f97316]/20 transition-all duration-200"
                  >
                    {/* Sinal de rádio */}
                    <div className="relative w-3 h-3 shrink-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_4px_#22d3ee]" />
                      <div className="absolute w-3 h-3 rounded-full border border-[#22d3ee]/30 animate-ping" />
                    </div>
                    <span className="text-[#f97316]/50 group-hover:text-[#f97316]/80 transition-colors">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[8px] text-[#c8c8e8]/20 tracking-widest uppercase">{label}</p>
                      <p className="font-mono text-[11px] text-[#c8c8e8]/45 group-hover:text-white transition-colors truncate">{value}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-[8px] text-[#f97316]/30">{freq}</p>
                      <p className="font-mono text-[8px] text-[#22d3ee]/40">{chStatus}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Terminal de transmissão */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[9px] text-[#f97316]/40 tracking-[0.3em] uppercase">Terminal de Transmissão</span>
              <div className="h-px flex-1 bg-[#ffffff06]" />
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/60 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]/20 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Identificação" name="name" type="text" placeholder="Seu nome" value={form.name} onChange={handleChange} required />
              <Field label="Freq. de Retorno" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <Field label="Assunto da Transmissão" name="subject" type="text" placeholder="Sobre o que quer falar?" value={form.subject} onChange={handleChange} required />

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-[#f97316]/40 tracking-[0.35em] uppercase">Conteúdo</label>
              <textarea
                name="message" rows={5} placeholder="Escreva sua mensagem..."
                value={form.message} onChange={handleChange} required
                className="w-full rounded border border-[#ffffff08] bg-[#060613] px-4 py-3 font-mono text-xs text-[#c8c8e8] placeholder-[#c8c8e8]/12 focus:outline-none focus:border-[#f97316]/30 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              className="w-full py-3 rounded border border-[#f97316]/30 bg-[#f97316]/8 hover:bg-[#f97316]/15 disabled:opacity-50 font-mono text-[11px] text-[#f97316]/70 tracking-[0.3em] uppercase transition-all duration-200 flex items-center justify-center gap-2"
            >
              {status === 'idle'    && '⟶  Enviar Transmissão'}
              {status === 'sending' && (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Transmitindo...
                </>
              )}
              {status === 'sent'    && '✓  Sinal Recebido'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer — créditos finais da missão */}
      <div className="max-w-5xl mx-auto mt-28 pt-8 border-t border-[#ffffff06]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]/60" style={{ boxShadow: '0 0 5px #f97316' }} />
            <p className="font-mono text-[9px] text-[#c8c8e8]/15 tracking-widest uppercase">
              © {new Date().getFullYear()} Prof. Física · Missão Concluída
            </p>
          </div>
          <p className="font-mono text-[9px] text-[#c8c8e8]/10 tracking-widest uppercase">
            React · Three.js · Tailwind CSS
          </p>
        </div>
      </div>
    </section>
  )
}
