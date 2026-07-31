## Why

First-time setup currently ends after creating one habit. A new user must then
discover the timeline builder, repeat the hobby they already named, save a
private timeline, and find a compact visibility menu before the product's core
creation-and-sharing loop reaches their public profile.

## What Changes

- Lead completed setup toward the first timeline while preserving a dashboard
  escape.
- Reuse the hobby named during setup to prefill one small, editable timeline
  phase.
- Return the first saved timeline to its canonical owner route with a focused
  completion prompt.
- Keep the timeline private until the owner explicitly publishes it, then link
  directly to the resulting profile.
- Preserve ordinary timeline creation, editing, signed-out builder behavior,
  and all existing visibility controls.

## Capabilities

### New Capabilities

- `first-public-timeline`: A privacy-preserving first-use journey from setup to
  one meaningful timeline and an explicit public-profile opt-in.

### Modified Capabilities

None.

## Impact

- Setup completion copy and routing.
- New-timeline server loading and builder initialization.
- First-save response metadata and canonical navigation.
- Owner-only first-timeline publication prompt.
- Focused unit/browser tests, product documentation, and design evidence.
- No dependency, schema, migration, deployment, or automatic publication.
