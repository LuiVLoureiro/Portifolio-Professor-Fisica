import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Textura circular com falloff gaussiano — elimina o aspecto "quadrado"
function createFireTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const center = size / 2
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center)
  grad.addColorStop(0.0,  'rgba(255,255,255,1)')   // núcleo branco-quente
  grad.addColorStop(0.15, 'rgba(255,240,180,0.95)')
  grad.addColorStop(0.35, 'rgba(255,160, 40,0.7)')
  grad.addColorStop(0.6,  'rgba(220, 60,  0,0.35)')
  grad.addColorStop(0.85, 'rgba(120, 20,  0,0.1)')
  grad.addColorStop(1.0,  'rgba(  0,  0,  0,0)')   // borda totalmente transparente

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

/**
 * Sistema de partículas de fogo na cauda do foguete.
 * Deve ser filho direto do group do foguete — herda transform automaticamente.
 *
 * @param {number}   tailY      Offset Y local da boca do propulsor
 * @param {number}   scale      Escala geral (velocidade, tamanho, spread)
 * @param {number}   count      Quantidade de partículas
 * @param {object}   scrollRef  Ref de scroll (scrollY/innerHeight). Quando fornecido,
 *                              o fogo faz fade-in de t=0.85 a t=1.1. Sem ele = sempre visível.
 */
