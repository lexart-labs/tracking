import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors *",
    },
    allowedHosts: 'all',
  },
  test: {
    server: {
      deps: {
        inline: ['jsdom', 'html-encoding-sniffer', '@exodus/bytes'],
      },
    },
    include: ['src/tests/unit/**/*.{test,spec}.{js,jsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    css: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: { 
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/services/**', 'src/application/pages/**'],
    },
  },
})
