import SectionHead from './SectionHead.jsx'

const stats = [
  { value: '08', unit: '年', label: '做东西的年头' },
  { value: '27', unit: '个', label: '上线过的项目' },
  { value: '03', unit: '个', label: '开源的玩具' },
]

export default function About() {
  return (
    <section className="sec about" id="about">
      <SectionHead num="02" title="关于" en="About" />

      <div className="about__body">
        <p className="about__lead" data-reveal>
          我把界面当成一层<span className="holo">会呼吸的薄膜</span> —— 光从后面透过来，颜色在边缘散开。
        </p>

        <div className="about__text" data-reveal style={{ '--delay': '120ms' }}>
          <p>
            白天写代码，晚上折腾颜色。喜欢把工业感的排版和一点不讲道理的虹彩放在一起，
            让工具看起来不像工具，更像一件<em>被人拿在手里把玩过</em>的物件。
          </p>
          <p>
            做过编辑器、笔记、小游戏，也做过一些单纯为了好看的页面。相信好的界面不需要解释，
            它应该在你还没想明白为什么之前，就先让你想伸手碰一下。
          </p>
          <p>目前在上海，接一些产品设计与前端实现的合作，也在攒自己的下一件玩具。</p>
        </div>
      </div>

      <dl className="about__stats">
        {stats.map((s, i) => (
          <div className="about__stat" key={s.label} data-reveal style={{ '--delay': `${i * 100}ms` }}>
            <b>
              {s.value}
              <span style={{ fontSize: '0.34em', marginLeft: '0.18em', color: 'var(--paper-dim)' }}>
                {s.unit}
              </span>
            </b>
            <span>{s.label}</span>
          </div>
        ))}
      </dl>
    </section>
  )
}
