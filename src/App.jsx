import { useEffect } from 'react'
import AuroraSvg from './components/AuroraSvg.jsx'
import Grain from './components/Grain.jsx'
import CursorLight from './components/CursorLight.jsx'
import FpsMeter from './components/FpsMeter.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import Works from './components/Works.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'

export default function App() {
  // 只用来把 Aurora 烤成位图（scripts/bake-aurora.mjs 访问 ?aurora-bake）
  const bakeMode =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('aurora-bake')
  // ?fps=1 显示实时帧率，真机上排查卡顿用
  const fpsMode =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('fps')

  // 滚动进场
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'))

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // 深链接：#works 之类在 React 挂载后再滚
  useEffect(() => {
    const { hash } = window.location
    if (!hash || hash.length < 2) return
    const el = document.querySelector(hash)
    if (!el) return
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [])

  if (bakeMode) {
    return (
      <div className="bake">
        <AuroraSvg />
      </div>
    )
  }

  return (
    <>
      <Grain />
      <CursorLight />
      {fpsMode && <FpsMeter />}
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Works />
        <About />
        <Contact />
      </main>
    </>
  )
}
