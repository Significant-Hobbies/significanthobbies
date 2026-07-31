## ADDED Requirements

### Requirement: Habit commitment links are explicit and optional

The system SHALL let an authenticated owner explicitly link a habit to at most
one owned, non-abandoned commitment, change that link, or clear it.

#### Scenario: Owner creates a linked habit

- **WHEN** an authenticated user creates a habit and selects one eligible
  commitment
- **THEN** the habit stores that commitment as private planning context

#### Scenario: Owner creates a habit without choosing a commitment

- **WHEN** an authenticated user creates a habit without selecting a commitment
- **THEN** the habit remains unlinked even if its name resembles an existing
  commitment

#### Scenario: Owner changes or clears a link

- **WHEN** the owner chooses another eligible commitment or no related
  commitment in habit management
- **THEN** the system updates only that owned habit's optional relationship

### Requirement: Link writes enforce ownership and eligibility

The system MUST accept a habit commitment link only when the habit and target
commitment belong to the authenticated user and the commitment is not
abandoned.

#### Scenario: User submits another person's commitment

- **WHEN** a user submits a commitment ID they do not own
- **THEN** the system rejects the link and does not change the habit

#### Scenario: User submits an abandoned commitment

- **WHEN** a user submits an abandoned commitment as the target
- **THEN** the system rejects the link and does not change the habit

#### Scenario: User submits another person's habit

- **WHEN** a user attempts to change the relationship on a habit they do not own
- **THEN** the system does not change that habit

### Requirement: Habit links do not create commitment progress

The system MUST keep habit check-ins separate from commitment proof, stamps,
status, streaks, badges, visibility, and public activity.

#### Scenario: Linked habit is checked in

- **WHEN** the owner completes or uncompletes a linked habit for a day
- **THEN** only the habit log changes and no commitment evidence or progress is
  created

#### Scenario: Habit link changes

- **WHEN** the owner links, relinks, or clears a commitment
- **THEN** the related commitment and its stamps remain unchanged

### Requirement: Commitment deletion preserves habit history

The system SHALL clear a habit's optional relationship when the related
commitment is deleted without deleting the habit or its logs.

#### Scenario: Related commitment is deleted

- **WHEN** a commitment referenced by a habit is deleted
- **THEN** the habit's commitment link becomes null and the habit and its
  existing check-ins remain available

### Requirement: Daily UI keeps the relationship quiet and private

The authenticated daily experience SHALL show the linked commitment as
secondary context and SHALL expose link editing only through deliberate habit
management controls.

#### Scenario: Linked habit card renders

- **WHEN** an authenticated owner views a linked habit
- **THEN** the card shows a quiet route to the related commitment and explains
  that checking in does not create proof or progress

#### Scenario: Signed-out preview renders

- **WHEN** a signed-out visitor views the daily preview
- **THEN** no commitment-link creation or editing control is exposed
