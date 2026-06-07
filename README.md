# 🎥 Velora Meet — Real-Time Video Conferencing Platform

A production-grade Zoom/Tencent-RTC-inspired video calling platform built with WebRTC, Socket.io, React, and Node.js.

---

## 📁 Project Structure

```
velora-meet/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx      # Marketing homepage
│   │   │   ├── Login.jsx        # Animated auth
│   │   │   ├── Register.jsx     # Sign up with strength meter
│   │   │   ├── Dashboard.jsx    # Create / join rooms
│   │   │   └── Room.jsx         # Full video call experience
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Sticky animated nav
│   │   │   ├── Footer.jsx       # SaaS-style footer
│   │   │   └── VideoTile.jsx    # Individual video stream card
│   │   ├── hooks/
│   │   │   └── useWebRTC.js     # Full WebRTC peer connection logic
│   │   ├── services/
│   │   │   ├── api.js           # REST API client
│   │   │   └── socket.js        # Socket.io singleton
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # JWT auth state
│   │   └── styles/
│   │       └── index.css        # Global CSS + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Node.js + Express backend
│   ├── routes/
│   │   ├── auth.js              # /api/auth/*
│   │   └── rooms.js             # /api/rooms/*
│   ├── controllers/
│   │   ├── authController.js    # Register, login, me
│   │   └── roomController.js    # Create, get, list rooms
│   ├── socket/
│   │   └── socketHandler.js     # All Socket.io events + signaling
│   ├── config/
│   │   ├── store.js             # In-memory data store
│   │   └── authMiddleware.js    # JWT verification
│   ├── index.js                 # Server entry point
│   └── package.json
│
├── README.md
└── .env.example
```

---

## 🧠 Architecture Overview

### WebRTC Signaling Flow

```
Peer A                    Server (Socket.io)              Peer B
  │                              │                           │
  │──── join-room ──────────────>│                           │
  │                              │<────── join-room ─────────│
  │                              │                           │
  │<─── existing-participants ───│                           │
  │<─────────────────────────────│──── user-joined ─────────>│
  │                              │                           │
  │────── webrtc-offer ─────────>│──── webrtc-offer ────────>│
  │                              │                           │
  │<─── webrtc-answer ───────────│<─── webrtc-answer ────────│
  │                              │                           │
  │──── ice-candidate ──────────>│──── ice-candidate ───────>│
  │<─── ice-candidate ───────────│<─── ice-candidate ────────│
  │                              │                           │
  │◄════════ Direct P2P WebRTC Stream ════════════════════════│
```

### How WebRTC Peer Connection Works

1. **Offer/Answer Model**: When User A joins a room with User B already in it:
   - A creates a `RTCPeerConnection`
   - A calls `createOffer()` → SDP offer describing A's codecs/capabilities
   - A sends offer via Socket.io to B (server just relays)
   - B calls `createAnswer()` → SDP answer
   - B sends answer back via Socket.io
   - Both set local/remote descriptions

2. **ICE Candidates**: Browser discovers network paths (local IP, STUN, TURN)
   - Each discovered candidate is sent to the remote peer via Socket.io
   - Peer adds candidate via `addIceCandidate()`
   - Browser selects the best path (usually direct P2P)

3. **Media Streams**: Once ICE completes, media flows directly P2P
   - `pc.addTrack()` adds local camera/mic tracks before offer
   - `pc.ontrack` fires on remote side when stream arrives

### Socket Room System

```
Socket.io Room = isolated broadcast channel keyed by roomId

join-room     → socket.join(roomId) + notify peers
send-message  → io.to(roomId).emit → all users in room
leave-room    → socket.leave(roomId) + cleanup
webrtc-*      → targeted to specific socketId (relaying)
```

---

## 🚀 Local Setup (VS Code)

### Prerequisites
- Node.js v18+ installed
- VS Code with ESLint extension (recommended)
- A modern browser (Chrome/Firefox recommended for WebRTC)

