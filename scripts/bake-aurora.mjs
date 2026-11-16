// 把 Aurora 的 SVG 滤镜一次性烤成位图。
// 原因：feTurbulence + feDisplacementMap + 大面积模糊在滚动时会被反复重栅格化，
// 实测每帧 ~250ms（3.5fps）；烤成图后只是一次纹理合成。
//
// 用法：node scripts/bake-aurora.mjs
// 前提：dev server 在 5178，Edge 调试端口 9223 已开。
import { writeFileSync } from 'node:fs'

const PORT = 9223
const BASE = 'http://127.0.0.1:5178/'
const OUT_DIR = 'public'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function cdpConnect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  const pending = new Map()
  let id = 0
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
    }
  })
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true })
    ws.addEventListener('error', rej, { once: true })
  })
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id
      pending.set(mid, { resolve, reject })
      ws.send(JSON.stringify({ id: mid, method, params }))
    })
  return { ws, send, ready }
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
const page = list.find((t) => t.type === 'page')
const cdp = cdpConnect(page.webSocketDebuggerUrl)
await cdp.ready

await cdp.send('Page.enable')
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})
await cdp.send('Page.navigate', { url: `${BASE}?aurora-bake=${Date.now()}` })
await sleep(2600)

// 透明背景，避免把黑底烤进去
await cdp.send('Emulation.setDefaultBackgroundColorOverride', {
  color: { r: 0, g: 0, b: 0, a: 0 },
})

for (const scale of [1, 2]) {
  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'webp',
    quality: 82,
    clip: { x: 0, y: 0, width: 1440, height: 900, scale },
    captureBeyondViewport: false,
  })
  const buf = Buffer.from(shot.data, 'base64')
  const name = scale === 1 ? 'aurora.webp' : 'aurora@2x.webp'
  writeFileSync(`${OUT_DIR}/${name}`, buf)
  console.log(`${name}  ${(buf.length / 1024).toFixed(0)} KB`)
}

cdp.ws.close()
