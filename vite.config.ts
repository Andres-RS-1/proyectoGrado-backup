import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  base: '/proyectoGrado-backup/',  // ← GitHub Pages path
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    outDir: 'dist',  // GitHub Pages lee aquí
    sourcemap: true  // Debug
  },
  server: {
    port: 5173,
    host: true
  }
})