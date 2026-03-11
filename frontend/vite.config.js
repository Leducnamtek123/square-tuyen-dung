import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'

const devServerPort = Number(process.env.VITE_DEV_SERVER_PORT || 3000);
const devServerClientPort = Number(process.env.VITE_DEV_SERVER_CLIENT_PORT || devServerPort);
const devServerHost = process.env.VITE_DEV_SERVER_HOST || '0.0.0.0';
const devServerHmrHost = process.env.VITE_DEV_SERVER_HMR_HOST || 'localhost';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        dimensions: false,
        expandProps: true,
        svgo: true,
        titleProp: true,
        ref: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fortawesome/react-fontawesome': path.resolve(__dirname, './src/icon-shims/fontawesome-react.jsx'),
      '@fortawesome/free-solid-svg-icons': path.resolve(__dirname, './src/icon-shims/fontawesome-solid.js'),
      '@fortawesome/free-regular-svg-icons': path.resolve(__dirname, './src/icon-shims/fontawesome-regular.js'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: devServerPort,
    host: devServerHost,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: devServerHmrHost,
      port: devServerClientPort
    },
    proxy: {
      '/api': {
        target: 'http://backend:8001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
  },
})
