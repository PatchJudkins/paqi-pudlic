import { useEffect, useState } from 'react'
import SectionHead from './SectionHead.jsx'
import { works } from '../data/works.js'

const WIDE = '(min-width: 901px)'

export default function Works() {
  // 宽屏分两栏：左栏放奇数项、右栏放偶数项，这样从上到下读仍是 01 02 03……
  // 同时两栏各自连续排布，横图和竖海报可以保留原比例，栏底不齐也不会留下空洞。
  const [split, setSplit] = useState(() => window.matchMedia(WIDE).matches)

  useEffect(() => {
    const mq = window.matchMedia(WIDE)
    const on = (e) => setSplit(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const columns = split
    ? [works.filter((_, i) => i % 2 === 0), works.filter((_, i) => i % 2 === 1)]
    : [works]

  const card = (w) => {
    const i = works.indexOf(w)
    return (
      <article className="work" key={w.id}>
        <a className="work__link" href={w.href} data-reveal style={{ '--delay': `${(i % 2) * 90}ms` }}>
          <div className="work__cover">
            <img
              className="work__img"
              src={w.cover}
              alt={`${w.title} ${w.cn}`}
              width={w.w}
              height={w.h}
              loading={i > 1 ? 'lazy' : 'eager'}
              decoding="async"
            />
            <span className="work__index">{w.id}</span>
            <span className="work__grain" />
            <span className="work__sheen" />
          </div>

          <div className="work__meta">
            <h3 className="work__title">
              {w.title} <span className="work__cn">{w.cn}</span>
            </h3>
            <span className="work__year">{w.year}</span>
          </div>

          <div className="work__tags">
            {w.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </a>
      </article>
    )
  }

  return (
    <section className="sec works" id="works">
      <SectionHead num="01" title="作品" en="Selected Works" />

      <div className={`works__grid${split ? '' : ' works__grid--flat'}`}>
        {columns.map((col, ci) => (
          <div className="works__col" key={ci}>
            {col.map(card)}
          </div>
        ))}
      </div>
    </section>
  )
}
