// 页面里用的是烤好的位图（public/aurora.webp、aurora@2x.webp），不是这堆滤镜。
// 原因：feTurbulence + feDisplacementMap + 大面积模糊在滚动时会被反复重栅格化，
// 实测每帧 ~250ms（3.5fps）。图由 scripts/bake-aurora.mjs 从 AuroraSvg.jsx 生成；
// 想改光带形状就改 AuroraSvg.jsx，再跑一次 node scripts/bake-aurora.mjs。
export default function Aurora() {
  return (
    <img
      className="aurora"
      src="./aurora.webp"
      srcSet="./aurora.webp 1x, ./aurora@2x.webp 2x"
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchPriority="high"
      draggable="false"
    />
  )
}
