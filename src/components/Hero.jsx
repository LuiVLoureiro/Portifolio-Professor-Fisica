import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as THREE from 'three'

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

// Estrelas em warp — vêm em direção à câmera simulando velocidade do foguete
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
      <pointsMaterial
        color="#dde8ff"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}

// Partículas de exaustão — chamas do propulsor, ficam na base
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
      <pointsMaterial
        color="#f97316"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  )
}

function RocketModel({ scrollRef }) {
  const groupRef = useRef()
  const obj = useLoader(OBJLoader, '/foguete/foguete.obj')

  const { model, offset } = useMemo(() => {
    const cloned = obj.clone(true)

    // Esconde o plano de lançamento — distorce completamente o bounding box
    cloned.traverse((child) => {
      if (child.name === 'pPlane1') child.visible = false
    })

    // Bounding box só dos meshes visíveis (o foguete em si)
    const box = new THREE.Box3()
    cloned.traverse((child) => {
      if (child.isMesh && child.visible) box.expandByObject(child)
    })

    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 3.5 / maxDim
    cloned.scale.setScalar(scale)

    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale)

    const mat = new THREE.MeshStandardMaterial({
      color: '#c0ccd8',
      metalness: 0.88,
      roughness: 0.18,
      emissive: '#0a0f1f',
      emissiveIntensity: 0.08,
    })
    cloned.traverse((child) => {
      if (child.isMesh && child.visible) {
        child.material = mat
        child.castShadow = true
      }
    })

    return { model: cloned, offset: center }
  }, [obj])

  useFrame(() => {
    if (!groupRef.current) return
    const t = scrollRef.current  // 0 → 1 conforme o usuário scrolla

    // Scroll=0: foguete quase vertical (lançamento iminente)
    // Scroll=1: inclinado ~75°, acelerando para o canto superior-direito
    groupRef.current.rotation.z = -0.15 - t * 1.15   // 0° → ~75° de inclinação
    groupRef.current.rotation.x =  0.10 + t * 0.25   // leve cabramento progressivo
    groupRef.current.rotation.y += 0.003              // giro lento contínuo

    // Sobe e desloca para a direita conforme acelera
    groupRef.current.position.x = 2.0 + t * 1.0
    groupRef.current.position.y = -0.3 + t * 2.2
  })

  return (
    <group ref={groupRef}>
      <primitive object={model} position={[-offset.x, -offset.y, -offset.z]} />
    </group>
  )
}

function Scene({ scrollRef }) {
  return (
    <>
      <ambientLight intensity={0.4} color="#dde8ff" />
      <pointLight position={[-1, 2, 4]} intensity={80} color="#c8d8ff" />
      <pointLight position={[2.0, -2.5, 1]} intensity={50} color="#f97316" />
      <pointLight position={[4, 1, -2]} intensity={25} color="#a78bfa" />

      <WarpField />
      <ExhaustField />
      <Suspense fallback={null}>
        <RocketModel scrollRef={scrollRef} />
      </Suspense>
    </>
  )
}

// Contador regressivo de lançamento
function useCountdown(from = 10) {
  const [count, setCount] = useState(from)
  const [launched, setLaunched] = useState(false)

  useEffect(() => {
    if (count <= 0) { setLaunched(true); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  return { count, launched }
}

export default function Hero() {
  const { count, launched } = useCountdown(5)
  const fadeStyle = useScrollFade()

  // Ref de scroll sem re-render — lido direto no useFrame do foguete
  const scrollRef = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = Math.min(1, window.scrollY / (window.innerHeight * 0.7))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#03030c] flex items-center justify-center">

      {/* Canvas — warp speed + exaustão + foguete */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Scene scrollRef={scrollRef} />
        </Canvas>
      </div>

      {/* Glow de exaustão na base — calor do propulsor */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, #f9731620, #ea580c0a, transparent)' }}
      />

      {/* Vignette — janela do cockpit */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, #03030c 100%)' }}
      />

      {/* Fade inferior para próxima seção */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#03030c] to-transparent pointer-events-none" />

      {/* HUD — canto superior esquerdo */}
      <div className="absolute top-20 left-6 md:left-10 space-y-1 select-none transition-[opacity,transform] duration-100"
        style={fadeStyle}>
        <p className="font-mono text-[9px] text-[#f97316]/50 tracking-[0.2em] uppercase">Propulsão</p>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${launched ? 'bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]' : 'bg-[#f97316] shadow-[0_0_6px_#f97316] animate-pulse'}`} />
          <span className="font-mono text-[10px] text-[#c8c8e8]/30">{launched ? 'PROPULSÃO ATIVA' : 'IGNIÇÃO PENDENTE'}</span>
        </div>
        <p className="font-mono text-[9px] text-[#c8c8e8]/20">ALT 408 km · 7.66 km/s</p>
      </div>

      {/* HUD — canto superior direito */}
      <div className="absolute top-20 right-6 md:right-10 text-right space-y-1 select-none transition-[opacity,transform] duration-100"
        style={fadeStyle}>
        <p className="font-mono text-[9px] text-[#22d3ee]/50 tracking-[0.2em] uppercase">Destino</p>
        <p className="font-mono text-[10px] text-[#c8c8e8]/30">RA 05h 34m · DEC +22°</p>
        <p className="font-mono text-[9px] text-[#c8c8e8]/20">Nébula do Caranguejo</p>
      </div>

      {/* Conteúdo central */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto gap-5 transition-[opacity,transform] duration-100"
        style={fadeStyle}>

        {/* Status de lançamento */}
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#f97316]/60" />
          <span className="font-mono text-[11px] tracking-[0.35em] uppercase"
            style={{ color: launched ? '#22d3ee' : '#f97316' }}>
            {launched ? '— Em Órbita —' : `Ignição em T-${count}`}
          </span>
          <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#f97316]/60" />
        </div>

        {/* Título */}
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

        {/* Subtítulo */}
        <p className="text-[#c8c8e8]/45 text-sm md:text-base leading-relaxed max-w-lg font-mono">
          Uma viagem pelo universo da física — projetos, simulações e materiais
          que transformam o impossível em compreensível.
        </p>

        {/* CTAs */}
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
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-[opacity,transform] duration-100"
        style={fadeStyle}>
        <span className="font-mono text-[9px] text-[#c8c8e8]/25 tracking-[0.35em] uppercase">Avançar</span>
        <div className="w-px h-10 bg-gradient-to-b from-[#f97316]/40 to-transparent animate-pulse" />
      </div>

      {/* Barra de velocidade lateral */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 select-none transition-[opacity,transform] duration-100"
        style={fadeStyle}>
        <span className="font-mono text-[8px] text-[#c8c8e8]/20 tracking-widest [writing-mode:vertical-rl]">VELOCIDADE</span>
        <div className="w-px h-24 bg-gradient-to-b from-[#f97316]/40 via-[#6c63ff]/30 to-transparent" />
        <span className="font-mono text-[8px] text-[#f97316]/40">MAX</span>
      </div>
    </section>
  )
}
