// Use the actual independently locked Worker test project from repository-root
// tools as well as from services/hub-backend. Explicit ESM matches its plugin.
// This is the maintained compatibility Worker's test:worker scope. Retained
// root src tests belong to the retired Hub web product and are not revived here.
export { default } from "./services/hub-backend/vitest.config.ts";
