# QuickFire Arena

React, TypeScript, React Three Fiber, and a WebSocket server prototype for a browser-based 3D FPS deathmatch.

Public deployment:

- Client: https://quick-fire-arena-client-c57svtq1k-kasukuzus-projects.vercel.app/
- WebSocket server: https://quickfire-arena.onrender.com

## Requirements

- Node.js 24 or newer
- npm

## Setup

```bash
npm install
npm run dev
```

Client: http://localhost:5173/

Server: ws://localhost:2567

Create or join a room with a room code, then choose your weapon and map vote in the lobby. The title screen only handles player name and room entry; weapon selection happens in the lobby before readying up.

## Checks

```bash
npm run typecheck
npm run build
```