export default function RocketFire({ tailY = -1.75, scale = 1, count = 260, scrollRef = null, opacityRef = null }) {
  const coreRef  = useRef()   // partículas internas — quentes e pequenas
  const outerRef = useRef()   // halo externo — grandes e lentas

  const texture = useMemo(() => createFireTexture(), [])

  // ── Camada interna (core): quente, rápida, pequena ───────────────────────
  const core = useMemo(() => {
    const n   = count
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const sz  = new Float32Array(n)
    const vel = new Float32Array(n * 3)
    const age = new Float32Array(n)
    const maxAge = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      maxAge[i]  = (0.08 + Math.random() * 0.18) / scale
      age[i]     = Math.random() * maxAge[i]
      pos[i*3+1] = tailY
    }
    return { pos, col, sz, vel, age, maxAge, n }
  }, [count, tailY, scale])

  // ── Camada externa (halo): mais lenta, maior, alaranjada ─────────────────
  const outer = useMemo(() => {
    const n   = Math.floor(count * 0.55)
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const sz  = new Float32Array(n)
    const vel = new Float32Array(n * 3)
    const age = new Float32Array(n)
    const maxAge = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      maxAge[i]  = (0.18 + Math.random() * 0.28) / scale
      age[i]     = Math.random() * maxAge[i]
      pos[i*3+1] = tailY
    }
    return { pos, col, sz, vel, age, maxAge, n }
  }, [count, tailY, scale])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    // ── Fade-in pelo scroll (aparece ao entrar no About) ──────────────────
    const scrollOpacity = opacityRef
      ? opacityRef.current
      : scrollRef
        ? Math.max(0, Math.min(1, (scrollRef.current - 0.85) / 0.25))
        : 1

    if (coreRef.current?.material)  coreRef.current.material.opacity  = 0.95 * scrollOpacity
    if (outerRef.current?.material) outerRef.current.material.opacity = 0.65 * scrollOpacity

    // Não atualiza partículas quando invisível — economiza CPU
    if (scrollOpacity === 0) return

    // ── Atualiza core ─────────────────────────────────────────────────────
    if (coreRef.current) {
      const { pos, col, sz, vel, age, maxAge, n } = core
      const spread = 0.06 * scale
      const spd    = scale * 3.2

      for (let i = 0; i < n; i++) {
        age[i] -= dt
        if (age[i] <= 0) {
          age[i]     = maxAge[i]
          // Nasce em disco fino na saída do propulsor
          const a = Math.random() * Math.PI * 2
          const r = Math.random() * spread
          pos[i*3]   = Math.cos(a) * r
          pos[i*3+1] = tailY - Math.random() * 0.04 * scale
          pos[i*3+2] = Math.sin(a) * r
          // Veloc: para trás (-Y) com leve espalhamento cônico
          const cone = 0.18
          vel[i*3]   = (Math.random() - 0.5) * cone * scale
          vel[i*3+1] = -(spd * (0.9 + Math.random() * 0.7))
          vel[i*3+2] = (Math.random() - 0.5) * cone * scale
        } else {
          pos[i*3]   += vel[i*3]   * dt
          pos[i*3+1] += vel[i*3+1] * dt
          pos[i*3+2] += vel[i*3+2] * dt
          // Turbulência lateral — chama oscila organicamente
          const t2 = age[i] / maxAge[i]
          pos[i*3]   += Math.sin(age[i] * 28 + i) * 0.003 * scale * (1 - t2)
          pos[i*3+2] += Math.cos(age[i] * 22 + i) * 0.003 * scale * (1 - t2)
          // Desacelera radialmente (cone se abre)
          vel[i*3]   *= 1 - dt * 3.5
          vel[i*3+2] *= 1 - dt * 3.5
        }

        const t = age[i] / maxAge[i]   // 1=nova, 0=velha

        // Branco → amarelo → laranja → some
        col[i*3]   = Math.min(1, t * 2.8)
        col[i*3+1] = Math.max(0, t * 2.2 - 0.4)
        col[i*3+2] = Math.max(0, t * 3.0 - 2.2)

        // Tamanho: estoura ao nascer, encolhe suavemente
        const pop  = Math.sin(Math.PI * Math.min(1, (1 - t) * 4))
        sz[i] = scale * (0.055 + 0.075 * pop) * Math.max(0.08, t)
      }

      const g = coreRef.current.geometry
      g.attributes.position.needsUpdate = true
      g.attributes.color.needsUpdate    = true
      g.attributes.size.needsUpdate     = true
    }

    // ── Atualiza halo externo ─────────────────────────────────────────────
    if (outerRef.current) {
      const { pos, col, sz, vel, age, maxAge, n } = outer
      const spread = 0.14 * scale
      const spd    = scale * 1.6

      for (let i = 0; i < n; i++) {
        age[i] -= dt
        if (age[i] <= 0) {
          age[i]     = maxAge[i]
          const a = Math.random() * Math.PI * 2
          const r = (0.3 + Math.random() * 0.7) * spread
          pos[i*3]   = Math.cos(a) * r
          pos[i*3+1] = tailY - Math.random() * 0.08 * scale
          pos[i*3+2] = Math.sin(a) * r
          const cone = 0.45
          vel[i*3]   = (Math.random() - 0.5) * cone * scale
          vel[i*3+1] = -(spd * (0.6 + Math.random() * 0.9))
          vel[i*3+2] = (Math.random() - 0.5) * cone * scale
        } else {
          pos[i*3]   += vel[i*3]   * dt
          pos[i*3+1] += vel[i*3+1] * dt
          pos[i*3+2] += vel[i*3+2] * dt
          // Turbulência mais intensa nas bordas
          pos[i*3]   += Math.sin(age[i] * 18 + i * 1.7) * 0.006 * scale
          pos[i*3+2] += Math.cos(age[i] * 14 + i * 2.3) * 0.006 * scale
          vel[i*3]   *= 1 - dt * 2.2
          vel[i*3+2] *= 1 - dt * 2.2
        }

        const t = age[i] / maxAge[i]

        // Laranja → vermelho escuro → some
        col[i*3]   = Math.min(1, t * 1.8) * 0.9
        col[i*3+1] = Math.max(0, t * 1.0 - 0.3) * 0.6
        col[i*3+2] = 0

        sz[i] = scale * (0.10 + 0.12 * Math.sin(Math.PI * (1 - t))) * Math.max(0.05, t)
      }

      const g = outerRef.current.geometry
      g.attributes.position.needsUpdate = true
      g.attributes.color.needsUpdate    = true
      g.attributes.size.needsUpdate     = true
    }
  })

  const commonProps = {
    map: texture,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    alphaTest: 0,
  }

  return (
    <>
      {/* Halo externo — renderiza antes (por trás) */}
      <points ref={outerRef} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[outer.pos, 3]} />
          <bufferAttribute attach="attributes-color"    args={[outer.col, 3]} />
          <bufferAttribute attach="attributes-size"     args={[outer.sz,  1]} />
        </bufferGeometry>
        <pointsMaterial {...commonProps} opacity={0.65} />
      </points>

      {/* Core interno — renderiza por cima, mais brilhante */}
      <points ref={coreRef} renderOrder={2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[core.pos, 3]} />
          <bufferAttribute attach="attributes-color"    args={[core.col, 3]} />
          <bufferAttribute attach="attributes-size"     args={[core.sz,  1]} />
        </bufferGeometry>
        <pointsMaterial {...commonProps} opacity={0.95} />
      </points>
    </>
  )
}
