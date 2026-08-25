# 🎬 WarayFlix

A minimalist, high-end cinematic streaming application built with React, Vite, and Tailwind CSS. Designed with an architectural split-viewport layout, dark-mode aesthetics, and smooth responsive navigation, **WarayFlix** delivers a sleek, distraction-free movie and TV series exploration experience.

---

## 📖 Documentation & Architecture

* **[HOW_IT_WORKS.md](./HOW_IT_WORKS.md)** — In-depth architectural diagrams, user flowcharts, real-time WebRTC sync, and technical breakdown.

---

## ✨ Core Feature Highlights

* **Multi-Server 4K Playback**: Instant server switcher with automatic fallback.
* **Exact Scrubber Resume**: Seamlessly resumes from the exact second you left off across devices.
* **P2P Watch Party**: Synchronized playback with friends via WebRTC & MQTT, featuring Host-Only Lock mode, live chat, and reactions.
* **Studio Hubs & Vaults**: Official hubs for Netflix, Disney+, Apple TV+, HBO Max, Prime Video, Marvel, A24, Paramount+, and Crunchyroll.
* **QR Phone Sync**: 1-tap mobile handoff to continue watching on your smartphone.
* **Floating Mini-Player (PiP)**: Stream in a corner window while browsing catalogs.
* **TV Binge Drawer & Hotkeys**: Press "N" for Next Episode, "S" to switch servers.
* **Cloud Watchlist & History**: Real-time cloud persistence powered by Supabase.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite 8
* **Styling:** Tailwind CSS 4, Custom Dark Theme (`#090A0F` / `#FAFAFA`)
* **Database & Auth:** Supabase
* **Real-Time:** WebRTC (PeerJS) & MQTT
* **Testing:** Vitest, React Testing Library, jsdom (53+ tests)
* **Deployment:** Vercel

---

## 🌐 Live Application

* **Live URL:** [https://waray-flix.vercel.app](https://waray-flix.vercel.app)
* **Recommended Browser:** Brave Browser (for ad-free streaming)

