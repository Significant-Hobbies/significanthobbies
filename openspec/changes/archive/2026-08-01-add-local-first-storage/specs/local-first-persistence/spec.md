## Purpose

Keep a person's private planning work durable before account creation while making the application's current source of truth understandable and safe to change.

## ADDED Requirements

### Requirement: One application-wide storage mode
The system SHALL derive one current storage mode from authentication state: `local` when no user is authenticated and `account` when a user is authenticated. Every migrated private surface SHALL read and write through that mode and SHALL identify the mode to the user in plain language.

#### Scenario: Anonymous visitor
- **WHEN** a visitor without an authenticated session opens a migrated private surface
- **THEN** the surface reads from browser storage, permits local mutations, and says that the data is saved on this device

#### Scenario: Authenticated owner
- **WHEN** an authenticated user opens a migrated private surface
- **THEN** the surface reads from the account database, writes only owner-scoped records, and says that the data is saved to the account

### Requirement: Durable and validated anonymous records
The system SHALL persist anonymous private records across refreshes and browser restarts with a schema version, stable record identifiers, and update timestamps. It SHALL validate records when reading and writing and SHALL isolate invalid or unsupported records rather than presenting them as valid user data.

#### Scenario: Return on the same browser
- **WHEN** an anonymous visitor saves valid private work and later returns in the same browser profile
- **THEN** the system restores that work without asking for the same data again

#### Scenario: Invalid local record
- **WHEN** a stored record fails current validation or uses an unsupported future schema version
- **THEN** the system does not load it as current data and preserves recoverable raw data for repair or export

### Requirement: Safe sign-in handoff
The system SHALL detect locally stored work when an anonymous visitor becomes authenticated and SHALL offer a clear import into that account. Import SHALL be idempotent, SHALL preserve account records on conflict, and SHALL not remove the local copy until all selected database writes succeed.

#### Scenario: Import non-conflicting local work
- **WHEN** a newly authenticated user approves importing local work that has no account equivalent
- **THEN** the system writes it to the account database once, marks the import complete, and switches the surface to the account record

#### Scenario: Existing account data conflicts
- **WHEN** local work and account work both exist for a single-active-record feature
- **THEN** the system keeps the account record authoritative and lets the user explicitly retain, replace, or discard the local version without silent overwrite

#### Scenario: Import fails
- **WHEN** any selected database write fails during import
- **THEN** the system reports the failure, keeps the local source intact, and permits a safe retry without duplicate records

### Requirement: Honest capability boundaries
The system SHALL distinguish private local planning from operations that require an authenticated identity or shared server state. Publishing, sharing under an identity, cross-device sync, and community mutations SHALL require authentication and SHALL not pretend to succeed locally.

#### Scenario: Anonymous publish attempt
- **WHEN** an anonymous visitor attempts an identity-dependent or public operation
- **THEN** the system preserves their private draft locally and asks them to sign in for that operation

### Requirement: Incremental whole-application adoption
The system SHALL maintain a documented inventory of private data domains and their local-first migration status. A surface SHALL not claim anonymous durability until all of its editable private records use the shared storage contract.

#### Scenario: Unmigrated surface
- **WHEN** an anonymous visitor reaches a private surface not yet migrated
- **THEN** the system clearly identifies it as account-required and does not render editable controls that discard input
