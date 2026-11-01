import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useChatStore } from '../store/chatStore'
import { useNavigate } from 'react-router-dom'

export default function HeroPage({ onEnter }) {
  const { clearChat } = useChatStore()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const ctaRef = useRef(null)
  const scrollRef = useRef(null)
  const threeRefs = useRef({
    scene: null, camera: null, renderer: null,
    stars: [], mountains: [], nebula: null, animationId: null,
    targetCameraX: 0, targetCameraY: 30, targetCameraZ: 100,
  })
  const smoothCamera = useRef({ x: 0, y: 30, z: 100 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const refs = threeRefs.current

    // Scene
    refs.scene = new THREE.Scene()
    refs.scene.fog = new THREE.FogExp2(0x000000, 0.00018)

    // Camera
    refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
    refs.camera.position.set(0, 30, 100)

    // Renderer
    refs.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true })
    refs.renderer.setSize(window.innerWidth, window.innerHeight)
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping
    refs.renderer.toneMappingExposure = 0.6

    // Stars
    for (let layer = 0; layer < 3; layer++) {
      const count = 4000
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array(count * 3)
      const col = new Float32Array(count * 3)
      const sz = new Float32Array(count)
      for (let j = 0; j < count; j++) {
        const r = 200 + Math.random() * 800
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        pos[j*3]   = r * Math.sin(phi) * Math.cos(theta)
        pos[j*3+1] = r * Math.sin(phi) * Math.sin(theta)
        pos[j*3+2] = r * Math.cos(phi)
        const c = new THREE.Color()
        const rnd = Math.random()
        if (rnd < 0.7) c.setHSL(0, 0, 0.8 + Math.random() * 0.2)
        else if (rnd < 0.88) c.setHSL(0.08, 0.5, 0.8)
        else c.setHSL(0.6, 0.5, 0.85)
        col[j*3]=c.r; col[j*3+1]=c.g; col[j*3+2]=c.b
        sz[j] = Math.random() * 2 + 0.5
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      geo.setAttribute('size', new THREE.BufferAttribute(sz, 1))
      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: layer } },
        vertexShader: `
          attribute float size; attribute vec3 color; varying vec3 vColor;
          uniform float time; uniform float depth;
          void main() {
            vColor = color;
            vec3 p = position;
            float angle = time * 0.04 * (1.0 - depth * 0.3);
            mat2 rot = mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            p.xy = rot * p.xy;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = size * (280.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0 - smoothstep(0.0, 0.5, d));
          }`,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const points = new THREE.Points(geo, mat)
      refs.scene.add(points)
      refs.stars.push(points)
    }

    // Nebula (horizon glow)
    const nebGeo = new THREE.PlaneGeometry(6000, 3000, 80, 80)
    const nebMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x000000) },
        color2: { value: new THREE.Color(0x000000) },
        opacity: { value: 0.0 },
      },
      vertexShader: `varying vec2 vUv; uniform float time;
        void main() { vUv = uv; vec3 p = position;
          p.z += sin(p.x*0.008+time)*cos(p.y*0.008+time)*18.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
      fragmentShader: `uniform vec3 color1; uniform vec3 color2; uniform float opacity; uniform float time;
        varying vec2 vUv;
        void main() {
          float m = sin(vUv.x*8.0+time)*cos(vUv.y*8.0+time);
          vec3 col = mix(color1,color2,m*0.5+0.5);
          float a = opacity*(1.0-length(vUv-0.5)*2.0);
          gl_FragColor = vec4(col,a); }`,
      transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false,
    })
    refs.nebula = new THREE.Mesh(nebGeo, nebMat)
    refs.nebula.position.z = -900
    refs.scene.add(refs.nebula)

    // Mountains (4 layers)
    const mtnLayers = [
      { z: -50,  y: -80,  h: 55,  color: 0x120820 },
      { z: -110, y: -95,  h: 75,  color: 0x0d1535 },
      { z: -170, y: -110, h: 95,  color: 0x0a2855 },
      { z: -230, y: -125, h: 115, color: 0x083366 },
    ]
    mtnLayers.forEach((layer, idx) => {
      const points2D = []
      const segs = 60
      for (let i = 0; i <= segs; i++) {
        const x = (i / segs - 0.5) * 1200
        const y = Math.sin(i * 0.12) * layer.h
              + Math.sin(i * 0.055 + idx) * layer.h * 0.5
              + Math.sin(i * 0.23 + idx * 2) * layer.h * 0.2
              + (Math.random() - 0.5) * layer.h * 0.15 - layer.h * 0.3
        points2D.push(new THREE.Vector2(x, y))
      }
      points2D.push(new THREE.Vector2(5000, -400))
      points2D.push(new THREE.Vector2(-5000, -400))
      const shape = new THREE.Shape(points2D)
      const geo = new THREE.ShapeGeometry(shape)
      const mat = new THREE.MeshBasicMaterial({ color: layer.color, side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(0, layer.y, layer.z)
      mesh.userData = { baseZ: layer.z, baseY: layer.y, idx }
      refs.scene.add(mesh)
      refs.mountains.push(mesh)
    })

    // Horizon sun glow
    const sunGeo = new THREE.SphereGeometry(18, 32, 32)
    const sunMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `varying vec3 vN; void main() { vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vN; uniform float time;
        void main() {
          float i = pow(0.65 - dot(vN, vec3(0,0,1)), 2.5);
          vec3 a = mix(vec3(1.0,0.3,0.0), vec3(0.6,0.1,1.0), i) * i;
          float p = sin(time*1.5)*0.12+0.88;
          gl_FragColor = vec4(a*p, i*0.6); }`,
      transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    })
    const sun = new THREE.Mesh(sunGeo, sunMat)
    sun.position.set(0, -12, -160)
    refs.scene.add(sun)
    refs.sun = sun

    // Animate loop
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate)
      const t = Date.now() * 0.001
      refs.stars.forEach(s => { if (s.material.uniforms) s.material.uniforms.time.value = t })
      if (refs.nebula?.material.uniforms) refs.nebula.material.uniforms.time.value = t * 0.4
      if (refs.sun?.material.uniforms) refs.sun.material.uniforms.time.value = t

      // Smooth camera
      const sm = 0.045
      smoothCamera.current.x += (refs.targetCameraX - smoothCamera.current.x) * sm
      smoothCamera.current.y += (refs.targetCameraY - smoothCamera.current.y) * sm
      smoothCamera.current.z += (refs.targetCameraZ - smoothCamera.current.z) * sm
      refs.camera.position.set(
        smoothCamera.current.x + Math.sin(t * 0.08) * 1.5,
        smoothCamera.current.y + Math.cos(t * 0.12) * 0.8,
        smoothCamera.current.z
      )
      refs.camera.lookAt(0, 8, -400)

      // Mountain parallax breathe
      refs.mountains.forEach((m, i) => {
        m.position.x = Math.sin(t * 0.07 + i) * (1.5 + i * 0.5)
        m.position.y = m.userData.baseY + Math.cos(t * 0.1) * 0.4
      })

      refs.renderer.render(refs.scene, refs.camera)
    }
    animate()

    // Resize
    const onResize = () => {
      refs.camera.aspect = window.innerWidth / window.innerHeight
      refs.camera.updateProjectionMatrix()
      refs.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Entrance animation — stagger with CSS classes
    setTimeout(() => {
      if (titleRef.current) titleRef.current.classList.add('hero-visible')
    }, 200)
    setTimeout(() => {
      if (subtitleRef.current) subtitleRef.current.classList.add('hero-visible')
    }, 700)
    setTimeout(() => {
      if (ctaRef.current) ctaRef.current.classList.add('hero-visible')
    }, 1100)
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.classList.add('hero-visible')
    }, 1600)

    return () => {
      cancelAnimationFrame(refs.animationId)
      window.removeEventListener('resize', onResize)
      refs.stars.forEach(s => { s.geometry.dispose(); s.material.dispose() })
      refs.mountains.forEach(m => { m.geometry.dispose(); m.material.dispose() })
      if (refs.nebula) { refs.nebula.geometry.dispose(); refs.nebula.material.dispose() }
      refs.renderer.dispose()
    }
  }, [])

  // Scroll → camera fly-in
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 1.5), 1)
      setScrollProgress(progress)
      const refs = threeRefs.current
      refs.targetCameraX = 0
      refs.targetCameraY = 30 + progress * 20
      refs.targetCameraZ = 100 - progress * 500
      refs.mountains.forEach((m, i) => {
        if (progress > 0.75) m.position.z = 9999
        else m.position.z = m.userData.baseZ
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleEnter = () => {
    clearChat()
    localStorage.removeItem("chatHistory")
    setEntered(true)
    // Flash and fly camera forward
    threeRefs.current.targetCameraZ = -600
    setTimeout(() => {
      onEnter && onEnter()
      navigate('/chat')
    }, 600)
  }

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        .hero-wrap { position: relative; width: 100%; background: transparent; filter: none !important; backdrop-filter: none !important; }
        .hero-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
        .hero-section { position: relative; width: 100%; height: 100vh; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; background: transparent; filter: none !important; backdrop-filter: none !important; }
        .hero-side { position: fixed; left: 28px; top: 50%; transform: translateY(-50%); z-index: 20; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .hero-side-bar { width: 1.5px; height: 60px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.25)); }
        .hero-side-text { writing-mode: vertical-rl; font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.3em; color: rgba(255,255,255,0.3); text-transform: uppercase; }
        .hero-side-bar2 { width: 1.5px; height: 60px; background: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent); }

        .hero-title { 
          font-family: 'Syne', sans-serif; font-weight: 900;
          font-size: clamp(72px, 14vw, 180px);
          letter-spacing: 2px; line-height: 0.9;
          overflow: hidden;
          color: #ff2d2d;
          background: transparent;
          text-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
          margin-bottom: 28px;
          opacity: 0; transform: translateY(60px);
          transition: opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-title.hero-visible { opacity: 1; transform: translateY(0); }

        .hero-subtitle {
          font-family: 'DM Sans', sans-serif; font-weight: 300;
          font-size: clamp(14px, 2vw, 20px);
          color: rgba(220,220,255,0.7); letter-spacing: 0.04em;
          text-align: center; line-height: 1.9; margin-bottom: 48px;
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.9s ease 0.1s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s;
        }
        .hero-subtitle.hero-visible { opacity: 1; transform: translateY(0); }

        .hero-cta {
          pointer-events: all;
          opacity: 0; transform: translateY(24px) scale(0.96);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1);
        }
        .hero-cta.hero-visible { opacity: 1; transform: translateY(0) scale(1); }

        .cta-btn {
          position: relative; overflow: hidden;
          padding: 16px 52px; border-radius: 60px;
          background: linear-gradient(135deg, #ff3344, #c41a8a);
          color: #fff; font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase;
          border: none; cursor: pointer;
          box-shadow: 0 8px 40px rgba(255,50,60,0.4), 0 0 0 1px rgba(255,80,100,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .cta-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 50px rgba(255,50,60,0.55), 0 0 0 1px rgba(255,80,100,0.4); }
        .cta-btn:hover::before { opacity: 1; }
        .cta-btn:active { transform: scale(0.98); }
        .cta-btn.firing { animation: ctaFire 0.5s ease forwards; }
        @keyframes ctaFire {
          0% { transform: scale(1); box-shadow: 0 8px 40px rgba(255,50,60,0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 80px rgba(255,50,60,0.9), 0 0 160px rgba(255,50,60,0.4); }
          100% { transform: scale(0.95); opacity: 0; }
        }

        .hero-scroll {
          position: fixed; bottom: 36px; left: 50%; transform: translateX(-50%);
          z-index: 20; display: flex; align-items: center; gap: 16px;
          opacity: 0; transition: opacity 0.8s ease;
        }
        .hero-scroll.hero-visible { opacity: 1; }
        .scroll-label { font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.35em; color: rgba(255,255,255,0.35); text-transform: uppercase; }
        .scroll-track { width: 120px; height: 1px; background: rgba(255,255,255,0.1); position: relative; overflow: hidden; }
        .scroll-fill { height: 100%; background: linear-gradient(90deg, #ff3344, #c41a8a); transition: width 0.1s; }
        .scroll-dots { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .scroll-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .scroll-dot.active { background: #ff3344; }
        @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .scroll-arrow { animation: scrollBounce 1.6s ease-in-out infinite; color: rgba(255,255,255,0.3); font-size: 18px; }

        /* Fade overlay when entering */
        .enter-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: #000; opacity: 0; pointer-events: none;
          transition: opacity 0.5s ease;
        }
        .enter-overlay.active { opacity: 1; pointer-events: all; }

        /* Floating particles */
        .hero-particle { position: fixed; border-radius: 50%; pointer-events: none; z-index: 5; }

        .glass-card {
          backdrop-filter: none !important;
          filter: none !important;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255,255,255,0.1);
        }
      `}</style>

      <div className="hero-wrap">
        <canvas ref={canvasRef} className="hero-canvas" />

        {/* Side decoration */}
        <div className="hero-side">
          <div className="hero-side-bar" />
          <div className="hero-side-text">SPACE</div>
          <div className="hero-side-bar2" />
        </div>

        {/* Sticky-like proper hero section */}
        <section className="hero-section">
          <h1 ref={titleRef} className="hero-title">VIDYASETU</h1>
          <div ref={subtitleRef} className="hero-subtitle">
            <span style={{ display: 'block' }}>India's Intelligent Education & Governance Portal</span>
            <span style={{ display: 'block', fontSize: '90%', opacity: 0.6 }}>Admissions · Scholarships · Government Schemes · Certificates</span>
          </div>
          <div ref={ctaRef} className="hero-cta">
            <button
              className={`cta-btn ${entered ? 'firing' : ''}`}
              onClick={handleEnter}
            >
              Launch Assistant →
            </button>
          </div>
        </section>

        {/* Scroll indicator */}
        <div ref={scrollRef} className="hero-scroll">
          <span className="scroll-label">Scroll</span>
          <div className="scroll-track">
            <div className="scroll-fill" style={{ width: `${scrollProgress * 100}%` }} />
          </div>
          <div className="scroll-arrow">↓</div>
        </div>

        {/* Removed solid gradient overlay below hero to keep space background visible */}

        {/* Feature cards that flow below the hero */}
        <section className="content-section" style={{ 
          position: 'relative', zIndex: 2, padding: '80px 10% 20vh', background: 'transparent',
          backdropFilter: 'none', filter: 'none'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { icon: '🎓', title: 'Admissions', desc: 'College & university admission guides' },
            { icon: '🏆', title: 'Scholarships', desc: 'All-India scholarship database with deadlines' },
            { icon: '🏛️', title: 'Govt Schemes', desc: 'Central & state education schemes' },
            { icon: '📄', title: 'Certificates', desc: 'How to get any student certificate' },
          ].map((card, i) => (
            <div key={i} className="glass-card" style={{
              borderRadius: 16, padding: '24px 20px',
              opacity: Math.max(0, (scrollProgress - 0.2) * 4),
              transform: `translateY(${Math.max(0, 40 - (scrollProgress - 0.2) * 160)}px)`,
              transition: 'none',
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6, textShadow: '0 0 10px rgba(0,0,0,0.6)' }}>{card.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, textShadow: '0 0 10px rgba(0,0,0,0.6)' }}>{card.desc}</div>
            </div>
          ))}
          </div>

          {/* Second CTA at bottom of scroll */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            marginTop: '15vh',
            opacity: Math.max(0, (scrollProgress - 0.6) * 3),
            textShadow: '0 0 10px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px,5vw,56px)', fontWeight: 800, color: '#fff', textAlign: 'center' }}>
              Ready to explore?
            </div>
            <button className="cta-btn" onClick={handleEnter} style={{ background: 'linear-gradient(135deg, #4f8ef7, #8b5cf6)' }}>
              Open AI Assistant →
            </button>
          </div>
        </section>
      </div>

      {/* Black fade overlay */}
      <div className={`enter-overlay ${entered ? 'active' : ''}`} />
    </>
  )
}
