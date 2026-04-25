/**
 * Custom cf:build for significanthobbies in Fleet monorepo.
 *
 * opennext's esbuild step fails in the Fleet monorepo because node_modules/next
 * is a pnpm virtual-store symlink that doesn't expose internal dist/server files
 * (node-environment.js, request-meta.js, etc.) needed by esbuild.
 *
 * Fix: After the first opennext pass (which builds .next and populates
 * .open-next/server-functions/default/index.mjs), inject a real node_modules
 * symlink for `next` in server-functions/default/node_modules/ so that esbuild
 * can resolve relative next internals, then re-run the bundle-only step.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(__dirname, "..");
const serverFunctionsDefaultDir = join(projectDir, ".open-next/server-functions/default");
const nodeModulesDir = join(serverFunctionsDefaultDir, "node_modules");

function createSymlink(resolvePath, linkPath) {
  if (existsSync(linkPath)) return;
  try {
    const pkgJson = require.resolve(`${resolvePath}/package.json`, { paths: [projectDir] });
    const pkgDir = dirname(pkgJson);
    symlinkSync(pkgDir, linkPath);
    console.log(`  Symlinked: ${resolvePath} -> ${pkgDir}`);
  } catch (e) {
    console.warn(`  Could not symlink ${resolvePath}: ${e.message}`);
  }
}

function injectSymlinks() {
  if (!existsSync(serverFunctionsDefaultDir)) return;
  mkdirSync(nodeModulesDir, { recursive: true });

  const packages = [
    "next",
    "@libsql/client",
    "drizzle-orm",
    "better-auth",
  ];

  for (const pkg of packages) {
    if (pkg.startsWith("@")) {
      const [scope, name] = pkg.split("/");
      mkdirSync(join(nodeModulesDir, scope), { recursive: true });
      createSymlink(pkg, join(nodeModulesDir, scope, name));
    } else {
      createSymlink(pkg, join(nodeModulesDir, pkg));
    }
  }
}

console.log("[cf-build] Step 1: Running full opennext build (may fail at esbuild step)...");
try {
  execSync("node_modules/.bin/opennextjs-cloudflare build", {
    cwd: projectDir,
    stdio: "inherit",
  });
  console.log("[cf-build] Build succeeded on first try!");
  process.exit(0);
} catch {
  console.log("[cf-build] First build failed at esbuild step (expected in monorepo). Injecting symlinks...");
}

console.log("[cf-build] Step 2: Injecting node_modules symlinks...");
injectSymlinks();

console.log("[cf-build] Step 3: Re-running bundle step only (--skipNextBuild)...");
execSync("node_modules/.bin/opennextjs-cloudflare build --skipNextBuild", {
  cwd: projectDir,
  stdio: "inherit",
});
console.log("[cf-build] Build complete!");
