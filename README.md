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
   npm install @vercel/kv jose openai
   ```
2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
3. Run Vercel dev:
   ```bash
   vercel dev
   ```

## Redis env compatibility

`api/auth.js` supports multiple env formats:

1. Preferred Upstash REST:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. Vercel-style aliases:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional, used for `GET`)
3. URL formats (auto-parsed):
   - `KV_URL`
   - `REDIS_URL`

So your example credentials with `KV_REST_API_*`, `KV_URL`, `REDIS_URL` are supported directly.

## Environment variables in Vercel

In **Project Settings → Environment Variables**, add at least:

- `OPENAI_API_KEY`
- `JWT_SECRET`
- one Redis pair (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)

Optional:
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL` / `REDIS_URL`

## Vercel website deploy

1. Push this repository to GitHub.
2. Go to https://vercel.com → **Add New** → **Project**.
3. Import your GitHub repo.
4. Add env variables in Vercel UI.
5. Click **Deploy**.
6. For production updates, push to `main` (auto-deploy), or run:
   ```bash
   vercel --prod
   ```

## Security note

If any token was shared publicly (chat/screenshot/commit), rotate it in Upstash immediately and update Vercel env values.
## Vercel KV setup

1. In Vercel Dashboard, open your project.
2. Go to **Storage** tab.
3. Click **Create Database** → choose **KV**.
4. Attach KV to the project.
5. Vercel will provide `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

## Environment variables in Vercel

In **Project Settings → Environment Variables**, add:

- `OPENAI_API_KEY`
- `JWT_SECRET`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Use `.env.example` as a template.

## Production deploy

```bash
vercel --prod
```

## Notes

- All routes except `#login` and `#register` are auth-protected.
- JWT token is saved in `localStorage` and sent as `Authorization: Bearer <token>`.
- Lessons and practice are available offline via service worker cache fallback.
