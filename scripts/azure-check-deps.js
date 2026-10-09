// Quick server dependency verification script for Azure deployment
const modules = [
  "express",
  "compression",
  "http-proxy-middleware",
];

async function check() {
  for (const mod of modules) {
    try {
      await import(mod);
    } catch (err) {
      console.error(`Missing dependency: ${mod}`);
      process.exit(1);
    }
  }
  console.log("All server dependencies are installed.");
}

check();
