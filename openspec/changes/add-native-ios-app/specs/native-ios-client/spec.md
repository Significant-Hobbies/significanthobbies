## Purpose

Defines the observable behavior of Significant Hobbies' native iPhone client, including full private-product parity, local and account-backed state, opt-in publication, accessibility, and submission preparation.

## ADDED Requirements

### Requirement: Native navigation preserves the product's three-part model
The iOS client SHALL expose Live More, Daily, and See History in that order and SHALL keep focused tools within those destinations rather than creating a unified multi-product hub.

#### Scenario: User launches the app
- **WHEN** onboarding is complete
- **THEN** the client opens to a native Significant Hobbies destination with Live More, Daily, and See History directly reachable

### Requirement: Daily provides the complete private ritual
The iOS client SHALL provide morning and evening reflection, private journal writing, boolean habit check-ins, new-thing capture, prior-entry context, and date navigation. Journal content SHALL have no public visibility control or sharing action.

#### Scenario: User completes an evening reflection
- **WHEN** the user writes an evening entry and checks a habit
- **THEN** both are saved privately without a score, streak, XP, or public state

### Requirement: Living plans have full management behavior
The iOS client SHALL support hobbies, hobby discovery and quiz results, commitments, timelines, bucket-list items, side quests, yearly direction, optional daily practice, proof stamps where applicable, and item-level archive or deletion consistent with the current product.

#### Scenario: User adds a commitment to a hobby
- **WHEN** the user creates a dated commitment and leaves public visibility off
- **THEN** it appears in the private Living plan and is absent from public surfaces

### Requirement: History connects reflection and lived evidence
The iOS client SHALL provide chronological history, personal trajectory, mortality context, hobby evolution, completed commitments, journal context, and remembered evidence without turning reflection into competitive progress.

#### Scenario: User opens See History
- **WHEN** the user reviews a prior period
- **THEN** the client presents dated private reflection and eligible lived evidence with privacy provenance

### Requirement: Private-by-default behavior works locally
The iOS client SHALL allow meaningful signed-out or local use for private Daily and Living data, persist it across relaunches, and clearly distinguish local-only state from account-backed state.

#### Scenario: User writes without connectivity
- **WHEN** the network is unavailable
- **THEN** private writing and Living changes save locally and remain accessible after relaunch

### Requirement: Account synchronization preserves explicit publication boundaries
When connected through existing Significant Hobbies service contracts, the client SHALL synchronize eligible private data, show synchronization state and recoverable errors, and require explicit item-level opt-in before publishing a Living item or profile field. Journal entries SHALL never be published.

#### Scenario: User enables publication for one item
- **WHEN** the user explicitly makes one eligible commitment public
- **THEN** only that item becomes publication-eligible and unrelated private data remains private

### Requirement: Native account access includes Sign in with Apple
The iOS client SHALL offer Sign in with Apple beside Google account connection. Apple identity tokens SHALL be verified by the service for the native bundle identifier. The service SHALL disable implicit email-based linking; an existing signed-in account MAY add Apple only through an explicit authenticated linking action.

#### Scenario: Existing Google user adds Apple
- **WHEN** an authenticated Google user chooses the Apple control and completes Apple's authorization
- **THEN** Apple is linked to that same account without replacing the private Life Atlas or inferring identity from matching email text

### Requirement: Profile and data control have parity
The iOS client SHALL provide profile editing, privacy settings, public-profile preview, soundtrack preference where supported, export, local reset, sign out, and account deletion with confirmation and recovery copy.

#### Scenario: User requests data export
- **WHEN** the user starts an export
- **THEN** the client produces or retrieves a portable representation of their eligible account and local data without changing it

### Requirement: Native Life Atlas remains accessible
The iOS client SHALL adapt the established paper, ink, atlas-gold, sage, path, waypoint, and almanac language to native controls while supporting Dynamic Type, VoiceOver, Reduce Motion, sufficient contrast, 44-point targets, and status cues beyond color.

#### Scenario: User enables an accessibility text size
- **WHEN** content uses a large accessibility category
- **THEN** reflection, primary actions, and navigation reflow without clipping or hiding content

### Requirement: Submission preparation stops before publication
The repository SHALL include privacy metadata, app icons, version/build configuration, support and privacy links or copy, automated tests, a simulator verification path, and a personal-team archive path. Preparation SHALL not create or modify App Store Connect records or upload a build.

#### Scenario: Maintainer prepares a release candidate
- **WHEN** the documented release checks and archive command complete
- **THEN** a locally verifiable archive and metadata checklist exist with publication left as a later manual action
