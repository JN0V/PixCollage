# F-Droid Compliance Guide

This project is intended to be published on F-Droid. Follow these requirements to stay compliant:

## 1) FOSS-only dependencies
- All dependencies must be Free/Open Source. Current stack:
  - React, React-DOM (MIT)
  - Vite (MIT)
  - TypeScript (Apache-2.0)
  - TailwindCSS (MIT)
  - Konva / react-konva (MIT)
  - Capacitor core / Android (MIT)
- Do not add any proprietary SDKs (Google Play Services, Firebase proprietary features, trackers, ads, crash analytics, etc.).

## 2) No tracking / analytics / ads
- The app must not include analytics or ad SDKs.
- Ensure you don’t add any telemetry.

## 3) Reproducible build instructions
- Use deterministic builds as much as possible.
- Build steps:
  1. Install NodeJS LTS and Java SDK 11+.
  2. Install Android SDK / Android build tools.
  3. Install project deps:
     - `npm ci` (preferred for reproducibility)
  4. Production web build:
     - `npm run build` (outputs to `dist/`)
  5. Capacitor sync:
     - `npx cap sync android`
  6. Android release build:
     - `cd android && ./gradlew assembleRelease`
- Provide a `keystore` managed outside the repository for signing. F-Droid will use its own signing keys.

## 4) Android Manifest and permissions
- Default Capacitor Android template uses minimal permissions.
- Avoid adding unnecessary permissions. If you add camera/filesystem features later, document why and ensure user consent.

## 5) Min/Target SDK
- Set `minSdkVersion` to 21+ (Android 5.0+) in `android/variables.gradle` when the Android project is created.
- Keep `targetSdkVersion` up to date.

## 6) App ID and metadata
- App ID: `com.pixcollage.app` (configure in `capacitor.config.ts`).
- Provide a clear `LICENSE` in the repository root (MIT/Apache-2.0 recommended). Ensure all assets are licensed for redistribution.
- Provide a privacy policy if you ever add network features.

## 7) Offline-first
- The core features do not rely on external services.
- Ensure the app is fully usable offline.

## 8) Build without proprietary repositories
- Ensure Gradle does not require proprietary repositories. Using Maven Central and Google Maven is acceptable for AndroidX; avoid closed-source artifacts.

## 9) QA checklist before submission
- [ ] No trackers/ads/crash SDKs
- [ ] Reproducible build works end-to-end via CLI
- [ ] All dependencies are FOSS
- [ ] Minimal permissions
- [ ] License present and assets allowed
- [ ] App works offline
- [ ] Version code/name set for releases

## Notes
- If you introduce native plugins, verify each plugin’s license and transitive dependencies.
- Keep docs updated as features evolve.
