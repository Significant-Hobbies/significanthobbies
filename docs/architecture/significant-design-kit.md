# SignificantDesignKit

Presentation-only SwiftUI library beside `PersonalSyncKit`. It owns the
family's shared *mechanics* — semantic theme roles, spacing, motion, tactile
controls, drawn lines, preference scaffolding, responsive framing — while each
product keeps its own accent, artwork, copy, and domain language.

Issue: [#147](https://github.com/Significant-Hobbies/significanthobbies/issues/147)

## Inventory (task 1)

Source of the shared roles: Anchor's `Sources/AnchorUI/Design/` — the
strongest existing foundation in the family.

| Role | Shared (kit) | Product-owned |
|---|---|---|
| Surfaces | `canvas`, `surface`, `surfaceRaised`, `hairline` | — |
| Text | `textPrimary`, `textSecondary`, `textTertiary` | — |
| Accent | role contract (`accent`, `accentSoft`, `accentDeep`, `onAccent`) | the color values |
| Status | `positive`, `caution`, `negative` | product-specific state colors |
| Layout | `SDKSpace` 4pt grid, `SDKRadius`, `SDKContentFrame` max-width | per-screen composition |
| Motion | `SDKMotion` springs + Reduce Motion suppression | product-specific choreography |
| Primitives | tactile button styles, `SDKCard`, `SDKSectionHeader`, `SDKPreferenceGroup`/`SDKPreference*Row`, `SDKPreferenceDivider`, `SDKDrawnUnderline`, `SDKDrawnTrace` | doodles, icons, domain components |
| Identity | `SDKIdentity`/`SDKPalette` (neutral paper/charcoal default) | accent + palette overrides via `.sdkTheme(identity:)` |

Not shared (explicitly product-owned per issue scope): Anchor's doodle assets,
interruption-origin colors, habit/schedule semantics and screens; Hub's
product-directory language; every app's models, storage, sync, and copy.

## Contract

- `SDKPalette.neutral(dark:)` is the family baseline (charcoal night, warm
  paper day). Products override only the roles that carry identity.
- `SDKTheme.resolve(_:identity:)` picks the palette for the live color scheme;
  `.sdkTheme(identity)` injects it at scene roots.
- `SDKMetrics.minimumTouchTarget = 44`, `minimumRowHeight = 60` — the
  accessibility floor components agree on.
- `SDKMotion.snappy/gentle(reduceMotion:)` return `nil` under Reduce Motion;
  meaning and hierarchy must not depend on the animation.
- Drawn-line primitives are `accessibilityHidden` decoration, never
  affordances.
- The kit imports only SwiftUI. It must never link product models, storage,
  `PersonalSyncKit`, or business logic.

## Adoption order (task 6)

Incremental — one product per reviewable change, never a batch token swap:

1. **Hub** (native shell) — lowest surface area, validates the kit end-to-end.
2. **Anchor** — source of the mechanics; adopt after the Settings/core-loop
   visual pass receives owner keep feedback. Preference primitives were
   authored extraction-ready (`PreferenceComponents.swift` → `SDKPreference*`).
3. **Calorie** — settings + Today surfaces; journal keeps its nutrient tables.
4. **Kith** — people/notes settings; memory editing keeps product layout.
5. **Setline** — workout surfaces are motion-sensitive; tactile styles only
   after the workout loop is visually reviewed.
6. **Significant Hobbies app** — last; it inherits whatever the family
   settled on.

Each adoption is a separate change with light/dark, Dynamic Type, keyboard/
touch, and Reduce Motion verification. A product may keep a product-owned
component or supply a palette override when a kit default conflicts with its
context — the foundation must not flatten real product needs.

## Status

- [x] Inventory and shared-role contract (this document)
- [x] `SignificantDesignKit` package product, theme/scale/motion/accessibility
      contracts, primitives, contract tests
- [ ] Owner keep feedback on the Anchor visual pass before freezing mechanics
- [ ] Hub + Anchor adoption changes (separate, reviewable)
- [ ] Package revision publication — requires explicit approval
