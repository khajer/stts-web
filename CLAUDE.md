# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

No test runner is configured yet.

## Architecture

Single-page React 19 + TypeScript app built with Vite. The app is a voice assistant that connects browser speech APIs to an AI backend.

**Data flow:**
1. `useSpeechRecognition` (wraps `SpeechRecognition` / `webkitSpeechRecognition`) captures voice input and fires `onResult` with the final transcript.
2. `App.tsx` receives the transcript, appends a `user` message, calls `getAIResponse`, then appends an `assistant` message.
3. `useSpeechSynthesis` (wraps `SpeechSynthesisUtterance`) speaks the response aloud and calls back when done so `App` can return to `idle`.

**Status machine** (`RecognitionStatus` in `src/types/speech.ts`):
`idle` → `listening` → `processing` → `speaking` → `idle`

**Key extension point — `src/services/aiService.ts`:**
`getAIResponse` is currently a keyword-matching mock. Replace its body to wire in Claude, OpenAI, or any other backend. The function receives the current user message and the full `Message[]` history.

**Browser compatibility:** Speech Recognition is Chrome/Edge only (`SpeechRecognition` or `webkitSpeechRecognition`). The app guards for this and shows an error banner when unsupported.

**`historyRef` pattern in `App.tsx`:** Message state is mirrored into a `useRef` so `handleUserSpeech` (a `useCallback`) can always read the latest history without being recreated on every render.
