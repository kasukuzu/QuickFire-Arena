import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { useCallback, useEffect, useRef, useState } from 'react';
import GameAudio from './audio/GameAudio';
import BulletTracer, { type BulletTracerItem } from './BulletTracer';
import DamageNumbers from './effects/DamageNumbers';
import HealthPickups from './HealthPickups';
import HUD from './HUD';
import ImpactEffect, { type ImpactEffectItem } from './ImpactEffect';
import PlayerAvatar from './PlayerAvatar';
import PlayerController from './PlayerController';
import RemoteBulletTracers from './effects/RemoteBulletTracers';
import RemoteMuzzleFlashes from './effects/RemoteMuzzleFlashes';
import WeaponModel from './WeaponModel';
import PauseMenu from './ui/PauseMenu';
import VRSessionBridge, { type VRDebugState } from './VRSessionBridge';
import VRADSOverlay from './VRADSOverlay';
import VRHud from './VRHud';
import GameMap from './maps/GameMap';
import type { ClientMessage, RoomSnapshot } from './types';

type Props = {
  playerId: string;
  snapshot: RoomSnapshot;
  send: (message: ClientMessage) => void;
  scoreboardOpen: boolean;
  onScoreboard: (open: boolean) => void;
  onLeave: () => void;
  vrMode: boolean;
};

