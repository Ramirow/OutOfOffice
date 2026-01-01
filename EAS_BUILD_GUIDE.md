# EAS Build Guide for Android & iOS

This guide will help you build Android APK/AAB and iOS IPA files using Expo Application Services (EAS) - **completely free on the EAS free tier!**

## Prerequisites

### For Both Platforms:
1. ✅ EAS CLI installed (already done)
2. ✅ EAS account (Expo account) - **FREE**
3. ✅ Project configured with `eas.json` (already configured)

### For iOS Only:
4. ⚠️ **Apple Developer Account** - **$99/year** (required for iOS builds)
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - This is required by Apple, not EAS
   - EAS Build service itself is **FREE** on the free tier

## Cost Breakdown

| Service | Cost | Required For |
|---------|------|--------------|
| **EAS Build (Free Tier)** | **FREE** ✅ | Android & iOS builds |
| **Expo Account** | **FREE** ✅ | Using EAS services |
| **Apple Developer Account** | **$99/year** ⚠️ | iOS builds only |
| **Google Play Developer** | **$25 one-time** | Android Play Store (optional) |

**Note**: EAS Build service is completely free! The only cost for iOS is Apple's required Developer account.

## Step-by-Step Instructions

### 1. Login to EAS

```bash
eas login
```

If you don't have an Expo account, create one at [expo.dev](https://expo.dev)

### 2. Configure Your Build Profile

Your `eas.json` already has three build profiles configured for both Android and iOS:
- **development**: For development builds with Expo Go
- **preview**: For internal testing (APK for Android, IPA for iOS)
- **production**: For store submission (AAB for Android, IPA for iOS)

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

### 5. Build iOS (for iPhone/iPad)

**⚠️ Important**: You need an Apple Developer account ($99/year) before building iOS apps.

#### 5a. First-Time iOS Setup

Before your first iOS build, you need to:

1. **Sign up for Apple Developer Account**:
   - Go to [developer.apple.com](https://developer.apple.com)
   - Pay $99/year fee
   - Wait for approval (usually instant)

2. **Configure iOS in app.json**:
   ```json
   {
     "expo": {
       "ios": {
         "supportsTablet": true,
         "bundleIdentifier": "com.ramimourani.OutOfOfficeClone"
       }
     }
   }
   ```

3. **Run iOS build setup**:
   ```bash
   eas build --platform ios --profile preview
   ```
   - EAS will guide you through Apple Developer account setup
   - You'll be asked to provide your Apple ID and credentials

#### 5b. Build iOS Preview (for testing)

```bash
eas build --platform ios --profile preview
```

This will:
- Build an IPA file you can install via TestFlight or direct install
- Take about 15-25 minutes
- Require Apple Developer account credentials

#### 5c. Build iOS Production (for App Store)

```bash
eas build --platform ios --profile production
```

This will:
- Build an IPA file ready for App Store submission
- Auto-increment version code
- Ready for App Store Connect submission

### 6. Build Both Platforms

To build for both Android and iOS simultaneously:

```bash
eas build --platform all --profile production
```

**Note**: This will build both platforms but requires Apple Developer account for iOS.

## Build Options

### Build Locally (faster, requires Android SDK)

```bash
eas build --platform android --profile preview --local
```

**Note**: Requires Android SDK and can be complex to set up.

### Build with Specific Configuration

Your `eas.json` is already configured with optimizations:
- **Preview builds**: APK format (easier to install directly)
- **Production builds**: AAB format (smaller size, for Play Store)
- **Release builds**: Optimized with R8 code shrinking (automatic)

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
    },
    "production": {
      "android": {
        "buildType": "aab"  // Smaller size, recommended for Play Store
      }
    }
  }
}
```

## After Build Completes

### For Android:
1. **Download the build**: EAS will provide a download link
2. **Install APK**: Transfer to Android device and install directly
3. **Submit to Play Store**: Use the AAB file for production builds

### For iOS:
1. **Download the build**: EAS will provide a download link
2. **Install via TestFlight**: Upload to App Store Connect and distribute via TestFlight
3. **Direct Install**: For preview builds, you can install directly on registered devices
4. **Submit to App Store**: Use production build for App Store submission

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

## Optimizing APK Size & Installation Speed

### Current Optimizations (Already Enabled)

✅ **R8 Code Shrinking**: Enabled automatically in release builds  
✅ **AAB Format**: Production builds use AAB (15-20% smaller than APK)  
✅ **Release Builds**: Preview builds use release mode for optimization  

### Tips to Reduce APK Size

1. **Optimize Asset Images**:
   - Compress images in `./assets/` folder
   - Recommended sizes:
     - `icon.png`: 1024x1024 (max 500KB)
     - `splash-icon.png`: 1242x2436 (max 1MB)
     - `adaptive-icon.png`: 1024x1024 (max 500KB)
   - Use WebP format where possible (smaller file size)

2. **Remove Unused Dependencies**:
   - Check `package.json` for unused packages
   - Remove any dependencies you don't use

3. **Use AAB for Production**:
   - AAB files are automatically smaller (already configured)
   - Use APK only for preview/testing

### Expected Installation Times

| APK Size | Mid-Range Device | High-End Device |
|----------|------------------|-----------------|
| 30-50 MB | 30-60 seconds | 10-20 seconds |
| 50-100 MB | 1-2 minutes | 30-60 seconds |
| 100+ MB | 2-5 minutes | 1-2 minutes |

**Note**: Installation time also depends on device storage speed and available RAM.

### Improving Installation Speed

1. **Device Storage**:
   - Ensure at least 500MB free space
   - Clear cache if installation is slow
   - Install to internal storage (faster than SD card)

2. **Installation Method**:
   - Transfer APK via USB (faster than network)
   - Use internal storage instead of external SD card
   - Close other apps before installing

3. **Build Type**:
   - Use APK for preview/testing (easier installation)
   - Use AAB for production (smaller, requires bundletool or Play Store)

## Troubleshooting

### Build Fails

1. Check build logs: `eas build:view`
2. Verify `app.json` configuration
3. **Android**: Check package name matches: `com.ramimourani.OutOfOfficeClone`
4. **iOS**: Verify bundle identifier is set in `app.json`

### Missing Assets

Make sure these files exist:
- `./assets/icon.png`
- `./assets/splash-icon.png`
- `./assets/adaptive-icon.png` (Android)
- `./assets/favicon.png` (Web)

### Slow Installation

1. **Check APK Size**:
   - Download the APK and check file size
   - If > 100MB, optimize assets or remove unused dependencies

2. **Device Performance**:
   - Mid-range devices (like Samsung A31) take longer
   - This is normal for large React Native apps
   - Ensure device has free storage and RAM

3. **Build Optimization**:
   - Production builds (AAB) are smaller than preview builds (APK)
   - R8 code shrinking is automatically enabled
   - Check build logs for actual APK/AAB size

### iOS-Specific Issues

1. **Apple Developer Account Required**: 
   - You must have an active Apple Developer account ($99/year)
   - Verify your account at [developer.apple.com](https://developer.apple.com)

2. **Bundle Identifier Issues**:
   - Ensure `bundleIdentifier` in `app.json` matches your Apple Developer account
   - Format: `com.yourname.appname` (e.g., `com.ramimourani.OutOfOfficeClone`)

3. **Provisioning Profile Issues**:
   - EAS handles this automatically, but if issues occur, check your Apple Developer account
   - Ensure your Apple ID has proper permissions

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

### For Android (Completely Free):

```bash
# 1. Login (if not already)
eas login

