# 快速启动指南

## ⚠️ 重要提示

您的系统上**未安装 Node.js**，需要先安装才能运行此项目。

## 快速步骤

### 1️⃣ 安装 Node.js（必需）

**Windows 用户：**
- 访问：https://nodejs.org/
- 下载 **LTS 版本**（推荐 v20.x）
- 运行安装程序，使用默认设置
- **重启命令行/终端**

**验证安装：**
```bash
node --version
npm --version
```

### 2️⃣ 配置 API Key

创建 `.env.local` 文件（在项目根目录），内容如下：

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**获取 API Key：**
- 访问：https://platform.openai.com/api-keys
- 登录并创建新的 API Key
- 复制并粘贴到 `.env.local` 文件中

### 3️⃣ 安装依赖并启动

**方式一：使用启动脚本（推荐）**
```bash
start.bat
```

**方式二：手动启动**
```bash
npm install
npm run dev
```

### 4️⃣ 访问应用

打开浏览器访问：**http://localhost:3000**

## 🧪 测试步骤

1. 点击 **"加载测试歌词 (Lydia, Fauré)"** 按钮
2. 点击 **"生成 IPA"** 按钮
3. 等待处理完成（几秒钟）
4. 点击任意行的 **"🔊 播放"** 按钮测试音频
5. 或点击 **"🎵 播放全篇"** 播放所有行

## 📝 注意事项

- 首次运行需要安装依赖（约 1-2 分钟）
- API 调用需要有效的 OpenAI API Key 和余额
- 如果端口 3000 被占用，Next.js 会自动使用下一个可用端口

## 🆘 需要帮助？

查看 `SETUP.md` 获取详细的故障排除指南。
