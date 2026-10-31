[README.md](https://github.com/user-attachments/files/34211523/README.md)
# CodePulse

Full-stack competitive programming analytics and community platform. Connect your Codeforces, LeetCode, and CodeChef handles and get one unified dashboard, a global + college-wise leaderboard, a contest tracker with Google Calendar reminders, and a small community space for interview experiences.

**Live:** https://codepulse-theta-two.vercel.app
**Backend:** https://codepulse-h1y8.onrender.com/api/health

> Backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after a period of inactivity can take 30-50 seconds to respond while it wakes up — this is expected, not a bug.

---

## Features

- **Auth** — JWT-based registration/login with role-based authorization (`user` / `admin`)
- **Multi-platform sync** — normalizes stats from Codeforces (official API), LeetCode (GraphQL), and CodeChef (scraped) into one schema. Each platform fails independently — one source being down never breaks the others.
- **Analytics dashboard** — rating history (multi-platform), difficulty breakdown, topic breakdown, submission heatmap, all built with Recharts
- **Leaderboard** — global and college-wise rankings from a MongoDB aggregation pipeline, using a composite score (solved-problem points + rating bonus) so it stays fair even for platforms without a contest rating. Auto-refreshes every 30 seconds via polling (TanStack Query) — no WebSockets
- **Redis caching** — cache-aside pattern for per-user stats and leaderboard results, with a cron job that proactively warms the global leaderboard cache
- **Contest tracker** — live upcoming contests from Codeforces + LeetCode, with one-click Google Calendar reminders via OAuth 2.0
- **Community** — post and search interview experiences, like/unlike, author or admin can delete
- **Deployed** — frontend on Vercel, backend on Render, database on MongoDB Atlas, cache on Upstash Redis

## Tech stack

**Frontend:** React (Vite), Tailwind CSS, React Router, Zustand, TanStack Query, Axios, Recharts, lucide-react
**Backend:** Node.js, Express, MongoDB + Mongoose, Redis (ioredis), JWT, node-cron, Google APIs (OAuth), Cheerio
**Infra:** Vercel, Render, MongoDB Atlas, Upstash Redis, Google Cloud Console (OAuth)

## Architecture

```
Client (React)  →  API (Express, JWT auth, service layer)
                          │
          ┌───────────────┼───────────────────┐
          │                                    │
   MongoDB Atlas                        Redis (Upstash)
   (users, stats,                    (cache-aside: profile
    posts, contests)                  stats, leaderboard)
          │
   ┌──────┴──────┬─────────────┐
Codeforces API  LeetCode        CodeChef
(official)      GraphQL         (scraped)
                                    +
                          Google Calendar (OAuth 2.0)
```

## Known limitations

Documented on purpose, not hidden — these are real, understood trade-offs, not bugs:

- **CodeChef has no public API.** Stats and rating history are scraped from the public profile page. If CodeChef changes their page structure, sync for that platform degrades gracefully (returns a clear failure status) rather than breaking the app.
- **LeetCode has no official public API either.** The app uses their internal GraphQL endpoint (the same one their own site uses), which is more stable than scraping but still unofficial and could change without notice.
- **No WebSockets, by design.** Real-time-feeling updates (leaderboard, dashboard) use polling + server-side caching instead. This is a deliberate architectural choice, not a missing feature — see the code comments in `leaderboardService.js` for the reasoning.
- **Google Calendar integration is in "Testing" mode** in Google Cloud Console (not verified/published), which means: only explicitly-added test-user Google accounts can connect their calendar, and refresh tokens expire after 7 days per Google's policy for unverified apps.
- **Render's free tier cold-starts**, as noted above.

## Local setup

### Prerequisites
Node.js 18+, a MongoDB Atlas cluster, an Upstash Redis database, a Google Cloud project with Calendar API enabled (see `server/.env.example` for what's needed).

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

### Frontend
```bash
cd client
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

## API overview

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

| Route | Method | Description |
|---|---|---|
| `/auth/register`, `/auth/login` | POST | Auth |
| `/auth/me` | GET, PATCH | Current user profile |
| `/platforms/connect` | POST | Connect/sync platform handles |
| `/platforms/me` | GET | Current user's synced stats |
| `/platforms/resync` | POST | Re-sync all connected platforms |
| `/leaderboard` | GET | Global or college-wise rankings (`?scope=`) |
| `/contests` | GET | Upcoming Codeforces + LeetCode contests |
| `/contests/google/start`, `/google/callback` | GET | Google Calendar OAuth flow |
| `/contests/add-to-calendar` | POST | Add a contest reminder to Google Calendar |
| `/community` | GET, POST | List/search posts, create a post |
| `/community/:id/like` | POST | Toggle like |
| `/community/:id` | DELETE | Delete (author or admin only) |

## License
