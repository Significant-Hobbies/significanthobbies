---
title: "Handling sync conflicts without silently discarding local ownership"
slug: "handling-sync-conflicts-without-silently-discarding-local-ownership"
target_query: "sync conflict resolution local data ownership"
search_intent: "informational and technical strategy for developers resolving synchronization conflicts while preserving local data authority"
meta_title: "Handling Sync Conflicts Without Discarding Local Ownership | Significant Hobbies Hub"
meta_description: "Learn how to handle sync conflicts while preserving local data ownership. We explore transaction boundaries, durable commits, and opt-in replay APIs for robust synchronization."
---


## Outline

1.  **Introduction**
    *   The challenge of distributed data synchronization.
    *   The fatal flaw of silently discarding local records.
    *   The core philosophy: preserving local data authority.
2.  **The Transaction Boundary: App Commits Before Progress**
    *   Flipping the typical sync loop.
    *   The `synchronize(applyChanges:)` contract.
3.  **Surviving Incomplete Bookkeeping and Restarts**
    *   Tolerating partial downloads and network interruptions.
    *   Safely replaying unacknowledged data.
4.  **Recovering State with Opt-In Replays**
    *   Designing an opt-in native replay API.
5.  **Account Identity and Native Data Authority**
    *   Binding runtimes to verified identities.
    *   Protecting offline queues.
6.  **Next Actions**
    *   Practical steps for migrating your sync integration.



## Introduction

Data synchronization across distributed systems remains one of the most notoriously difficult engineering challenges in modern application development. When an individual uses a mobile application offline on a train, edits a series of records, and then connects to a network where a separate device has already pushed conflicting changes, the resulting collision must be handled with extreme care. The most common approach taken by naive synchronization engines is to enforce "last write wins" at the transport layer, effectively treating the server as the ultimate source of truth and silently overwriting the local client's state. While this might resolve the immediate conflict and satisfy the sync engine's bookkeeping, it introduces a fatal flaw: silently discarding local ownership.

When a synchronization engine discards local records without the application's explicit consent, it destroys the user's trust and obliterates valuable tombstones and historical context. The core philosophy of a robust synchronization system must be to preserve local data authority. At Significant Hobbies Hub, we treat independently owned applications as the canonical authorities of their own domains. Our Hub joins these independent applications through privacy-safe summaries and typed semantic actions—it explicitly does not absorb their local stores. The Hub provides the transport, but the native application retains the immediate data authority. This means that sync conflict resolution cannot simply be a server-side decree; it must be an orchestrated transaction that respects the local application's durable state.

## The Transaction Boundary: App Commits Before Progress

Many traditional synchronization frameworks provide a seemingly simple API: a method that fetches the latest changes from the server and returns them to the application as an array. The application is then expected to merge these changes into its local database. This return-only pattern is fundamentally flawed. If the application crashes before it can durably save the downloaded changes, or if the local database runs out of disk space, the sync engine has already advanced its internal cursor. The engine believes the changes were successfully delivered, but the application never saved them. The data is lost in the void between the sync client and the local store.

To solve this, we must flip the typical synchronization loop. The sync engine must never advance its cursor or acknowledge receipt of data until the application has durably committed the changes to its own local store. This is the essence of the `synchronize(applyChanges:)` contract.

When a native application initiates a sync using `synchronize(applyChanges:)`, the engine downloads the pending mutations but pauses its internal bookkeeping. It yields the downloaded batch to the application through the `applyChanges` closure. The application is then responsible for atomic insertion, updating its local database, handling any domain-specific merge logic, and explicitly committing the transaction. If the application throws an error during this process, the `synchronize` method catches the error, halts the sync process, and most importantly, *does not advance the sync cursor*. The in-memory state is discarded, but the durable state remains precisely as it was before the sync began.

This architectural inversion guarantees that downloaded records actually reach the application's durable store before the sync progress is updated. The sync engine waits for the owning app's durable commit. Concurrent sync attempts are serialized, ensuring that overlapping calls wait for the current commit to finish before attempting another pull. This prevents race conditions where simultaneous syncs might try to merge conflicting pages of data.

## Surviving Incomplete Bookkeeping and Restarts

Network connections are inherently unreliable, and application lifecycles are often interrupted by the operating system. A robust synchronization system must tolerate partial downloads, sudden network loss, and application restarts without corrupting the local data or losing track of the remote state.

Consider the scenario where the application successfully applies the changes in the `applyChanges` closure and commits them to disk, but immediately afterward, the network drops before the sync engine can acknowledge the cursor advancement to the server. The local application now has the new data, but the server thinks it still needs to be sent.

The system must safely replay unacknowledged data. Because the cursor was never durably advanced, the next time the application starts and calls `synchronize(applyChanges:)`, the server will re-send the same batch of mutations. The native application must be designed to tolerate this replay. It should inspect the idempotency keys, base versions, and occurred-at timestamps of the incoming records. If it has already processed a record, it can safely ignore it or perform a fast no-op update. The sync engine's bookkeeping failures must leave the downloads retryable.

