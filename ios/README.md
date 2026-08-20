# Journal for iPhone

A private native SwiftUI journal for iOS 17 and later. The app is focused on morning and evening reflection, free writing, dates, and finding earlier entries.

The existing `com.significanthobbies.app` identity and local document remain unchanged so current entries survive the split. Live and Habits records stay preserved in the compatible archive but are no longer exposed or edited by the Journal interface. Account sync remains revisioned and optional; the app is fully useful offline.

## Local checks

```bash
./scripts/check.sh
```

## Personal-team archive

```bash
SH_ARCHIVE_PATH=/private/tmp/SignificantHobbies.xcarchive ./scripts/archive.sh
```

The script is locked to personal team `8F7LXHTJZR`, verifies the local signature, and contains no upload step.

## Device-only checks before submission

- Complete morning/evening reflection, writing, date navigation, and archive flows on physical iPhone hardware.
- Verify the largest Dynamic Type sizes, VoiceOver chronology, Reduce Motion, and writing keyboard behavior on hardware.
- Verify account callback, Keychain persistence, and offline reconciliation after native account sync is enabled.
- Confirm screenshots, support/privacy URLs, age rating, and App Privacy answers in App Store Connect before upload.
