## Why

Trajectory's four-part contract is currently presented as a conventional form, which hides the directional relationship between a person's present reality, intended direction, decision policy, and learning loop. The interface should make the trajectory understandable before asking for text and restore the spatial, graph-like quality that made the earlier experience feel like movement over time.

## What Changes

- Replace the stacked four-field setup with a responsive trajectory map that shows the four parts as connected, selectable nodes.
- Let a person edit one focused node at a time while keeping the full trajectory visible as context.
- Present an active contract as a directional path, with review history represented as dated evidence and visible bends when the contract changes.
- Preserve the current contract schema, local/account persistence, import behavior, and review lifecycle.
- Keep all interactions keyboard accessible and provide a readable linear equivalent on narrow screens and for assistive technology.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `trajectory-contract`: Require the primary Trajectory experience to communicate the relationship and direction among the four contract parts instead of treating them as unrelated fields.

## Impact

The change is confined to the `/trajectory` presentation and its focused browser tests and documentation. It does not change database schema, server actions, local storage records, authentication, public routes, dependencies, or deployment configuration.
