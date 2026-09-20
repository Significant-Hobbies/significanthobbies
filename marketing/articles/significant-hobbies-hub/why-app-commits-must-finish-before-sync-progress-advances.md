---
title: "Why App Commits Must Finish Before Sync Progress Advances"
slug: "why-app-commits-must-finish-before-sync-progress-advances"
target_query: "sync commit boundary architecture"
search_intent: "Understand the technical necessity of saving local data before advancing sync cursors"
meta_title: "Why App Commits Must Finish Before Sync Progress Advances | Significant Hobbies Hub"
meta_description: "Explore the architectural necessity of a strict sync commit boundary, ensuring data durability and correct synchronization."
---

## Outline

1.  **Introduction**: The hidden danger in asynchronous sync operations and the illusion of completion.
2.  **The Peril of Return-Only Sync**: Why legacy "fire and forget" synchronization leaves data vulnerable.
3.  **Establishing the Commit Boundary**: The mechanics of `synchronize(applyChanges:)` and atomic local saves.
4.  **Handling Concurrency and Replay**: How strict boundaries protect against race conditions and enable safe recovery.
5.  **Real-World Application**: How the Significant Hobbies Hub implements these guarantees.
    *   The `PersonalSyncKit` Contract
    *   Opt-In Download Recovery
    *   Account Ownership
6.  **Conclusion**: The path to durable, predictable data synchronization.

## Introduction

In modern mobile development, the synchronization of data between local storage and a central hub often feels like magic to the user. Changes made on a device appear seamlessly elsewhere. However, beneath this smooth exterior lies a critical architectural challenge: ensuring that data downloaded from a central repository is truly, durably saved on the local device before the system records that synchronization as complete.

A common pitfall in system design is the assumption that once a payload is received over the network, the job is done. This assumption leads to subtle bugs. If the application crashes, runs out of disk space, encounters a local database constraint error, or loses power *after* the network call succeeds but *before* the data is fully committed to local storage, the system is left in an inconsistent state. The server believes the client has received the data (and advances its cursor), but the client does not possess that data locally.

To solve this problem, a strict sync commit boundary must be enforced: the application's local commit must finish entirely and successfully before any synchronization progress advances. This article explores why this boundary is non-negotiable and how it is implemented in practice.

## The Peril of Return-Only Sync

Consider a legacy approach to synchronization, often implemented as a simple, return-only API call. We can visualize this as a bare `synchronize()` function. In this model, the synchronization framework performs a network request to fetch new records from the central server and then simply hands them off to the application, immediately returning control.

The framework, having delivered the payload over the wire, implicitly assumes success. It updates the local "last sync time" or advances the synchronization cursor. But what happens if the application fails to persist those records? What if an unexpected exception occurs while writing to the local database?

In this scenario, the framework's bookkeeping becomes dangerously out of sync with reality. When the app restarts, or when the next scheduled sync interval occurs, the framework will use its erroneously advanced cursor. It will ask the server for changes that occurred *after* that advanced point in time. Those un-persisted records from the previous attempt will never be fetched again. They are permanently lost to the client, creating a "black hole" where data simply disappears without a trace.

This architectural flaw cannot be papered over with retries. The network operation itself succeeded. The critical failure occurred at the boundary between the sync framework and the application's local data authority. Without tying the framework's knowledge of success to the actual persistence of the data on disk, data loss is practically guaranteed over time.

## Establishing the Commit Boundary

The robust solution to this problem is a contract that tightly couples the delivery of data with the verified confirmation of its local storage. This is achieved by inverting control. Instead of returning data to the caller and walking away, the synchronization framework requires the caller to provide a specific mechanism for applying changes—typically a closure, callback, or a transaction block.

The contract must be straightforward but non-negotiable:

1.  **Delivery**: The sync framework performs the network operation and downloads a batch of changes from the server.
2.  **Application**: The framework invokes the provided closure, passing the downloaded batch of changes to the application logic.
3.  **Atomic Save**: The application *must* atomically save the entire batch to its own local, durable store before the closure returns.
4.  **Confirmation**: If the application's save fails for any reason, the closure fails and propagates that error back to the framework.
5.  **Advancement**: Only if the closure completes successfully does the synchronization framework update the downloaded-record metadata and advance the local sync cursor.

This pattern creates a hard, verifiable boundary. Progress is explicitly tied to local durability. The framework refuses to believe the data is synced until the application proves it has been saved.

## Handling Concurrency and Replay

A strict commit boundary simplifies complex scenarios involving concurrency and error recovery.

### The Replay Guarantee

Because progress only advances after a verified successful local commit, the system naturally tolerates replay. Consider a scenario where the application successfully saves the data within the closure, but immediately afterward, the subsequent bookkeeping step fails due to a sudden crash.

In a system with a strict commit boundary, the cursor remains at its older, safe position. The next sync attempt will simply fetch the exact same batch of data again. The application must be designed to handle this gracefully. It must treat incoming sync batches as idempotent operations. This means the application logic must be capable of safely reapplying changes it has potentially already seen.

### Serializing Sync Attempts

Concurrency introduces another significant layer of risk. If multiple synchronization operations are permitted to run simultaneously, they might attempt to apply conflicting batches of data. Worse, they might interleave their local database saves, violating the atomic save requirement.

