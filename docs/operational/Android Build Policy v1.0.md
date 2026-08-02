# Android Build Policy v1.0

This note documents the safe workflow for GeoTaxi Android builds when EAS Build is the official source of truth and local builds are only used for day-to-day testing.

## Source of truth

- EAS is authoritative for Android release versioning and signing policy.
- `eas.json` uses `cli.appVersionSource: "remote"`, so EAS manages `android.versionCode` remotely.
- `app.json` may still contain `android.versionCode`, but EAS ignores it when the version source is remote.

## Why this matters

- Android will not install an APK if its `versionCode` is lower than the one already installed on the device.
- Android can also reject installs when the signing key changes.
- The generic installer message `Application not installed` usually hides one of these two problems.

## Current project rule

- Local builds must stay compatible with the EAS-managed package name, signing identity, and version policy.
- Do not treat the local build as a separate product line.
- When you build locally, use a `versionCode` that is strictly greater than the version already installed on the target device.

## Official EAS workflow

1. Check the current remote Android version:

   ```bash
   eas build:version:get -p android -e apk
   ```

2. If a new official version is needed, set the remote version before building:

   ```bash
   eas build:version:set -p android -e apk
   ```

3. Build the official APK only after the remote version is in sync:

   ```bash
   eas build -p android --profile apk
   ```

## Local day-to-day workflow

1. Read the current remote version from EAS.
2. Pick a local `versionCode` that is higher than both:
   - the remote EAS version; and
   - the version currently installed on the phone.
3. Build locally with the same signing material used by EAS.
4. Verify the APK before sharing it.

Example local release build:

```bash
cd android
./gradlew.bat --no-daemon --% assembleRelease -PversionCode=<next_version> -PversionName=1.0.0
```

Use the EAS keystore and matching alias/passwords already stored in the workspace secrets or local secure notes.

## Verification checklist

- Confirm the APK exists at `android/app/build/outputs/apk/release/app-release.apk`.
- Confirm the embedded package name is `com.taxiliquidacionapp`.
- Confirm the embedded `versionCode` is the one you intended.
- Verify signing with `apksigner verify --verbose --print-certs`.
- If possible, install on the target device without uninstalling the app first.

## Current synced state at the time of this note

- EAS remote Android `versionCode` was synchronized to `35` on 2026-08-01.
- Use `eas build:version:get -p android -e apk` again before any future official build, because this value will keep moving.

## Practical rule of thumb

- If the app is already installed on the phone, the next APK must have a higher `versionCode`.
- If EAS and local builds ever disagree, update the EAS remote version first, then build locally or officially from that aligned state.

