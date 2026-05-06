import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { GameRoom } from './rooms/GameRoom.js';
import type { ClientMessage } from './types.js';

const PORT = Number(process.env.PORT ?? 2567);
const rooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, GameRoom>();

const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('QuickFire Arena server is running');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});
const wss = new WebSocketServer({ server });

wss.on('connection', (socket) => {
  let playerId: string | null = null;

  socket.on('message', (raw) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(String(raw)) as ClientMessage;
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'Invalid message.' }));
      return;
    }

    if (message.type === 'createRoom') {
      const room = new GameRoom(makeRoomId());
      rooms.set(room.id, room);
      playerId = room.addClient(socket, message.name);
      if (playerId) playerRooms.set(playerId, room);
      return;
    }

    if (message.type === 'joinRoom') {
      const room = rooms.get(message.roomId.trim().toUpperCase());
      if (!room) {
        socket.send(JSON.stringify({ type: 'error', message: 'Room not found.' }));
        return;
      }
      playerId = room.addClient(socket, message.name);
      if (playerId) playerRooms.set(playerId, room);
      return;
    }

    if (!playerId) return;
    playerRooms.get(playerId)?.handle(playerId, message);
  });

  socket.on('close', () => {
    if (!playerId) return;
    const room = playerRooms.get(playerId);
    room?.removeClient(playerId);
    playerRooms.delete(playerId);
    if (room && room.size === 0) rooms.delete(room.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`QuickFire Arena server listening on port ${PORT}`);
});

function makeRoomId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  do {
    id = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms.has(id));
  return id;
}
