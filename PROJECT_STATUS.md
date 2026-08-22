# Significant Hobbies Hub — PROJECT STATUS

Last updated: 2026-08-23

## Why / What

The Hub joins seven independently useful personal applications in one UI. It
shows privacy-safe status and provenance and offers only documented semantic
actions, while every product retains its own interface and immediate data
authority.

## Current status

- Canonical source: `Significant-Hobbies/significanthobbies`.
- Hub Backend was consolidated here with its complete repository history.
- The root `PersonalSyncKit` package is the single native sync-client source.
- Live is independently owned at `Significant-Hobbies/live` and retains the
  existing `significanthobbies` Worker, D1, auth, and apex compatibility paths.
- Journal is independently owned at `Significant-Hobbies/journal` and retains
  bundle `com.significanthobbies.app` plus its local-first atlas.
- The Hub UI and backend use the existing `personal-platform` Worker and D1;
  there is no schema, credential, or user-data migration in this split.

## Next

Finish real-owner sync testing across the seven products, then improve Hub
summaries and actions from observed use. Product work belongs in this
repository's GitHub Issues.
