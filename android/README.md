# Android Configuration for Sprytna Spiżarnia

## 📱 Folder Structure Overview

Folder `android` zawiera kompletną konfigurację dla aplikacji React Native na platformę Android.

## 🏗️ Structure Created

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/sprytna/spizarnia/
│   │   │   ├── MainActivity.java
│   │   │   ├── MainApplication.java
│   │   │   └── MessagingService.java
│   │   ├── res/
│   │   │   ├── drawable/
│   │   │   ├── mipmap-*/
│   │   │   ├── values/
│   │   │   └── xml/
│   │   └── AndroidManifest.xml
│   ├── build.gradle
│   └── proguard-rules.pro
├── gradle/wrapper/
├── build.gradle
├── gradle.properties
├── local.properties
└── settings.gradle
```

## 🔧 Configuration Details

### Package Name
- **Application ID**: `com.sprytna.spizarnia`
- **Debug Suffix**: `.debug`

### SDK Versions
- **MinSDK**: 21 (Android 5.0)
- **CompileSDK**: 34 (Android 14)
- **TargetSDK**: 34

### Permissions Configured
- ✅ Internet access
- ✅ Camera (for barcode scanning)
- ✅ Storage (for product photos)
- ✅ Location (for store locations)
- ✅ Push notifications
- ✅ Biometric authentication

### Firebase Integration
- ✅ Firebase Analytics
- ✅ Firebase Auth
- ✅ Firebase Firestore
- ✅ Firebase Storage
- ✅ Firebase Functions
- ✅ Firebase Messaging (FCM)

### Notification Channels
- **Default**: General app notifications
- **Expiry**: Product expiration alerts
- **Family**: Family sharing updates
- **Achievements**: Achievement unlocks
- **Recipes**: Recipe suggestions
- **Reports**: Weekly reports

## 🚀 Next Steps

### 1. Add App Icons
Dodaj ikony aplikacji w folderach `mipmap-*`:
- `ic_launcher.png` (108x108, 162x162, 216x216, 324x324, 432x432)
- `ic_launcher_round.png` (same sizes)

### 2. Firebase Configuration
Dodaj plik `google-services.json` do `app/` folder:
```bash
# Download from Firebase Console
# Place in: android/app/google-services.json
```

### 3. Generate Release Keystore
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 4. Update local.properties
Dodaj ścieżki do Android SDK:
```properties
sdk.dir=/path/to/android/sdk
ndk.dir=/path/to/android/ndk
```

### 5. Install Dependencies
```bash
cd ..
npm install
cd android
./gradlew clean
```

## 🎯 Features Enabled

### Core Features
- ✅ Offline mode support
- ✅ Family sharing
- ✅ Barcode scanning
- ✅ Push notifications
- ✅ Biometric authentication
- ✅ Camera integration
- ✅ Location services

### Notification System
- ✅ Multi-channel support
- ✅ Rich notifications
- ✅ Action buttons
- ✅ Firebase Cloud Messaging
- ✅ Local notifications

### Security
- ✅ Network security config
- ✅ Certificate pinning ready
- ✅ ProGuard rules
- ✅ Biometric authentication
- ✅ Secure storage

## 🔐 Security Notes

1. **Never commit keystore files** to version control
2. **Store passwords securely** in environment variables
3. **Use different passwords** for store and key
4. **Backup keystore files** safely
5. **Update local.properties** with real paths

## 📱 Build Commands

### Debug Build
```bash
cd android
./gradlew assembleDebug
```

### Release Build
```bash
cd android
./gradlew assembleRelease
```

### Install Debug
```bash
cd android
./gradlew installDebug
```

## 🛠️ Troubleshooting

### Common Issues
1. **SDK not found**: Update `local.properties`
2. **Build failed**: Check Gradle version
3. **Permissions denied**: Update AndroidManifest.xml
4. **Firebase errors**: Add google-services.json

### Dependencies
All required dependencies are configured in `build.gradle` files.

---

**Status**: ✅ Complete Android configuration ready for React Native development
**Package**: `com.sprytna.spizarnia`
**Features**: Full notification system, Firebase integration, security features
