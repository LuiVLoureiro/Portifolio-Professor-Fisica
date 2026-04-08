import { Suspense, useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Points, PointMaterial, Html } from '@react-three/drei'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import RocketFire from './RocketFire'

// Paleta de cores do foguete OBJ — mesma do Hero
const ROCKET_PALETTE = {
  aiStandardSurface1SG: { color: '#5a6898', metalness: 0.65, roughness: 0.35 },
  aiStandardSurface2SG: { color: '#f97316', metalness: 0.20, roughness: 0.55 },
  aiStandardSurface3SG: { color: '#e8eaf5', metalness: 0.30, roughness: 0.40 },
  aiStandardSurface4SG: { color: '#10204a', metalness: 0.55, roughness: 0.40 },
  aiStandardSurface5SG: { color: '#22d3ee', metalness: 0.15, roughness: 0.25, emissive: '#0a3040', emissiveIntensity: 0.6 },
  aiStandardSurface6SG: { color: '#a8b8d0', metalness: 0.70, roughness: 0.25 },
  aiStandardSurface7SG: { color: '#dc2626', metalness: 0.25, roughness: 0.55 },
  aiStandardSurface8SG: { color: '#f0f4ff', metalness: 0.85, roughness: 0.10 },
  aiStandardSurface9SG: { color: '#0a0c18', metalness: 0.75, roughness: 0.40 },
  initialShadingGroup:  { color: '#808898', metalness: 0.45, roughness: 0.50 },
}

function useReveal(threshold = 0.15, delay = 0) {
  const ref = useRef()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0px)' : 'translateY(40px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  }
  return [ref, style]
}

// ─── Three.js Scene ──────────────────────────────────────────────────────────

function BackgroundStars() {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(1200 * 3)
    for (let i = 0; i < 1200; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 60
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.008
  })
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#c8d0ff" size={0.04} sizeAttenuation depthWrite={false} opacity={0.5} />
    </Points>
  )
}

// Planeta geométrico — icosaedro com wireframe e núcleo brilhante
function MathPlanet() {
  const outerRef  = useRef()
  const innerRef  = useRef()
  const coreRef   = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.12
      outerRef.current.rotation.x = t * 0.04
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.08
      innerRef.current.rotation.z =  t * 0.06
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.3
    }
  })

  return (
    <group>
      {/* Atmosfera externa — transparência suave */}
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#6c63ff" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Camada externa — icosaedro de alta subdivisão */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[2.4, 2]} />
        <meshBasicMaterial color="#6c63ff" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Camada interna — icosaedro mais simples, rotação inversa */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.55} />
      </mesh>

      {/* Núcleo — octaedro brilhante no centro */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.9} />
      </mesh>

      {/* Ponto de luz central */}
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>
    </group>
  )
}

// Anel orbital com rotação própria
function OrbitalRing({ radius, tilt, speed, color, opacity = 0.3 }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.getElapsedTime() * speed
    ref.current.rotation.x = tilt
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 4, 120]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

// Partículas que orbitam o planeta
function OrbitalParticles({ radius, count, color, tilt, speed }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      arr[i * 3]     = Math.cos(angle) * radius
      arr[i * 3 + 1] = 0
      arr[i * 3 + 2] = Math.sin(angle) * radius
    }
    return arr
  }, [count, radius])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.getElapsedTime() * speed
    ref.current.rotation.x = tilt
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={0.06} sizeAttenuation depthWrite={false} opacity={0.85} />
    </Points>
  )
}


// Fórmulas matemáticas flutuando — Html do drei sobrepõe HTML em posições 3D
const formulas = [
  { pos: [ 3.5,  1.8,  0.5], label: 'E = mc²',        color: '#22d3ee' },
  { pos: [-3.8,  0.8,  1.0], label: 'F = ma',          color: '#a78bfa' },
  { pos: [ 1.2, -2.8,  2.0], label: 'ΔxΔp ≥ ℏ/2',    color: '#f97316' },
  { pos: [-2.0,  2.6, -1.5], label: 'E = hf',          color: '#22d3ee' },
  { pos: [ 0.5,  3.2, -2.5], label: '∇·E = ρ/ε₀',    color: '#a78bfa' },
  { pos: [-3.5, -1.5, -1.0], label: 'G = 6.674×10⁻¹¹', color: '#6c63ff' },
]

