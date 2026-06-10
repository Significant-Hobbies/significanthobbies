// Self-contained flat config. The shared @saas-maker/eslint-config/next was
// removed: its installed 1.0.2 needed @eslint/eslintrc, which eslint 10 no
// longer provides. eslint-config-next 16 ships native flat-config arrays,
// but bundles eslint-plugin-react 7.x, which also breaks on eslint 10
// (legacy context API) — strip that plugin and its rules, keep the rest.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const stripReactPlugin = (configs) =>
  configs.map((config) => {
    const hasReactPlugin = Boolean(config.plugins?.react);
    const hasReactRules = Object.keys(config.rules ?? {}).some((rule) =>
      rule.startsWith("react/"),
    );
    if (!hasReactPlugin && !hasReactRules) return config;
    const { react: _react, ...plugins } = config.plugins ?? {};
    const rules = Object.fromEntries(
      Object.entries(config.rules ?? {}).filter(
        ([rule]) => !rule.startsWith("react/"),
      ),
    );
    return { ...config, plugins, rules };
  });

export default [
  ...stripReactPlugin(coreWebVitals),
  ...typescript,
  {
    // Match the fleet-wide shared config, which reports these as warnings.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/triple-slash-reference": "warn",
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      "drizzle/**",
      "worker.mjs",
    ],
  },
];
