@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 全能文件保存 - 一键发布到 GitHub

echo ============================================================
echo   全能文件保存 · 一键自动化发布
echo   步骤：拉取远端 → 混淆源码 → 提交 → 推送 GitHub
echo ============================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org
    pause
    exit /b 1
)
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Git，请先安装：https://git-scm.com
    pause
    exit /b 1
)

echo.
echo [1/5] 拉取远端最新版本...
git pull --rebase --autostash origin main
if %errorlevel% neq 0 (
    echo.
    echo ============================================================
    echo [错误] 拉取失败！
    echo 原因：远端存在本地没有的提交，或存在冲突。
    echo 处理：
    echo   1. 运行 git status 查看冲突文件
    echo   2. 手动解决冲突后：git add . 并 git rebase --continue
    echo   3. 重新运行本脚本
    echo ============================================================
    pause
    exit /b 1
)

echo.
echo [2/5] 运行混淆工具（源码 → 混淆发布版）...
node _混淆工具.js
if %errorlevel% neq 0 (
    echo.
    echo ============================================================
    echo [错误] 混淆工具执行失败！请检查 _混淆工具.js 是否有语法错误。
    echo ============================================================
    pause
    exit /b 1
)

echo.
echo [3/5] 暂存所有改动...
git add .
echo --- 本次改动文件 ---
git status --short
echo ---------------------

git diff --cached --quiet
if %errorlevel% equ 0 (
    echo.
    echo [提示] 没有需要提交的改动。
    echo   如果刚修改过源码，请确认：
    echo   - 修改的是 _原始未混淆版\ 目录下的文件？
    echo   - 混淆工具是否已重新生成发布版？
    echo ============================================================
    echo   无需上传，脚本结束。
    pause
    exit /b 0
)

echo.
echo [4/5] 提交改动...
git commit -m "auto update: %date% %time%"
if %errorlevel% neq 0 (
    echo [错误] 提交失败！
    pause
    exit /b 1
)

echo.
echo [5/5] 推送至 GitHub...
git push origin main
if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   发布成功！
    echo   等待 1-2 分钟后刷新 GitHub Pages 页面即可看到更新。
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo [错误] 推送失败！可能原因：
    echo   1. 远端有新提交被拒绝 → 重新运行本脚本自动拉取合并
    echo   2. 网络问题（超时/代理）→ 检查网络后重试
    echo   3. 认证失败 → 检查 Git 凭据（凭据管理器）
    echo   4. GitHub 拦截内容 → 检查代码中是否含敏感信息
    echo ============================================================
)

pause
