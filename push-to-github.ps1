# 一键推送到GitHub并触发APK构建

# 使用说明：
# 1. 先在GitHub创建空仓库
# 2. 复制仓库地址
# 3. 运行此脚本

$REPO_URL = Read-Host "请输入GitHub仓库地址（例如：https://github.com/你的用户名/bazi-calculator.git）"

Write-Host "`n=== 初始化Git仓库 ===" -ForegroundColor Cyan
git init
git add .
git commit -m "初始提交：八字测算App + GitHub Actions APK构建"
git branch -M main

Write-Host "`n=== 添加远程仓库 ===" -ForegroundColor Cyan
git remote add origin $REPO_URL

Write-Host "`n=== 推送到GitHub ===" -ForegroundColor Cyan
git push -u origin main

Write-Host "`n✅ 推送完成！" -ForegroundColor Green
Write-Host "`n📱 APK构建已自动触发" -ForegroundColor Yellow
Write-Host "请访问以下地址查看构建进度：" -ForegroundColor Yellow
Write-Host "$REPO_URL/actions" -ForegroundColor Yellow
Write-Host "`n等待3-5分钟后，APK将在Artifacts中可供下载。" -ForegroundColor Yellow
