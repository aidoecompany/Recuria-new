# Recuria — Clinical AI Assistant Platform
### powered by Aidoe

A clinic-ready AI medical assistant built with Next.js 14, Supabase, and a modular AI provider layer (Claude / OpenAI).

---

## 🗂 Project Structure

```
recuria/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # AI completion endpoint
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx          # Login page
│   │   ├── dashboard/                # Protected dashboard (add later)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Main chat interface
│   ├── components/
│   │   └── chat/
│   │       ├── ChatWindow.tsx        # Main orchestrator
│   │       ├── ChatInput.tsx         # Input bar
│   │       ├── MessageBubble.tsx     # Message + typing indicator
│   │       └── Sidebar.tsx           # Session sidebar
│   ├── lib/
│   │   ├── ai/
│   │   │   └── service.ts            # 🔑 Modular AI layer (swap providers here)
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   └── server.ts             # Server Supabase client
│   │   ├── rateLimit.ts              # In-memory rate limiter
│   │   └── useChat.ts                # Chat state hook
│   ├── middleware.ts                 # Auth middleware
│   └── types/
│       └── index.ts                  # Shared TypeScript types
├── supabase/
│   └── schema.sql                    # Full DB schema + RLS policies
├── .env.example                      # Environment variable template
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase + AI API keys
```

### 3. Set up Supabase database
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
3. Copy your project URL and anon key into `.env.local`

### 4. Run locally
```bash
npm run dev
# → http://localhost:3000
```

---

## 🗄 Database Schema

### Tables
| Table | Key Fields |
|-------|-----------|
| `users` | id, email, role (admin/doctor/staff), created_at |
| `chat_sessions` | id, user_id, title, created_at |
| `messages` | id, session_id, role (user/assistant), content, timestamp |

All tables have **Row Level Security enabled** — users can only access their own data.

---

## 🔁 Switching AI Providers

The AI layer is fully modular. To swap from Claude to OpenAI:

**In `.env.local`, change:**
```env
ACTIVE_AI_PROVIDER=openai   # was: claude
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
```

That's it. No code changes needed. The logic lives in `src/lib/ai/service.ts`.

To add a new provider (e.g., Gemini, Mistral), add a new function in `service.ts` and add a case to the switch statement.

---

## 🔐 Security Features

- ✅ Environment variables for all API keys
- ✅ Supabase Row Level Security on all tables
- ✅ Auth middleware protecting `/dashboard`, `/settings`, `/admin`
- ✅ Rate limiting: 20 requests/minute per IP (configurable via `.env`)
- ✅ Input validation with Zod schemas
- ✅ Security headers on all API routes
- ✅ Service role client only used server-side

---

## 🚀 Deploying to Vercel

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial Recuria deployment"
git remote add origin https://github.com/your-org/recuria.git
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### Step 3: Add environment variables
In Vercel dashboard → Settings → Environment Variables, add all variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ACTIVE_AI_PROVIDER
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL          ← set to your Vercel URL
```

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy automatically.

### Step 5: Update Supabase auth settings
In Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 🏥 Production Readiness Notes

### For clinic deployment:

1. **Rate limiting** — Replace in-memory rate limiter with Redis/Upstash for multi-instance deployments
2. **Audit logging** — Add a separate `audit_logs` table to track who accessed what and when
3. **HIPAA** — Ensure Supabase is configured in a HIPAA-eligible region; consider a Business Associate Agreement (BAA)
4. **Auth hardening** — Enable MFA in Supabase for all clinical staff accounts
5. **Data retention** — Implement message/session expiry policies per your compliance requirements
6. **Error monitoring** — Add Sentry or similar for production error tracking
7. **Load testing** — Test AI provider rate limits before go-live

### Scaling:
- Next.js on Vercel auto-scales
- Supabase connection pooling enabled by default
- For >1000 concurrent users, use Supabase's PgBouncer mode

---

## 📄 Medical Disclaimer

> Recuria is an AI assistant and does not replace professional medical judgment.

This disclaimer appears in the app footer and should be visible to all users at all times per best practices for medical AI tools.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| AI (default) | Anthropic Claude |
| AI (swap) | OpenAI GPT-4o |
| Deployment | Vercel |
