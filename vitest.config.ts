/// <reference types="vitest/config" />

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // VitePWA injects this virtual module at build time. Point tests at a
      // local stub so importing the app does not fail during collection.
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/pwa-register-react.ts', import.meta.url)
      )
    }
  },
  test: {
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts']
  }
});
