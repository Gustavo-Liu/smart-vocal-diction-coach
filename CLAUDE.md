# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart Vocal Diction Coach is a Next.js application that helps classical singers learn French lyric diction. It converts French lyrics into IPA (International Phonetic Alphabet) notation using GPT-4o, then provides audio playback via Google Cloud Text-to-Speech.

## Development Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
npm start        # Start production server
```

## Environment Setup

Create `.env.local` with:
```
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
GOOGLE_TTS_VOICE_NAME=fr-FR-Neural2-A  # Optional, defaults to fr-FR-Neural2-A
```

## Architecture

### API Routes (`src/app/api/`)

- **`/api/process`** - Converts French lyrics to IPA using GPT-4o. Returns `ProcessResult` with lines containing original text and `ipa_sung` notation.
- **`/api/audio`** - Generates MP3 audio using Google Cloud TTS. Uses original French text (not IPA) for synthesis because Google TTS has limited IPA phoneme support for French.
- **`/api/search-lyrics`** - Searches for French song lyrics.

### Core Libraries (`src/lib/`)

- **`openai-gpt.ts`** - GPT-4o integration with in-memory caching (50 entries max). Handles IPA generation and JSON response parsing.
- **`google-tts.ts`** - Google TTS utilities including IPA normalization. Note: The `synthesizeMp3FromIpa` function exists here but the audio route uses its own inline implementation.
- **`prompts/french-diction.ts`** - The detailed prompt template for GPT-4o. Contains rules for classical French singing diction (elision, liaison, vowel sounds, alveolar trill R).

### Key Design Decisions

1. **IPA Display vs Audio**: The IPA shown to users uses classical singing notation (alveolar trill [r]), but Google TTS receives the original French text because its IPA phoneme support is limited.

2. **Caching Strategy**: Both GPT responses and TTS audio use in-memory caches. Audio cache key is `voiceName|originalText` (speed is applied client-side via `playbackRate`).

3. **i18n**: Bilingual support (English/Chinese) via React Context (`src/lib/i18n/`). All UI strings use the `t` object from `useLanguage()`.

### Data Flow

1. User enters French lyrics → `InputForm`
2. POST to `/api/process` → GPT-4o generates IPA → cached `ProcessResult`
3. Results displayed in `LyricsCard` with play buttons
4. Click play → POST to `/api/audio` → Google TTS generates MP3 → browser plays via `<audio>` element with `playbackRate` for speed control

### Types (`src/lib/types.ts`)

- `LyricLine`: `{ original: string, ipa_sung: string }`
- `ProcessResult`: `{ lines: LyricLine[], metadata?: {...} }`
- `ApiCallRecord`: Tracks API usage for the logs panel

## Path Aliases

Use `@/*` for imports from `src/*` (configured in tsconfig.json).
