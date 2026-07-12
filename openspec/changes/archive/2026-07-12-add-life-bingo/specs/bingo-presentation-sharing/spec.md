## ADDED Requirements

### Requirement: Private by default
The system SHALL create every authenticated bucket list with private visibility unless the owner explicitly changes it.

#### Scenario: Save a guest draft
- **WHEN** an authenticated user saves a recovered guest bucket list
- **THEN** the resulting list is accessible only to its owner

### Requirement: Bingo share visibility
The system SHALL allow owners to set a bucket list to private, unlisted, or public and SHALL assign a stable Bingo share slug when sharing is enabled.

#### Scenario: Enable unlisted sharing
- **WHEN** the owner changes a private bucket list to unlisted
- **THEN** the system creates a public Bingo URL that is accessible to anyone with the link

### Requirement: Public item privacy
The system SHALL return a not-found response for private bucket lists on public share routes.

#### Scenario: Open a private slug
- **WHEN** a visitor requests the share route for a private bucket list
- **THEN** the system does not reveal the list or its owner data

### Requirement: Bingo remixing
The system SHALL let a visitor copy a shared Bingo board's prompts into a new guest bucket list without copying completion state or reflections.

#### Scenario: Remix a public board
- **WHEN** a visitor selects “Make my version” on a shared board
- **THEN** the workspace opens a new incomplete local list containing the source prompts in Bingo view

### Requirement: Image export
The system SHALL let visitors export Bingo view as a polished PNG with editing controls excluded.

#### Scenario: Export progress artifact
- **WHEN** a visitor exports a partially completed Bingo board
- **THEN** the downloaded image contains the title, grid, completion treatments, progress, and subtle Significant Hobbies attribution
