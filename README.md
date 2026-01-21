# 智能声乐正音助手 | Smart Vocal Diction Coach

法语艺术歌曲发音指导工具 | French Art Song Pronunciation Guide

## 功能特性 | Features

- 📝 输入法语歌词，自动生成歌唱用 IPA（国际音标）| Input French lyrics, auto-generate singing IPA
- 🎵 慢速语音合成，便于跟读学习 | Slow speech synthesis for practice
- 🔗 可视化连读标记 | Visual liaison markers
- 🎚️ 可调节播放速度（0.1-1.0，默认 0.3）| Adjustable playback speed (0.1-1.0, default 0.3)
- 🌐 中英文界面切换 | Chinese/English interface switching

## 技术栈 | Tech Stack

- **前端 Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **AI**: OpenAI GPT-4o (文本处理 text processing) + TTS-1-HD (语音合成 speech synthesis)
- **部署 Deployment**: Vercel (推荐 recommended)

---

## 部署指南 | Deployment Guide

### 环境要求 | Prerequisites

- Node.js 18+
- npm 或 yarn | npm or yarn
- OpenAI API Key（需要开通 GPT-4 和 TTS 权限）| OpenAI API Key (requires GPT-4 and TTS access)

### 第一步：克隆仓库 | Step 1: Clone Repository

```bash
git clone https://github.com/Gustavo-Liu/smart-vocal-diction-coach.git
cd smart-vocal-diction-coach
```

### 第二步：安装依赖 | Step 2: Install Dependencies

```bash
npm install
```

### 第三步：配置环境变量 | Step 3: Configure Environment Variables

创建 `.env.local` 文件并添加你的 OpenAI API Key：

Create a `.env.local` file and add your OpenAI API Key:

```bash
# Windows (PowerShell)
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local

# macOS / Linux
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
```

或手动创建文件，内容如下 | Or manually create the file with:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **重要提示 | Important Notes:**
- 请将 `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 替换为你的实际 API Key
- Replace `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual API Key
- 不要将 `.env.local` 文件提交到版本控制 | Do not commit `.env.local` to version control
- 获取 API Key: [OpenAI Platform](https://platform.openai.com/api-keys)

### 第四步：运行开发服务器 | Step 4: Run Development Server

```bash
npm run dev
```

打开浏览器访问 | Open browser and visit: [http://localhost:3000](http://localhost:3000)

### 第五步：生产环境部署 | Step 5: Production Deployment

#### Vercel 部署（推荐）| Vercel Deployment (Recommended)

1. 将代码推送到 GitHub | Push code to GitHub
2. 在 [Vercel](https://vercel.com) 导入项目 | Import project on Vercel
3. 在 Vercel 项目设置中添加环境变量 | Add environment variable in Vercel project settings:
   - Name: `OPENAI_API_KEY`
   - Value: 你的 API Key | Your API Key
4. 部署完成 | Deploy

#### 其他平台 | Other Platforms

确保设置环境变量 `OPENAI_API_KEY` 后运行：

Make sure to set the `OPENAI_API_KEY` environment variable, then run:

```bash
npm run build
npm start
```

---

## 项目结构 | Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── process/      # 处理歌词 → IPA | Process lyrics → IPA
│   │   └── audio/        # 生成音频 | Generate audio
│   ├── page.tsx          # 主页面 | Main page
│   └── layout.tsx        # 根布局 | Root layout
├── components/            # React 组件 | React components
├── lib/                   # 工具函数 | Utilities
│   ├── i18n/             # 国际化 | Internationalization
│   ├── prompts/          # Prompt 模板 | Prompt templates
│   ├── openai-gpt.ts     # GPT 调用 | GPT calls
│   ├── openai-tts.ts     # TTS 调用 | TTS calls
│   └── types.ts          # TypeScript 类型 | TypeScript types
└── styles/               # 全局样式 | Global styles
```

## 测试用例 | Test Case

使用 "Lydia, Fauré" 作为测试用例，点击预设按钮快速填入歌词。

Use "Lydia, Fauré" as a test case, click the preset button to quickly fill in the lyrics.

## 开发计划 | Development Plan

详见计划文件中的 MVP 开发优先级。

See MVP development priorities in the planning documents.

## License

MIT
