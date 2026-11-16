import { useEffect, useRef } from 'react'
import Aurora from './Aurora.jsx'

export default function Hero() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let raf = 0
    const apply = () => {
      raf = 0
      el.style.setProperty('--mx', mx.toFixed(3))
      el.style.setProperty('--my', my.toFixed(3))
    }
    let mx = 0
    let my = 0

    const onMove = (e) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
      // 每个 pointermove 都写 CSS 变量会让整个 hero 子树重算样式，合并到一帧里
      if (!raf) raf = requestAnimationFrame(apply)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero__bg" aria-hidden="true">
        <Aurora />
        <div className="hero__scrim" />
      </div>

      <div className="hero__inner">
        <p className="hero__eyebrow">
          <i />
          独立开发者 · 视觉实验 · 现居上海
        </p>

        <h1 className="hero__title">
          <span className="hero__line hero__line--a">Patch</span>
          <span className="hero__line hero__line--b holo">Judkins</span>
        </h1>

        <div className="hero__meta">
          <p className="hero__lede">
            我是帕奇，做界面和没用的小工具。
            <br />
            把<strong>光</strong>、<strong>噪点</strong>和一点<strong>故障感</strong>，缝进日常。
          </p>

          <div className="hero__cta">
            <a className="btn" href="#works">
              看作品 <span aria-hidden="true">↘</span>
            </a>
            <a className="btn btn--ghost" href="#about">
              关于我
            </a>
          </div>
        </div>
      </div>

      <a className="hero__scroll" href="#works" aria-label="向下滚动">
        <span>Scroll</span>
        <i />
      </a>
    </header>
  )
}
