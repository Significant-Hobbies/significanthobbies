# bucket-list-management Specification

## Purpose
TBD - created by archiving change add-life-bingo. Update Purpose after archive.
## Requirements
### Requirement: One bucket list with multiple views
The system SHALL represent a user's desired experiences as one bucket list that can be displayed in List or Bingo view without duplicating items or completion state.

#### Scenario: Switch presentation
- **WHEN** an owner switches a bucket list from List view to Bingo view
- **THEN** the same items and completion state appear in the board layout

### Requirement: Guided guest creation
The system SHALL let a visitor create a bucket list by choosing a horizon, desired feelings, and boldness level without requiring authentication.

#### Scenario: Guest creates through Life Bingo
- **WHEN** a visitor completes the Life Bingo creation flow
- **THEN** the system displays the generated items in Bingo view and stores the bucket-list draft in the visitor's browser

### Requirement: Balanced generation
The system SHALL generate unique, concrete experiences balanced across the selected intentions and multiple effort levels.

#### Scenario: Annual Bingo generation
- **WHEN** a visitor requests a 5×5 annual board
- **THEN** the system returns 24 actionable bucket-list items plus a center “Something unexpected” item

### Requirement: Item editing
The system SHALL let an owner add, replace, edit, remove, and reorder bucket-list items while preserving valid Bingo layouts when that view is used.

#### Scenario: Replace a suggestion
- **WHEN** the owner asks to replace one generated item
- **THEN** the system substitutes a non-duplicate suggestion that fits the list preferences

### Requirement: Guest draft recovery
The system SHALL recover a versioned guest bucket-list draft after page navigation or authentication.

#### Scenario: Return after sign-in
- **WHEN** a guest begins sign-in from the workspace and returns successfully
- **THEN** the workspace restores the same unsaved list and offers authenticated persistence

