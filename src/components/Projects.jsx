import { useState } from 'react'

const projects = [
  {
    id: '01',
    title: 'Simulador MUV',
    description: 'Simulação interativa de Movimento Uniformemente Variado com controle de aceleração, velocidade inicial e tempo. Gráficos gerados em tempo real.',
    tags: ['Cinemática', 'JavaScript', 'Canvas'],
    accent: '#a78bfa',
    status: 'ÓRBITA ATIVA',
    featured: true,
  },
  {
    id: '02',
    title: 'Pêndulo Interativo',
    description: 'Oscilações com ajuste de comprimento, massa e amortecimento. Demonstra conservação de energia e período em função do comprimento.',
    tags: ['Oscilações', 'Three.js', 'React'],
    accent: '#22d3ee',
    status: 'TRANSMITINDO',
  },
  {
    id: '03',
    title: 'Ciclo de Carnot',
    description: 'Diagrama P-V animado com cálculo de eficiência, trabalho e calor trocado. Ideal para aulas de termodinâmica.',
    tags: ['Termodinâmica', 'SVG', 'Educação'],
    accent: '#f87171',
    status: 'EM ANÁLISE',
  },
  {
    id: '04',
    title: 'Óptica Geométrica',
    description: 'Traçado de raios em lentes convergentes e divergentes. Determina imagem real ou virtual por objeto arrastável.',
    tags: ['Óptica', 'Canvas', 'WebGL'],
    accent: '#34d399',
    status: 'OPERACIONAL',
  },
  {
    id: '05',
    title: 'Campo Elétrico 2D',
    description: 'Visualização vetorial de campos elétricos com cargas posicionáveis. Exibe linhas de campo em tempo real.',
    tags: ['Eletrostática', 'Three.js', 'Física'],
    accent: '#fbbf24',
    status: 'OPERACIONAL',
  },
  {
    id: '06',
    title: 'Relatividade Especial',
    description: 'Dilatação do tempo e contração do espaço em função da velocidade como fração de c.',
    tags: ['Relatividade', 'React', 'Visualização'],
    accent: '#818cf8',
    status: 'TRANSMITINDO',
  },
]

const allTags = ['Todos', ...new Set(projects.flatMap(p => p.tags))]

function MissionCard({ project, featured = false }) {
  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-[#ffffff08] bg-[#060613] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${featured ? 'sm:col-span-2' : ''}`}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 40px -10px ${project.accent}25`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Linha colorida superior — identificação da missão */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 0%, ${project.accent}70 40%, ${project.accent}70 60%, transparent 100%)` }} />

      {/* Glow de fundo no hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${project.accent}08, transparent)` }} />

      <div className={`relative z-10 flex flex-col h-full p-5 ${featured ? 'md:p-7' : ''}`}>

        {/* Header da missão */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-0.5">
            <p className="font-mono text-[9px] text-[#c8c8e8]/25 tracking-[0.3em] uppercase">Missão {project.id}</p>
            <h3
              className={`font-bold text-white leading-tight uppercase ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {project.title}
            </h3>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: project.accent, boxShadow: `0 0 5px ${project.accent}` }} />
            <span className="font-mono text-[8px] tracking-widest" style={{ color: `${project.accent}80` }}>{project.status}</span>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px mb-4" style={{ background: `${project.accent}20` }} />

        {/* Descrição */}
        <p className={`text-[#c8c8e8]/45 leading-relaxed flex-1 mb-5 ${featured ? 'text-sm md:text-base' : 'text-sm'}`}>
          {project.description}
        </p>

        {/* Footer */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map(tag => (
              <span
                key={tag}
                className="font-mono text-[9px] px-2 py-0.5 rounded border border-[#ffffff08] bg-[#03030c]/60 tracking-widest"
                style={{ color: `${project.accent}80` }}
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href="#"
            className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0"
            style={{ color: project.accent }}
          >
            Acessar ›
          </a>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const [active, setActive] = useState('Todos')

  const filtered = active === 'Todos' ? projects : projects.filter(p => p.tags.includes(active))

  return (
    <section id="projetos" className="relative py-32 px-6 bg-[#03030c] overflow-hidden">

      {/* Separador de fase */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, #6c63ff20, transparent)' }} />

      {/* Estrelas de fundo estáticas — estamos em órbita, velocidade menor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:  `${Math.random() * 1.5 + 0.5}px`,
              height: `${Math.random() * 1.5 + 0.5}px`,
              top:    `${Math.random() * 100}%`,
              left:   `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto">

        {/* Cabeçalho de fase */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-2 h-2 rounded-full bg-[#6c63ff] shadow-[0_0_8px_#6c63ff]" />
            <span className="font-mono text-[10px] text-[#6c63ff]/60 tracking-[0.3em] uppercase">Fase 02 — Órbita de Missão</span>
          </div>
          <h2
            className="text-4xl md:text-6xl font-bold text-white uppercase leading-none"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            Missões
          </h2>
          <p className="font-mono text-xs text-[#c8c8e8]/20 mt-3 tracking-widest">
            Altitude: 408 km · Inclinação: 51.6° · Período: 92.68 min
          </p>
        </div>

        {/* Filtro — painel de controle de missões */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          <span className="font-mono text-[9px] text-[#c8c8e8]/20 tracking-widest uppercase mr-2">Filtrar:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActive(tag)}
              className={`font-mono text-[10px] px-3.5 py-1 rounded border tracking-[0.2em] uppercase transition-all duration-200 ${
                active === tag
                  ? 'border-[#6c63ff]/50 bg-[#6c63ff]/10 text-[#a78bfa]'
                  : 'border-[#ffffff08] text-[#c8c8e8]/25 hover:border-[#6c63ff]/25 hover:text-[#c8c8e8]/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((project, i) => (
            <MissionCard
              key={project.id}
              project={project}
              featured={i === 0 && active === 'Todos'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
