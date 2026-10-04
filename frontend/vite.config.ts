import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = env.VITE_API_BASE_URL || '/api';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiBaseUrl.startsWith('/api') ? 'http://localhost:3101' : apiBaseUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, '/api'),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
