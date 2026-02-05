# JOY BANGLA - APK Build and Deployment Guide

## Overview
This guide explains how to build the Android APK for the JOY BANGLA application and release it through GitHub Actions.

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm/pnpm
- Java Development Kit (JDK) 11+
- Android SDK (API level 31+)
- Android Studio (recommended)
- Capacitor CLI: `npm install -g @capacitor/cli`

### Build Steps for Local Testing

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the web app:**
   ```bash
   npm run build
   ```

3. **Initialize Capacitor (if not already done):**
   ```bash
   npx cap init
   ```

4. **Add Android platform:**
   ```bash
   npx cap add android
   ```

5. **Sync assets to Android:**
   ```bash
   npx cap sync
   ```

6. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

7. **Build APK in Android Studio:**
   - Open Android Studio
   - Select "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
   - The APK will be located in `android/app/build/outputs/apk/release/`

## Automated Release through GitHub Actions

### Setup Instructions

1. **Create a signed APK:**
   - Generate a signing key:
     ```bash
     keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
     ```

2. **Store signing credentials as GitHub secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `KEYSTORE_BASE64`: Base64 encoded keystore file
       ```bash
       base64 -i my-release-key.jks | tr -d '\n' | pbcopy
       ```
     - `KEYSTORE_PASSWORD`: Your keystore password
     - `KEY_ALIAS`: Your key alias (e.g., `my-key-alias`)
     - `KEY_PASSWORD`: Your key password

3. **Create a release tag to trigger the build:**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

4. **The GitHub Actions workflow will:**
   - Build the web assets
   - Set up Android build environment
   - Build the signed APK
   - Create a GitHub Release with the APK attached

## Distribution

### For Users
- Download the APK from the GitHub Releases page
- On Android device, go to Settings → Security → Enable "Unknown Sources"
- Install the APK file

### For App Store
To publish on Google Play Store:
1. Create a Google Play Developer account
2. Complete required app information and graphics
3. Build a signed APK/AAB (Android App Bundle)
4. Upload to Google Play Console

## Web Deployment

The web version can be deployed to any hosting service:

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist/spa`

### Vercel
1. Import your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist/spa`

## Customization

### App Icon and Splash Screen
- App Icon: Replace `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Splash Screen: Modify `capacitor.config.ts` or use Capacitor plugin

### App Configuration
Edit `capacitor.config.ts` to customize:
- App ID: `appId: 'com.joybangla.app'`
- App Name: `appName: 'Joy Bangla'`
- Splash screen colors and duration
- Status bar color: `#006bb6` (Bangladesh flag blue)

## Troubleshooting

### APK Installation Fails
- Ensure you have enabled "Unknown Sources" in device settings
- Check Android version compatibility (API 21+)
- Try uninstalling previous version first

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx cap sync` to sync latest changes to Android
- Check Android SDK installation and API levels

### Gradle Build Issues
- Update Android Gradle plugin: `gradle wrapper --gradle-version 8.0`
- Clear gradle cache: `cd android && ./gradlew clean`

## Version Management

Update version in:
1. `capacitor.config.ts`: Update version info
2. `android/app/build.gradle`: Update versionCode and versionName
3. `package.json`: Update version field

Then create a new tag:
```bash
git tag -a vX.Y.Z -m "Release version X.Y.Z"
git push origin vX.Y.Z
```

## Support

For issues with:
- **Capacitor**: https://capacitorjs.com/docs
- **Android SDK**: https://developer.android.com
- **GitHub Actions**: https://docs.github.com/en/actions
