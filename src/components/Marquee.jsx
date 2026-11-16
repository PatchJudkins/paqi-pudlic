const items = [
  'Iridescent',
  'Liquid Metal',
  'Acid Dream',
  'Vaporwave',
  'Holographic',
  '数字手作',
  'Glitch Poetry',
  '慢工出细活',
]

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__item" key={copy}>
            {items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
