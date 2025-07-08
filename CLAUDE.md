# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered quiz application built with Astro and Solid.js that uses Google's Gemini API to generate dynamic quiz questions and evaluate answers semantically.

## Key Commands

### Development
```bash
pnpm run dev        # Start dev server on http://localhost:4321
pnpm run build      # Build for production
pnpm run preview    # Preview production build
```

### Testing
```bash
pnpm test          # Run E2E tests
pnpm test:ui       # Run tests with UI mode
```

## Architecture Overview

### Component Flow
1. **QuizApp.jsx** - Main orchestrator managing application state and flow between screens
2. **ThemeInput.jsx** → **QuizDisplay.jsx** → **ResultDisplay.jsx** - Sequential UI flow
3. **geminiService.js** - Handles all Gemini API interactions (quiz generation & answer validation)

### Key Technical Decisions
- **Astro + Solid.js**: Astro for static generation with Solid.js islands for reactive components
- **State Management**: Simple reactive state in QuizApp component using Solid.js signals
- **AI Integration**: Uses Gemini 2.0 Flash model with structured JSON responses for reliable parsing
- **Testing**: Playwright E2E tests with API mocking to ensure consistent test results

### API Integration Pattern
The Gemini service uses structured prompts to ensure consistent JSON responses:
- Quiz generation returns: `{ question, correctAnswer, explanation }`
- Answer validation returns: `{ isCorrect, feedback }`

### Environment Setup
Requires `PUBLIC_GEMINI_API_KEY` in `.env` file. Get key from https://aistudio.google.com/apikey

### Testing Approach
E2E tests mock the Gemini API responses to ensure deterministic testing without consuming API quota.