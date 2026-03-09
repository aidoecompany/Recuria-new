# Recuria Deployment Checklist (Vercel + Supabase)

## 1) Connect GitHub repo to Vercel
- Import: `aidoecompany/Recuria-new`
- Production branch: `main`
- Framework: Next.js (auto-detected)

## 2) Add Vercel environment variables
Set these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ACTIVE_AI_PROVIDER`
- `ANTHROPIC_API_KEY` (if using Claude)
- `OPENAI_API_KEY` (if using OpenAI)
- `OPENAI_MODEL`
- `NEXT_PUBLIC_APP_URL` = `https://recuria-neww.vercel.app`
- `NEXT_PUBLIC_APP_NAME` = `Recuria`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_WINDOW_MS`

## 3) Configure Supabase Auth
In Supabase -> Authentication -> URL Configuration:

- Site URL: `https://recuria-neww.vercel.app`
- Redirect URLs (add all):
  - `https://recuria-neww.vercel.app`
  - `https://recuria-neww.vercel.app/login`
  - `https://recuria-neww.vercel.app/auth/login`

## 4) Trigger deployment
- Push to `main` branch
- Confirm Vercel build succeeds

## 5) Post-deploy checks
- Open `https://recuria-neww.vercel.app/login`
- Test Sign in
- Test Sign up
- Test Forgot password + OTP verification
- Confirm redirect after OTP goes to `https://recuria-neww.vercel.app`

## 6) Security notes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
- Keep service keys only in server-side env variables.
- Rotate keys immediately if accidentally exposed.
