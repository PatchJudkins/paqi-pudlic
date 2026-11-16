import { useEffect, useState } from 'react'

const links = [
  { href: '#works', label: '作品' },
  { href: '#about', label: '关于' },
  { href: '#contact', label: '联系' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
      <a className="nav__mark" href="#top" aria-label="回到顶部">
        <span className="nav__dot" />
        PJ<span className="nav__mark-sub">/2026</span>
      </a>

      <nav className="nav__links" aria-label="主导航">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>

      <a className="nav__cta" href="mailto:hi@patchjudkins.dev">
        合作 ↗
      </a>
    </header>
  )
}
