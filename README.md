# QuickFire Arena

React, TypeScript, React Three Fiber, and a WebSocket server prototype for a browser-based 3D FPS deathmatch.

Public deployment:

- Client: https://quick-fire-arena-client.vercel.app
- WebSocket server: wss://quickfire-arena.onrender.com

## Requirements

- Node.js 24 or newer
- npm

## Setup

```bash
npm install
npm run dev
```

Local development client: http://localhost:5173/

Local development server: ws://localhost:2567

Production uses the Vercel client and the Render WebSocket server through `VITE_WS_URL=wss://quickfire-arena.onrender.com`.

Create or join a room with a room code, then choose your weapon and map vote in the lobby. The title screen only handles player name and room entry; weapon selection happens in the lobby before readying up.

## Checks

```bash
npm run typecheck
npm run build
```
