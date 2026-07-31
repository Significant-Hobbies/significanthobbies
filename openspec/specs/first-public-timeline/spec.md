# first-public-timeline Specification

## Purpose
Define the privacy-preserving first-use journey from completed setup to one
meaningful timeline and an explicit public-profile opt-in.
## Requirements
### Requirement: Completed setup leads to first timeline creation
The system SHALL make first timeline creation the primary next step after setup
while retaining a secondary path to the dashboard. The timeline entry path
SHALL reuse a bounded hobby answer already persisted for the authenticated user
and SHALL NOT expose that answer in the URL.

#### Scenario: Setup hobby is available
- **WHEN** a user completes setup after naming a hobby
- **THEN** the primary continuation opens a new timeline with that hobby in one editable present-day phase

#### Scenario: Hobby was skipped
- **WHEN** a user completes setup without naming a hobby
- **THEN** the ordinary timeline template chooser remains available

### Requirement: Ordinary timeline creation remains unchanged
The system SHALL apply setup-specific prefill only to the explicit setup entry
path. Direct and signed-out visits to the new-timeline route SHALL retain the
existing template-first experience.

#### Scenario: Direct builder visit
- **WHEN** a visitor opens the new-timeline route without setup context
- **THEN** the existing template chooser is shown and no personal starter hobby is loaded

#### Scenario: First creation is interrupted
- **WHEN** a user edits a new timeline and refreshes, navigates away, or reaches an authentication handoff before saving
- **THEN** the local creation draft is restored until the timeline is successfully saved

### Requirement: First timeline remains private until explicit consent
The first saved timeline SHALL use the existing private default. On its
canonical owner route, the system SHALL explain that state and offer separate
publish and keep-private actions. It MUST NOT publish because setup completed,
because the timeline was saved, or because a completion marker is present.
Before publication, the system SHALL disclose that a public timeline may also
appear in public discovery and search.

#### Scenario: First save completes
- **WHEN** an authenticated user saves their first timeline
- **THEN** the timeline remains private and its owner sees an explicit publication choice

#### Scenario: Owner keeps it private
- **WHEN** the owner chooses to keep the first timeline private
- **THEN** the completion prompt is dismissed without changing visibility

#### Scenario: Owner publishes
- **WHEN** the owner explicitly chooses to add the timeline to their public profile
- **THEN** the server changes visibility to public, the canonical route confirms the public state, and the owner receives a route to that profile

### Requirement: Completion presentation grants no authority
The first-save completion prompt SHALL render only for the timeline owner while
the timeline is private. Visibility changes SHALL continue to use the existing
server-side ownership check.

#### Scenario: Non-owner copies completion URL
- **WHEN** a non-owner opens a timeline URL carrying the first-save marker
- **THEN** no owner publication prompt is shown and no private timeline becomes visible
