# 八字测算App - GitHub Actions APK自动构建指南

## 快速开始

### 1. 初始化Git仓库

```powershell
cd d:\AA1232\az612

# 初始化Git（如果还没有）
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "初始提交：八字测算App"
```

### 2. 创建GitHub仓库

1. 访问 https://github.com/new
2. 创建新仓库（例如：`bazi-calculator`）
3. **不要**勾选"初始化README"和"添加.gitignore"

### 3. 推送到GitHub

```powershell
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/bazi-calculator.git

# 推送到main分支
git push -u origin main
```

### 4. 查看构建进度

- 访问仓库页面 → 点击 **Actions** 标签
- 你会看到正在运行的工作流
- 等待3-5分钟，构建完成后APK会自动上传

---

## 获取APK

构建完成后，有两种方式下载APK：

### 方式A：从Artifacts下载

1. 点击 **Actions** 标签
2. 点击最新的工作流运行
3. 在页面底部的 **Artifacts** 区域
4. 点击 `bazi-calculator-debug` 下载
5. 解压后得到 `app-debug.apk`

### 方式B：从Releases下载（仅push触发）

1. 点击仓库右侧的 **Releases**
2. 点击最新的 Release
3. 下载 `app-debug.apk` 文件

---

## 手动触发构建

如果想在任意时刻重新构建：

1. 进入 **Actions** 标签
2. 点击左侧的 **Build Android APK** 工作流
3. 点击右侧的 **Run workflow** 下拉菜单
4. 选择分支（通常选 `main`）
5. 点击 **Run workflow**

---

## 安装APK到手机

### 方法1：USB传输

1. 将APK文件复制到手机
2. 在手机上打开文件管理器
3. 点击APK文件安装
4. 如果提示"未知来源"，允许安装

### 方法2：扫码安装

1. 在GitHub Releases 页面右键APK链接
2. 复制下载链接
3. 使用二维码生成器生成二维码
4. 手机扫码下载并安装

### 方法3：ADB安装（开发者）

```bash
adb install app-debug.apk
```

---

## 工作流触发条件

工作流会在以下情况自动运行：

- ✅ **推送到main/master分支**
- ✅ **手动触发**（通过Actions页面）

---

## 自定义配置

### 修改应用名称

编辑 `capacitor.config.ts`：

```typescript
export default {
  appId: 'com.bazi.calculator',
  appName: '八字测算',  // 改这里
  webDir: 'dist',
};
```

### 构建发布版APK（需要签名）

如果需要构建正式签名版，需要：

1. 生成密钥库（本地执行一次）
2. 在GitHub Secrets中添加签名信息
3. 修改工作流文件添加签名步骤

（调试版APK无需签名即可安装测试）

---

## 常见问题

### Q: 构建失败怎么办？

1. 点击Actions中的失败步骤查看详细日志
2. 常见原因：
   - `npm ci` 失败 → 检查 `package.json` 和 `package-lock.json` 是否提交
   - `gradlew` 找不到 → 确保 `android` 目录已提交
   - Web资源找不到 → 确保 `npm run build` 生成的 `dist` 目录已提交

### Q: 如何确保所有必要文件都已提交？

确保以下文件在Git中：

```
✅ package.json
✅ package-lock.json
✅ capacitor.config.ts
✅ src/（所有源代码）
✅ android/（整个目录）
✅ .github/workflows/android-apk.yml
✅ dist/（构建输出，通常忽略，工作流会自动构建）
```

**注意**：`node_modules` 不需要提交，工作流会自动安装。

### Q: 每次都要等很久？

首次构建会下载Android SDK（约2-3分钟），后续构建会使用缓存，通常1-2分钟完成。

---

## 完整命令清单

```powershell
# 1. 进入项目目录
cd d:\AA1232\az612

# 2. 初始化Git
git init

# 3. 添加所有文件
git add .

# 4. 首次提交
git commit -m "初始提交：八字测算App + Android配置"

# 5. 添加远程仓库（替换为你的）
git remote add origin https://github.com/你的用户名/bazi-calculator.git

# 6. 推送
git push -u origin main
```

---

## 下一步

APK构建成功后，你可以：

- 在真机上测试
- 分享给朋友测试
- 配置自动发布到应用市场
- 构建发布版APK（签名）
- 添加更多功能
