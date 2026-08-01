## Why

The product has accumulated separate pages with competing visual structures and too many equal-weight navigation choices. Its two-dimensional thesis—Live More and Daily—should organize the interface, while the mortality frame and personal history should feel like one coherent account of a finite life.

## What Changes

- Reduce the primary navigation to `SH`, `Live More`, `Daily`, and `See History`, with direct links rather than expandable menus.
- Make `/life-plan` the merged Live More home for hobbies, bucket lists, Life Bingo, and side quests.
- Make `/look-back` the merged See History home for the life-in-weeks mortality frame, Trajectory, and existing personal-history narrative.
- Establish the Life Atlas visual system: spatial paths for possibility and action, almanac-like chronology for history, fewer card shells, and one coherent responsive layout language.
- Preserve existing focused routes as deeper editing and exploration destinations.
- Preserve local-first and account-backed storage authority, privacy, and all existing data.

## Capabilities

### New Capabilities

- `life-atlas-navigation`: Organize the application around the two primary modes and two merged destination pages.

### Modified Capabilities

- `trajectory-contract`: Make Trajectory visible within the combined See History experience while preserving its focused editing route.

## Impact

This changes the global navigation, `/life-plan`, `/look-back`, shared local history rendering, Trajectory presentation reuse, browser tests, and product/design documentation. It adds no production dependencies, schema changes, migrations, public publishing behavior, or deployment changes.
