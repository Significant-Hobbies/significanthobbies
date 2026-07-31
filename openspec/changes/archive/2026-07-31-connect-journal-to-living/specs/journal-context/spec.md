## ADDED Requirements

### Requirement: Journal context choices are private and owned
The system SHALL offer a signed-in journal writer only timelines and
non-abandoned commitments owned by that user as optional context choices. The
signed-out preview SHALL NOT offer context selection.

#### Scenario: Owned choices are available
- **WHEN** a signed-in user opens the daily journal
- **THEN** the context selector lists only that user's timelines and non-abandoned commitments

#### Scenario: Preview remains read-only
- **WHEN** a signed-out visitor opens the daily preview
- **THEN** no journal-context selector or persistence control is shown

### Requirement: A journal entry has at most one optional context
The system SHALL allow a journal entry to reference either one owned timeline,
one owned commitment, or no context. Saving morning or evening writing SHALL
preserve the selected context until the user changes or clears it.

#### Scenario: Save a timeline context
- **WHEN** a signed-in user saves journal writing with one of their timelines selected
- **THEN** the entry stores that timeline and no commitment reference

#### Scenario: Save a commitment context
- **WHEN** a signed-in user saves journal writing with one of their commitments selected
- **THEN** the entry stores that commitment and no timeline reference

#### Scenario: Clear a context
- **WHEN** a signed-in user selects no context and saves the entry
- **THEN** both journal context references are cleared without deleting the writing

### Requirement: Context ownership is enforced by the server
The server MUST verify that a requested context belongs to the authenticated
user before changing a journal entry. An invalid, missing, or cross-user target
MUST be rejected without persisting the requested context.

#### Scenario: Reject another user's target
- **WHEN** a signed-in user submits a timeline or commitment id owned by another user
- **THEN** the save is rejected and the journal entry does not gain that reference

### Requirement: Saved context is recognizable and navigable
The daily journal SHALL show the saved context for today's writer and for a
selected recent entry, using a human-readable label and a link to the related
private timeline or commitments surface.

#### Scenario: Read a linked recent entry
- **WHEN** a user selects a recent journal date that has a valid context
- **THEN** the journal reader shows its context label and a route to that Living surface

#### Scenario: Referenced target is deleted
- **WHEN** a linked timeline or commitment is deleted
- **THEN** the journal writing remains and its context reference becomes empty

### Requirement: Linking has no progression or publication side effects
Journal context SHALL remain private journal metadata. Saving it MUST NOT create
or update stamps, habit logs, scores, streaks, badges, notifications, timeline
visibility, or social activity.

#### Scenario: Save linked reflection
- **WHEN** a user saves a journal entry linked to a commitment
- **THEN** only the journal entry and its context metadata are changed