### Step 1 — Clone & open in VS Code

```bash
# Open the velora-meet folder in VS Code
code velora-meet
```

### Step 2 — Set up the Server

```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the server (development)
npm run dev
```

Server starts on **http://localhost:5000**

Verify it's running:
```bash
curl http://localhost:5000/api/health
# → {"status":"ok","message":"Velora Meet server is running 🚀"}
```

### Step 3 — Set up the Client

Open a new terminal in VS Code (`Ctrl+Shift+``):

```bash
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the frontend
npm run dev
```

Frontend starts on **http://localhost:5173**

### Step 4 — Open in Browser

1. Go to `http://localhost:5173`
2. Register a new account
3. Click **Create Room**
4. Copy the room link
5. Open another tab (or use a different browser/incognito) and join with the same link

---

## 🌐 Deployment Guide (FREE)

### Frontend → Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) → New Project → Import repo

3. Set **Root Directory** to `client`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```

5. Deploy — Vercel auto-detects Vite

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service

2. Connect your GitHub repo

3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. Add Environment Variables:
   ```
   PORT=5000
   JWT_SECRET=your_super_secret_here_make_it_long
   CLIENT_URL=https://your-frontend.vercel.app
   ```

5. Deploy → copy the Render URL → paste into Vercel's `VITE_API_URL`

### ⚠️ Important: WebRTC on Production

For production, you need a **TURN server** for users behind strict firewalls.
Free options:

```javascript
// Add to ICE_SERVERS in useWebRTC.js
{
  urls: 'turn:openrelay.metered.ca:80',
  username: 'openrelayproject',
  credential: 'openrelayproject',
}
```

Or use [Xirsys](https://xirsys.com) (free tier) for managed TURN.

---

## 🔌 API Reference

### Auth Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Create account |
| POST | `/api/auth/login` | `{email, password}` | Login |
| GET | `/api/auth/me` | — (Bearer token) | Get current user |

### Room Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/rooms` | ✅ | Create room |
| GET | `/api/rooms` | ✅ | List all rooms |
| GET | `/api/rooms/:roomId` | ✅ | Get room info |

### Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join-room` | Client → Server | `{roomId, userId, userName}` |
| `user-joined` | Server → Client | `{socketId, userName, participants}` |
| `user-left` | Server → Client | `{socketId, userName}` |
| `existing-participants` | Server → Client | `{participants}` |
| `send-message` | Client → Server | `{roomId, message, userName, userId}` |
| `chat-message` | Server → Client | `{id, text, userName, system, timestamp}` |
| `webrtc-offer` | Client ↔ Server | `{offer, targetSocketId, fromSocketId}` |
| `webrtc-answer` | Client ↔ Server | `{answer, targetSocketId, fromSocketId}` |
| `webrtc-ice-candidate` | Client ↔ Server | `{candidate, targetSocketId, fromSocketId}` |
| `media-state-change` | Client → Server | `{roomId, audioEnabled, videoEnabled}` |
| `leave-room` | Client → Server | `{roomId}` |

---

## 🔧 Extending to MongoDB

Replace `server/config/store.js` with:

```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: String,
});

const RoomSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  host: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Room: mongoose.model('Room', RoomSchema),
};
```

Update controllers to use `User.findOne()`, `User.create()`, etc.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| `--gold` | `#C9A84C` |
| `obsidian` | `#080808` |
| `void` | `#0D0D0D` |
| `surface` | `#121212` |
| `elevated` | `#1A1A1A` |
| Font Display | Playfair Display |
| Font Body | DM Sans |
| Font Mono | JetBrains Mono |

---

## 🛡️ Security Notes

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (10 rounds)
- CORS configured to allow only your frontend origin
- In production: use HTTPS (Vercel + Render provide SSL automatically)
- WebRTC streams are encrypted by default (DTLS-SRTP)

---

Built by Vansh — powered by WebRTC 🚀
#   v e l o r a - m e e t  
 