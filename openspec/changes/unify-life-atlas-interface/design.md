## Context

The current shell presents six peer links, `/life-plan` is account-rich but locally skeletal, and `/look-back` contains narrative history without the mortality or Trajectory surfaces that explain it. Existing data sources and focused routes are sound and must remain authoritative. The chosen visual direction is recorded in the root `DESIGN.md`.

## Goals / Non-Goals

**Goals:**
- Establish one reusable Life Atlas composition across the global shell and two merged pages.
- Reuse existing server queries and local repositories rather than duplicate data.
- Make each merged page useful in both local and account storage modes.

**Non-Goals:**
- No route deletion, schema migration, content recommendation engine, calendar integration, or new dependency.
- No redesign of every focused tool in this change.
- No new analytics, score, or inferred life advice.

## Decisions

### Keep focused routes and introduce merged homes through existing canonical URLs

`/life-plan` becomes Live More and `/look-back` becomes See History. Existing focused routes remain available from those pages. This avoids redirect churn and preserves deep links.

### Compose summaries, not embedded full applications

Merged pages show real state, a clear next action, and a path into each focused tool. They do not mount four complete editors into one page. This preserves performance and prevents competing interaction models.

### Reuse the Trajectory map as a read-only historical element

The graph-first map accepts the current contract in view mode. See History renders that map with a link to the focused review route. Local history reads the existing browser trajectory repository; account history uses the existing owner-scoped contract action.

### Give Live More and See History different emotional temperatures

Live More uses sunlit, high-chroma flat fields and verb-led invitations. See
History retains the quieter night atlas because reflection and mortality need
more calm. The shared system comes from typography, direct wayfinding, and
spatial composition—not from making every destination visually identical.

Daily uses the same warm-light system at a calmer tempo: a time-aware colored
greeting, blue AM/PM rhythm, and a high-contrast paper journal. See History uses
the product palette as a personal almanac, and shows the four-node Trajectory
shape even before content exists so its empty state remains explanatory.

### Use CSS/SVG atlas notation rather than image assets

Contour lines, routes, waypoints, week cells, and chronology are generated from semantic markup and lightweight SVG. The approved direction boards are visual references, not runtime assets.

## Risks / Trade-offs

- [Merged homes become link directories] → Show real current state and one next action before secondary routes.
- [Atlas styling becomes decorative] → Every path and marker must represent navigation, time, status, or relationship.
- [Look Back query becomes heavier] → Reuse parallel reads and return concise Trajectory state without new joins.
- [Focused routes retain older styling] → Treat the shell and merged homes as the system-establishing slice, then migrate focused tools incrementally.
- [The atlas feels like a memorial rather than an invitation] → Keep mortality on See History and make Live More bright, playful, and action-first.

## Migration Plan

Ship as additive presentation and composition changes. Rollback restores the earlier shell and page layouts without touching local or account data.