function MathLabels() {
  return (
    <>
      {formulas.map(({ pos, label, color }) => (
        <Html
          key={label}
          position={pos}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <span style={{
            fontFamily: "'Inter', monospace",
            fontSize: '10px',
            color,
            opacity: 0.75,
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            textShadow: `0 0 8px ${color}`,
          }}>
            {label}
          </span>
        </Html>
      ))}
    </>
  )
}

// Foguete OBJ em órbita real — mesmo canvas do planeta, depth testing automático
function OrbitingRocket({ scrollRef }) {
  const orbitRef = useRef()
  const matsRef  = useRef([])
  const obj = useLoader(OBJLoader, '/foguete/foguete.obj')

  const { model, offset } = useMemo(() => {
    const cloned = obj.clone(true)

    cloned.traverse((child) => {
      if (child.name === 'pPlane1') child.visible = false
    })

    const box = new THREE.Box3()
    cloned.traverse((child) => {
      if (child.isMesh && child.visible) box.expandByObject(child)
    })
    const size = box.getSize(new THREE.Vector3())
    cloned.scale.setScalar(1 / Math.max(size.x, size.y, size.z))

    const center = box.getCenter(new THREE.Vector3())
      .multiplyScalar(1 / Math.max(size.x, size.y, size.z))

    const matCache = {}
    const allMats  = []
    cloned.traverse((child) => {
      if (!child.isMesh || !child.visible) return
      const name = child.material?.name ?? 'initialShadingGroup'
      if (!matCache[name]) {
        const def = ROCKET_PALETTE[name] ?? ROCKET_PALETTE.initialShadingGroup
        matCache[name] = new THREE.MeshStandardMaterial({
          color: def.color, metalness: def.metalness ?? 0.5,
          roughness: def.roughness ?? 0.4,
          emissive: def.emissive ?? '#000000',
          emissiveIntensity: def.emissiveIntensity ?? 0,
          transparent: true, opacity: 0,
        })
        allMats.push(matCache[name])
      }
      child.material = matCache[name]
    })
    matsRef.current = allMats

    return { model: cloned, offset: center }
  }, [obj])

  useFrame(({ clock }) => {
    if (!orbitRef.current) return
    const t = scrollRef.current

    // Fade-in ao entrar na seção About (t: 0.85 → 1.1)
    const scrollOpacity = Math.max(0, Math.min(1, (t - 0.85) / 0.25))
    if (scrollOpacity === 0) {
      matsRef.current.forEach(m => { m.opacity = 0 })
      return
    }

    const ot = clock.getElapsedTime() * 0.22
    const r  = 4.2

    const px = Math.cos(ot) * r
    const py = Math.sin(ot * 0.4) * 0.9
    const pz = Math.sin(ot) * r

    orbitRef.current.position.set(px, py, pz)
    orbitRef.current.rotation.y = Math.atan2(-Math.sin(ot), Math.cos(ot))
    orbitRef.current.rotation.z = Math.PI / 2
    orbitRef.current.rotation.x = 0

    // ── Oclusão pelo planeta ──────────────────────────────────────────────
    // A câmera está em z=9 olhando para z=0 (origem = centro do planeta).
    // Quando pz > 0 o foguete está entre a câmera e o planeta → visível.
    // Quando pz < 0 o foguete está no lado oposto → atrás do planeta.
    // Transição suave de pz=0 (lateral) até pz=-PLANET_R (totalmente atrás).
    const PLANET_R = 2.4
    const behind = Math.max(0, Math.min(1, -pz / PLANET_R))
    matsRef.current.forEach(m => { m.opacity = scrollOpacity * (1 - behind) })
  })

  return (
    <group ref={orbitRef} scale={0.42}>
      <primitive object={model} position={[-offset.x, -offset.y, -offset.z]} />
      {/* tailY=-0.5 = metade inferior do foguete normalizado em 1u (pre-scale) */}
      <RocketFire tailY={-0.5} scale={0.45} count={160} scrollRef={scrollRef} />
    </group>
  )
}

