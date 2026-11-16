import { useEffect, useRef } from 'react'

export default function CursorLight() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let x = tx
    let y = ty
    let raf = 0

    const tick = () => {
      x += (tx - x) * 0.12
      y += (ty - y) * 0.12
      // 收敛后停止 rAF：静止时不再每帧合成这张 720px 的混合层
      if (Math.abs(tx - x) < 0.4 && Math.abs(ty - y) < 0.4) {
        x = tx
        y = ty
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        raf = 0
        return
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      tx = e.clientX
      ty = e.clientY
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div className="cursor-light" ref={ref} aria-hidden="true" />
}
