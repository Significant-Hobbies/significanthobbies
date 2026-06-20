// Plain flat ESLint config (formerly @saas-maker/eslint-config/next, inlined;
// no remote-standards fetch, no fallow plugin).
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  {
    ignores: [
      "dist",
      ".next",
      "build",
      ".wrangler",
      "node_modules",
      "out",
      ".open-next",
      // repo-specific:
      "drizzle/**",
      "worker.mjs",
      "landing-astro/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    },
  },
  // Pin the React version: eslint-plugin-react's auto-detection calls
  // context.getFilename, which eslint 10 removed.
  { settings: { react: { version: "19.0.0" } } },
  {
    rules: {
      // 9 existing violations need real refactors (sync-from-storage effects
      // in hooks/side-quests); keep visible as warnings until then.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  prettier,
];
