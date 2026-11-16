export default function Aurora() {
  return (
    <svg
      className="aurora"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="gA" x1="0%" y1="0%" x2="100%" y2="48%">
          <stop offset="0%" stopColor="#ff2e63" />
          <stop offset="15%" stopColor="#ff7a45" />
          <stop offset="31%" stopColor="#ffd93d" />
          <stop offset="47%" stopColor="#7dff6b" />
          <stop offset="63%" stopColor="#22e0ff" />
          <stop offset="81%" stopColor="#6b5bff" />
          <stop offset="100%" stopColor="#c77dff" />
        </linearGradient>

        <linearGradient id="gB" x1="10%" y1="100%" x2="90%" y2="0%">
          <stop offset="0%" stopColor="#6b5bff" />
          <stop offset="24%" stopColor="#22e0ff" />
          <stop offset="48%" stopColor="#7dff6b" />
          <stop offset="72%" stopColor="#ffd93d" />
          <stop offset="100%" stopColor="#ff2e63" />
        </linearGradient>

        {/* 锐利的液态形变：细而亮的虹彩丝
            注意：feTurbulence 一旦用 <animate> 动起来，整块 1440x900 的
            湍流+位移+模糊每帧重算，实测把页面拖到 3.5fps。这里保持静态，
            由 .aurora 的 CSS transform 慢速漂移制造流动感（合成器完成，0 重绘）。 */}
        <filter id="fWarp" x="-25%" y="-40%" width="150%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0042 0.012" numOctaves="2" seed="9" result="t" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="t"
            scale="196"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feGaussianBlur in="d" stdDeviation="2.4" />
        </filter>

        {/* 同一噪声场的柔光版本 */}
        <filter id="fWarpSoft" x="-25%" y="-40%" width="150%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0042 0.012" numOctaves="2" seed="9" result="t2" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="t2"
            scale="196"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d2"
          />
          <feGaussianBlur in="d2" stdDeviation="26" />
        </filter>

        <filter id="fAmbient" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="72" />
        </filter>
      </defs>

      {/* 环境色雾：压得很低，只负责让黑不死 */}
      <g filter="url(#fAmbient)" opacity="0.5">
        <ellipse cx="1080" cy="130" rx="330" ry="190" fill="#ff2e63" opacity="0.5" />
        <ellipse cx="820" cy="360" rx="380" ry="170" fill="#22e0ff" opacity="0.42" />
        <ellipse cx="1220" cy="600" rx="320" ry="190" fill="#7dff6b" opacity="0.26" />
        <ellipse cx="380" cy="700" rx="360" ry="180" fill="#6b5bff" opacity="0.4" />
      </g>

      {/* 柔光带：给丝留一点体积 */}
      <g filter="url(#fWarpSoft)" opacity="0.34">
        <path
          d="M-140 240 C 220 140 470 330 760 250 S 1180 150 1600 270"
          fill="none"
          stroke="url(#gA)"
          strokeWidth="58"
          strokeLinecap="round"
        />
        <path
          d="M-140 520 C 200 420 480 600 790 500 S 1200 410 1600 540"
          fill="none"
          stroke="url(#gB)"
          strokeWidth="46"
          strokeLinecap="round"
        />
        <path
          d="M-140 760 C 260 690 560 810 880 740 S 1260 670 1600 770"
          fill="none"
          stroke="url(#gA)"
          strokeWidth="40"
          strokeLinecap="round"
        />
      </g>

      {/* 主体：被噪声拉长、揉皱的虹彩细丝 */}
      <g filter="url(#fWarp)" opacity="0.94">
        <path d="M-140 168 C 240 96 430 214 730 160 S 1180 74 1600 178" fill="none" stroke="url(#gA)" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
        <path d="M-140 252 C 210 160 470 336 780 256 S 1190 158 1600 276" fill="none" stroke="url(#gB)" strokeWidth="19" strokeLinecap="round" opacity="0.95" />
        <path d="M-140 318 C 250 262 500 372 760 318 S 1150 258 1600 340" fill="none" stroke="url(#gA)" strokeWidth="7" strokeLinecap="round" opacity="0.8" />
        <path d="M-140 452 C 190 372 470 520 790 444 S 1210 366 1600 470" fill="none" stroke="url(#gA)" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
        <path d="M-140 540 C 220 470 520 604 830 522 S 1240 456 1600 566" fill="none" stroke="url(#gB)" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
        <path d="M-140 648 C 250 574 540 700 860 632 S 1250 566 1600 668" fill="none" stroke="url(#gA)" strokeWidth="17" strokeLinecap="round" opacity="0.88" />
        <path d="M-140 748 C 240 686 520 790 850 724 S 1270 668 1600 762" fill="none" stroke="url(#gB)" strokeWidth="10" strokeLinecap="round" opacity="0.78" />
        <path d="M-120 836 C 320 744 660 690 1000 590 S 1380 470 1620 386" fill="none" stroke="url(#gA)" strokeWidth="6" strokeLinecap="round" opacity="0.6" />

        {/* 丝芯高光 */}
        <path d="M-140 252 C 210 160 470 336 780 256 S 1190 158 1600 276" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M-140 452 C 190 372 470 520 790 444 S 1210 366 1600 470" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        <path d="M-140 648 C 250 574 540 700 860 632 S 1250 566 1600 668" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* 散落的镜面碎片 */}
      <g filter="url(#fAmbient)" opacity="0.5">
        <ellipse cx="1010" cy="232" rx="120" ry="7" fill="#fff" opacity="0.5" />
        <ellipse cx="1270" cy="742" rx="170" ry="6" fill="#fff" opacity="0.35" />
        <ellipse cx="470" cy="866" rx="150" ry="5" fill="#ffd93d" opacity="0.3" />
      </g>
    </svg>
  )
}
