/// <reference types="vitest/config" />

import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts']
  }
});
