## ADDED Requirements

### Requirement: Item completion
The system SHALL let a bucket-list owner toggle an item complete and optionally record a date and short reflection.

#### Scenario: Complete an experience
- **WHEN** the owner completes an item with a reflection
- **THEN** the item displays a completion treatment in both views and retains the reflection and completion date

### Requirement: Bingo detection
The system SHALL detect completed horizontal, vertical, and diagonal lines when a bucket list uses a 3×3 or 5×5 Bingo layout.

#### Scenario: Complete a row
- **WHEN** all items in a Bingo row are complete
- **THEN** the system identifies that row as a bingo line and presents a restrained celebration

### Requirement: Authenticated persistence
The system SHALL allow an authenticated user to create, update, and delete only their own bucket lists using validated server mutations.

#### Scenario: Reject another user's update
- **WHEN** an authenticated user attempts to update a bucket list owned by a different user
- **THEN** the server rejects the mutation without changing the list

### Requirement: Side Quest intake
The system SHALL let a user add a Side Quest to a bucket list as a source-linked item without changing the Side Quest's own completion state.

#### Scenario: Add a Side Quest
- **WHEN** a user chooses “Add to Bucket List” on a Side Quest
- **THEN** the selected bucket list receives one item containing the quest label and source identifier

### Requirement: Progress summary
The system SHALL show completed-item count, total-item count, percentage, and Bingo-line count when applicable.

#### Scenario: View partial progress
- **WHEN** a bucket list contains completed and unfinished items
- **THEN** its workspace and share artifact display the accurate progress summary
