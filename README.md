# SprytnaSpizarnia

Smart pantry management app built with React Native.

## Features

- Product management with barcode scanning
- Smart shopping lists
- Recipe generation based on available ingredients
- Meal planning
- Family sharing

## Tech Stack

- React Native
- TypeScript
- Firebase
- Redux Toolkit
- React Navigation

## Quick start

1. Install dependencies: `npm install`
2. Configure Firebase (see below)
3. Start Metro: `npm start`

## Requirements

- Node.js (recommended LTS)
- npm or yarn
- JDK 17 (project configured for Java 17 / Gradle toolchain)
- Android SDK (platforms and build-tools for API 36 required to run on the provided emulator)

## Android — development notes

- Set your Android SDK path locally in `android/local.properties` (do NOT commit this file):
  - `sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\sdk`
- To run on Android emulator or device (Windows PowerShell):
  - `cd android; .\\gradlew.bat clean`
  - from repo root: `npx react-native run-android`
- Release builds and signing: see `android/keystore-instructions.txt` and keep keystore credentials private.
- `android/gradle.properties` contains some project settings (e.g. `android.suppressUnsupportedCompileSdk=34,36` and `org.gradle.java.home`) used to make the project build reproducibly.

## Firebase

- Place your `google-services.json` in `android/app/` (an example file `android/app/google-services.json.example` is included).
- Follow Firebase console steps to set up Android app and download the config file.

## Assets & fonts

- Fonts are stored in `android/app/src/main/assets/fonts` and are already referenced by `react-native.config.js` so they are bundled automatically.

## Common troubleshooting

- Build fails pointing to Java version: ensure JDK 17 is installed and `org.gradle.java.home` in `android/gradle.properties` points to it.
- If Gradle complains about `com.facebook.react` plugin, ensure `@react-native/gradle-plugin` is installed in project devDependencies.
- Flipper-related resolution errors (e.g. `flipper-fresco-plugin`) were worked around by omitting the plugin; if you need Flipper, add proper repositories or plugin versions.
- If `adb` or emulator is not found, make sure `platform-tools` from Android SDK are installed and `adb` is on PATH.

## Developer commands

- Install deps: `npm install`
- Start Metro: `npm start`
- Run on Android: `npx react-native run-android`
- Clean & assemble (Windows): `cd android; .\\gradlew.bat clean assembleDebug`
- View device logs: `adb logcat` (filter with `| Select-String ReactNative` in PowerShell)

## Contributing

- Please open issues / PRs. Keep secrets (keystore passwords, google-services.json with private project details) out of the repo.

## Notes

- The project contains IntelliJ/Android Studio settings in `.idea/`. There is no `.vscode/` workspace by default; a minimal `.vscode` configuration can be provided to help VS Code users.
