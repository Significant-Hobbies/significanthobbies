# Journal iOS release draft

Preparation only. No App Store Connect record has been created.

## Identity

- Name: Journal
- Bundle ID: `com.significanthobbies.app`
- Version: `1.0.0`
- Build: `1`
- SKU: `significant-hobbies-ios-1`
- Primary language: English (U.S.)
- Category: Lifestyle
- Minimum iOS: 17.0
- Copyright: `2026 Sarthak Agrawal`
- License: Apple's standard EULA
- Content rights: all bundled copy, artwork, and sample hobby content is owned or licensed for distribution

## Store copy

**Subtitle**
Write the day while it is yours

**Promotional text**
Keep a private morning and evening reflection, free writing, and a findable record of earlier days.

**Description**
Journal gives each day one private page. Start with a short morning reflection, return for evening notes, and write freely in between. Earlier entries remain attached to their dates so they are easy to find again.

Writing is always private. There is no public profile, social feed, publishing control, XP, or shame loop.

Journal remains useful without an account. If account sync is enabled, it keeps a private cross-device archive with explicit conflict choices. The preserved bundle and document identities keep entries created before the product split readable.

**Keywords**
journal,reflection,private diary,morning pages,daily notes,writing,evening review

## URLs

- Support: `https://journal.significanthobbies.com/support/`
- Privacy: `https://journal.significanthobbies.com/privacy/`

## Privacy draft

- Tracking: none
- Third-party advertising: none
- Journal entries: always private and never publication-eligible
- Account mode: name, email address, user ID, and private user content are linked to the user and used only for app functionality
- Device-only mode: content remains on this device unless the user explicitly exports it
- IDFA: not used

## Age rating draft

- Made for Kids: No
- In-app parental controls or age assurance: None
- Unrestricted web access, broadly distributed user-generated content, social
  media, messaging/chat, and advertising: No in this native build
- Health or Wellness Topics: Yes — private reflection
- Medical or Treatment Information: None
- Violence, sexuality or nudity, profanity, horror, drugs, alcohol, gambling,
  contests, and loot boxes: None

Confirm the rating produced by App Store Connect's current questionnaire.

## Review notes draft

The app works in local mode and writing has no sharing control. Account sync offers Sign in with Apple beside Google and stores the existing private revisioned archive; a conflict always requires an explicit copy choice. Existing Google users add Apple explicitly while authenticated, and matching email text never silently merges identities. Apple tokens are nonce-bound and validated for the preserved bundle ID `com.significanthobbies.app`.

## Screenshots and release

- Replace the pre-split App Store screenshots with Journal-only screens before upload.
- Each iPhone image uses an accepted App Store screenshot size and has no alpha channel.
- Accessibility evidence is retained separately and is not part of the default store sequence
- The target is universal, so both the iPhone and iPad sequences are required
- App previews: omit for version 1.0
- Release: manual
