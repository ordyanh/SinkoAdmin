import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import compression from "compression";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeUrl = (url) => (url ? url.replace(/\/+$/, "") : "");

const isAzure = Boolean(process.env.WEBSITE_INSTANCE_ID || process.env.WEBSITE_SITE_NAME);
const defaultTarget = isAzure || process.env.NODE_ENV === "production" ? "remote" : "local";
const isLocal = (process.env.VITE_BACKEND_TARGET || defaultTarget).toLowerCase() === "local";

const LOCAL_CORE_DEFAULT = "http://localhost:5206";
const REMOTE_CORE_DEFAULT = "https://synco-h4etbseqg4h2ewcw.swedencentral-01.azurewebsites.net";

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
    coreBackend: CORE_SERVICE_URL,
    timestamp: new Date().toISOString()
  });
});

// Proxy Core Service Admin APIs to Azure Backend
app.use(
  createProxyMiddleware({
    pathFilter: (pathname) => /^\/api\//i.test(pathname),
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    secure: false,
    followRedirects: true,
  })
);

// 1. Serve static assets with caching
app.use(
  "/assets",
  express.static(path.join(__dirname, "dist/assets"), {
    immutable: true,
    maxAge: "1y",
  })
);
app.use(express.static(path.join(__dirname, "dist"), { maxAge: "1h" }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// 2. SPA client-side routing fallback - always serve index.html for all page routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SinkoAdmin listening on port ${port}`);
  console.log(`Backend Target: ${isLocal ? "LOCAL (http://localhost:5206)" : "REMOTE (Azure Cloud)"}`);
  console.log(`Core Service URL: ${CORE_SERVICE_URL}`);
});
