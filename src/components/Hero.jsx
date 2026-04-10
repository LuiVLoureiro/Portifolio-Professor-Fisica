import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'
import RocketFire from './RocketFire'

// ── Utility ──────────────────────────────────────────────────────────────────

function remap(v, a, b, c, d) {
  return c + (d - c) * Math.max(0, Math.min(1, (v - a) / (b - a)))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// ── Scroll fade para o conteúdo HTML do hero ─────────────────────────────────

function useScrollFade() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const progress = typeof window !== 'undefined'
    ? Math.min(1, scrollY / (window.innerHeight * 0.55))
    : 0
  return {
    opacity: Math.max(0, 1 - progress * 1.4),
    transform: `translateY(${-progress * 70}px)`,
    pointerEvents: progress > 0.9 ? 'none' : 'auto',
  }
}

// ── Estrelas em warp ──────────────────────────────────────────────────────────

function WarpField() {
  const ref = useRef()
  const count = 3000

  const { positions, velocities } = useMemo(() => {
    const positions  = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = -(Math.random() * 80)
      velocities[i] = 0.08 + Math.random() * 0.35
    }
    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 2] += velocities[i]
      if (pos.array[i * 3 + 2] > 6) {
        pos.array[i * 3]     = (Math.random() - 0.5) * 40
        pos.array[i * 3 + 1] = (Math.random() - 0.5) * 40
        pos.array[i * 3 + 2] = -80
      }
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#dde8ff" size={0.05} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
    </points>
  )
}

// ── Partículas de exaustão ────────────────────────────────────────────────────

function ExhaustField() {
  const ref = useRef()
  const count = 600

  const { positions, velocities } = useMemo(() => {
    const positions  = new Float32Array(count * 3)
    const velocities = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 3
      positions[i * 3 + 1] = -4 - Math.random() * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3
      velocities[i] = 0.02 + Math.random() * 0.06
    }
    return { positions, velocities }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] -= velocities[i]
      if (pos.array[i * 3 + 1] < -14) {
        pos.array[i * 3]     = (Math.random() - 0.5) * 3
        pos.array[i * 3 + 1] = -4
        pos.array[i * 3 + 2] = (Math.random() - 0.5) * 3
      }
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f97316" size={0.07} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
    </points>
  )
}

// ── Canvas de fundo do hero (estrelas + exaustão, sem foguete) ───────────────

function BackgroundScene() {
  return (
    <>
      <WarpField />
      <ExhaustField />
    </>
  )
}

// ── Paleta de cores por material (nomes vêm dos usemtl do OBJ) ───────────────
//
// Os materiais Arnold (aiStandardSurface) exportam com Kd=0 no MTL,
// por isso atribuímos manualmente com base no nome e frequência de uso:
//   3SG (27×) corpo branco principal  |  6SG (24×) painéis prateados
//   4SG (24×) estrutura azul-escuro   |  1SG (22×) secundário azul-roxo
//   2SG (8×)  acentos laranja         |  7SG (7×)  motor/vermelho
//   9SG (5×)  exaustão/preto         |  8SG/5SG   detalhes cromados/ciano
//
const ROCKET_PALETTE = {
  // Corpo branco principal (27×) — pérola brilhante com tom azul frio
  aiStandardSurface3SG: { color: '#d8e8ff', metalness: 0.50, roughness: 0.28 },
  // Painéis prateados (24×) — prata polida de alta refletividade
  aiStandardSurface6SG: { color: '#b0c8e8', metalness: 0.88, roughness: 0.14 },
  // Estrutura azul-escuro (24×) — azul marinho profundo
  aiStandardSurface4SG: { color: '#0a1a48', metalness: 0.65, roughness: 0.32 },
  // Secundário azul-índigo (22×) — índigo vibrante
  aiStandardSurface1SG: { color: '#3858d0', metalness: 0.72, roughness: 0.28 },
  // Acentos laranja (8×) — laranja quente com glow suave
  aiStandardSurface2SG: { color: '#ff8820', metalness: 0.12, roughness: 0.42, emissive: '#7a3500', emissiveIntensity: 0.5 },
  // Detalhes ciano (5×) — ciano elétrico com forte emissive
  aiStandardSurface5SG: { color: '#00e5ff', metalness: 0.10, roughness: 0.18, emissive: '#004860', emissiveIntensity: 1.0 },
  // Motor/vermelho (7×) — vermelho vivo com glow de calor
  aiStandardSurface7SG: { color: '#ff2828', metalness: 0.18, roughness: 0.42, emissive: '#6a0000', emissiveIntensity: 0.6 },
  // Detalhes cromados (5×) — cromo quase branco, muito metálico
  aiStandardSurface8SG: { color: '#ecf4ff', metalness: 0.95, roughness: 0.05 },
  // Exaustão/preto (5×) — preto com reflexo azul profundo
  aiStandardSurface9SG: { color: '#05080f', metalness: 0.82, roughness: 0.30 },
  // Fallback
  initialShadingGroup:  { color: '#6878a8', metalness: 0.52, roughness: 0.45 },
}