export default function GameCanvas({ playerId, snapshot, send, scoreboardOpen, onScoreboard, onLeave, vrMode }: Props) {
  const me = snapshot.players.find((player) => player.id === playerId);
  const screenRef = useRef<HTMLElement>(null);
  const hasLockedOnce = useRef(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [vrDebug, setVrDebug] = useState<VRDebugState | null>(null);
  const [vrAds, setVrAds] = useState(false);
  const [tracers, setTracers] = useState<BulletTracerItem[]>([]);
  const [impacts, setImpacts] = useState<ImpactEffectItem[]>([]);
  const [weaponView, setWeaponView] = useState({
    ads: false,
    recoil: 0,
    firing: false,
    moving: false,
    crouching: false,
    shotPulse: 0
  });

  const addShotVisual = useCallback((tracer: Omit<BulletTracerItem, 'id' | 'createdAt'>, impact: Omit<ImpactEffectItem, 'id' | 'createdAt'>) => {
    const now = performance.now();
    const tracerItem = { ...tracer, id: now + Math.random(), createdAt: now };
    const impactItem = { ...impact, id: now + Math.random() + 1, createdAt: now };
    setTracers((current) => [...current, tracerItem]);
    setImpacts((current) => [...current, impactItem]);
    window.setTimeout(() => setTracers((current) => current.filter((item) => item.id !== tracerItem.id)), 90);
    window.setTimeout(() => setImpacts((current) => current.filter((item) => item.id !== impactItem.id)), 220);
  }, []);

  const requestPointerLock = useCallback(() => {
    const canvas = screenRef.current?.querySelector('canvas');
    if (!canvas) return;
    try {
      const result = canvas.requestPointerLock() as Promise<void> | void;
      if (result instanceof Promise) result.catch(() => setPointerLocked(false));
    } catch {
      setPointerLocked(false);
    }
  }, []);

  useEffect(() => {
    if (vrMode) return undefined;
    const onPointerLockChange = () => {
      const canvas = screenRef.current?.querySelector('canvas');
      const locked = Boolean(canvas && document.pointerLockElement === canvas);
      setPointerLocked(locked);
      if (locked) {
        hasLockedOnce.current = true;
        setPauseMenuOpen(false);
      } else if (hasLockedOnce.current) {
        setPauseMenuOpen(true);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyP') return;
      event.preventDefault();
      setPauseMenuOpen(true);
      if (document.pointerLockElement) void document.exitPointerLock();
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('keydown', onKeyDown);
      if (document.pointerLockElement) void document.exitPointerLock();
    };
  }, [vrMode]);

  useEffect(() => {
    if (vrMode) return undefined;
    const timeout = window.setTimeout(() => {
      requestPointerLock();
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [requestPointerLock, vrMode]);

  const controlsEnabled = !vrMode && pointerLocked && !pauseMenuOpen;

  if (!me || !me.weaponId) return null;

  return (
    <main className="game-screen" ref={screenRef}>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 180, position: [0, 2.5, 8] }}>
        <color attach="background" args={['#9db3bf']} />
        <ambientLight intensity={0.45} />
        <directionalLight castShadow position={[10, 18, 8]} intensity={1.5} shadow-mapSize={[2048, 2048]} />
        <Sky sunPosition={[20, 12, 10]} />
        <GameMap activeMapId={snapshot.activeMapId} />
        {snapshot.players.map((player) =>
          player.id === playerId ? null : <PlayerAvatar key={player.id} player={player} serverTime={snapshot.serverTime} />
        )}
        <HealthPickups pickups={snapshot.healthPickups} serverTime={snapshot.serverTime} />
        <DamageNumbers events={snapshot.damageEvents} players={snapshot.players} serverTime={snapshot.serverTime} />
        <RemoteBulletTracers events={snapshot.shotEvents} players={snapshot.players} localPlayerId={playerId} serverTime={snapshot.serverTime} />
        <RemoteMuzzleFlashes events={snapshot.shotEvents} players={snapshot.players} localPlayerId={playerId} serverTime={snapshot.serverTime} />
        <BulletTracer tracers={tracers} />
        <ImpactEffect impacts={impacts} />
        {vrMode ? (
          <VRSessionBridge
            player={me}
            snapshot={snapshot}
            activeMapId={snapshot.activeMapId}
            send={send}
            onAdsChange={setVrAds}
            onShotVisual={addShotVisual}
            onDebugInput={setVrDebug}
          />
        ) : null}
        {vrMode ? <VRHud snapshot={snapshot} player={me} /> : null}
        {vrMode ? <VRADSOverlay weaponId={me.weaponId} ads={vrAds} /> : null}
        {!vrMode ? (
          <>
            <WeaponModel
              weaponId={me.weaponId}
              ads={weaponView.ads}
              recoil={weaponView.recoil}
              moving={weaponView.moving}
              crouching={weaponView.crouching}
              firing={weaponView.firing}
              reloading={Boolean(me.reloadingUntil)}
              shotPulse={weaponView.shotPulse}
            />
            <PlayerController
              player={me}
              snapshot={snapshot}
              activeMapId={snapshot.activeMapId}
              send={send}
              onScoreboard={onScoreboard}
              onWeaponViewChange={setWeaponView}
              onShotVisual={addShotVisual}
              controlsEnabled={controlsEnabled}
            />
          </>
        ) : null}
        <GameAudio snapshot={snapshot} localPlayerId={playerId} />
      </Canvas>
      <HUD snapshot={snapshot} player={me} scoreboardOpen={scoreboardOpen} ads={vrMode ? vrAds : weaponView.ads} playerId={playerId} vrMode={vrMode} />
      {vrMode ? (
        <div className="vr-mode-hint">
          <strong>VR Mode</strong>
          <span>Questブラウザの Enter VR を押すとHMD視点で見回せます</span>
        </div>
      ) : null}
      {vrMode && new URLSearchParams(window.location.search).get('debugVr') === '1' && vrDebug ? <VRDebugPanel debug={vrDebug} /> : null}
      {!vrMode && !pointerLocked && !pauseMenuOpen ? (
        <button className="pointer-start-overlay" onClick={requestPointerLock}>
          <strong>クリックして操作開始</strong>
          <span>ESCでメニューを開けます</span>
        </button>
      ) : null}
      {!vrMode && pauseMenuOpen ? <PauseMenu onResume={requestPointerLock} onLeave={onLeave} /> : null}
      {!vrMode ? <div className="lock-hint">ESC / P: Menu</div> : null}
    </main>
  );
}

function VRDebugPanel({ debug }: { debug: VRDebugState }) {
  return (
    <div className="vr-debug-panel">
      <strong>VR INPUT</strong>
      <span>L stick {debug.leftStickX.toFixed(2)} / {debug.leftStickY.toFixed(2)}</span>
      <span>R stick {debug.rightStickX.toFixed(2)} / {debug.rightStickY.toFixed(2)}</span>
      <span>L trigger {debug.leftTrigger.toFixed(2)} / grip {String(debug.leftGrip)}</span>
      <span>R trigger {debug.rightTrigger.toFixed(2)} / grip {String(debug.rightGrip)}</span>
      <span>A {String(debug.aPressed)} / B {String(debug.bPressed)}</span>
      <span>isVRMode {String(debug.isVRMode)}</span>
    </div>
  );
}
