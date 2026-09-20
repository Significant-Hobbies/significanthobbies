---
title: "Safe Cursor Advancement in an Incremental Sync Engine"
slug: safe-cursor-advancement-in-an-incremental-sync-engine
target_query: incremental sync engine design
search_intent: Learn how to design an incremental sync engine that prevents data loss during synchronization by correctly managing commit boundaries and cursor state.
meta_title: Safe Cursor Advancement in Incremental Sync Engines
meta_description: A technical deep dive into designing incremental sync engines that safely advance cursors only after local application commits, preventing data loss and managing replay states.
---

## Outline

1.  **Introduction**: The complexity of incremental synchronization and the risk of data loss.
2.  **The Danger of Premature Cursor Advancement**: Why advancing a sync cursor before the application durably commits data leads to irrecoverable states.
3.  **Local Commit Before Cursor Advancement**: Designing an architecture that guarantees the application store updates before bookkeeping state changes.
4.  **Bounded Batches and Memory Management**: Handling large synchronization events safely to prevent memory exhaustion and timeout failures.
5.  **Tolerating Replay for Robust Sync**: Why applications must be designed to tolerate receiving the same synchronized batch multiple times without breaking.
6.  **Next Action**: Practical steps for developers implementing local-first or offline-capable sync architectures.

---

## Introduction

Building an incremental synchronization engine is a fundamental challenge for any application that aims to operate locally while occasionally connecting to a central source of truth. The core promise of such an engine is simple: fetch only what has changed since the last time the client asked, apply those changes locally, and then remember where you left off. This "remembering" is almost universally implemented via a "cursor"—a high-water mark, a timestamp, or a version vector that represents the exact point in the synchronization history that the client has successfully processed.

However, the simplicity of the concept masks a profound architectural danger. The most critical, yet frequently mishandled, aspect of an incremental sync engine is the exact moment when that cursor is advanced. If a sync engine updates its internal bookkeeping to say, "I have processed everything up to point X," before the application's durable local store has actually written the data up to point X, the system is fundamentally broken. This article explores the mechanics of safe cursor advancement, drawing on concrete evidence and architectural decisions required to build a reliable incremental sync engine.

## The Danger of Premature Cursor Advancement

To understand the solution, we must first dissect the failure mode. Consider a naive synchronization implementation, often structured as a simple return-oriented function call. The sync engine reaches out to a remote server, says "give me everything since my last cursor (e.g., 0)," and the server responds with a batch of records.

In a flawed architecture, the sync engine receives this batch, immediately updates its internal cursor store (perhaps saving the new cursor to a local file or database), and *then* returns the array of records to the calling application.

This is a recipe for data loss. What happens if the application crashes exactly one millisecond after the sync engine returns the records, but *before* the application can execute its own database transaction to save them?

When the application restarts and initiates synchronization again, the sync engine will consult its internal store. It will see that the cursor has already been advanced. It will reach out to the server and say, "give me everything since the *new* cursor." The server will correctly respond with an empty set, or only newer records. The batch of records that were downloaded but never saved by the application are now permanently lost to the client. The client believes it is fully synchronized, but it is missing a chunk of history.

This scenario demonstrates that synchronization cannot be treated as a simple data-fetching exercise. It is a distributed transaction that spans the network, the sync engine's state, and the application's local durable store.

## Local Commit Before Cursor Advancement

The fundamental rule for safe cursor advancement is strict serialization: **local commit before cursor advancement.** The sync engine must never update its bookkeeping state until it has irrefutable proof that the calling application has durably stored the downloaded changes.

Achieving this requires a specific API contract between the sync engine and the consuming application. Instead of a return-oriented API (`let changes = await synchronize()`), the architecture must use an apply-closure or callback-driven model.

In this model, the sync engine manages the network transport and the pagination logic. When it receives a batch of records, it does not advance its cursor. Instead, it passes that batch to a closure provided by the application.

*(Internal link suggestion: Link "network transport" to our article on "Optimizing HTTP transport layers for mobile sync")*

The application is required to take that batch, begin a transaction in its own local database, apply all the incoming mutations, and commit that transaction. If the commit fails (perhaps due to disk space issues, schema validation errors, or a crash), the closure must throw an error.

The sync engine awaits the completion of this closure. Only when the closure returns successfully does the sync engine know it is safe to proceed. At that exact moment, the sync engine updates its own durable metadata: it records the new versions of the specific records it just processed, updates its deduplication fingerprints, and finally, advances the domain cursor.

This architectural shift moves the commit boundary. The sync engine's state updates are completely contingent on the application's state updates succeeding. If the process is interrupted at any point before the sync engine writes its new cursor, the next synchronization attempt will simply reuse the old cursor, download the same batch again, and retry the process.

## Bounded Batches and Memory Management