function PlanetScene({ scrollRef }) {
  return (
    <>
      {/* Luzes para o MeshStandardMaterial do foguete */}
      <ambientLight intensity={0.5} color="#dde8ff" />
      <pointLight position={[6, 6, 6]}   intensity={60} color="#c8d8ff" />
      <pointLight position={[-5, -3, -5]} intensity={20} color="#a78bfa" />

      <BackgroundStars />
      <MathPlanet />
      <OrbitalRing radius={3.2} tilt={0.3} speed={0.20} color="#6c63ff" opacity={0.35} />
      <OrbitalRing radius={3.8} tilt={1.1} speed={-0.14} color="#22d3ee" opacity={0.25} />
      <OrbitalRing radius={4.5} tilt={1.8} speed={0.09} color="#a78bfa" opacity={0.18} />
      <OrbitalParticles radius={3.2} count={60}  color="#6c63ff" tilt={0.3}  speed={0.20} />
      <OrbitalParticles radius={3.8} count={40}  color="#22d3ee" tilt={1.1}  speed={-0.14} />
      <OrbitalParticles radius={4.5} count={28}  color="#a78bfa" tilt={1.8}  speed={0.09} />
      <MathLabels />
      <Suspense fallback={null}>
        <OrbitingRocket scrollRef={scrollRef} />
      </Suspense>
    </>
  )
}

// ─── Seção ───────────────────────────────────────────────────────────────────

const skills = [
  { label: 'Mecânica Clássica',         level: 95, formula: 'F = ma' },
  { label: 'Eletromagnetismo',           level: 90, formula: '∇×B = μ₀J' },
  { label: 'Física Moderna',             level: 85, formula: 'E = hf' },
  { label: 'Termodinâmica',              level: 88, formula: 'ΔS ≥ 0' },
  { label: 'Simulações Computacionais',  level: 80, formula: '∂²u/∂t²' },
  { label: 'Didática & Pedagogia',       level: 92, formula: '∑ alunos' },
]

const timeline = [
  {
    year: '2024 – atual',
    title: 'Professor de Física',
    place: 'Escola Estadual X',
    desc: 'Ensino médio e pré-vestibular com foco em metodologias ativas e simulações digitais.',
  },
  {
    year: '2022',
    title: 'Mestrado em Física Aplicada',
    place: 'Universidade Federal Y',
    desc: 'Dissertação sobre modelagem computacional de sistemas oscilatórios não-lineares.',
  },
  {
    year: '2019',
    title: 'Licenciatura em Física',
    place: 'Universidade Federal Y',
    desc: 'Graduação com ênfase em física teórica e iniciação científica em óptica quântica.',
  },
]

