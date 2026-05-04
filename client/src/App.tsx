import { useMemo, useRef, useState } from 'react';
import GameCanvas from './game/GameCanvas';
import CountdownScreen from './screens/CountdownScreen';
import LobbyScreen from './screens/LobbyScreen';
import MapSelectedScreen from './screens/MapSelectedScreen';
import MapRouletteScreen from './screens/MapRouletteScreen';
import ResultScreen from './game/ResultScreen';
import { weaponList } from './game/WeaponSystem';
import type { ClientMessage, MapSelectionId, RoomSnapshot, ServerMessage, WeaponId } from './game/types';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:2567';

export default function App() {
  const socketRef = useRef<WebSocket | null>(null);
  const [name, setName] = useState(`Player${Math.floor(Math.random() * 900 + 100)}`);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponId>('ar');
  const [playerId, setPlayerId] = useState('');
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState('');
  const [scoreboardOpen, setScoreboardOpen] = useState(false);

  const connected = useMemo(() => Boolean(playerId && snapshot), [playerId, snapshot]);

  function connect(initialMessage: ClientMessage) {
    setError('');
    socketRef.current?.close();
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.addEventListener('open', () => socket.send(JSON.stringify(initialMessage)));
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as ServerMessage;
      if (message.type === 'joined') {
        setPlayerId(message.playerId);
        setRoomIdInput(message.roomId);
      }
      if (message.type === 'snapshot') setSnapshot(message.snapshot);
      if (message.type === 'error') setError(message.message);
    });
    socket.addEventListener('close', () => {
      if (!snapshot || snapshot.state !== 'result') setError('Connection closed.');
    });
  }

  function send(message: ClientMessage) {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }

  function leave() {
    socketRef.current?.close();
    socketRef.current = null;
    setPlayerId('');
    setSnapshot(null);
    setScoreboardOpen(false);
  }

  if (connected && snapshot?.state === 'lobby') {
    return (
      <LobbyScreen
        snapshot={snapshot}
        playerId={playerId}
        onSelectWeapon={(weaponId) => {
          setSelectedWeapon(weaponId);
          send({ type: 'weaponSelect', weaponId });
        }}
        onSelectMap={(mapId: MapSelectionId) => send({ type: 'mapVoteSelect', mapId })}
        onToggleReady={() => send({ type: 'readyToggle' })}
        onStart={() => send({ type: 'startGame' })}
      />
    );
  }

  if (connected && snapshot?.state === 'roulette') {
    return <MapRouletteScreen snapshot={snapshot} />;
  }

  if (connected && snapshot?.state === 'map_selected') {
    return <MapSelectedScreen snapshot={snapshot} />;
  }

  if (connected && snapshot?.state === 'countdown') {
    return <CountdownScreen snapshot={snapshot} />;
  }

  if (connected && snapshot?.state === 'playing') {
    return (
      <GameCanvas
        playerId={playerId}
        snapshot={snapshot}
        send={send}
        scoreboardOpen={scoreboardOpen}
        onScoreboard={setScoreboardOpen}
      />
    );
  }

  if (connected && snapshot?.state === 'result') {
    return <ResultScreen snapshot={snapshot} onLeave={leave} />;
  }

  return (
    <main className="screen title-screen">
      <section className="title-copy">
        <p className="eyebrow">Prototype</p>
        <h1>QuickFire Arena</h1>
        <p>ローカルの2タブで試せる、最大8人のリアルタイムFPSデスマッチ。</p>
      </section>

      <section className="panel title-panel">
        <label>
          Player Name
          <input value={name} maxLength={18} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          Room Code
          <input
            value={roomIdInput}
            maxLength={5}
            placeholder="ABCDE"
            onChange={(event) => setRoomIdInput(event.target.value.toUpperCase())}
          />
        </label>

        <div>
          <span className="label">Weapon</span>
          <div className="segmented">
            {weaponList.map((weapon) => (
              <button
                className={selectedWeapon === weapon.id ? 'active' : ''}
                key={weapon.id}
                onClick={() => setSelectedWeapon(weapon.id)}
              >
                {weapon.name}
              </button>
            ))}
          </div>
        </div>

        <div className="button-row">
          <button className="primary" onClick={() => connect({ type: 'createRoom', name, weaponId: selectedWeapon })}>
            Create Room
          </button>
          <button
            onClick={() => connect({ type: 'joinRoom', roomId: roomIdInput, name, weaponId: selectedWeapon })}
            disabled={roomIdInput.trim().length < 5}
          >
            Join Room
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </main>
  );
}
