## ADDED Requirements

### Requirement: Trajectory appears in personal history
The system SHALL surface the current Trajectory and its revisions within See History while keeping the focused Trajectory route available for creating, reviewing, and adjusting the contract.

#### Scenario: Active trajectory in history
- **WHEN** a person with an active Trajectory opens See History
- **THEN** the historical experience shows the connected four-part map and links to the focused review action

#### Scenario: No trajectory in history
- **WHEN** a person without a Trajectory opens See History
- **THEN** the historical experience identifies the missing direction without inventing one and offers the focused creation route
