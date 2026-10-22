import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeUrl = (url) => (url ? url.replace(/\/+$/, "") : "");

const defaultTarget = process.env.NODE_ENV === "production" ? "remote" : "local";
const isLocal = (process.env.VITE_BACKEND_TARGET || defaultTarget).toLowerCase() === "local";

const LOCAL_AUTH_DEFAULT = "http://127.0.0.1:5273";
const LOCAL_CORE_DEFAULT = "http://127.0.0.1:5206";
const REMOTE_AUTH_DEFAULT = "https://lobster-app-zhysf.ondigitalocean.app";
const REMOTE_CORE_DEFAULT = "https://octopus-app-bomx6.ondigitalocean.app";

const AUTH_SERVICE_URL = normalizeUrl(
  isLocal
    ? process.env.VITE_LOCAL_AUTH_URL || LOCAL_AUTH_DEFAULT
    : process.env.VITE_REMOTE_AUTH_URL || process.env.VITE_AUTH_API_URL || REMOTE_AUTH_DEFAULT
);

const CORE_SERVICE_URL = normalizeUrl(
  isLocal
    ? process.env.VITE_LOCAL_CORE_URL || LOCAL_CORE_DEFAULT
    : process.env.VITE_REMOTE_CORE_URL || process.env.VITE_CORE_API_URL || REMOTE_CORE_DEFAULT
);

const app = express();
app.disable("x-powered-by");
app.use(compression());

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.json({
    status: "healthy",
    service: "SinkoAdmin",
    target: isLocal ? "local" : "remote",
    authBackend: AUTH_SERVICE_URL,
    coreBackend: CORE_SERVICE_URL,
    timestamp: new Date().toISOString(),
  });
});

// 1. Proxy Auth Service APIs
app.use(
  createProxyMiddleware({
    pathFilter: (pathname) =>
      /^\/(api\/(auth|company|employee|verification-request|auth\/complete-onboarding|supplier\/(register|verify|resend-code)|me)|auth|me)/i.test(
        pathname
      ),
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    followRedirects: true,
  })
);

// 2. Proxy Core Service APIs
app.use(
  createProxyMiddleware({
    pathFilter: (pathname) => /^\/api\//i.test(pathname),
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    followRedirects: true,
  })
);

// 3. Serve static assets with caching
app.use(
  "/assets",
  express.static(path.join(__dirname, "dist/assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(express.static(path.join(__dirname, "dist"), { maxAge: "1h" }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// 4. SPA client-side routing fallback - always serve index.html for all page routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SinkoAdmin listening on port ${port}`);
  console.log(`Backend Target: ${isLocal ? "LOCAL (:5206 / :5273)" : "REMOTE (DigitalOcean Cloud)"}`);
  console.log(`  Auth Service URL: ${AUTH_SERVICE_URL}`);
  console.log(`  Core Service URL: ${CORE_SERVICE_URL}`);
});
