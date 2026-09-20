---
title: "An offline-first architecture for a family of personal apps"
slug: "an-offline-first-architecture-for-a-family-of-personal-apps"
target_query: "offline first architecture"
search_intent: "Informational - Developers looking for real-world patterns to build offline-first application ecosystems."
meta_title: "Offline-First Architecture for Personal Apps: The Significant Hobbies Approach"
meta_description: "Learn how the Significant Hobbies Hub uses an offline-first architecture, PersonalSyncKit, and decentralized data authorities to unify five personal apps."
---

## Outline

1. **Introduction to the Decentralized App Dilemma**
2. **The Significant Hobbies Hub: A Unified Control Plane**
3. **Decentralized Data Authorities: Respecting App Ownership**
4. **PersonalSyncKit: The Foundation of Native Sync**
5. **Sync Commit Boundaries: Guaranteeing Data Durability**
6. **Account Ownership and Isolation Strategies**
7. **Opt-in Download Recovery: Resilience Without Data Loss**
8. **Concrete Examples: Putting the Architecture into Practice**
9. **Practical Next Action for Developers**
10. **Internal Link Suggestions**

***

## Introduction to the Decentralized App Dilemma

When building software for personal productivity, one critical architectural decision is how to handle data storage and synchronization. Cloud-first architectures prioritize server-side databases. While this makes synchronization straightforward, it fundamentally breaks when the user is offline.

For personal applications, an offline-first architecture is not just a feature; it is a requirement. However, as an ecosystem of applications grows, a dilemma emerges: how do you provide a unified experience across multiple independent applications without falling back into the trap of a centralized data silo?

This article explores the offline-first architecture developed for the Significant Hobbies ecosystem, a suite of personal applications (Live, Calorie, Setline, Kith, and Anchor). By examining the principles of their integration, we will uncover how to build a unified control plane that respects decentralized data authorities, ensures robust native synchronization, and protects user identity.

## The Significant Hobbies Hub: A Unified Control Plane

The Significant Hobbies Hub serves as the privacy-safe control plane for the family of apps. Rather than forcing all applications to store data in a single database, the Hub is designed to join independently owned apps through privacy-safe summaries and typed semantic actions.

The Hub provides a single interface where individuals can view their status. However, it explicitly does not absorb the local stores of the individual applications. It uses a shared Cloudflare Worker and D1 database, but its role is to aggregate privacy-safe status, offering only documented semantic actions.

This separation of concerns means that the Hub can evolve its presentation without risking the functionality of the individual apps. Every product in the suite retains its own interface and its immediate data authority.

## Decentralized Data Authorities: Respecting App Ownership

A cornerstone of this offline-first architecture is decentralized data authorities. Each application is treated as an independent entity with its own canonical repository, runtime, and data storage mechanism.

For example:
- **Live** maintains its own Worker, D1 database, and relies on signed-out IndexedDB for local data authority.
- **Journal** uses a versioned local atlas first, with optional synchronization.
- **Anchor, Calorie, Kith, and Setline** remain independently owned, managing their own local stores.

This decentralized approach ensures that if the Hub goes offline, individual applications continue to function perfectly. Users can track calories or log anchor habits without degradation. The data authority always resides locally with the client application first. Only when the client decides to synchronize does the data move through the Hub's typed service bindings.

## PersonalSyncKit: The Foundation of Native Sync

To facilitate synchronization without violating offline-first principles, the ecosystem relies on a dedicated Swift package: `PersonalSyncKit`. This package acts as the single native sync-client source.

`PersonalSyncKit` abstracts network transport, batching, and remote acknowledgements. It allows individual applications to focus on domain logic while relying on a standardized framework for moving data between the local offline store and the Hub. By centralizing the sync logic, the architecture ensures consistent behavior across all apps.

## Sync Commit Boundaries: Guaranteeing Data Durability

One challenging aspect of offline-first synchronization is managing the commit boundary between downloaded remote data and the local database. If a sync client advances its cursor before the local database durably saves the new records, a crash could result in permanent data loss.

To solve this, `PersonalSyncKit` enforces a strict native sync commit contract. Native consumers must call a specific method—`synchronize(applyChanges:)`—and atomically save the supplied batch in their own store before that closure returns.

The framework guarantees that download metadata and the sync cursor will only advance after the closure succeeds. If the local save fails and throws an error, the sync client will not advance the cursor. The app must tolerate replay: if its local save succeeds but the subsequent bookkeeping fails, the exact same batch of records might arrive again.

This architecture prevents corrupt bookkeeping from discarding ownership and tombstone history. It forces the application to be the final arbiter of durability. Concurrent sync attempts are serialized, ensuring the local database isn't overwhelmed. Existing return-only sync calls remain deprecated compatibility paths and do not gain the app-commit guarantee until consumers migrate.

