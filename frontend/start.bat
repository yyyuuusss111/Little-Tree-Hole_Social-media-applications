@echo off
echo 正在启动 Natural Idyllic Vue3 前端项目...
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络连接或Node.js版本
        pause
        exit /b 1
    )
)

echo 启动开发服务器...
npm run dev

pause
