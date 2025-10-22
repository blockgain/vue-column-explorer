import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueColumnExplorer',
      fileName: (format) => `vue-column-explorer.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'lucide-vue-next'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          'lucide-vue-next': 'LucideVueNext'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
