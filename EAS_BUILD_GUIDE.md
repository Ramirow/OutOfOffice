# EAS Build Guide for Android

This guide will help you build an Android APK or AAB (Android App Bundle) using Expo Application Services (EAS).

## Prerequisites

1. ✅ EAS CLI installed (already done)
2. ✅ EAS account (Expo account)
3. ✅ Project configured with `eas.json` (already configured)

## Step-by-Step Instructions

### 1. Login to EAS

```bash
eas login
```

If you don't have an Expo account, create one at [expo.dev](https://expo.dev)

### 2. Configure Your Build Profile (Optional)

Your `eas.json` already has three build profiles:
- **development**: For development builds with Expo Go
- **preview**: For internal testing (APK)
- **production**: For Play Store submission (AAB)

### 3. Build Android APK (for testing)

For a preview/test build (APK file):

```bash
eas build --platform android --profile preview
```

This will:
- Build an APK file you can install directly on Android devices
- Take about 10-20 minutes
- Provide a download link when complete

### 4. Build Android AAB (for Play Store)

For production build (AAB file for Google Play Store):

```bash
eas build --platform android --profile production
```

This will:
- Build an AAB (Android App Bundle) file
- Auto-increment version code
- Ready for Play Store submission

### 5. Build Both Platforms

To build for both Android and iOS:

```bash
eas build --platform all --profile production
```

## Build Options

### Build Locally (faster, requires Android SDK)

```bash
eas build --platform android --profile preview --local
```

**Note**: Requires Android SDK and can be complex to set up.

### Build with Specific Configuration

You can modify `eas.json` to customize builds:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "image": "latest",
        "buildType": "apk",  // or "aab"
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

## After Build Completes

1. **Download the build**: EAS will provide a download link
2. **Install APK**: Transfer to Android device and install
3. **Submit to Play Store**: Use the AAB file for production builds

## Useful Commands

### Check Build Status

```bash
eas build:list
```

### View Build Details

```bash
eas build:view
```

### Cancel a Build

```bash
eas build:cancel
```

## Troubleshooting

### Build Fails

1. Check build logs: `eas build:view`
2. Verify `app.json` configuration
3. Check Android package name matches: `com.ramimourani.OutOfOfficeClone`

### Missing Assets

Make sure these files exist:
- `./assets/icon.png`
- `./assets/splash-icon.png`
- `./assets/adaptive-icon.png`

### Version Issues

Update version in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1"  // Increment for new builds
  }
}
```

## Quick Start (Recommended)

For a quick test build:

```bash
# 1. Login (if not already)
eas login

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Wait for build to complete (check email or dashboard)
# 4. Download and install APK on your Android device
```

## Next Steps

After building:
1. Test the APK on your device
2. Fix any issues
3. Build production AAB when ready
4. Submit to Google Play Store

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Build Configuration](https://docs.expo.dev/build-reference/android-builds/)
- [Expo Dashboard](https://expo.dev)

