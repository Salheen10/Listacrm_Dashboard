import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages serves the app under /Listacrm_Dashboard/; Vercel serves it at the domain root.
export default defineConfig({
  plugins: [vue()],
  base: process.env.VERCEL ? '/' : '/Listacrm_Dashboard/'
})
