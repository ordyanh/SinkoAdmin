/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_TARGET?: string;
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_CORE_API_URL?: string;
  readonly VITE_LOCAL_AUTH_URL?: string;
  readonly VITE_LOCAL_CORE_URL?: string;
  readonly VITE_REMOTE_AUTH_URL?: string;
  readonly VITE_REMOTE_CORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
