# Sinhala English Learner (Free-tier Demo)

A mobile-friendly English vocabulary website for Sinhala users.

## Features
- Search an English word with autocomplete (Datamuse)
- Meaning + Sinhala translation (Unicode Sinhala)
- Pronunciation (IPA + audio when available)
- Usage (3 short sentences + Sinhala) with daily limits + caching
- Word of the Day generated daily via GitHub Actions (`public/wotd.json`)

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000

## Deploy (Vercel)
1. Push to GitHub
2. Import repo in Vercel
3. Set env vars if needed (AI_API_KEY optional; TRANSLATE_ENDPOINT optional)
4. Deploy

## WOTD automation
GitHub Actions updates `public/wotd.json` daily.
You can run locally:
```bash
npm run wotd:generate
```

## Notes about free-tier safety
- Autocomplete is debounced
- Definitions are cached (server memory)
- Usage is cached (server memory)
- Usage endpoint rate-limited per IP per day (simple in-memory demo)
