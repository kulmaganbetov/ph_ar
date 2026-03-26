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
