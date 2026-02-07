import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/matrix-game/',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  },
});