## Account Ownership and Isolation Strategies

Managing identity and data isolation is paramount. An offline-first app might be used without an account, accumulating a local database. What happens when the user finally signs in?

The architecture handles this through explicit account ownership. Before the first synchronization, the native app must prompt the user to approve which verified Hub account will own the local document. This choice is saved atomically with the local data, and the runtime is bound to that account using `bindAccount(account, adoptingUnownedData: true)`.

Crucially, existing ownership never transfers to another user. If a user signs out and signs in with a different account, the application must use a separate local document and sync storage. It is strictly forbidden to delete or reassign old data simply to make a sign-in succeed.

Furthermore, the shared queue rigorously checks the captured session around transport and app commits. It requires explicit adoption of unowned data and rejects bindings that mismatch the established account owner. The repair rejects stale identity completions, validates new bearer sessions before saving them, and removes signed-out sessions before remote revocation. This source-level identity protection ensures local data remains securely isolated to its rightful owner.

## Opt-in Download Recovery: Resilience Without Data Loss

Even with strict commit boundaries, edge cases exist where a client might need to recover historical data. Perhaps a device was restored from an incomplete backup.

To address this, the architecture provides an opt-in download recovery mechanism. Compatible callers can request a replay from the start using `synchronize(account: account, replayFromStart: true, applyChanges: ...)`, recovering records that an older client acknowledged without retaining.

This replay mechanism is carefully bounded. It reads historical pages from zero but does not reset the durable state of the sync client. It commits the app before updating progress, and is limited to 100 pages of at most 500 records. The cursor is retryable if a partial download fails, but it never moves backwards.

Importantly, the recovery process respects local data authority. The callback receives the latest replayed version of each record, but excludes versions older than the already-known metadata. Callers are required to preserve their newer local edits and local tombstones. Replay is a tool for filling in gaps, not a permission to overwrite the local store.

## Concrete Examples: Putting the Architecture into Practice

To understand how this architecture operates, let's look at Anchor, which handles planning, focus timing, and schedule review after absorbing the Indulge/Habits product loop.

Imagine a user is offline. They complete focus sessions, add habits, and delete an old schedule. All actions are instantly recorded in Anchor's local database. The user experiences zero latency because Anchor acts as the local data authority.

Once the device reconnects, `PersonalSyncKit` initiates a synchronization.
1. The sync engine checks the stable, server-verified ID to ensure the session is valid.
2. It pulls any new privacy-safe summaries from the Hub.
3. It calls `synchronize(applyChanges:)`, handing a batch of Hub updates to Anchor.
4. Anchor attempts to save these updates to its local database atomically. Only when that atomic save is successful does `PersonalSyncKit` advance its cursor.
5. Finally, Anchor's local changes are uploaded to the Hub.

If the app crashes during step 4, the cursor is not advanced. On the next launch, `PersonalSyncKit` will provide the same batch again, ensuring no data is lost.

## Practical Next Action for Developers

If you are building an offline-first application ecosystem, the most critical step you can take today is to audit your synchronization boundaries.

Examine your sync client. Does it advance its state before or after the local database has durably committed the changes?

Implement a pattern similar to `synchronize(applyChanges:)`. Force the network layer to wait for a successful, atomic local database commit before acknowledging the data or moving the sync cursor forward. Ensure concurrent sync attempts wait for the current commit. This single architectural shift will improve the reliability of your offline-first applications.

## Internal Link Suggestions

- Link to documentation on the Hub UI and shared Cloudflare Worker deployment.
- Link to the Ownership Matrix for Canonical Repositories.
- Link to the Native Sync Account Ownership Implementation Guide.

***

## Source Notes (Non-Publishable)

This article was drafted based strictly on the current repository evidence. The claims and architectural details are supported by the following files:

- `README.md`: Provided the foundation for the Hub's role as a privacy-safe control plane for Live, Calorie, Setline, Kith, and Anchor. It detailed the `PersonalSyncKit` native sync commit contract, specifically the `synchronize(applyChanges:)` method and the requirement to atomically save batches before advancing cursors. It also outlined the account ownership rules, `bindAccount`, and the opt-in download recovery mechanisms including the 100 pages of 500 records limit.
- `PROJECT_STATUS.md`: Confirmed the consolidation of the Hub Backend, the status of the shared mirror source, local commit before cursor advancement, and the retention of tombstone history. It verified that Anchor absorbed the Indulge/Habits loop and detailed the identity protection repairs like rejecting stale identity completions.
- `agents.md`: Reaffirmed the product boundary: the Hub joins independently owned apps through privacy-safe summaries and typed semantic actions without absorbing their local stores.
- `docs/architecture/ownership-and-extraction.md`: Provided the matrix defining canonical repositories, runtime owners, and data authorities, proving that apps like Live maintain separate data authorities (IndexedDB) from the Personal Platform D1.
