## 1. First-use handoff

- [x] 1.1 Make setup completion wait for persisted onboarding answers and lead
  to the setup-specific timeline entry path with a dashboard escape.
- [x] 1.2 Load a bounded persisted starter hobby only for the authenticated
  setup entry path.

## 2. Timeline creation

- [x] 2.1 Initialize one editable `Now` phase from the starter hobby while
  preserving the ordinary template picker, change-template escape, and a
  recoverable creation draft.
- [x] 2.2 Return first-save and canonical navigation metadata from the existing
  save action without changing private-by-default visibility.

## 3. Explicit publication

- [x] 3.1 Show an owner-only first-save completion prompt only for a private
  timeline.
- [x] 3.2 Disclose public discovery/search, publish only after an explicit
  action, and provide server-confirmed keep-private and public-profile paths.

## 4. Verification and product truth

- [x] 4.1 Add focused helper and browser coverage for starter, privacy, and
  publication states.
- [x] 4.2 Run tests, typecheck, lint, docs check, production build, strict
  OpenSpec validation, and diff checks.
- [x] 4.3 Complete preserve-mode design review at 390, 768, and 1440 pixels.
- [x] 4.4 Update current product docs and `PROJECT_STATUS.md`, then archive the
  completed OpenSpec change.
