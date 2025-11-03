import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/hippo-drum-machine/',
  plugins: [react()],
  server: {
    port: 8111
  }
})
