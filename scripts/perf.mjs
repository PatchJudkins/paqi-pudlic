// 帧耗时探针：找出页面卡顿的真正来源。
// 用法：node scripts/perf.mjs [场景名...]
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
  const events = []
  let id = 0
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
    } else if (msg.method) {
      events.push(msg)
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
  return { ws, send, ready, events }
}

const BENCH = `
(async () => {
  const SCENARIOS = [
    { name: 'scroll', hide: [] },
    { name: 'scroll no-grain', hide: ['.grain'] },
    { name: 'mouse-move', hide: [], mode: 'mouse' },
    { name: 'mouse no-cursor', hide: ['.cursor-light'], mode: 'mouse' },
    { name: 'works area', hide: [], anchor: '#works' },
    { name: 'all-off', hide: ['.aurora', '.cursor-light', '.grain'] },
  ];

  const raf = () => new Promise((r) => requestAnimationFrame(r));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // mode: 'scroll' 或 'mouse'（派发 pointermove，测柔光 + 视差那条路径）
  async function measure(mode) {
    const deltas = [];
    let prev = performance.now();
    const t0 = prev;
    // 一边滚一边测
    const startY = window.scrollY;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    let i = 0;
    while (performance.now() - t0 < 1400) {
      await raf();
      const now = performance.now();
      deltas.push(now - prev);
      prev = now;
      const p = Math.min(1, (now - t0) / 1400);
      if (mode === 'mouse') {
        const a = (i += 1) / 26;
        window.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: cx + Math.cos(a) * cx * 0.8,
            clientY: cy + Math.sin(a) * cy * 0.6,
            bubbles: true,
          })
        );
      } else {
        window.scrollTo(0, startY + p * 900);
      }
    }
    if (mode !== 'mouse') window.scrollTo(0, startY);
    const sorted = deltas.slice(3).sort((a, b) => a - b);
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
    const long = sorted.filter((d) => d > 32).length;
    return {
      frames: sorted.length,
      avg: +avg.toFixed(1),
      p50: +at(0.5).toFixed(1),
      p95: +at(0.95).toFixed(1),
      max: +sorted[sorted.length - 1].toFixed(1),
      fps: +(1000 / avg).toFixed(1),
      longFrames: long,
    };
  }

  const out = [];
  for (const s of SCENARIOS) {
    const hidden = [];
    let styleEl = null;
    if (s.css) {
      styleEl = document.createElement('style');
      styleEl.textContent = s.css;
      document.head.appendChild(styleEl);
    }
    for (const sel of s.hide) {
      document.querySelectorAll(sel).forEach((el) => {
        hidden.push([el, el.style.display]);
        el.style.display = 'none';
      });
    }
    await sleep(250);
    if (s.anchor) {
      document.querySelector(s.anchor)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      await sleep(300);
    }
    out.push({ scenario: s.name, ...(await measure(s.mode || 'scroll')) });
    for (const [el, prev] of hidden) el.style.display = prev;
    if (styleEl) styleEl.remove();
    await sleep(200);
  }
  return out;
})()
`

const results = []
const list = await targets()
const page = list.find((t) => t.type === 'page')
const cdp = cdpConnect(page.webSocketDebuggerUrl)
await cdp.ready

// node scripts/perf.mjs --w 2560 --h 1440 --dsf 1.5
const argv = process.argv.slice(2)
const argOf = (name, def) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? Number(argv[i + 1]) : def
}
const W = argOf('w', 1440)
const H = argOf('h', 900)
const DSF = argOf('dsf', 1)

const stamp = Date.now()
console.log(`viewport ${W}x${H} @${DSF}x`)

await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: W,
  height: H,
  deviceScaleFactor: DSF,
  mobile: false,
})
await cdp.send('Page.enable')
await cdp.send('Page.navigate', { url: `${URL_BASE}?s=${stamp}` })
await sleep(2500)

const res = await cdp.send('Runtime.evaluate', {
  expression: BENCH,
  awaitPromise: true,
  returnByValue: true,
})
const rows = res.result.value
console.log('scenario              avg    p50    p95    max   fps  long')
for (const r of rows) {
  console.log(
    [
      r.scenario.padEnd(20),
      String(r.avg).padStart(5),
      String(r.p50).padStart(6),
      String(r.p95).padStart(6),
      String(r.max).padStart(6),
      String(r.fps).padStart(5),
      String(r.longFrames).padStart(4),
    ].join(' ')
  )
}
results.push(rows)
cdp.ws.close()