Safe cursor advancement is intricately linked to how an engine handles large data volumes. When a client synchronizes for the first time, or after being offline for months, the server might have thousands or millions of changes to send.

Attempting to process all of these changes in a single, massive apply-closure is dangerous. It can lead to memory exhaustion on constrained devices, database transaction timeouts, and an unacceptably long period where the UI is blocked or progress is lost if an interruption occurs.

*(Internal link suggestion: Link "memory exhaustion on constrained devices" to our guide on "Memory profiling in native Swift applications")*

Therefore, a robust incremental sync engine must utilize bounded batches. The server should never send unbounded arrays of records. Instead, it must paginate the results, typically limiting them to a sensible size (e.g., 500 records per page).

Crucially, the "local commit before cursor advancement" rule must apply to *each individual page*, not the entire synchronization session.

The workflow looks like this:
1. The engine fetches page 1 (using cursor 0).
2. The engine calls the application's apply closure with the records from page 1.
3. The application commits page 1 to its database and returns success.
4. The engine advances its cursor to the end of page 1.
5. The engine fetches page 2 (using the new cursor).

This creates a checkpointing system. If the client loses network connectivity while fetching page 50, it does not lose the progress made on the first 49 pages. Because the cursor was advanced after each successful application commit, the next sync attempt will seamlessly resume exactly where it left off, asking for page 50. This pagination is vital for performance and reliability, ensuring that even massive catch-up syncs can be completed incrementally over unstable connections.

## Tolerating Replay for Robust Sync

The strict separation of application state and sync engine state introduces a specific edge case that the application must be designed to handle: **replay**.

Consider the scenario where the application successfully executes its local database transaction and returns success from the apply closure. However, microseconds later, before the sync engine can durably write its new cursor to disk, the device's battery dies or the process is hard-killed by the operating system.

When the device restarts and sync runs again, the engine's persistent store still contains the old cursor. The engine will request the same batch of records from the server, and it will pass that identical batch into the application's apply closure a second time.

*(Internal link suggestion: Link "persistent store" to our overview on "Choosing local databases for offline-first architectures")*

This means the application's apply closure **must be idempotent**. It must be able to receive a batch of records it has already applied and process them without corrupting its local store, duplicating data, or throwing errors.

In a typical local-first application using a Last-Write-Wins (LWW) or versioned document model, tolerating replay is straightforward. The application simply checks the incoming record's version or timestamp against the locally stored version. If the incoming version is less than or equal to the local version, the application safely ignores the update.

This replay tolerance is the necessary compromise for achieving zero data loss. By guaranteeing that the sync engine's bookkeeping is the *last* thing to update, we guarantee that records are never skipped, but we accept that they might occasionally be delivered twice in catastrophic failure scenarios. It is far better for an application to redundantly overwrite a row with identical data than to silently miss a critical update.

## Next Action

If you are building an offline-capable application or a custom sync engine, audit your synchronization boundaries today. Search your codebase for your sync invocation. If your API looks like `data = fetchSync(cursor); updateCursor(newCursor); saveData(data);`, you are vulnerable to data loss. Refactor your engine to accept an injection of the application's commit logic, ensuring your engine only advances its internal high-water mark after receiving absolute confirmation that the application's local durable store has safely persisted the downloaded batch.

---

## Source Notes

*This section is for internal review only and should not be published.*

The claims in this article are supported by the architectural implementation of the Significant Hobbies Hub native sync client.

*   **Local Commit Before Cursor Advancement:** Supported by `Sources/PersonalSyncKit/PersonalSyncRuntime.swift` and `Sources/PersonalSyncKit/SyncState.swift` (specifically the `SyncCoordinator` actor). The `synchronize(applyChanges:)` API requires a closure. The implementation awaits the `applyChanges(allChanges)` closure *before* executing `versions.setVersion` and `cursors.setCursor`.
*   **The Return-Only API Trap:** `PersonalSyncRuntime.swift` explicitly marks the return-only `synchronize()` method as deprecated with the message: "Use synchronize(applyChanges:) to commit downloaded records before advancing sync progress."
*   **Bounded Batches:** Supported by `SyncCoordinator.synchronize`, which pulls pages incrementally and processes cursors per page. The server emits "at most 500 records/page" as documented in the code comments and pagination logic.
*   **Tolerating Replay:** Documented explicitly in the `PROJECT_STATUS.md` and codebase comments: "The app must tolerate replay: if its save succeeds but bookkeeping fails, the same batch can arrive again." The `replayFromStart` logic in `SyncCoordinator` also strictly manages historical version checking to prevent overwriting newer local data during replay scenarios.
*   **Issue Tracking:** `PROJECT_STATUS.md` and `README.md` attribute this architectural refinement to the "sync commit-boundary repair" tracked in Issue #155 and Issue #158.
