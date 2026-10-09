import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_BACKEND_TARGET || 'remote';
  const backendUrl = target === 'local'
    ? (env.VITE_LOCAL_CORE_URL || 'http://localhost:5206')
    : (env.VITE_REMOTE_CORE_URL || 'https://synco-h4etbseqg4h2ewcw.swedencentral-01.azurewebsites.net');

  return {
    plugins: [react()],
    server: {
      port: 5180,
      host: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 5180,
    },
  };
});