function SkillBar({ label, level, formula, index = 0 }) {
  const [ref, style] = useReveal(0.1, index * 80)
  return (
    <div ref={ref} className="group" style={style}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[11px] text-[#c8c8e8]/45 tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-[#6c63ff]/50">{formula}</span>
          <span className="font-mono text-[11px] text-[#22d3ee]/60">{level}%</span>
        </div>
      </div>
      <div className="relative h-px w-full bg-[#ffffff08]">
        <div
          className="absolute left-0 top-0 h-full transition-[width] duration-[1.2s] ease-out"
          style={{
            width: style.opacity === 0 ? '0%' : `${level}%`,
            background: 'linear-gradient(90deg, #6c63ff, #22d3ee)',
            boxShadow: '0 0 6px #22d3ee50',
            transitionDelay: `${index * 80 + 300}ms`,
          }}
        />
      </div>
    </div>
  )
}

function LogItem({ item, last, index = 0 }) {
  const [ref, style] = useReveal(0.1, index * 120)
  return (
    <div ref={ref} className="relative pl-8" style={style}>
      {!last && <div className="absolute left-[5px] top-4 h-full w-px bg-[#ffffff08]" />}
      <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#22d3ee]"
        style={{ boxShadow: '0 0 8px #22d3ee' }} />
      <p className="font-mono text-[9px] text-[#22d3ee]/50 tracking-[0.3em] uppercase mb-0.5">{item.year}</p>
      <h4 className="text-white text-sm font-bold mb-0.5 uppercase"
        style={{ fontFamily: "'Oswald', sans-serif" }}>{item.title}</h4>
      <p className="font-mono text-[10px] text-[#c8c8e8]/25 mb-1.5">{item.place}</p>
      <p className="text-[#c8c8e8]/45 text-sm leading-relaxed">{item.desc}</p>
    </div>
  )
}

export default function About({ scrollRef }) {
  const [refHeading, styleHeading] = useReveal(0.2, 0)
  const [refQuote, styleQuote]     = useReveal(0.2, 0)
  const [refStats, styleStats]     = useReveal(0.2, 100)

  return (
    <section id="sobre" className="relative bg-[#04040f] overflow-hidden">

      {/* Separador superior */}
      <div className="absolute top-0 left-0 w-full h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #22d3ee20, transparent)' }} />

      {/* ── Canvas Three.js — Planeta da Matemática ─────────────────────── */}
      <div className="relative w-full h-[65vh] min-h-[480px]">
        <Canvas camera={{ position: [0, 1.5, 9], fov: 52 }}>
          <PlanetScene scrollRef={scrollRef} />
        </Canvas>

        {/* Fade inferior — funde com o conteúdo abaixo */}
        <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #04040f)' }} />

        {/* Indicador de fase — sobreposto no canvas */}
        <div ref={refHeading} className="absolute top-8 left-6 md:left-10" style={styleHeading}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#22d3ee]" style={{ boxShadow: '0 0 8px #22d3ee' }} />
            <span className="font-mono text-[10px] text-[#22d3ee]/60 tracking-[0.3em] uppercase">
              Fase 01 — O Planeta da Matemática
            </span>
          </div>
          <h2
            className="text-4xl md:text-6xl font-bold text-white uppercase leading-none"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            A Linguagem<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #22d3ee, #6c63ff)' }}>
              do Universo
            </span>
          </h2>
        </div>

        {/* Telemetria do planeta — canto direito */}
        <div className="absolute top-8 right-6 md:right-10 text-right space-y-1 select-none">
          <p className="font-mono text-[9px] text-[#c8c8e8]/20 tracking-widest">OBJETO DETECTADO</p>
          <p className="font-mono text-[10px] text-[#22d3ee]/40">Planeta Classe-M</p>
          <p className="font-mono text-[9px] text-[#c8c8e8]/15">Comp. orbital: 4.2 AU</p>
          <p className="font-mono text-[9px] text-[#6c63ff]/40">∞ equações ativas</p>
        </div>
      </div>

      {/* ── Conteúdo textual ─────────────────────────────────────────────── */}
      <div className="relative px-6 pb-32">
        <div className="max-w-5xl mx-auto">

          {/* Frase conceitual */}
          <div ref={refQuote} className="border-l-2 border-[#22d3ee]/20 pl-5 mb-16 max-w-2xl" style={styleQuote}>
            <p className="text-[#c8c8e8]/50 text-base leading-relaxed mb-3">
              A matemática não é uma invenção humana — é a linguagem que o universo
              escolheu para existir. Cada órbita, cada onda, cada partícula obedece
              equações que podem ser escritas em uma linha.
            </p>
            <p className="text-[#c8c8e8]/35 text-sm leading-relaxed">
              Meu trabalho é traduzir essa linguagem para que qualquer pessoa
              possa ler o que o cosmos está dizendo.
            </p>
          </div>

          {/* Stats de telemetria */}
          <div ref={refStats} className="grid grid-cols-3 gap-3 mb-16 max-w-lg" style={styleStats}>
            {[
              { value: '5+',  label: 'Anos de Missão',      unit: 'anos'     },
              { value: '300+',label: 'Tripulantes Formados', unit: 'alunos'   },
              { value: '6',   label: 'Missões Ativas',       unit: 'projetos' },
            ].map(({ value, label, unit }) => (
              <div key={label} className="relative rounded-xl border border-[#ffffff08] bg-[#070714] p-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, #22d3ee30, transparent)' }} />
                <p className="font-mono text-[8px] text-[#22d3ee]/30 tracking-widest uppercase mb-1">{unit}</p>
                <p className="text-2xl font-bold text-white leading-none"
                  style={{ fontFamily: "'Oswald', sans-serif" }}>{value}</p>
                <p className="font-mono text-[9px] text-[#c8c8e8]/20 mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Grid: skills + timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Diagnóstico de sistemas */}
            <div>
              <div className="flex items-center gap-3 mb-7">
                <span className="font-mono text-[9px] text-[#22d3ee]/40 tracking-[0.3em] uppercase">Diagnóstico de Sistemas</span>
                <div className="h-px flex-1 bg-[#ffffff06]" />
              </div>
              <div className="space-y-5">
                {skills.map((s, i) => <SkillBar key={s.label} {...s} index={i} />)}
              </div>
            </div>

            {/* Log de missão */}
            <div>
              <div className="flex items-center gap-3 mb-7">
                <span className="font-mono text-[9px] text-[#22d3ee]/40 tracking-[0.3em] uppercase">Log de Missão</span>
                <div className="h-px flex-1 bg-[#ffffff06]" />
              </div>
              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <LogItem key={item.year} item={item} last={i === timeline.length - 1} index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
