import SectionHead from './SectionHead.jsx'

const links = [
  { label: 'GitHub', href: 'https://github.com/PatchJudkins' },
  { label: '小红书', href: '#' },
  { label: '即刻', href: '#' },
  { label: 'RSS', href: '#' },
]

export default function Contact() {
  return (
    <section className="sec contact" id="contact">
      <SectionHead num="03" title="联系" en="Contact" />

      <p className="contact__kicker" data-reveal>
        有想做的东西，或者只是想聊聊颜色
      </p>

      <a className="contact__mail" href="mailto:hi@patchjudkins.dev" data-reveal>
        hi@patchjudkins.dev
      </a>

      <div className="contact__links" data-reveal style={{ '--delay': '120ms' }}>
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
            {l.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>

      <footer className="footer">
        <span>© 2026 帕奇 · PatchJudkins</span>
        <span className="footer__mid">
          <i />
          上海 · 31.23°N 121.47°E
        </span>
        <span>React + 一点点噪声</span>
      </footer>
    </section>
  )
}
