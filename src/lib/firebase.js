/**
 * Firebase Realtime Database integration for GatherWord.
 *
 * HOW TO SET UP:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (e.g. "gatherword")
 * 3. Add a Web App to get your config object
 * 4. Enable Realtime Database (start in test mode for local dev)
 * 5. Paste your config values into the firebaseConfig object below
 *    or set environment variables in a .env file:
 *      VITE_FIREBASE_API_KEY=...
 *      VITE_FIREBASE_AUTH_DOMAIN=...
 *      VITE_FIREBASE_DATABASE_URL=...
 *      VITE_FIREBASE_PROJECT_ID=...
 *      VITE_FIREBASE_APP_ID=...
 *
 * Database Rules (Firebase Console → Realtime Database → Rules):
 * {
 *   "rules": {
 *     "rooms": {
 *       "$roomCode": {
 *         ".read": true,
 *         ".write": true,
 *         ".indexOn": ["createdAt"]
 *       }
 *     }
 *   }
 * }
 */

import { initializeApp } from 'firebase/app'
import {
  getDatabase,
  ref,
  set,
  onValue,
  push,
  remove,
  serverTimestamp,
  onDisconnect,
  get,
} from 'firebase/database'

// Replace with your Firebase project config or use .env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'YOUR_DATABASE_URL',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
}

let app
let db

function getDB() {
  if (!db) {
    try {
      app = initializeApp(firebaseConfig)
      db = getDatabase(app)
    } catch (e) {
      // Already initialized
      db = getDatabase()
    }
  }
  return db
}

// ─── ROOM OPERATIONS ──────────────────────────────────────────────────────────

export async function createRoom(roomCode, leaderName) {
  const database = getDB()
  const roomRef = ref(database, `rooms/${roomCode}`)
  await set(roomRef, {
    code: roomCode,
    leaderName,
    createdAt: serverTimestamp(),
    currentSlide: null,
    slideIndex: -1,
    slideTotal: 0,
    members: {},
  })
}

export async function checkRoomExists(roomCode) {
  const database = getDB()
  const roomRef = ref(database, `rooms/${roomCode}`)
  const snap = await get(roomRef)
  return snap.exists()
}

export function subscribeToRoom(roomCode, callback) {
  const database = getDB()
  const roomRef = ref(database, `rooms/${roomCode}`)
  return onValue(roomRef, (snap) => {
    callback(snap.val())
  })
}

// ─── BROADCAST ────────────────────────────────────────────────────────────────

export async function broadcastSlide(roomCode, slide, index, total) {
  const database = getDB()
  const slideRef = ref(database, `rooms/${roomCode}/currentSlide`)
  await set(slideRef, {
    ...slide,
    index,
    total,
    broadcastAt: serverTimestamp(),
  })
}

export async function clearBroadcast(roomCode) {
  const database = getDB()
  const slideRef = ref(database, `rooms/${roomCode}/currentSlide`)
  await set(slideRef, null)
}

// ─── MEMBERS ──────────────────────────────────────────────────────────────────

export async function joinRoomMember(roomCode, memberId, memberName) {
  const database = getDB()
  const memberRef = ref(database, `rooms/${roomCode}/members/${memberId}`)
  await set(memberRef, {
    name: memberName,
    joinedAt: serverTimestamp(),
    online: true,
  })
  // Remove on disconnect
  onDisconnect(memberRef).remove()
}

export async function leaveRoom(roomCode, memberId) {
  const database = getDB()
  const memberRef = ref(database, `rooms/${roomCode}/members/${memberId}`)
  await remove(memberRef)
}

export async function closeRoom(roomCode) {
  const database = getDB()
  const roomRef = ref(database, `rooms/${roomCode}`)
  await remove(roomRef)
}

// ─── FALLBACK (BroadcastChannel for same-device testing) ──────────────────────

export class LocalChannel {
  constructor(roomCode) {
    this.roomCode = roomCode
    this.channel = new BroadcastChannel('gatherword_' + roomCode)
    this.storageKey = 'gw_room_' + roomCode
    this._listeners = {}
  }

  on(event, fn) {
    this._listeners[event] = fn
    this.channel.addEventListener('message', (e) => {
      if (e.data?.type === event) fn(e.data)
    })
  }

  emit(event, data) {
    const msg = { type: event, ...data }
    this.channel.postMessage(msg)
    // Persist to localStorage for cross-tab
    const store = this._readStore()
    store[event] = { ...data, _t: Date.now() }
    localStorage.setItem(this.storageKey, JSON.stringify(store))
  }

  _readStore() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
    } catch {
      return {}
    }
  }

  pollStore(event, lastSeen, cb) {
    const store = this._readStore()
    if (store[event] && store[event]._t !== lastSeen) {
      cb(store[event])
      return store[event]._t
    }
    return lastSeen
  }

  close() {
    this.channel.close()
  }

  clearStore() {
    localStorage.removeItem(this.storageKey)
  }
}
