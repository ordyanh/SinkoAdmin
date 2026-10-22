import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeUrl = (url?: string) => (url ? url.replace(/\/+$/, '') : '');

const LOCAL_AUTH_DEFAULT = 'http://127.0.0.1:5273';
const LOCAL_CORE_DEFAULT = 'http://127.0.0.1:5206';
const REMOTE_AUTH_DEFAULT = 'https://lobster-app-zhysf.ondigitalocean.app';
const REMOTE_CORE_DEFAULT = 'https://octopus-app-bomx6.ondigitalocean.app';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = (env.VITE_BACKEND_TARGET || 'remote').toLowerCase();
  const isLocal = target === 'local';

  const authUrl = normalizeUrl(
    isLocal
      ? env.VITE_LOCAL_AUTH_URL || LOCAL_AUTH_DEFAULT
      : env.VITE_REMOTE_AUTH_URL || env.VITE_AUTH_API_URL || REMOTE_AUTH_DEFAULT
  );

  const coreUrl = normalizeUrl(
    isLocal
      ? env.VITE_LOCAL_CORE_URL || LOCAL_CORE_DEFAULT
      : env.VITE_REMOTE_CORE_URL || env.VITE_CORE_API_URL || REMOTE_CORE_DEFAULT
  );

  return {
    plugins: [react()],
    server: {
      port: 5180,
      host: true,
      allowedHosts: true,
      proxy: {
        // Auth Service API routes
        '^/(api/([Aa]uth|[Cc]ompany|[Ee]mployee|verification-request|auth/complete-onboarding|[Ss]upplier/(register|verify|resend-code)|me)|[Aa]uth|me)': {
          target: authUrl,
          changeOrigin: true,
          secure: false,
          followRedirects: true,
        },
        // Core Web API routes (Admin, Products, Orders, etc.)
        '/api': {
          target: coreUrl,
          changeOrigin: true,
          secure: false,
          followRedirects: true,
        },
      },
    },
    preview: {
      port: 5180,
    },
  };
});
