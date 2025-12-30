import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_PAGES_BASE ?? (repoName ? `/${repoName}/` : '/')

export default defineConfig({
  base,
  plugins: [vue()],
  build: {
    outDir: 'dist-playground',
  },
})
