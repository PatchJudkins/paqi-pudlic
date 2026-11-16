// 首屏加载探针：冷启动时到底慢在哪。
// 用法：node scripts/load.mjs [--w 1920 --h 1080]
const PORT = 9223
const URL_BASE = 'http://127.0.0.1:5178/'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function targets() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
  return res.json()
}

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

const argv = process.argv.slice(2)
const argOf = (n, d) => {
  const i = argv.indexOf(`--${n}`)
  return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : d
}

const list = await targets()
const page = list.find((t) => t.type === 'page')
const cdp = cdpConnect(page.webSocketDebuggerUrl)
await cdp.ready

await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: argOf('w', 1920),
  height: argOf('h', 1080),
  deviceScaleFactor: argOf('dsf', 1),
  mobile: false,
})
await cdp.send('Network.enable')
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })

// 在文档创建前挂载长任务 + LCP 观察器
await cdp.send('Page.enable')
await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    window.__long = [];
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__long.push([Math.round(e.startTime), Math.round(e.duration)]);
    }).observe({ entryTypes: ['longtask'] });
    window.__lcp = 0;
    new PerformanceObserver((l) => {
      const e = l.getEntries().at(-1);
      window.__lcp = Math.round(e.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  `,
})

const t0 = Date.now()
await cdp.send('Page.navigate', { url: `${URL_BASE}?s=${t0}` })
await sleep(4000)

const { result } = await cdp.send('Runtime.evaluate', {
  expression: `(() => {
    const n = performance.getEntriesByType('navigation')[0] || {};
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint');
    return JSON.stringify({
      ttfb: Math.round(n.responseStart || 0),
      domInteractive: Math.round(n.domInteractive || 0),
      domContentLoaded: Math.round(n.domContentLoadedEventEnd || 0),
      load: Math.round(n.loadEventEnd || 0),
      fcp: fcp ? Math.round(fcp.startTime) : null,
      lcp: window.__lcp || null,
      longTasks: window.__long || [],
      resources: performance.getEntriesByType('resource')
        .map(r => [r.name.replace(location.origin, ''), Math.round(r.duration)])
        .sort((a, b) => b[1] - a[1]).slice(0, 6),
    });
  })()`,
  returnByValue: true,
})

const d = JSON.parse(result.value)
console.log(`冷启动（禁用缓存，${argOf('w', 1920)}x${argOf('h', 1080)}）`)
console.log(`  FCP ${d.fcp}ms   LCP ${d.lcp}ms   load ${d.load}ms   TTFB ${d.ttfb}ms`)
console.log(`  长任务：${d.longTasks.length ? d.longTasks.map(([s, dur]) => `${s}ms/${dur}ms`).join('  ') : '无'}`)
console.log('  最慢资源：')
for (const [name, dur] of d.resources) console.log(`    ${String(dur).padStart(4)}ms  ${name}`)
cdp.ws.close()
