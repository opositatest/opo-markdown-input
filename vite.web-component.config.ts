import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function esmMarker(): Plugin {
  return {
    name: 'esm-marker',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.fileName === 'editor.js') {
          chunk.code += '\nexport {};\n'
        }
      }
    },
  }
}

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [react(), esmMarker()],
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
