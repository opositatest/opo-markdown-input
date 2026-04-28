import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [react()],
  build: {
    lib: {
      entry: './src/web-component-entry.ts',
      formats: ['es'],
      fileName: () => 'editor.js',
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        codeSplitting: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'editor.css'
          }

          return '[name][extname]'
        },
      },
    },
  },
})
