## MODIFIED Requirements

### Requirement: One active trajectory contract
The system SHALL allow a person in either local or account storage mode to hold at most one active trajectory contract. The contract SHALL contain non-empty constraints, intent, decision policy, and feedback loop fields, plus a weekly or monthly review cadence.

#### Scenario: Create the first contract
- **WHEN** a person with no active contract submits all four fields and a valid cadence
- **THEN** the system creates an active private contract in the current storage mode and shows its concise summary on `/trajectory`

#### Scenario: Reject incomplete framing
- **WHEN** a person submits a contract with any required field empty or beyond its accepted length
- **THEN** the system rejects the submission without creating a partial contract

#### Scenario: Prevent parallel focus
- **WHEN** a person already has an active contract and attempts to create another without adjusting or closing the active one
- **THEN** the system rejects the second active contract

### Requirement: Private version history
The system SHALL show the person prior contract versions and their reviews, including which parts changed between adjacent versions. Trajectory contracts and reviews SHALL remain private and unscored in both local and account storage modes.

#### Scenario: Inspect an adjusted trajectory
- **WHEN** a person views a trajectory that has been adjusted
- **THEN** the history identifies the changed contract fields and shows the recorded review signal and decision

#### Scenario: Signed-out local trajectory
- **WHEN** a signed-out visitor opens `/trajectory`
- **THEN** the system restores their locally saved trajectory or presents an editable empty state and identifies that changes remain on this device
