import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import svgr from 'vite-plugin-svgr'
import { visualizer } from 'rollup-plugin-visualizer'

const devServerPort = Number(process.env.VITE_DEV_SERVER_PORT || 3000);
const devServerClientPort = Number(process.env.VITE_DEV_SERVER_CLIENT_PORT || devServerPort);
const devServerHost = process.env.VITE_DEV_SERVER_HOST || '0.0.0.0';
const devServerHmrHost = process.env.VITE_DEV_SERVER_HMR_HOST || 'localhost';

const plugins = [
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
    process.env.ANALYZE
      ? visualizer({
          filename: 'build/stats.html',
          gzipSize: true,
          brotliSize: true,
        })
      : null,
  ].filter(Boolean)

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@fortawesome/react-fontawesome': path.resolve(__dirname, './src/icon-shims/fontawesome-react.jsx'),
      '@fortawesome/free-solid-svg-icons': path.resolve(__dirname, './src/icon-shims/fontawesome-solid.js'),
      '@fortawesome/free-regular-svg-icons': path.resolve(__dirname, './src/icon-shims/fontawesome-regular.js'),
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: devServerPort,
    host: devServerHost,
    strictPort: true,
    allowedHosts: true,
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://backend:8001',
        changeOrigin: true,
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'build',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    // Strip console.log and debugger in production
    esbuild: {
      drop: ['debugger'],
      pure: ['console.log', 'console.debug', 'console.trace'],
    },
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // --- React core (good for long-term caching) ---
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor';
          }

          // --- Streamdown ecosystem: ALL loaded via CDN (Safari compat) ---
          // Do NOT bundle any streamdown modules - they use ES2018 regex
          // that crashes Safari iOS < 16.4 at parse time.

          // --- PDF: split pdfjs-dist (large) from viewer ---
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }

          if (id.includes('@react-pdf-viewer') || id.includes('@react-pdf/renderer')) {
            return 'pdf-viewer';
          }

          // --- UI framework ---
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }

          // --- Routing ---
          if (id.includes('react-router')) {
            return 'router';
          }

          // --- State management ---
          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'redux';
          }

          // --- Charts ---
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }

          // --- LiveKit ---
          if (id.includes('livekit')) {
            return 'livekit';
          }

          // --- Firebase ---
          if (id.includes('firebase')) {
            return 'firebase';
          }

          // --- Rich text editor ---
          if (id.includes('react-draft-wysiwyg') || id.includes('draft-js') || id.includes('draftjs-to-html')) {
            return 'editor';
          }

          // --- Maps ---
          if (id.includes('react-leaflet') || id.includes('leaflet') || id.includes('@goongmaps')) {
            return 'maps';
          }

          // --- Spreadsheet ---
          if (id.includes('xlsx')) {
            return 'xlsx';
          }

          // --- i18n ---
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }

          // --- Swiper ---
          if (id.includes('swiper')) {
            return 'swiper';
          }
        },
      },
      onwarn(warning, warn) {
        // Suppress eval warning from pdfjs-dist (third-party, cannot fix)
        if (warning?.message?.includes('pdfjs-dist') && warning?.message?.includes('eval')) {
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
