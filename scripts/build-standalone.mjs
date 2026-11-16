// 打包成「一个 HTML 文件」：JS、CSS、图片全部内联成 data URI，
// 双击就能看，不需要 dev server，也不需要联网。
// 用法：node scripts/build-standalone.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, basename } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')

console.log('· vite build')
execFileSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build'], {
  stdio: 'inherit',
  cwd: root,
})

const MIME = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

const dataUri = (file) =>
  `data:${MIME[extname(file).toLowerCase()] || 'application/octet-stream'};base64,${readFileSync(file).toString('base64')}`

let html = readFileSync(join(dist, 'index.html'), 'utf8')

// <script type="module" crossorigin src="./assets/index-xxx.js"></script> → 内联
html = html.replace(
  /<script[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (_, src) => `<script type="module">\n${readFileSync(join(dist, src.replace(/^\.?\//, '')), 'utf8')}\n</script>`
)

// <link rel="stylesheet" href="..."> → <style>
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_, href) => `<style>\n${readFileSync(join(dist, href.replace(/^\.?\//, '')), 'utf8')}\n</style>`
)

// modulepreload 已经不需要了
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '')

// 图片转 data URI（在 JS 字符串里出现的就是这些相对路径）
const inlined = new Map()
const addImage = (rel) => {
  const file = join(dist, rel.replace(/^\.\//, ''))
  if (!inlined.has(rel)) inlined.set(rel, dataUri(file))
  return inlined.get(rel)
}

// srcSet 里的 2x 变体先去掉：data URI 自带逗号，会破坏 srcSet 的解析
html = html.replace(/"?\.\/aurora\.webp 1x, \.\/aurora@2x\.webp 2x"?/g, 'void 0')
html = html.split(`"./aurora.webp"`).join(`"${dataUri(join(dist, 'aurora@2x.webp'))}"`)

for (const f of readdirSync(join(dist, 'works'))) {
  html = html.split(`'./works/${f}'`).join(`'${addImage(`works/${f}`)}'`)
  html = html.split(`"./works/${f}"`).join(`"${addImage(`works/${f}`)}"`)
}

const out = join(dist, 'paqi.html')
writeFileSync(out, html)
const kb = (statSync(out).size / 1024 / 1024).toFixed(2)
console.log(`· 生成 ${out}（${kb} MB，内联 ${inlined.size} 张图）`)
