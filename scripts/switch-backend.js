import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

const LOCAL_CORE = "http://localhost:5206";
const REMOTE_CORE = "https://synco-h4etbseqg4h2ewcw.swedencentral-01.azurewebsites.net";

const targetArg = (process.argv[2] || "").toLowerCase().trim();

function readEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

function writeEnv(target) {
  const isLocal = target === "local";
  const activeUrl = isLocal ? LOCAL_CORE : REMOTE_CORE;
  const content = `# SinkoAdmin Backend Target Configuration
# Values: "local" | "remote"
VITE_BACKEND_TARGET=${isLocal ? "local" : "remote"}

# Active Core API URL (Horeca API with AdminController)
VITE_CORE_API_URL=${activeUrl}

# Local C:\\Src\\synco-app\\Horeca endpoint
VITE_LOCAL_CORE_URL=${LOCAL_CORE}

# Remote Azure cloud endpoint
VITE_REMOTE_CORE_URL=${REMOTE_CORE}
`;

  fs.writeFileSync(envPath, content, "utf-8");
  console.log(`\n======================================================`);
  console.log(` Switched SinkoAdmin Backend Target to: ${isLocal ? "LOCAL (C:\\Src\\synco-app\\Horeca :5206)" : "REMOTE (Azure Cloud)"}`);
  console.log(`======================================================`);
  console.log(` Admin API URL: ${activeUrl}`);
  console.log(`\nRestart Vite dev server if running to apply proxy changes.\n`);
}

function showStatus() {
  const env = readEnv();
  const target = (env.VITE_BACKEND_TARGET || "remote").toLowerCase();
  const isLocal = target === "local";
  console.log(`\n======================================================`);
  console.log(` Current SinkoAdmin Backend Target: ${isLocal ? "LOCAL" : "REMOTE"}`);
  console.log(`======================================================`);
  console.log(` Target Mode : ${target}`);
  console.log(` Core API URL: ${env.VITE_CORE_API_URL || (isLocal ? LOCAL_CORE : REMOTE_CORE)}`);
  console.log(`\nTo switch:\n  npm run use:local   (switch to C:\\Src\\synco-app\\Horeca local backend :5206)\n  npm run use:remote  (switch to Azure remote cloud backend)\n`);
}

if (targetArg === "local" || targetArg === "remote") {
  writeEnv(targetArg);
} else if (targetArg === "toggle") {
  const env = readEnv();
  const current = (env.VITE_BACKEND_TARGET || "remote").toLowerCase();
  writeEnv(current === "local" ? "remote" : "local");
} else {
  showStatus();
}
