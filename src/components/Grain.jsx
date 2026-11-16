export default function Grain() {
  // 颗粒与扫描线合成在同一层（.grain），省掉一层全屏合成
  return <div className="grain" aria-hidden="true" />
}
