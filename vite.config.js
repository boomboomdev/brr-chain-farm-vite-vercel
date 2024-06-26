import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host:"127.0.0.1",
    port:3000
  },
  optimizeDeps:{
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
          global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
          NodeGlobalsPolyfillPlugin({
              buffer: true
          })
      ]
  }
  }
})
