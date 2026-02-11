# 📱 Nexus CSP - Android APK Build Guide

## Prerequisites

Before building the APK, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Android Studio** - [Download here](https://developer.android.com/studio)
3. **Java JDK 17** (usually comes with Android Studio)

## Step-by-Step Instructions

### Step 1: Install Dependencies

Open a terminal in the `banking-kiosk-app` folder and run:

```bash
npm install
```

### Step 2: Add Android Platform

```bash
npx cap add android
```

### Step 3: Sync Web Files to Android

```bash
npx cap sync android
```

### Step 4: Open in Android Studio

```bash
npx cap open android
```

This opens your project in Android Studio.

### Step 5: Build the APK

In Android Studio:
1. Wait for Gradle sync to complete (may take 5-10 minutes first time)
2. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build to complete
4. Click **Locate** when done to find your APK

The APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Creating a Signed Release APK

For Play Store or sharing:

1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Choose **APK**
3. Create a new keystore (save this file safely!)
4. Fill in your details
5. Select **release** build type
6. Click **Finish**

## App Icon

Replace the icons in `android/app/src/main/res/mipmap-*` folders with your own icons:
- `mipmap-hdpi`: 72x72
- `mipmap-mdpi`: 48x48
- `mipmap-xhdpi`: 96x96
- `mipmap-xxhdpi`: 144x144
- `mipmap-xxxhdpi`: 192x192

## Troubleshooting

### "SDK not found"
Set ANDROID_HOME environment variable to your Android SDK path.

### Gradle sync failed
1. In Android Studio: **File → Sync Project with Gradle Files**
2. Make sure you have internet connection

### Build failed
Check the error message in the Build output panel. Common fixes:
- Update Gradle plugin version
- Accept SDK licenses: `sdkmanager --licenses`

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Add Android platform
npx cap add android

# Sync changes after editing web files
npx cap sync android

# Open in Android Studio
npx cap open android
```

## Files Created

- `manifest.json` - PWA configuration
- `package.json` - Node.js project config
- `capacitor.config.json` - Capacitor settings
- `sw.js` - Service worker for offline support
- `icons/` - App icons folder

---

**Your app ID:** `com.radhefinvest.nexuscsp`
**Your app name:** `Nexus CSP`
