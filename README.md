# PhysicsAR — Физика Зертханасы

Kazakh-language PWA for high school physics with theory lessons, lab simulations, AR overlay mode, quizzes, and AI assistant.

## Project structure

```
physics-ar/
├── index.html
├── manifest.json
├── sw.js
├── package.json
└── api/
    ├── auth.js
    └── chat.js
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
3. Run locally:
   ```bash
   npm run dev
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

## Environment variables in Vercel

In **Project Settings → Environment Variables**, add at least:

- `OPENAI_API_KEY`
- `JWT_SECRET`
- one Redis pair (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`)

Optional:
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL` / `REDIS_URL`

## Deploy on Vercel (when project type = Other)

If you selected **Other** in Vercel, this repo is now compatible out-of-the-box:

1. Import repo in Vercel.
2. Framework preset: **Other**.
3. Root Directory: repository root.
4. Build Command: leave empty (or `npm run build`).
5. Output Directory: leave empty.
6. Add env variables.
7. Deploy.

Why this works:
- `index.html` is static entry point.
- `api/*.js` are Vercel serverless functions.
- `package.json` provides dependencies + Node runtime metadata.

## Merge conflict tips

If you see merge conflicts:

1. `git fetch origin`
2. `git rebase origin/main` (or `git merge origin/main`)
3. Resolve conflict markers in files (`<<<<<<<`, `=======`, `>>>>>>>`).
4. Re-run checks:
   ```bash
   node --check api/auth.js
   node --check api/chat.js
   ```
5. Commit resolved files.

## Security note

If any token was shared publicly (chat/screenshot/commit), rotate it in Upstash immediately and update Vercel env values.

## Notes

- All routes except `#login` and `#register` are auth-protected.
- JWT token is saved in `localStorage` and sent as `Authorization: Bearer <token>`.
- Lessons and practice are available offline via service worker cache fallback.
