# ✦ GatherWord — Church Small Group Sync PWA

Real-time Bible verse & discussion question sync for church small groups.
**No accounts. No app store. No friction.** Just a 4-digit code.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Zero friction join** | QR code scan or 4-digit room code — members are live in seconds |
| **Dual-view architecture** | Leader Control Panel + distraction-free Member View |
| **Real-time sync** | Firebase Realtime Database (or BroadcastChannel for local testing) |
| **PWA installable** | Works offline, add-to-home-screen on iOS & Android |
| **Screen Wake Lock** | Members' screens stay on automatically |
| **Dim-room optimized** | Dark UI, serif typography, slow fade transitions |
| **No accounts** | Anonymous sessions — members get a random name |
| **Auto-expire rooms** | Rooms are cleaned up when the leader ends the session |

---

## 🚀 Quick Start (Local / Demo Mode)

Works **without Firebase** using the browser's BroadcastChannel API. Open two tabs — one as Leader, one as Member on the same device.

```bash
npm install
npm run dev
```

Open http://localhost:5173 in two tabs:
- Tab 1 → "I'm the Leader" → note the 4-digit code
- Tab 2 → "I'm a Member" → enter the code → Join

---

## 🔥 Firebase Setup (Full Multi-Device Sync)

### 1. Create a Firebase Project

1. Visit https://console.firebase.google.com
2. Click **Add project** → name it (e.g. "gatherword")
3. Disable Google Analytics (optional)

### 2. Enable Realtime Database

1. In the left sidebar: **Build → Realtime Database**
2. Click **Create Database**
3. Choose your region (closest to your group)
4. Start in **test mode** (you'll add proper rules later)

### 3. Get Your Config

1. Project Settings (gear icon) → **Your apps** → **Add app** → Web (`</>`)
2. Register app name (e.g. "GatherWord Web")
3. Copy the `firebaseConfig` object values

### 4. Set Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in your Firebase values
```

### 5. Set Database Rules

In Firebase Console → Realtime Database → Rules, paste:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt"]
      }
    }
  }
}
```

> ⚠️ For production, add authentication or at minimum rate limiting rules.

### 6. Run

```bash
npm run dev
```

Now open the app on multiple devices on the same network (or deploy it).

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── HomeScreen.jsx      # Landing with Leader/Member choice
│   ├── LeaderScreen.jsx    # Control panel (slide library, preview, broadcast)
│   ├── MemberScreen.jsx    # Full-screen member view (dim-room optimized)
│   ├── SlideCard.jsx       # Slide thumbnail in the library
│   ├── SlideRenderer.jsx   # Renders verse/question/title for preview & member
│   └── QRModal.jsx         # QR code + room code invite modal
├── hooks/
│   ├── useRealtimeRoom.js  # Firebase + LocalChannel sync logic
│   └── useWakeLock.js      # Screen Wake Lock API with visibility re-acquire
├── lib/
│   └── firebase.js         # Firebase RTDB operations + LocalChannel fallback
├── App.jsx                 # Root: routing + orchestration
├── main.jsx                # Entry point + SW registration
└── index.css               # Global styles + Tailwind + Google Fonts
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline caching
└── icon.svg                # App icon
```

### Real-time Sync Flow

```
Leader creates room → Firebase RTDB node: /rooms/{code}
Member scans QR / enters code → Joins /rooms/{code}/members/{memberId}
Leader clicks "Push to Group" → Writes to /rooms/{code}/currentSlide
All members → onValue() listener fires → AnimatePresence fade transition
Member leaves → onDisconnect() removes member entry automatically
Leader ends → Deletes entire /rooms/{code} node
```

---

## 📱 PWA Installation

### On iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**

### On Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **three-dot menu** (⋮)
3. Tap **"Add to Home Screen"** or **"Install app"**

---

## 🎨 Design System

- **Fonts**: EB Garamond (serif, for Scripture) + DM Sans (UI)
- **Color palette**: Deep navy (#080A12) with warm gold (#C9A84C) accents
- **Member view**: Extra-dark background optimized for dim living rooms
- **Transitions**: Framer Motion fade-in-up (650ms ease) between slides
- **Typography scale**: `clamp()` responsive sizing for verse text

---

## 📦 Build for Production

```bash
npm run build
# Output: dist/ folder — deploy to Vercel, Netlify, or Firebase Hosting
```

### Deploy to Vercel (recommended)
```bash
npx vercel --prod
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 🔐 Security Notes

For a church production deployment, consider:

1. **Rate limiting** room creation (1 per IP per minute)
2. **Room expiry** — add a Firebase Cloud Function to delete rooms older than 4 hours
3. **Room code collision** — the 4-digit space (9000 codes) is sufficient for typical usage; for large orgs use 6 digits
4. **Database rules** — restrict write access once you understand your usage pattern

---

## 📖 Slide Types

| Type | Icon | Use For |
|---|---|---|
| **Scripture** | Gold badge | Bible verses with reference |
| **Discussion** | Blue badge | Small group discussion prompts |
| **Title** | Purple badge | Session titles, announcements |

---

## 🤝 Contributing

Built with React 18, Vite, Tailwind CSS, Firebase RTDB, Framer Motion, and react-hot-toast.

MIT License. Built for the church. ✦
