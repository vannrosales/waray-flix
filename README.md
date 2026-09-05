# 🎬 WarayFlix `v1.0`

> **High-Precision Cinema Index & Decentralized Streaming Application**

**WarayFlix** is a high-performance, modern cinematic web application built with React 19, Vite, and Tailwind CSS. Featuring dark-mode aesthetics, zero-tracking privacy architecture, real-time P2P synchronized watch parties, and seamless multi-server fallback playback, WarayFlix delivers a distraction-free streaming and catalog discovery experience.

---

## 🚀 Live Deployment & Links

* **Live Application:** [https://waray-flix.vercel.app](https://waray-flix.vercel.app)
* **Interactive User Guide:** [https://waray-flix.vercel.app/how-it-works](https://waray-flix.vercel.app/how-it-works)
* **Compliance & Legal:** [https://waray-flix.vercel.app/legal](https://waray-flix.vercel.app/legal)
* **Recommended Browser:** Brave Browser (or Chrome/Firefox with uBlock Origin) for 100% pop-up free third-party video embeds.

---

## ✨ Features Implemented in `v1.0`

### 1. 🎥 High-Precision Streaming & Multi-Server Engine
* **Multi-Server Fallback Engine**: Instant switching between 5 streaming endpoints (CineSrc, VidSrc, Zoryva, VidCore, Videasy) with automatic fallback and latency resilience.
* **Exact Scrubber Resume**: Seamlessly records and resumes playback from the exact second you left off across all devices.
* **Always-Visible Player Controls**: High-contrast top HUD navigation that never disappears or obstructs during playback.
* **Binge Drawer & Hotkeys**: Press `N` for Next Episode, `S` for Next Server, `Space` for Play/Pause, `F` for Fullscreen.
* **Floating Picture-in-Picture (PiP) Mini-Player**: Stream in a floating corner window while navigating other catalog sections.
* **QR Phone Sync**: 1-click mobile handoff to cast or continue playback on your smartphone.

### 2. 👥 P2P Synchronized Watch Parties
* **Zero-Lag Group Streaming**: Host synchronized viewing rooms powered by WebRTC (PeerJS) and MQTT websockets.
* **Live Chat & Reactions**: Floating real-time chat drawer with emoji reactions and host control badges.
* **Host-Only Lock Mode**: Room creators can lock player controls to prevent accidental skips from guests.
* **1-Click Share & Room Codes**: Share instant 6-character room codes or direct room URLs.

### 3. 🔑 Authentication & Google Identity Services (One-Tap)
* **Google Identity Services (GIS)**: Native Google One-Tap and direct popup authentication without third-party page redirects.
* **Encrypted Token Security**: OAuth 2.0 / PKCE token exchanges powered by Supabase with Row Level Security (RLS).
* **Frictionless Guest Fallback**: Full site access, local watchlist, and search work 100% without requiring an account.

### 4. 📢 Admin Console & Live Moving Marquee Broadcast System
* **Master Admin Control Panel (`/admin`)**: Password-protected broadcast manager.
* **4 Announcement Categories**: 🔧 *Maintenance Notice*, ⚠️ *System Alert*, ✨ *New Update*, and 🔔 *General Notice*.
* **Smooth Moving Marquee Ticker**: Continuous scrolling broadcast ticker across the top of all pages with interactive hover/touch pause.
* **Real-Time Cross-Device Sync**: Broadcast updates sync live across all connected browsers, mobile devices, and incognito sessions.

### 5. 🦸 MCU & Franchise Chronological Timelines
* **Chronological Saga Roadmaps**: Explore Marvel Cinematic Universe titles in story chronological order from Mutant Genesis to Multiversal Incursions.
* **Interactive Checklist Shelf**: Check off watched movies/series with dynamic progress bars and chapter countdowns.
* **Official Doctor Doom Backdrop & Video Trailer**: Instant high-resolution mural photography with built-in official trailers.

### 6. 📖 Interactive "How It Works" Guide (`/how-it-works`)
* Visual 6-card step-by-step feature breakdown.
* Interactive FAQ accordion answering common questions regarding server switching, free access, and TMDb metadata.

### 7. 🛡️ Anti-Bot & AI Scraper Defense System
* **Strict `robots.txt` Rules**: Disallows aggressive AI scrapers (`GPTBot`, `Bytespider`, `CCBot`, `ClaudeBot`, etc.) while whitelisting verified search engines (Googlebot) and social link preview crawlers.
* **Client-Side Bot Shield (`botShield.js`)**: Headless browser environment detection (`navigator.webdriver`, Puppeteer, Playwright) with burst API throttling.
* **Invisible Honeypot Traps**: Traps and rejects automated spam bots during authentication.

### 8. ⚖️ Transparent Legal & Non-Hosting Architecture
* Modern Bento-grid compliance page (`/legal`) disclosing non-hosting indexing policies, DMCA safe harbor protocols, zero-tracking privacy, and TMDb attribution.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19.2, Vite 8.2 |
| **Styling & Design System** | Tailwind CSS 4.3, Custom Cinema Dark Theme (`#000000`, `#121212`, `#252525`, `#FFFFFF`), Montserrat Typography |
| **Icons & UI Assets** | Lucide React |
| **Database & Auth** | Supabase (PostgreSQL, GoTrue Auth, Realtime WebSockets) |
| **P2P Realtime Engine** | WebRTC (PeerJS) & MQTT |
| **API & Metadata** | The Movie Database (TMDb) API |
| **Testing Suite** | Vitest 4.1, Testing Library, jsdom (**65 / 65 Passing Tests**) |
| **Hosting & CI/CD** | Vercel Edge Network |

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: v18+ or v20+
* **npm** or **pnpm**

### 1. Clone the repository
```bash
git clone https://github.com/vannrosales/waray-flix.git
cd v-flix
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Test Suite
```bash
npm run test
```

### 6. Build for Production
```bash
npm run build
```

---

## 📄 License & Disclaimer

* **Disclaimer:** WarayFlix does not host, upload, or store any media files on its servers. All video streams are embedded from third-party decentralized providers across the web. All movie and TV metadata is powered by TMDb.
* **License:** MIT License. © 2026 WarayFlix.
