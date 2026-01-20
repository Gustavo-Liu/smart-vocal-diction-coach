@echo off
echo ========================================
echo 智能声乐正音助手 - 启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请先安装 Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 重启命令行后再次运行此脚本
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js 已安装
node --version
echo.

REM 检查 .env.local 文件
if not exist .env.local (
    echo [警告] 未找到 .env.local 文件
    echo.
    echo 正在创建 .env.local 文件...
    (
        echo # OpenAI API Key
        echo # Get your API key from https://platform.openai.com/api-keys
        echo OPENAI_API_KEY=your_api_key_here
    ) > .env.local
    echo.
    echo [重要] 请编辑 .env.local 文件，填入你的 OpenAI API Key！
    echo.
    pause
)

REM 检查 node_modules
if not exist node_modules (
    echo [信息] 正在安装依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo.
)

echo [✓] 依赖已安装
echo.
echo [信息] 启动开发服务器...
echo [信息] 浏览器将自动打开 http://localhost:3000
echo.
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev
