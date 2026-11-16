export default function SectionHead({ num, title, en }) {
  return (
    <div className="sec__head" data-reveal>
      <span className="sec__num">{num}</span>
      <h2 className="sec__title">{title}</h2>
      <span className="sec__en">{en}</span>
    </div>
  )
}
