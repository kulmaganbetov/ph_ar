# PhysicsAR — Физика Зертханасы

Kazakh-language PWA for high school physics with theory lessons, lab simulations, AR overlay mode, quizzes, and AI assistant.

## Project structure

```
physics-ar/
├── index.html
├── manifest.json
├── sw.js
└── api/
    ├── auth.js
    └── chat.js
```

## Local setup

1. Install dependencies:
   ```bash
   npm install jose openai
   ```
2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
3. Run Vercel dev:
   ```bash
   vercel dev
   ```

## Upstash Redis setup (instead of Vercel KV)

1. Open https://console.upstash.com and create a **Redis** database.
2. Choose a region close to your Vercel deployment.
3. Open the database and copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Environment variables in Vercel

In **Project Settings → Environment Variables**, add:

- `OPENAI_API_KEY`
- `JWT_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

> Backward compatibility: `api/auth.js` also accepts `KV_REST_API_URL` and `KV_REST_API_TOKEN` as fallback names.

## Vercel website deploy

1. Push this repository to GitHub.
2. Go to https://vercel.com → **Add New** → **Project**.
3. Import your GitHub repo.
4. Add all environment variables above in the Vercel UI.
5. Click **Deploy**.
6. For production updates, push to `main` (auto-deploy), or run:
   ```bash
   vercel --prod
   ```

## Notes

- All routes except `#login` and `#register` are auth-protected.
- JWT token is saved in `localStorage` and sent as `Authorization: Bearer <token>`.
- Lessons and practice are available offline via service worker cache fallback.
