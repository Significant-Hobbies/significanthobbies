## Purpose

Organize the product around living, daily attention, and historical perspective so related tools feel like parts of one coherent life-planning system.

## ADDED Requirements

### Requirement: Two-mode primary navigation
The primary application navigation SHALL expose direct destinations for Live More, Daily, and See History, with the product mark returning home. It SHALL NOT expose bucket lists, Life Bingo, side quests, Trajectory, or Life in Weeks as peer top-level links.

#### Scenario: Navigate on desktop
- **WHEN** a person uses the desktop application shell
- **THEN** the top bar shows `SH`, `Live More`, `Daily`, and `See History` as direct links without expandable menus

#### Scenario: Navigate on mobile
- **WHEN** a person opens the mobile navigation
- **THEN** the same three destinations appear in the same semantic order with usable touch targets

### Requirement: Merged Live More home
The Live More destination SHALL bring together hobbies, bucket lists, Life Bingo, and side quests in one coherent page while preserving focused routes for deeper work.

#### Scenario: Open Live More signed out
- **WHEN** a signed-out person opens Live More
- **THEN** the page presents locally usable or publicly explorable entry points for all four areas without requiring authentication

#### Scenario: Open Live More signed in
- **WHEN** a signed-in person opens Live More
- **THEN** the page uses their owner-scoped Living data and retains access to focused editing routes

### Requirement: Merged See History home
The See History destination SHALL combine the mortality frame, Trajectory, and existing look-back narrative into one chronological experience while preserving their focused routes.

#### Scenario: See local history
- **WHEN** a signed-out person opens See History
- **THEN** the page derives mortality, Trajectory, and narrative context from browser-authoritative private records

#### Scenario: See account history
- **WHEN** a signed-in person opens See History
- **THEN** the page derives mortality, Trajectory, and narrative context from owner-scoped account records
