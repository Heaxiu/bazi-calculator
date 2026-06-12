# 八字测算App - Android APK打包指南

## 环境准备

### 1. 安装必需软件

**方式A：使用 winget（推荐）**
```powershell
# 安装 JDK 17+
winget install Oracle.JDK.17

# 安装 Android Studio（包含SDK）
winget install Google.AndroidStudio
```

**方式B：手动下载**
- JDK 17+：https://adoptium.net/
- Android Studio：https://developer.android.com/studio

### 2. 配置环境变量

安装完成后，在PowerShell中执行：

```powershell
# 设置 ANDROID_HOME（替换为你的实际路径）
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# 添加到PATH
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"
```

永久设置：
```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')
```

### 3. 安装Android SDK组件

打开Android Studio → Tools → SDK Manager，确保安装：
- Android SDK Platform 34 (或最新)
- Android SDK Build-Tools
- Android SDK Command-line Tools

或在命令行：
```powershell
sdkmanager "platforms;android-34" "build-tools;34.0.0"
```

---

## 构建APK

### 方法1：使用Gradle构建调试版APK

```powershell
# 进入项目目录
cd d:\AA1232\az612

# 重新构建Web资源
npm run build

# 同步到Android项目
npx cap sync android

# 进入Android目录
cd android

# 构建调试版APK
.\gradlew assembleDebug

# APK位置：
# android\app\build\outputs\apk\debug\app-debug.apk
```

### 方法2：使用Android Studio构建（图形界面）

1. 打开Android Studio
2. 选择 `Open an existing project`
3. 选择 `d:\AA1232\az612\android` 目录
4. 等待Gradle同步完成
5. 点击 `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
6. APK生成位置：`android\app\build\outputs\apk\debug\app-debug.apk`

### 方法3：构建发布版APK（签名）

```powershell
cd d:\AA1232\az612\android

# 生成密钥库（首次需要）
keytool -genkey -v -keystore bazi-release.keystore -alias bazi -keyalg RSA -keysize 2048 -validity 10000

# 在 android\gradle.properties 中添加：
# BAZI_RELEASE_STORE_FILE=../bazi-release.keystore
# BAZI_RELEASE_KEY_ALIAS=bazi
# BAZI_RELEASE_STORE_PASSWORD=你的密码
# BAZI_RELEASE_KEY_PASSWORD=你的密码

# 构建发布版
.\gradlew assembleRelease
```

---

## 在线构建方案（无需安装Android Studio）

如果不想安装Android Studio，可以使用以下在线服务：

### 方案A：使用 Capacitor Cloud
```powershell
# 安装 Capacitor Cloud CLI
npm install -g @capacitor/cloud

# 上传构建
cd d:\AA1232\az612
npx cap cloud build android
```

### 方案B：使用 GitHub Actions

在项目根目录创建 `.github/workflows/android.yml`：

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build web app
        run: npm run build
        
      - name: Setup Capacitor
        run: npx cap sync android
        
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
          
      - name: Build APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug
          
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: bazi-app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

推送到GitHub后，每次push会自动构建APK。

---

## 安装测试

### 在模拟器/真机测试

```powershell
# 连接设备后运行：
cd d:\AA1232\az612\android
.\gradlew installDebug

# 或直接使用adb安装
adb install app\build\outputs\apk\debug\app-debug.apk
```

### 使用Capacitor直接运行

```powershell
# 在Android模拟器中运行
npx cap run android

# 在Android Studio中打开
npx cap open android
```

---

## APK文件位置

- **调试版**：`android\app\build\outputs\apk\debug\app-debug.apk`
- **发布版**：`android\app\build\outputs\apk\release\app-release.apk`

---

## 快速检查清单

- [ ] JDK 17+ 已安装
- [ ] Android Studio 已安装
- [ ] `ANDROID_HOME` 环境变量已设置
- [ ] Android SDK Platform 34 已安装
- [ ] `npm run build` 构建成功
- [ ] `npx cap sync android` 同步成功
- [ ] `.\gradlew assembleDebug` 构建APK成功

---

## 常见问题

### Q: gradlew 找不到
确保在 `android` 目录下执行，且有执行权限：
```powershell
cd d:\AA1232\az612\android
.\gradlew assembleDebug
```

### Q: SDK未找到
检查 `ANDROID_HOME` 是否正确，或在 `android\local.properties` 中添加：
```
sdk.dir=C\:\\Users\\你的用户名\\AppData\\Local\\Android\\Sdk
```

### Q: JDK版本不兼容
Capacitor需要JDK 17+，检查版本：
```powershell
java -version
```
