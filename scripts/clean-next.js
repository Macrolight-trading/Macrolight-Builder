const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const nextDir = path.join(process.cwd(), ".next");

if (!fs.existsSync(nextDir)) {
  process.exit(0);
}

// On Windows/OneDrive, .next files are sometimes briefly locked by the
// sync client. Strategy:
// 1. Try fs.rmSync with generous retries to ride out transient locks.
// 2. Fall back to PowerShell: use robocopy to mirror an empty dir over
//    .next (evicts locked handles), then Remove-Item.


const tryFsRemove = () => {
  try {
    fs.rmSync(nextDir, {
      recursive: true,
      force: true,
      maxRetries: 15,
      retryDelay: 300,
    });
    return true;
  } catch {
    return false;
  }
};

if (tryFsRemove()) {
  process.exit(0);
}

if (process.platform !== "win32") {
  console.error("Failed to remove .next directory");
  process.exit(1);
}

// PowerShell fallback: robocopy an empty temp dir over .next to evict
// locked files, then force-remove.
const emptyDir = path.join(process.cwd(), ".next-empty-tmp");
fs.mkdirSync(emptyDir, { recursive: true });

spawnSync(
  "robocopy",
  [emptyDir, nextDir, "/MIR", "/NFL", "/NDL", "/NJH", "/NJS"],
  { stdio: "ignore" }
);

fs.rmSync(emptyDir, { recursive: true, force: true });

const ps = spawnSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    `if (Test-Path '${nextDir}') { Remove-Item -Recurse -Force '${nextDir}' -ErrorAction SilentlyContinue }`,
  ],
  { stdio: "inherit" }
);

if (!fs.existsSync(nextDir)) {
  process.exit(0);
}

console.error("Warning: could not fully remove .next — continuing anyway.");
process.exit(0);