A robust synchronization framework must carefully serialize sync attempts. Concurrent calls to the sync mechanism must wait for any currently in-progress commit to finish completely. Furthermore, the application must adhere to a strict rule: it must not trigger a recursive sync operation from within the `applyChanges` closure. Attempting to synchronize while already committing a previous synchronization batch would violate the established boundary, defeat serialization protections, and potentially lead to deadlocks.

## Real-World Application: Significant Hobbies Hub

The Significant Hobbies Hub architecture provides a compelling example of these principles in action. The Hub manages data synchronization across five independently useful personal applications: Live, Calorie, Setline, Kith, and Anchor. A foundational tenet of this architecture is that the Hub does not absorb the local data stores of these individual applications. Every product retains its own immediate data authority over its specific domain.

To maintain perfect consistency without compromising this decentralized local data authority, the Hub relies heavily on a strict native sync commit contract.

### The `PersonalSyncKit` Contract

The `PersonalSyncKit` Swift package serves as the single native sync-client source for these applications. Its established contract explicitly mandates the commit boundary mechanism described earlier.

The repository explicitly outlines this requirement: Native consumers should call the API `synchronize(applyChanges:)` and atomically save the supplied batch in their own local store before that closure returns. The documentation dictates that the consumer must throw an error if the save fails for any reason. Crucially, download metadata and the cursor advance only after the closure succeeds entirely.

This explicit contract requires that the application must tolerate replay: if its local save succeeds but the framework's bookkeeping fails, the exact same batch can arrive again during the next cycle. It also strictly mandates serialization, stating that concurrent sync attempts must wait for the current commit, and explicitly forbids recursive synchronization inside the apply closure to prevent race conditions.

The Hub architecture recognizes the danger of legacy approaches. The older, return-only `synchronize()` API is explicitly deprecated within the system because, as the documentation notes, it cannot establish that downloaded records actually reached the app's durable store.

### Opt-In Download Recovery

The strength of this strict commit boundary enables advanced recovery features. The `PersonalSyncKit` supports an opt-in replay API, invoked via `synchronize(account: account, replayFromStart: true, applyChanges: ...)`. This powerful mechanism allows compatible callers to deliberately recover records that an older client might have acknowledged in the past without actually retaining them locally.

Because the system relies on the strict `applyChanges` contract, the framework can safely begin reading historical pages from zero without forcing a destructive reset of durable local state. The framework always waits for the application to commit the replayed data before updating any progress markers.

### Account Ownership

The commit boundary also plays a vital role in data security and account isolation. Before the very first sync, the native application must ask the user to approve which verified Hub account owns the local document. This choice is then saved atomically with the local data.

During a synchronization cycle, the captured account is passed to the `synchronize` function. Crucially, the application's commit callback must also check its local document owner before saving the newly downloaded changes. The strict commit boundary ensures that this ownership check happens simultaneously with the atomic save of the downloaded data. If the ownership check fails, the entire batch is rejected, the closure throws, and the sync progress cursor remains safely unchanged.

## Conclusion

The illusion of immediate, seamless synchronization is a powerful feature for users, but it is deeply fragile if not built on a foundation of undeniable technical durability. The architecture of the Hub effectively demonstrates that a strict sync commit boundary is not merely an obscure implementation detail, but a fundamental, non-negotiable requirement for ensuring data integrity over time.

By firmly requiring applications to completely finish their local database commits before synchronization progress is allowed to advance, developers systematically eliminate the risk of black holes where data disappears.

---

### Internal-Link Suggestions

*   Link "Significant Hobbies Hub" to the main Hub overview page.
*   Link "local data authority" to the architecture documentation on ownership and extraction for deeper insights into the specific data domain separations.

### Next Action

Review your application's current synchronization implementation immediately. Identify any residual use of deprecated return-only sync APIs and plan a systematic migration to a contract that strictly enforces a local commit boundary before advancing any progress metadata.

---

### Source Notes (Not for Publication)

This draft is directly supported by the following repository evidence:

*   **`README.md`**: Defines the "Native sync commit contract," explicitly detailing the requirements for `synchronize(applyChanges:)`, atomic saves, replay tolerance, and the formal deprecation of the older, return-only APIs. It also details the precise mechanisms of the "Opt-in download recovery" feature and the required behavior for "Native sync account ownership".
*   **`PROJECT_STATUS.md`**: Confirms that the critical sync commit-boundary repair was actively tracked in issue 155, noting that the specific `synchronize(applyChanges:)` method correctly waits for the owning app's durable commit. It also repeatedly notes that existing return-only sync calls remain strictly as deprecated compatibility paths. The document names the apps: Live, Calorie, Setline, Kith, and Anchor.

**Important Limitations**: The deployment and adoption of these features are ongoing processes. `PROJECT_STATUS.md` notes that while Kith is the first consumer to successfully update to the new contract, physical signed-in round trips remain completely unqualified. Furthermore, consumer migrations across the ecosystem are still absolutely required for the deprecated return-only APIs to finally gain the robust app-commit guarantee. Existing applications and production storage have not yet been migrated.