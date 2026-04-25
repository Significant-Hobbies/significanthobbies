/**
 * Custom cf:build for significanthobbies in Fleet monorepo.
 *
 * Root cause: In this pnpm monorepo, Next.js standalone creates
 * .next/node_modules/.pnpm/next@.../  with only traced files — a sparse
 * subset. opennext's esbuild fails because it can't resolve next's internal
 * modules (node-environment.js, etc.) from this sparse store.
 *
 * Fix:
 * 1. Run pnpm build (generates .next with standalone + .nft.json files)
 * 2. Copy full next/dist into .next pnpm store so all files are accessible
 * 3. Patch .nft.json files to include the missing next server files
 *    (so copyTracedFiles copies them into .open-next)
 * 4. Run opennextjs-cloudflare build --skipNextBuild
 */
import { execSync } from "node:child_process";
import { readdirSync, existsSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(__dirname, "..");
const fleetRoot = resolve(projectDir, "..");

/** Find a next installation with the full dist/server (has node-environment.js) */
function findFullNextDir(entry) {
  // Try local project pnpm store first
  const localPnpm = join(projectDir, "node_modules/.pnpm");
  if (existsSync(localPnpm)) {
    const nextVer = entry.split("_")[0]; // e.g. "next@16.2.4"
    for (const localEntry of readdirSync(localPnpm)) {
      if (localEntry.startsWith(nextVer + "_")) {
        const candidate = join(localPnpm, localEntry, "node_modules/next");
        if (existsSync(join(candidate, "dist/server/node-environment.js"))) {
          return candidate;
        }
      }
    }
  }
  // Fallback: Fleet workspace pnpm store (same hash)
  const fleetPnpm = join(fleetRoot, "node_modules/.pnpm");
  if (existsSync(fleetPnpm)) {
    for (const fleetEntry of readdirSync(fleetPnpm)) {
      if (fleetEntry === entry) {
        const candidate = join(fleetPnpm, fleetEntry, "node_modules/next");
        if (existsSync(join(candidate, "dist/server/node-environment.js"))) {
          return candidate;
        }
      }
    }
  }
  return null;
}

/** Copy full next/dist into the sparse .next/node_modules/.pnpm/next@... store */
function patchDotNextStore() {
  const dotNextPnpm = join(projectDir, ".next/node_modules/.pnpm");
  if (!existsSync(dotNextPnpm)) return;

  for (const entry of readdirSync(dotNextPnpm)) {
    if (!entry.startsWith("next@")) continue;
    const sparseNextDir = join(dotNextPnpm, entry, "node_modules/next");
    const fullNextDir = findFullNextDir(entry);
    if (!fullNextDir) { console.warn(`  Full next not found for: ${entry.slice(0, 50)}`); continue; }

    console.log(`  Copying next/dist into .next store...`);
    for (const subdir of ["dist/server", "dist/shared", "dist/lib", "dist/build"]) {
      const src = join(fullNextDir, subdir);
      if (existsSync(src)) cpSync(src, join(sparseNextDir, subdir), { recursive: true, force: true });
    }
    console.log(`  Done`);
  }
}

/** Patch all .nft.json files to include missing next server/shared/lib files */
function patchNftFiles() {
  const dotNext = join(projectDir, ".next");
  const sampleNft = join(dotNext, "server/app/page.js.nft.json");
  if (!existsSync(sampleNft)) return;

  const sample = JSON.parse(readFileSync(sampleNft, "utf8"));
  // Find the path prefix used for the next package (e.g. "../../../node_modules/next")
  const nextEntry = sample.files.find(f => f.includes("node_modules/next") && !f.includes(".pnpm") && !f.endsWith("package.json"));
  if (!nextEntry) { console.warn("  Could not find next prefix in nft.json"); return; }
  // Strip the trailing path to get just the prefix (e.g. ../../../node_modules/next)
  const nextPkgPrefix = nextEntry.slice(0, nextEntry.indexOf("node_modules/next") + "node_modules/next".length);

  const MISSING_FILES = [
    "dist/server/node-environment.js", "dist/server/node-environment-baseline.js",
    "dist/server/node-polyfill-crypto.js", "dist/server/request-meta.js",
    "dist/server/base-server.js", "dist/server/require.js", "dist/server/send-payload.js",
    "dist/server/load-components.js", "dist/server/web/utils.js", "dist/server/base-http/node.js",
    "dist/server/api-utils/index.js", "dist/server/api-utils/node/index.js",
    "dist/server/lib/lru-cache.js", "dist/server/route-kind.js",
    "dist/server/lib/streaming-metadata.js", "dist/server/web/adapter.js",
    "dist/server/lib/fallback.js", "dist/server/lib/postponed-request-body.js",
    "dist/shared/lib/utils.js", "dist/shared/lib/constants.js",
    "dist/shared/lib/router/utils/route-matcher.js",
    "dist/shared/lib/router/utils/middleware-route-matcher.js",
    "dist/shared/lib/router/utils/parse-url.js",
    "dist/shared/lib/router/utils/querystring.js",
    "dist/shared/lib/router/utils/cache-busting-search-param.js",
    "dist/shared/lib/page-path/denormalize-page-path.js",
    "dist/shared/lib/page-path/normalize-page-path.js",
    "dist/shared/lib/page-path/absolute-path-to-page.js",
    "dist/shared/lib/is-plain-object.js",
    "dist/shared/lib/no-fallback-error.external.js",
    "dist/shared/lib/i18n/normalize-locale-path.js",
    "dist/lib/find-pages-dir.js", "dist/lib/is-error.js", "dist/lib/picocolors.js",
    "dist/build/output/log.js",
  ];

  const nftFiles = [];
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".nft.json")) nftFiles.push(p);
    }
  }
  walk(join(dotNext, "server"));

  let patched = 0;
  for (const nftPath of nftFiles) {
    try {
      const d = JSON.parse(readFileSync(nftPath, "utf8"));
      const existing = new Set(d.files);
      // Find prefix for this specific nft file
      const thisNextEntry = d.files.find(f => f.includes("node_modules/next") && !f.includes(".pnpm") && !f.endsWith("package.json"));
      const prefix = thisNextEntry
        ? thisNextEntry.slice(0, thisNextEntry.indexOf("node_modules/next") + "node_modules/next".length)
        : nextPkgPrefix;
      let added = 0;
      for (const mf of MISSING_FILES) {
        const p = `${prefix}/${mf}`;
        if (!existing.has(p)) { d.files.push(p); added++; }
      }
      if (added > 0) { writeFileSync(nftPath, JSON.stringify(d)); patched++; }
    } catch { /* skip */ }
  }
  console.log(`  Patched ${patched}/${nftFiles.length} .nft.json files with ${MISSING_FILES.length} missing entries`);
}

// Step 1: Next.js build (generates .next with standalone + fresh .nft.json files)
console.log("[cf-build] Step 1: Running Next.js build...");
execSync("pnpm build", { cwd: projectDir, stdio: "inherit" });

// Step 2: Copy full next/dist into .next pnpm store
console.log("[cf-build] Step 2: Patching .next pnpm store with full next dist...");
patchDotNextStore();

// Step 3: Patch .nft.json files to include the missing next files
// (copyTracedFiles reads these to know which files to copy into .open-next)
console.log("[cf-build] Step 3: Patching .nft.json trace files...");
patchNftFiles();

// Step 4: Run opennext bundle-only (reads patched .nft.json, populates .open-next, runs esbuild)
console.log("[cf-build] Step 4: Running opennext bundle step (--skipNextBuild)...");
execSync("node_modules/.bin/opennextjs-cloudflare build --skipNextBuild", {
  cwd: projectDir,
  stdio: "inherit",
});

console.log("[cf-build] Build complete!");
