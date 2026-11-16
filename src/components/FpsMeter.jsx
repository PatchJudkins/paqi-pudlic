import { useEffect, useState } from 'react'

// 只在 ?fps=1 时挂载：把真实帧率显示在角落，方便在真机上判断卡不卡。
export default function FpsMeter() {
  const [stats, setStats] = useState({ fps: 0, ms: 0, worst: 0 })

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let acc = 0
    let frames = 0
    let worst = 0

    const tick = (now) => {
      const dt = now - last
      last = now
      acc += dt
      frames += 1
      if (dt > 32) worst = Math.max(worst, dt)
      if (acc >= 500) {
        setStats({
          fps: Math.round((frames * 1000) / acc),
          ms: +(acc / frames).toFixed(1),
          worst: Math.round(worst),
        })
        acc = 0
        frames = 0
        worst = 0
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="fps" data-bad={stats.fps > 0 && stats.fps < 50 ? '1' : '0'}>
      <b>{stats.fps}</b>
      <span>fps · {stats.ms}ms</span>
      <span>{stats.worst > 32 ? `最近掉到 ${stats.worst}ms` : '无掉帧'}</span>
    </div>
  )
}
