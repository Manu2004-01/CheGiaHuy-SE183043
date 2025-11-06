# Hướng dẫn Build APK với Expo

## Phương pháp 1: EAS Build (Khuyến nghị - Dễ nhất)

### Bước 1: Cài đặt EAS CLI
```bash
npm install -g eas-cli
```

### Bước 2: Đăng nhập vào Expo
```bash
eas login
```
(Nếu chưa có tài khoản, tạo tại: https://expo.dev)

### Bước 3: Khởi tạo cấu hình EAS
```bash
eas build:configure
```
Lệnh này sẽ tạo file `eas.json` với các profile build.

### Bước 4: Build APK
```bash
# Build APK (preview profile - không cần keystore)
eas build --platform android --profile preview

# Hoặc build AAB để upload lên Play Store
eas build --platform android --profile production
```

### Bước 5: Tải APK
Sau khi build xong, bạn sẽ nhận được link để tải APK về máy.

---

## Phương pháp 2: Build Local (Không cần EAS)

### Bước 1: Cài đặt expo-dev-client
```bash
npx expo install expo-dev-client
```

### Bước 2: Generate native code
```bash
npx expo prebuild
```

### Bước 3: Build APK với Gradle
```bash
# Di chuyển vào thư mục android
cd android

# Build APK debug
./gradlew assembleDebug

# Hoặc build APK release (cần cấu hình keystore)
./gradlew assembleRelease
```

APK sẽ được tạo tại: `android/app/build/outputs/apk/debug/app-debug.apk`

### Lưu ý:
- Cần cài đặt Android Studio và Android SDK
- Cần JDK 17 hoặc mới hơn
- Cần cấu hình ANDROID_HOME environment variable

---

## Phương pháp 3: Build trực tiếp với Expo CLI (Limited)

Với Expo SDK 54, bạn có thể thử:
```bash
npx expo export --platform android
```

Tuy nhiên, phương pháp này chỉ tạo JavaScript bundle, không tạo APK hoàn chỉnh.

---

## Cấu hình bổ sung trong app.json

Để build APK, bạn nên cập nhật `app.json` với thông tin đầy đủ:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.superheroapp",
      "versionCode": 1,
      "permissions": []
    }
  }
}
```

---

## Troubleshooting

### Lỗi: "EAS CLI not found"
- Chạy: `npm install -g eas-cli`

### Lỗi: "Android SDK not found"
- Cài Android Studio
- Cấu hình ANDROID_HOME trong environment variables

### Lỗi: "Keystore required"
- Với preview profile, không cần keystore
- Với production profile, EAS sẽ tự tạo keystore hoặc bạn có thể upload keystore của riêng mình