// ── Modelo 3D do foguete ──────────────────────────────────────────────────────
//
// Animação baseada em scroll (t = scrollY / innerHeight):
//
//  t = 0.00 → foguete à direita, quase vertical — pronto para lançar
//  t = 0.55 → texto desaparece — foguete centraliza e inclina
//  t = 1.00 → fim do hero — foguete quase horizontal, voando
//  t = 1.80 → foguete zooma em direção à câmera (fly-through)
//  t = 2.10 → foguete some — a jornada começou
//
function RocketModel({ scrollRef }) {
  const groupRef   = useRef()
  const matsRef    = useRef([])
  const smoothTRef = useRef(0)
  const launchRef  = useRef({ triggered: false, startTime: 0 })
  const obj = useLoader(OBJLoader, '/foguete/foguete.obj')

  const { model, offset, tailY, mats } = useMemo(() => {
    const cloned = obj.clone(true)

    // Remove plano de lançamento (distorce o bounding box)
    cloned.traverse((child) => {
      if (child.name === 'pPlane1') child.visible = false
    })

    // Bounding box só do foguete
    const box = new THREE.Box3()
    cloned.traverse((child) => {
      if (child.isMesh && child.visible) box.expandByObject(child)
    })

    const size   = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale  = 3.5 / maxDim
    cloned.scale.setScalar(scale)

    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale)

    // Cauda real = borda inferior do bounding box após centralização
    // tailY = box.min.y * scale - center.y = scale * (box.min.y - center_original.y)
    //       = -(scale * size.y / 2)
    const tailY = -(scale * size.y / 2)

    // Um material por nome único — reutilizado entre meshes do mesmo grupo
    const matCache = {}
    const allMats  = []

    function buildMat(name) {
      if (matCache[name]) return matCache[name]
      const def = ROCKET_PALETTE[name] ?? ROCKET_PALETTE.initialShadingGroup
      const mat = new THREE.MeshStandardMaterial({
        color:             def.color,
        metalness:         def.metalness         ?? 0.5,
        roughness:         def.roughness         ?? 0.4,
        emissive:          def.emissive          ?? '#000000',
        emissiveIntensity: def.emissiveIntensity ?? 0,
        transparent: true,
        opacity: 1,
      })
      matCache[name] = mat
      allMats.push(mat)
      return mat
    }

    cloned.traverse((child) => {
      if (!child.isMesh || !child.visible) return

      // O OBJLoader cria material como Array quando o mesmo grupo
      // contém múltiplos usemtl — é preciso tratar os dois casos.
      if (Array.isArray(child.material)) {
        child.material = child.material.map(m =>
          buildMat(m?.name ?? 'initialShadingGroup')
        )
      } else {
        child.material = buildMat(child.material?.name ?? 'initialShadingGroup')
      }
      child.castShadow = true
    })

    return { model: cloned, offset: center, tailY, mats: allMats }
  }, [obj])

  useEffect(() => { matsRef.current = mats })

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return

    const tDirect = scrollRef.current
    const lerpFactor = Math.min(1, 10 * delta)
    smoothTRef.current = lerp(smoothTRef.current, tDirect, lerpFactor)
    const tSmooth = smoothTRef.current

    // Reset phase 2 se o usuário rolar de volta ao topo
    if (tSmooth < 0.05 && launchRef.current.triggered) {
      launchRef.current.triggered = false
      launchRef.current.startTime = 0
    }

    // Threshold: dispara o lançamento quando o foguete chegou ao tamanho mínimo
    const TRIGGER_T = 0.22

    if (!launchRef.current.triggered && tSmooth >= TRIGGER_T) {
      launchRef.current.triggered = true
      launchRef.current.startTime = clock.getElapsedTime()
    }

    groupRef.current.rotation.y = -(25 * Math.PI / 180)
    groupRef.current.rotation.z = -0.10

    if (launchRef.current.triggered) {
      // ── Fase 2: lançamento em alta velocidade para o topo ─────────────────
      const elapsed = clock.getElapsedTime() - launchRef.current.startTime

      // Posição de partida (onde a fase 1 parou em TRIGGER_T)
      const pBase  = Math.min(1, TRIGGER_T / 0.55)
      const pxBase = lerp(1.8, 0.0, pBase)
      const pzBase = lerp(0.0, -7.0, pBase)

      // Aceleração quadrática para cima — foguete dispara em alta velocidade
      const py = elapsed * elapsed * 35
      groupRef.current.position.set(pxBase, py, pzBase)

      // Endereiça o foguete de volta ao vertical conforme sobe
      groupRef.current.rotation.x = lerp(-Math.PI / 4, 0.1, Math.min(1, elapsed * 4))

      // Fade-out rápido
      const opacity = Math.max(0, 1 - elapsed * 6)
      matsRef.current.forEach(m => { m.opacity = opacity })

    } else {
      // ── Fase 1: animação dirigida pelo scroll ──────────────────────────────
      const pSmooth = Math.min(1, tSmooth / 0.55)
      groupRef.current.rotation.x = lerp(0.05, -Math.PI / 4, pSmooth)

      const px = lerp(1.8, 0.0, pSmooth)
      const pz = lerp(0.0, -7.0, pSmooth)
      groupRef.current.position.set(px, 0.0, pz)

      // Mantém o foguete visível durante toda a fase 1
      matsRef.current.forEach(m => { m.opacity = 1 })
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={model} position={[-offset.x, -offset.y, -offset.z]} />
      <RocketFire tailY={tailY} scale={0.45} count={160} />
    </group>
  )
}

