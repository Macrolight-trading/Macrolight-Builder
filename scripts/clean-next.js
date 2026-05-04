const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const nextDir = path.join(process.cwd(), ".next");

if (!fs.existsSync(nextDir)) {
  process.exit(0);
}

const removeWithFs = () => {
  fs.rmSync(nextDir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 200,
  });
};

try {
  removeWithFs();
} catch (error) {
  if (process.platform !== "win32") {
    throw error;
  }

  const cleanup = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      `if (Test-Path '${nextDir}') { Remove-Item -Recurse -Force '${nextDir}' }`,
    ],
    { stdio: "inherit" }
  );

  if (cleanup.status !== 0) {
    throw error;
  }
}