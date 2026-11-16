import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 相对路径：dist 里的 index.html 双击（file://）也能找到资源
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5178,
    strictPort: true,
    watch: { ignored: ['**/.shots/**', '**/.edge-profile/**', '**/dist/**'] },
  },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
})
