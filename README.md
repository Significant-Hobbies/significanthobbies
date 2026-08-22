# Significant Hobbies Hub

The Hub is the front door and privacy-safe control plane for seven personal
apps: Live, Journal, Habits, Calorie, Setline, Kith, and Anchor.

This repository owns:

- the Hub UI served by `services/hub-backend`;
- the existing `personal-platform` Cloudflare Worker and D1;
- typed summary, record, semantic-action, audit, and undo contracts;
- the root `PersonalSyncKit` Swift package used by native applications.

Live and Journal were extracted with preserved history into
[`Significant-Hobbies/live`](https://github.com/Significant-Hobbies/live) and
[`Significant-Hobbies/journal`](https://github.com/Significant-Hobbies/journal).
Their runtime and local data identities did not move.

## Checks

```bash
npm --prefix services/hub-backend ci
npm run check
npm run test:swift
```

See [the ownership matrix](docs/architecture/ownership-and-extraction.md) for
canonical repositories, data authorities, compatibility, and rollback.
