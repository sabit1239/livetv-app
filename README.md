# 🎬 OTTStream — Live TV Streaming Platform

A production-grade OTT Live TV web app built with **Next.js 15, TypeScript, Tailwind CSS, HLS.js, Zustand**.
No Firebase. No backend. Deploy directly to Vercel — zero config needed.

## ✨ Features

- 📺 **14 Pre-loaded channels** — FIFA+, Red Bull TV, NASA TV, T Sports, beIN Sports & more
- 🎬 **HLS Video Player** — Auto quality, PiP, fullscreen, keyboard shortcuts, auto-reconnect
- 🔐 **Local Auth** — Register/Login stored in browser (localStorage via Zustand)
- ❤️ **Favorites & Watch History** — Persisted locally
- 📋 **M3U Playlist Import** — Import from any URL
- 🛡️ **Admin Panel** — Add/edit/delete channels (first registered user = admin)
- 📅 **TV Guide / EPG** — 7-day program timeline
- 🌙 **Dark Mode** — Full dark/light theme
- 📱 **PWA Ready** — Installable on Android/iOS
- 🚀 **Vercel Ready** — Deploy in one click, zero environment variables needed

## 🚀 Deploy to Vercel (3 steps)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Click **Deploy** — no env vars needed!

## 💻 Run Locally

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 👑 Admin Access

- Register an account (first account auto-becomes Admin)
- Go to `/admin` or click **Admin Panel** in the user menu

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home (Netflix-style)
│   ├── channel/[id]/         # Watch page + HLS player
│   ├── search/               # Browse & filter channels
│   ├── guide/                # TV Guide / EPG
│   ├── profile/              # User profile, favorites, history
│   ├── settings/             # Playlist import
│   ├── admin/                # Admin panel
│   └── auth/login|register/  # Auth pages
├── components/
│   ├── player/VideoPlayer    # Full HLS.js player
│   ├── channels/             # ChannelCard, ChannelRow
│   ├── home/HeroBanner       # Netflix hero
│   └── layout/               # Navbar, Footer
├── lib/
│   ├── channels-data.ts      # 14 default channels
│   ├── m3u-parser.ts         # M3U playlist parser
│   └── auth.ts               # Local auth helpers
└── store/index.ts            # Zustand global state
```

## ⌨️ Player Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` / `K` | Play/Pause |
| `M` | Toggle mute |
| `F` | Fullscreen |
| `↑ / ↓` | Volume |
| `R` | Retry stream |

## 🔧 Tech Stack

Next.js 15 · TypeScript · Tailwind CSS · HLS.js · Zustand · Framer Motion
