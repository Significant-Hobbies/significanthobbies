import config from "@saas-maker/eslint-config/next";

export default [
  // landing-astro is generated/overlaid (own tooling), same as linkchat.
  { ignores: ["drizzle/**", "worker.mjs", "landing-astro/**"] },
  ...config,
  // Pin the React version: eslint-plugin-react's auto-detection calls
  // context.getFilename, which eslint 10 removed (same pattern as linkchat).
  { settings: { react: { version: "19.0.0" } } },
  {
    rules: {
      // 9 existing violations need real refactors (sync-from-storage effects
      // in hooks/side-quests); keep visible as warnings until then.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
