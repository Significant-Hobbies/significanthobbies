## Purpose

Help a person focus through one private, revisable reasoning contract that connects present reality to future decisions and learning.

## ADDED Requirements

### Requirement: One active trajectory contract
The system SHALL allow an authenticated user to hold at most one active trajectory contract. The contract SHALL contain non-empty constraints, intent, decision policy, and feedback loop fields, plus a weekly or monthly review cadence.

#### Scenario: Create the first contract
- **WHEN** a user with no active contract submits all four fields and a valid cadence
- **THEN** the system creates an active private contract and shows its concise summary on `/trajectory`

#### Scenario: Reject incomplete framing
- **WHEN** a user submits a contract with any required field empty or beyond its accepted length
- **THEN** the system rejects the submission without creating a partial contract

#### Scenario: Prevent parallel focus
- **WHEN** a user already has an active contract and attempts to create another without adjusting or closing the active one
- **THEN** the system rejects the second active contract

### Requirement: Review an active contract
The system SHALL let the owner record an observed signal and choose exactly one outcome: continue, adjust, complete, or release.

#### Scenario: Continue after review
- **WHEN** the owner records a signal and chooses continue
- **THEN** the system stores the review and keeps the current contract active without changing its content

#### Scenario: Adjust after review
- **WHEN** the owner records a signal, chooses adjust, and supplies a valid revised four-part contract
- **THEN** the system stores the review, closes the current version as adjusted, and opens the revision as the sole active contract

#### Scenario: Close after review
- **WHEN** the owner chooses complete or release with an observed signal
- **THEN** the system stores the review, closes the contract with the selected outcome, and leaves the user with no active contract

### Requirement: Private version history
The system SHALL show the owner prior contract versions and their reviews, including which parts changed between adjacent versions. Trajectory contracts and reviews SHALL remain private and unscored.

#### Scenario: Inspect an adjusted trajectory
- **WHEN** the owner views a trajectory that has been adjusted
- **THEN** the history identifies the changed contract fields and shows the recorded review signal and decision

#### Scenario: Signed-out preview
- **WHEN** a signed-out visitor opens `/trajectory`
- **THEN** the system shows read-only sample contract content and does not accept mutations

### Requirement: Cadence is an explicit reminder preference
The system SHALL store a weekly or monthly review cadence chosen by the user and present it as review context without scoring missed reviews or creating streaks.

#### Scenario: Missed cadence
- **WHEN** a user does not review at the selected cadence
- **THEN** the system preserves the active contract without a penalty, score, streak reset, or synthetic review