# 2. Build preview APK
eas build --platform android --profile preview

# 3. Wait for build to complete (check email or dashboard)
# 4. Download and install APK on your Android device
```

### For iOS (Requires $99/year Apple Developer Account):

```bash
# 1. Login (if not already)
eas login

# 2. Ensure you have Apple Developer account ($99/year)
# 3. Build preview IPA
eas build --platform ios --profile preview

# 4. Wait for build to complete (check email or dashboard)
# 5. Download and install via TestFlight or direct install
```

## Next Steps

### After Android Build:
1. Test the APK on your device
2. Fix any issues
3. Build production AAB when ready
4. Submit to Google Play Store ($25 one-time fee for Play Store account)

### After iOS Build:
1. Test the IPA via TestFlight or direct install
2. Fix any issues
3. Build production IPA when ready
4. Submit to App Store Connect (requires Apple Developer account)

## EAS Free Tier Limits

**Good News**: EAS Build free tier is very generous:
- ✅ **Unlimited builds** (no build count limit)
- ✅ **All build profiles** (development, preview, production)
- ✅ **Both platforms** (Android and iOS)
- ✅ **No credit card required** for EAS free tier

**Only Cost**: 
- Apple Developer Account ($99/year) - **required by Apple, not EAS**
- Google Play Developer ($25 one-time) - **only if submitting to Play Store**

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Build Configuration](https://docs.expo.dev/build-reference/android-builds/)
- [iOS Build Configuration](https://docs.expo.dev/build-reference/ios-builds/)
- [EAS Free Tier Information](https://docs.expo.dev/build/billing/)
- [Apple Developer Account](https://developer.apple.com)
- [Expo Dashboard](https://expo.dev)

## Summary

✅ **EAS Build is FREE** - No cost for building Android or iOS apps  
⚠️ **Apple Developer Account** - $99/year required for iOS (Apple's requirement, not EAS)  
✅ **Unlimited builds** on EAS free tier  
✅ **Both platforms supported** on free tier  

**You can build iOS apps for free using EAS, but you need Apple's Developer account to sign and distribute them.**

