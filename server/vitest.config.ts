import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url)); 

export default defineConfig({
  test: {
    testTimeout: 15000,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: [path.resolve(__dirname, './src/test-setup.ts')],
    clearMocks: true,
    globals: false,
  }
})