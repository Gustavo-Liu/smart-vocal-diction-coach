# 项目启动指南

## 前置要求

1. **安装 Node.js**
   - 访问 https://nodejs.org/
   - 下载并安装 LTS 版本（推荐 v20.x 或更高版本）
   - 安装完成后，重启终端/命令行

2. **获取 OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 登录并创建新的 API Key
   - 复制 API Key（格式类似：sk-...）

## 安装步骤

### 1. 验证 Node.js 安装

打开终端/命令行，运行：

```bash
node --version
npm --version
```

应该显示版本号（例如：v20.x.x 和 10.x.x）

### 2. 安装项目依赖

在项目根目录运行：

```bash
npm install
```

这将安装所有必需的依赖包（可能需要几分钟）

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

**Windows (PowerShell):**
```powershell
Copy-Item .env.local.example .env.local
```

**Windows (CMD):**
```cmd
copy .env.local.example .env.local
```

**Mac/Linux:**
```bash
cp .env.local.example .env.local
```

然后编辑 `.env.local` 文件，将 `your_api_key_here` 替换为你的实际 OpenAI API Key：

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器启动后，打开浏览器访问：**http://localhost:3000**

## 测试功能

1. **加载测试歌词**
   - 点击"加载测试歌词 (Lydia, Fauré)"按钮
   - 歌词会自动填入文本框

2. **生成 IPA**
   - 选择 R 音风格（默认：Uvular）
   - 点击"生成 IPA"按钮
   - 等待处理完成（可能需要几秒钟）

3. **播放音频**
   - 点击单行的"🔊 播放"按钮播放该行
   - 或点击"🎵 播放全篇"播放所有行
   - 使用速度滑块调整播放速度（0.1-1.0）

4. **查看结果**
   - 每行显示：原文、IPA（歌唱）、IPA（口语）
   - 连读说明会显示在 notes 部分

## 故障排除

### 问题：npm 命令未找到
**解决**：需要安装 Node.js（见前置要求）

### 问题：API 调用失败
**解决**：
- 检查 `.env.local` 文件是否存在且包含正确的 API Key
- 确认 API Key 有效且有足够的余额
- 检查网络连接

### 问题：端口 3000 已被占用
**解决**：
- 关闭占用 3000 端口的程序
- 或修改 `package.json` 中的 dev 脚本为：`"dev": "next dev -p 3001"`

### 问题：依赖安装失败
**解决**：
- 清除缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json`，重新运行 `npm install`

## 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行代码检查
