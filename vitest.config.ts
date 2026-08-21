import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    // Needed so `import css from './foo.css?raw'` resolves to the real
    // stylesheet instead of an empty string (Vitest stubs CSS by default).
    css: true,
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test-setup.ts',
        'src/main.tsx',
        'src/web-component-entry.ts',
        'src/react-entry.ts',
        'src/app/**',
        'src/**/*.d.ts',
        'src/**/*.css',
        'src/web-component-test.ts',
      ],
    },
  },
})
