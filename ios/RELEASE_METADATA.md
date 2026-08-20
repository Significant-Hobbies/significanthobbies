# Significant Hobbies iOS release draft

Preparation only. No App Store Connect record has been created.

## Identity

- Name: Significant Hobbies
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
Choose, live, and remember

**Promotional text**
Carry your Life Atlas: private Daily reflection, hobbies and commitments, and a truthful history of what became real.

**Description**
Significant Hobbies helps you notice what matters, return to it, and remember how it changed. Live More holds hobbies, commitments, timelines, bucket-list possibilities, side quests, and yearly direction. Daily is a private morning and evening ritual with journal writing, humane habit check-ins, and one new thing. See History connects reflection to lived evidence without turning either into a competition.

Daily writing is always private. Eligible Living items begin private and only become public-profile candidates when you explicitly choose that item. There is no social feed, XP, or shame loop.

The local Life Atlas remains useful without an account. If account sync is enabled, it keeps a private cross-device copy with explicit conflict choices. You can export or preview-replace the complete Atlas whenever you choose.

**Keywords**
hobbies,life planner,journal,reflection,bucket list,habits,commitments,goals,private diary

## URLs

- Support: `https://significanthobbies.com`
- Privacy: `https://significanthobbies.com/privacy`

## Privacy draft

- Tracking: none
- Third-party advertising: none
- Daily reflections and journal: always private and never publication-eligible
- Living items: private by default; item-level opt-in only
- Account mode: name, email address, user ID, and private user content are linked to the user and used only for app functionality
- Device-only mode: content remains on this device unless the user explicitly exports it
- IDFA: not used

## Age rating draft

- Made for Kids: No
- In-app parental controls or age assurance: None
- Unrestricted web access, broadly distributed user-generated content, social
  media, messaging/chat, and advertising: No in this native build
- Health or Wellness Topics: Yes — private reflection and humane habit planning
- Medical or Treatment Information: None
- Violence, sexuality or nudity, profanity, horror, drugs, alcohol, gambling,
  contests, and loot boxes: None

Confirm the rating produced by App Store Connect's current questionnaire.

## Review notes draft

The app works in local mode. Daily writing intentionally has no sharing control. To inspect the opt-in boundary, open a hobby and choose its Private status; the confirmation explains that only the selected eligible item changes. Account sync offers Sign in with Apple beside Google and stores a private revisioned Life Atlas; a conflict always requires an explicit copy choice. Existing Google users add Apple explicitly while authenticated, and matching email text never silently merges identities. Apple tokens are nonce-bound and validated for `com.significanthobbies.app`.

## Screenshots and release

- iPhone 6.9-inch portrait: `ios/artifacts/app-store/iphone-6.9/live-more.jpg`,
  `daily.jpg`, and `history.jpg`
- iPad 13-inch portrait: `ios/artifacts/app-store/ipad-13/live-more.jpg`,
  `daily.jpg`, and `history.jpg`
- Each iPhone image is `1320 × 2868`; each iPad image is `2064 × 2752`.
  Every store image has no alpha channel and uses an accepted screenshot size.
- Accessibility evidence is retained separately and is not part of the default store sequence
- The target is universal, so both the iPhone and iPad sequences are required
- App previews: omit for version 1.0
- Release: manual
