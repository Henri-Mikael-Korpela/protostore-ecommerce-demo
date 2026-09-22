import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { javaDto } from './plugin/java-dto.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    javaDto({
      prefix: '@protostore',
      javaRoot: '../backend/src/main/java/com/prostore',
      // Keep in sync with `paths` in tsconfig.app.json
      outDir: '.generated/protostore',
    }),
    react(),
  ],
})
