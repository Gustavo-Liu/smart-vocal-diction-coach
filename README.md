# 智能声乐正音助手 (Smart Vocal Diction Coach)

法语艺术歌曲发音指导工具 MVP

## 功能特性

- 📝 输入法语歌词，自动生成歌唱用 IPA（国际音标）
- 🎵 慢速语音合成，便于跟读学习
- 🔗 可视化连读标记
- 🎚️ 可调节播放速度（0.1-1.0，默认 0.3）

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **AI**: OpenAI GPT-4o (文本处理) + TTS-1-HD (语音合成)
- **部署**: Vercel (推荐)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的 OpenAI API Key:

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`:
```
OPENAI_API_KEY=your_api_key_here
```

### 3. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── process/      # 处理歌词 → IPA
│   │   └── audio/        # 生成音频
│   ├── page.tsx          # 主页面
│   └── layout.tsx        # 根布局
├── components/            # React 组件
├── lib/                   # 工具函数
│   ├── prompts/          # Prompt 模板
│   ├── openai-gpt.ts     # GPT 调用
│   ├── openai-tts.ts     # TTS 调用
│   └── types.ts          # TypeScript 类型
└── styles/               # 全局样式
```

## 测试用例

使用 "Lydia, Fauré" 作为测试用例，点击预设按钮快速填入歌词。

## 开发计划

详见计划文件中的 MVP 开发优先级。

## License

MIT
