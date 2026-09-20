---
title: "How to sync useful summaries without centralizing intimate text"
slug: "how-to-sync-useful-summaries-without-centralizing-intimate-text"
target_query: "privacy-safe data synchronization architecture"
search_intent: "Informational/Architectural"
meta_title: "How to Sync Useful Summaries Without Centralizing Intimate Text"
meta_description: "Learn how the Significant Hobbies Hub uses privacy-safe summaries and typed semantic actions to integrate independent apps without absorbing their local data stores."
---

## Outline

1. **Introduction: The Dilemma of Centralization**
2. **The Significant Hobbies Hub Philosophy**
3. **Architecture of Decentralized Authority**
4. **The Native Sync Commit Contract**
5. **Account Ownership and Isolation**
6. **Opt-In Download Recovery and Resilience**
7. **Concrete Examples in the Ecosystem**
8. **Internal Link Suggestions**
9. **Practical Next Action**
10. **Source Notes (Non-Publishable)**

## Introduction: The Dilemma of Centralization

Architectural choices surrounding data storage have profound implications for privacy. Traditional systems often pool user data into a single, monolithic database to simplify synchronization and querying. However, this introduces risks. A single breach exposes everything, forcing users to trust a centralized authority with sensitive information. This trade-off between integration and data sovereignty is a fundamental engineering challenge.

The challenge is magnified with suites of personal applications. Users want a unified dashboard providing a holistic view of their activities, but they do not want raw, intimate details aggregated in the cloud. How can developers build a cohesive ecosystem that feels integrated without centralizing sensitive text? The answer lies in synchronizing useful, aggregated summaries while keeping raw text firmly under local control.

## The Significant Hobbies Hub Philosophy

The Significant Hobbies Hub provides a concrete blueprint. Designed as the front door for independently useful personal applications—Live, Calorie, Setline, Kith, and Anchor—the Hub demonstrates deep integration without absorbing local data stores. The core philosophy: the Hub joins independent apps through privacy-safe summaries and typed semantic actions, explicitly avoiding becoming a central repository.

This architecture ensures each product retains its own interface and immediate data authority. When an individual writes a detailed journal entry, the raw text remains within the application's local domain. The Hub receives only a summary—perhaps indicating an entry was created and its duration. This populates a unified dashboard but remains useless to anyone attempting to extract private thoughts. Intimate text is treated with high local sovereignty, while metadata crosses application boundaries via strictly typed contracts.

## Architecture of Decentralized Authority

This philosophy relies on separating concerns. The Hub UI is served by a dedicated backend using a shared Cloudflare Worker and D1 database. This infrastructure processes only what is necessary for coordination, communicating with individual applications via typed service bindings.

Each application—like Live, Calorie, or Anchor (which absorbed the Indulge/Habits loop)—maintains its own canonical repository, runtime owner, and data authority. For native apps, this means a local, versioned database. The native app dictates how data is modified.

When interacting with the Hub, an app exposes documented semantic actions. The Hub cannot query the local database arbitrarily. It invokes specific operations, ensuring the local store is never bypassed. The PersonalSyncKit Swift package orchestrates these interactions without violating local authority. If the system needs a summary, it relies on the app to generate it.

## The Native Sync Commit Contract

A critical component of this synchronization is the native sync commit contract. The synchronization API enforces a strict sequence for data integrity.

When native consumers download a batch of changes, they must atomically save the batch locally before the closure returns. If the save fails, the application must throw an error. The system advances download metadata and the cursor only after the local closure succeeds. This app-commit-before-progress semantic guarantees the Hub never considers a record synchronized until durably stored by the owning application.

The system is designed to tolerate replay. If an app saves data locally but subsequent bookkeeping fails, the same batch may arrive again. The application must be idempotent. Older, return-only APIs are deprecated because they cannot establish that records reached the app's durable store.

This strict boundary prevents corrupt bookkeeping from discarding ownership and tombstone history. Failed bookkeeping simply retains prior state, and the process safely serializes concurrent sync attempts.

## Account Ownership and Isolation

Rigorous account isolation guarantees that data belonging to one verified user cannot be merged with another's session. The Hub implements durable account ownership and in-flight sync isolation.

Before a native application's first synchronization, it must explicitly ask the user to approve which verified Hub account owns the local document. This choice is saved atomically locally, and the runtime is bound using the captured account identifier. This ownership is permanent; it never transfers to another user. If signing in differently, users must use a separate local document and sync storage.

The sync queue is inextricably linked to this account. The runtime enforces that all operations are performed under the bound account. The shared queue explicitly verifies the captured session around transport and app commits, storing a stable owner alongside its queue and rejecting different-account binding.

Account protection ensures stale identity completions are rejected, new bearer sessions validated before saving, and signed-out sessions removed before remote revocation.

## Opt-In Download Recovery and Resilience

Distributed systems must handle device loss or reinstallation. The architecture includes an opt-in native replay API, allowing compatible callers to request recovery of records an older client acknowledged without retaining.

An app can read historical pages from the beginning without resetting its durable state. This retains the verified-owner lock and processes the existing outbox. Replay is bounded and cancellable (limited to 100 pages of at most 500 records). If a limit is reached or a local write fails, the cursor remains retryable and never moves backward.

The app receives the latest replayed version of each record, excluding versions older than known metadata. Callers must preserve current local edits and tombstones. The replay mechanism fills gaps; it is not permission to unilaterally replace the local store. Outbound-only callers are not opted into imports.

## Concrete Examples in the Ecosystem

To visualize this, consider the interactions between the Hub and independent apps like Kith and Anchor.

When a user completes a personal session in Kith, intimate details are stored purely locally. Kith generates a summary—a typed payload indicating an interaction occurred and a timestamp. This is enqueued and synchronized to the Hub Backend.

The Hub receives this typed semantic action and updates the unified user directory. If compromised, attackers would only find metadata, not the actual notes, which remain secure on the local device.

Similarly, Anchor manages planning and focus timing. While minute-by-minute focus struggles remain local, the Hub receives a simple summary indicating focus block completion, allowing a cohesive timeline without centralized surveillance.

## Internal Link Suggestions

- **Hub Directory**: Link to the `/hub` documentation.
- **Live Integration**: Reference `Significant-Hobbies/live` paths.
- **PersonalSyncKit Documentation**: Link to the Swift package documentation.

## Practical Next Action

If developing a new application for the Hub ecosystem, review the native package documentation. Ensure the app strictly follows the app-commit-before-progress semantics. Verify the application asks the user to approve the Hub account before the first sync. Transition away from any legacy return-only calls.

## Source Notes (Non-Publishable)

- **Source Files Referenced:**
  - `README.md`: Details on the native sync commit contract, opt-in download recovery, and native sync account ownership.
  - `PROJECT_STATUS.md`: Details on Hub's architectural status, bounded batches, verified per-record acknowledgements, the absorption of Habits into Anchor, and account isolation.
  - `agents.md`: The product boundary rule that the Hub joins apps through privacy-safe summaries and typed semantic actions, without absorbing local stores. Apps: Live, Calorie, Setline, Kith, Anchor.

- **Limitations & Constraints:**
  - Existing applications and production storage have not been migrated.
  - Shared runtime requires explicit adoption of unowned data and rejects different-account binding.
  - Replay is *not* permission to replace the local store; callers must preserve newer edits and tombstones. Outbound-only callers must not opt into imports.
  - The return-only synchronization API is deprecated.
  - Kith is the first consumer to update; physical signed-in round trips remain unqualified.