We see this exact behavior validated in tests like `failedCursorPersistenceAfterAppCommitReplaysSafely` and `downloadedChangesRetryAfterFailedLocalCommitAndRestart`. If the application fails to commit, the downloaded changes retry on the next restart. The cursor remains at zero, the version store remains untouched, and no fingerprints are incorrectly advanced. Corrupt bookkeeping stops synchronization instead of discarding ownership and tombstone history. This strict enforcement of the commit boundary prevents the insidious data loss that plagues weaker sync implementations.

## Recovering State with Opt-In Replays

There are times when an application needs to rebuild its state, or when a user wants to recover historical data that an older client might have acknowledged but failed to properly retain. However, forcing a massive server-side overwrite is dangerous. It damages user trust and can annihilate recent offline edits that haven't yet been synced.

To handle this, a sync engine should provide an opt-in native replay API. This API allows compatible callers to request a full historical replay without resetting their existing durable state. In our ecosystem, this is achieved by calling `synchronize(account: account, replayFromStart: true, applyChanges: ...)`.

This method reads historical pages starting from cursor zero. Crucially, it does not wipe the local database first. It keeps the verified-owner lock and preserves the existing outbox processing. The callback receives the latest replayed version of each record, but the application is explicitly instructed that this replay is *not* permission to blindly replace its store. Callers must still preserve newer local edits and local tombstones. If a local record has a newer base version or a more recent local modification timestamp than the replayed record, the local record must win. The application retains its immediate data authority.

To safeguard against unbound loops, the replay mechanism is bounded. It is limited to a maximum number of pages and records per page—for instance, 100 pages of at most 500 records. The replay is cancellable, and any failure leaves the cursor in a retryable state. The cursor never moves backward, ensuring progress is strictly monotonic once a batch is durably committed.

## Account Identity and Native Data Authority

Synchronization cannot happen in a vacuum; it is fundamentally tied to account identity. A sync engine must never implicitly transfer data to a different user or silently adopt unowned offline data without explicit consent.

Before the first synchronization, the native application must ask the person to approve which verified server account owns the local document. This choice must be saved atomically with the local data. The runtime is then bound to this specific account.

This is not just a theoretical security concern; it is a structural requirement for preserving local ownership. The sync runtime must enforce this binding. It must require the explicit adoption of unowned data and aggressively reject attempts to bind to a different account. If an application's local document belongs to Account A, and the user signs in with Account B, the sync engine must not upload Account A's private data to Account B's remote store. Existing queues without ownership stay intact but cannot upload before explicit approval.

The native consumer must also verify its local document owner before saving downloaded changes within the `applyChanges` callback. This dual-layered identity check—both at the transport layer and the application's durable commit boundary—protects offline queues and ensures that account isolation is maintained even in complex, multi-user environments.

## Internal Link Suggestions
- Consider linking "transaction boundary" to our documentation on `PersonalSyncRuntime` implementation details.
- Link "privacy-safe summaries" to the Significant Hobbies Hub architecture overview.
- When mentioning "account identity", internal linking to the Hub's authentication lifecycle and ownership matrix would provide deeper context for developers.

## Practical Next Actions

If you are maintaining a native consumer within the Hub ecosystem, you must migrate away from the deprecated `synchronize()` API.

1. Update your sync integration to use `synchronize(applyChanges:)`.
2. Move your local database insertion logic inside the `applyChanges` closure.
3. Ensure your local save operation is atomic and throws an error if it fails.
4. Verify that your application handles replayed data gracefully by checking record versions and idempotency keys before overwriting local state.
5. Ensure you are capturing the `PersonalSyncAccount` and explicitly binding it to your runtime before initiating any synchronization.



## Source Notes (Non-Publishable)

This section contains references to the canonical repository files that support the technical claims made in this article.

*   **`synchronize(applyChanges:)` Contract:** The requirement that native consumers must call `synchronize(applyChanges:)` and atomically save the batch before the closure returns is documented in `README.md` (Native sync commit contract) and implemented in `Sources/PersonalSyncKit/PersonalSyncRuntime.swift`.
*   **Opt-In Replay API:** The behavior of `synchronize(account: account, replayFromStart: true, applyChanges: ...)` and its limitations (100 pages of at most 500 records) are supported by the `README.md` (Opt-in download recovery) and `PROJECT_STATUS.md`.
*   **Sync Commit Recovery:** Evidence that incomplete bookkeeping leaves downloads retryable and does not advance the cursor is demonstrated in `Tests/PersonalSyncKitTests/SyncCommitRecoveryTests.swift`. Tests include `failedCursorPersistenceAfterAppCommitReplaysSafely`, `laterPageFailureDoesNotAcknowledgeOrApplyPartialDownload`, and `downloadedChangesRetryAfterFailedLocalCommitAndRestart`.
*   **Overlapping Syncs:** The serialization of concurrent sync attempts is validated by the `overlappingSyncWaitsForAppCommitBeforePullingAgain` test in `Tests/PersonalSyncKitTests/SyncCommitRecoveryTests.swift`.
*   **Account Identity and Data Authority:** The requirement to bind the runtime to a verified account and explicit adoption of unowned data is supported by `PersonalSyncRuntime.swift` (`bindAccount`) and `README.md` (Native sync account ownership).
*   **Hub Philosophy:** The claim that the Hub joins apps without absorbing their local stores is supported by `agents.md` (Product boundary) and `PROJECT_STATUS.md`.
