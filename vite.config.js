import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  server: {
    host: '127.0.0.1',
    port: 10610,
    strictPort: true,
    open: false
  },
  preview: {
    host: '127.0.0.1',
    port: 10610,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
