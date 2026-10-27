# Bible Reader

[![Version](https://img.shields.io/badge/version-v0.4.4-gold.svg)](package.json)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.0-119EFF.svg)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An offline-first, modern scripture devotional application built with **React 19**, **TypeScript**, **Vite**, and **Capacitor 7**. Available both as a Progressive Web App (PWA) and a native Android application.

Bible Reader helps you engage with Scripture through structured annual reading plans, dual public domain translations, responsive reader themes, and a passage audio player with background playback and voice selection.

---

## Key Features

### 📅 Daily Reading Plan & Calendar
- **Structured Schedule**: Yearly daily readings mapped in a clear calendar interface.
- **Progress Tracking**: Track read and unread passages stored privately in `localStorage`.
- **Dynamic Scripture Card**: Daily random scripture card on the calendar screen with instant verse refresh.
- **Calendar Navigation**: Browse through days, jump to today, or switch months seamlessly.

### 📖 Immersive Reader View
- **Paper Themes**: Tailor reading to your environment with **Cream Parchment**, **Warm Sepia**, **Midnight Slate**, and **Pitch OLED** themes.
- **Typography Controls**: Adjustable font scale (`sm`, `md`, `lg`, `xl`) and serif/sans-serif font family toggles.
- **Scroll Progress Indicator**: Real-time reading progress bar pinned to the top of the passage.
- **Dual Public-Domain Translations**: Toggle between **King James Version (KJV)** and **World English Bible (WEB)** with zero latency.
- **Per-Verse Actions**: Click to highlight, copy with citation, or share via the native Android share sheet / Web Share API.

### 🔊 Enhanced Audio Player & Background Drawer
- **Text-to-Speech (TTS)**: Clean, natural audio narration synchronized with verse-by-verse scrolling and highlighting.
- **Persistent Audio Drawer**: Bottom audio player drawer accessible across the app when playback is active, offering mini-bar and expanded control sheets.
- **Voice Selection**: Choose between the system default voice or regional voice profiles with retry polling and fallbacks.
- **Playback Controls**: Variable reading speeds (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`), single verse repeat mode, and full passage looping.
- **MediaSession Integration**: Native Android notification and lock screen controls for play, pause, previous verse, and next verse.

### 📱 100% Offline & Native Android Ready
- **Offline Text Chunks**: All 66 books for both translations are bundled locally and loaded on demand through Vite dynamic chunks.
- **Native Android APK**: Built with Capacitor 7, handling native hardware back button navigation, audio focus, and native share sheets.
- **PWA Capabilities**: Installable directly on desktop and mobile browsers with custom service worker caching.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vite.dev/)
- **Native Container**: [Capacitor 7](https://capacitorjs.com/) (`@capacitor/android`, `@capacitor/core`, `@capacitor/app`, `@capacitor/share`)
- **Speech Synthesis**: [`@capacitor-community/text-to-speech`](https://github.com/capacitor-community/text-to-speech) + Web Speech API fallback
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Styling**: Stack-independent Vanilla CSS design system with CSS custom properties (`src/index.css`)

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`
- **For Android Builds**:
  - JDK 17
  - Android SDK (API 34 / Platform Tools)
  - `adb` configured in your PATH

### Installation

```bash
git clone https://github.com/adedokunyinka/bible-reader.git
cd bible-reader
npm install
```

### Development Server

Start the local Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Linting & Type Checking

```bash
# Run Oxlint
npm run lint

# Run TypeScript type check
npx tsc -b --noEmit
```

### Production Web Build

```bash
npm run build
```

The production assets will be output to the `dist/` directory.

---

## Android Development & APK Builds

The project includes build automation scripts and a `Makefile` for fast building and device installation.

### Environment Setup

Set your JDK and Android SDK paths (example):

```bash
export JAVA_HOME=/path/to/jdk-17
export ANDROID_HOME=/path/to/android_sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH
```

### Build and Install via Makefile

```bash
# Build debug APK using build-apk.sh
make build

# Install built APK to a connected Android device or emulator via adb
make install

# Clean rebuild
make build_clean
```

### Build via Script Directly

```bash
# Debug build
./build-apk.sh

# Clean and build debug APK
./build-apk.sh --clean

# Build unsigned release APK
./build-apk.sh --release
```

Generated APKs are placed in the root directory:
- `app-debug.apk` (or `bible-reader-v<VERSION>-debug.apk`)
- `app-release.apk` (for release builds)

---

## Project Structure

```text
bible-reader/
├── android/                 # Native Android project (Capacitor)
├── public/                  # Static assets, web app manifest, icons, service worker
├── scripts/                 # Version sync and utility build scripts
│   ├── build-apk.sh         # Automated APK build script
│   └── sync-version.mjs     # Synchronizes version across manifest, SW, and Android
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── About/           # About, Privacy Policy, and Credits modal
│   │   ├── AudioPlayer/     # AudioDrawer & AudioPlayerControls
│   │   ├── BottomNav/       # Passage reader bottom navigation
│   │   ├── Calendar/        # Daily reading plan & monthly calendar
│   │   ├── Logo/            # Vector application logos
│   │   ├── Navbar/          # Top navigation bar & theme toggle
│   │   ├── Progress/        # Reading plan progress breakdown
│   │   └── ReadingView/     # Main scripture reader view
│   ├── data/                # Bible texts (KJV & WEB JSON chunks) & reading plan
│   ├── hooks/               # Custom React hooks (audio, readings, theme, PWA, etc.)
│   ├── lib/                 # Utility functions (date formatting, calculation)
│   ├── types/               # TypeScript interfaces & types
│   ├── App.tsx              # Root application component & view manager
│   ├── index.css            # Stack-independent design system & tokens
│   ├── main.tsx             # Application entry point
│   └── version.ts           # App version constant
├── capacitor.config.json    # Capacitor configuration
├── package.json             # Dependencies and scripts
└── vite.config.ts           # Vite build configuration
```

---

## Privacy Policy

Bible Reader is committed to user privacy:
- **No Remote Tracking**: Does not track user activity, collect personal data, or include third-party analytics.
- **Offline Storage**: Reading progress, settings, and notes remain strictly stored on the user's local device (`localStorage`).
- **No Account Required**: Immediate access to all functionality without sign-up or telemetry.

---

## Creator & Credits

- **Creator & Developer**: **Yinka Enoch Adedokun** — [Website](https://yinkaenoch.netlify.app)
- **Scripture Texts**:
  - **King James Version (KJV)**: Public Domain
  - **World English Bible (WEB)**: Public Domain
- **Icons**: [Lucide Icons](https://lucide.dev/)

---

## License

This project is licensed under the [MIT License](LICENSE).