// ── Canvas fixo do foguete — sobrepõe todas as seções ────────────────────────

function RocketOverlay({ scrollRef }) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // Polling via RAF — Lenis não dispara scroll nativo
    let prev = false
    let rafId
    const poll = () => {
      // Hero tem exatamente h-screen → some quando t >= 1.0
      const nowHidden = scrollRef.current >= 1.0
      if (nowHidden !== prev) { prev = nowHidden; setHidden(nowHidden) }
      rafId = requestAnimationFrame(poll)
    }
    rafId = requestAnimationFrame(poll)
    return () => cancelAnimationFrame(rafId)
  }, [scrollRef])

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 20, display: hidden ? 'none' : 'block' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} color="#c8d8ff" />
        {/* Luz principal frontal — ilumina pérola e cromo */}
        <pointLight position={[-1, 2, 4]} intensity={100} color="#d8eaff" />
        {/* Glow de propulsor laranja — aquece o motor */}
        <pointLight position={[0, -2, 1]} intensity={70} color="#ff8820" />
        {/* Rim light índigo — contrasta o lado escuro */}
        <pointLight position={[4, 1, -2]} intensity={40} color="#6070ff" />
        {/* Contraluz ciano — acende os detalhes emissivos */}
        <pointLight position={[-3, 0, -3]} intensity={20} color="#00e5ff" />
        <Suspense fallback={null}>
          <RocketModel scrollRef={scrollRef} />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ── Contador regressivo ───────────────────────────────────────────────────────

