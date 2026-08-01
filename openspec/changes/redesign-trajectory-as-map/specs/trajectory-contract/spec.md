## MODIFIED Requirements

### Requirement: One active trajectory contract
The system SHALL allow a person in either local or account storage mode to hold at most one active trajectory contract. The contract SHALL contain non-empty constraints, intent, decision policy, and feedback loop fields, plus a weekly or monthly review cadence. The primary Trajectory interface SHALL present the four parts as a connected direction from present position through future action and learning, while allowing each part to be selected and edited independently.

#### Scenario: Create the first contract
- **WHEN** a person with no active contract opens `/trajectory`
- **THEN** the system shows the relationship among all four parts before asking the person to edit one focused part at a time

#### Scenario: Complete the map
- **WHEN** a person supplies all four parts and a valid cadence
- **THEN** the system creates an active private contract in the current storage mode and presents it as a connected trajectory

#### Scenario: Reject incomplete framing
- **WHEN** a person submits a contract with any required part empty or beyond its accepted length
- **THEN** the system rejects the submission without creating a partial contract and keeps the person's draft available

#### Scenario: Prevent parallel focus
- **WHEN** a person already has an active contract and attempts to create another without adjusting or closing the active one
- **THEN** the system rejects the second active contract

#### Scenario: Understand the map without a desktop pointer
- **WHEN** a person uses a narrow screen, keyboard, or assistive technology
- **THEN** the four parts remain available in a logical sequence with explicit labels and usable editing controls
