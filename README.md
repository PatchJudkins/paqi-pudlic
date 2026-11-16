# PATCH JUDKINS

帕奇（PatchJudkins）的个人网站 —— 作品集 + 自我介绍。

黑底、虹彩薄膜、胶片颗粒；七色光谱在暗场里流动。React + Vite，零 UI 库、零网络字体、零图片依赖（除了作品图）。

```
npm install
npm run dev      # http://127.0.0.1:5178
npm run build    # dist/
```

## 结构

```
index.html              入口
src/
  App.jsx              页面装配 + 进场动画 + 深链接
  main.jsx             挂载与样式引入
  components/          Hero / Marquee / Works / About / Contact / Nav …
    Aurora.jsx         背景虹彩（一张烤好的位图，见下）
    AuroraSvg.jsx      虹彩的 SVG 源文件（重新烤图用）
    FpsMeter.jsx       实时帧率表（?fps=1 才出现）
  data/works.js        作品列表
  styles/
    tokens.css         颜色 / 字体 / 间距变量
    global.css         基础样式、颗粒、进场
    components.css     各区块
public/
  aurora.webp          背景虹彩 1440×900
  aurora@2x.webp       背景虹彩 2880×1800
  works/               作品图（最长边 1200，JPEG q82）
scripts/
  bake-aurora.mjs      重新生成背景虹彩位图
  shoot.mjs            CDP 精确截图（无窗口白边）
  build-standalone.mjs 打包成单个自包含 HTML
  perf.mjs             分场景帧耗时探针
  load.mjs             冷启动加载探针
```

## 关于性能

背景的液态虹彩最初是实时 SVG 滤镜（`feTurbulence` + `feDisplacementMap` + 大范围模糊）。它很漂亮，但**滚动时每一帧都会被重新栅格化**，实测 282ms 一帧 —— 3.5fps。

现在改成：用同一套 SVG 通过 CDP 截一张带透明通道的 WebP，页面里放 `<img>`，流动感交给 CSS `transform` 缓慢漂移（纯合成器，不重绘）。想改光带形状就改 `src/components/AuroraSvg.jsx`，然后：

```
npm run bake:aurora
```

另外三处也是同样的思路 —— 用一次性代价换掉每帧代价：

- 全屏 `mix-blend-mode` 层全部去掉（2560×1440 下每帧要重做全屏混合，滚动 31fps → 60fps）
- 颗粒和扫描线合并成一个全屏层
- 文字的全息色相循环改成 `steps()` 跳变，不再是逐帧 `hue-rotate`

1080p 实测：滚动、移动鼠标、滚过作品区都是 60fps，冷启动 FCP/LCP 244ms，无长任务。

## 单文件版

```
npm run build:standalone   # → dist/paqi.html（约 2.2MB）
```

JS、CSS、图片全部内联进一个 HTML，双击即可打开，不需要服务器也不需要联网。

## 说明

作品、关于区的数字、邮箱和社交链接目前是占位内容，等待替换。