function useCountdown(from = 5) {
  const [count, setCount] = useState(from)
  useEffect(() => {
    if (count <= 0) return
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count])
  return { count, launched: count <= 0 }
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export default function Hero({ scrollRef }) {
  const { count, launched } = useCountdown(5)
  const fadeStyle = useScrollFade()

  return (
    <>
      <section className="relative h-screen w-full overflow-hidden bg-[#03030c] flex items-center justify-center">

        {/* Canvas de fundo — estrelas e exaustão (sem foguete) */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <BackgroundScene />
          </Canvas>
        </div>

        {/* Glow de exaustão na base */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, #f9731620, #ea580c0a, transparent)' }}
        />

        {/* Vignette — janela do cockpit */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, #03030c 100%)' }}
        />

        {/* Fade inferior */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#03030c] to-transparent pointer-events-none z-[3]" />

        {/* HUD — superior esquerdo */}
        <div
          className="absolute top-20 left-6 md:left-10 space-y-1 select-none z-10 transition-[opacity,transform] duration-100"
          style={fadeStyle}
        >
          <p className="font-mono text-[9px] text-[#f97316]/50 tracking-[0.2em] uppercase">Propulsão</p>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${launched ? 'bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]' : 'bg-[#f97316] shadow-[0_0_6px_#f97316] animate-pulse'}`} />
            <span className="font-mono text-[10px] text-[#c8c8e8]/30">
              {launched ? 'PROPULSÃO ATIVA' : 'IGNIÇÃO PENDENTE'}
            </span>
          </div>
          <p className="font-mono text-[9px] text-[#c8c8e8]/20">ALT 408 km · 7.66 km/s</p>
        </div>

        {/* HUD — superior direito */}
        <div
          className="absolute top-20 right-6 md:right-10 text-right space-y-1 select-none z-10 transition-[opacity,transform] duration-100"
          style={fadeStyle}
        >
          <p className="font-mono text-[9px] text-[#22d3ee]/50 tracking-[0.2em] uppercase">Destino</p>
          <p className="font-mono text-[10px] text-[#c8c8e8]/30">RA 05h 34m · DEC +22°</p>
          <p className="font-mono text-[9px] text-[#c8c8e8]/20">Nébula do Caranguejo</p>
        </div>

        {/* Conteúdo central — fica atrás do foguete (z-10 < z-20 do canvas fixo) */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto gap-5 transition-[opacity,transform] duration-100"
          style={fadeStyle}
        >
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#f97316]/60" />
            <span
              className="font-mono text-[11px] tracking-[0.35em] uppercase"
              style={{ color: launched ? '#22d3ee' : '#f97316' }}
            >
              {launched ? '— Em Órbita —' : `Ignição em T-${count}`}
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#f97316]/60" />
          </div>

          <h1
            className="text-5xl sm:text-7xl md:text-[clamp(4rem,10vw,8rem)] font-bold text-white leading-[0.95] tracking-tight"
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            FÍSICA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] via-[#a78bfa] to-[#22d3ee]">
              ALÉM
            </span>
            <br />
            DA SALA DE AULA
          </h1>

          <p className="text-[#c8c8e8]/45 text-sm md:text-base leading-relaxed max-w-lg font-mono">
            Uma viagem pelo universo da física — projetos, simulações e materiais
            que transformam o impossível em compreensível.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              href="#projetos"
              className="px-8 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-mono text-xs tracking-[0.25em] uppercase transition-all duration-200 hover:shadow-lg hover:shadow-[#f97316]/30"
            >
              Iniciar Missão
            </a>
            <a
              href="#sobre"
              className="px-8 py-2.5 rounded-full border border-[#ffffff15] hover:border-[#ffffff35] text-[#c8c8e8]/50 hover:text-white font-mono text-xs tracking-[0.25em] uppercase transition-all duration-200"
            >
              Conhecer Piloto
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 transition-[opacity,transform] duration-100"
          style={fadeStyle}
        >
          <span className="font-mono text-[9px] text-[#c8c8e8]/25 tracking-[0.35em] uppercase">Avançar</span>
          <div className="w-px h-10 bg-gradient-to-b from-[#f97316]/40 to-transparent animate-pulse" />
        </div>

        {/* Barra de velocidade lateral */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 select-none z-10 transition-[opacity,transform] duration-100"
          style={fadeStyle}
        >
          <span className="font-mono text-[8px] text-[#c8c8e8]/20 tracking-widest [writing-mode:vertical-rl]">VELOCIDADE</span>
          <div className="w-px h-24 bg-gradient-to-b from-[#f97316]/40 via-[#6c63ff]/30 to-transparent" />
          <span className="font-mono text-[8px] text-[#f97316]/40">MAX</span>
        </div>
      </section>

      {/* Canvas fixo do foguete — sobrepõe hero E about durante a transição */}
      <RocketOverlay scrollRef={scrollRef} />
    </>
  )
}
