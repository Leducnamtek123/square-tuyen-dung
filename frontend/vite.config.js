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
    hmr: false,
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@streamdown/mermaid') || id.includes('mermaid') || id.includes('cytoscape')) {
            return 'mermaid';
          }

          if (id.includes('@streamdown/code') || id.includes('shiki')) {
            return 'code';
          }

          if (id.includes('@streamdown/math')) {
            return 'math';
          }

          if (id.includes('@streamdown/cjk') || id.includes('streamdown')) {
            return 'streamdown';
          }

          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }

          if (id.includes('@react-pdf-viewer') || id.includes('@react-pdf/renderer')) {
            return 'pdf';
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'redux';
          }

          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }

          if (id.includes('livekit')) {
            return 'livekit';
          }

          if (id.includes('firebase')) {
            return 'firebase';
          }

          if (id.includes('react-draft-wysiwyg') || id.includes('draft-js') || id.includes('draftjs-to-html')) {
            return 'editor';
          }

          if (id.includes('react-leaflet') || id.includes('leaflet') || id.includes('@goongmaps')) {
            return 'maps';
          }

          if (id.includes('xlsx')) {
            return 'xlsx';
          }
        },
      },
      onwarn(warning, warn) {
        if (warning?.message?.includes('pdfjs-dist') && warning?.message?.includes('Use of eval')) {
          return;
        }

        warn(warning);
      },
    },
  },
  optimizeDeps: {
    exclude: ['react-virtuoso'],
  },
})
