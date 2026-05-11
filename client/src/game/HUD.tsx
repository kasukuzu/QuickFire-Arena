import { useEffect, useMemo, useRef } from 'react';
import { WEAPONS } from './WeaponSystem';
import ADSOverlay from './ads/ADSOverlay';
import KillFeed from './ui/KillFeed';
import KillStreakMessage from './ui/KillStreakMessage';
import MatchHud from './ui/hud/MatchHud';
import { playHitSound, playHurtSound, playReloadDoneSound, playReloadSound } from './sound';
import type { DamageEvent, PlayerState, RoomSnapshot } from './types';

type Props = {
  snapshot: RoomSnapshot;
  player: PlayerState;
  scoreboardOpen: boolean;
  ads: boolean;
  playerId: string;
  vrMode?: boolean;
};

export default function HUD({ snapshot, player, scoreboardOpen, ads, playerId, vrMode = false }: Props) {
  const remaining = snapshot.matchEndsAt ? Math.max(0, snapshot.matchEndsAt - snapshot.serverTime) : 0;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  const timeLabel = `${minutes}:${seconds}`;
  const weapon = player.weaponId ? WEAPONS[player.weaponId] : null;
  const respawnMs = player.respawnAt ? Math.max(0, player.respawnAt - snapshot.serverTime) : 0;
  const invincibleMs = player.invincibleUntil ? Math.max(0, player.invincibleUntil - snapshot.serverTime) : 0;
  const ranking = [...snapshot.players].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
  const hpPercent = Math.max(0, Math.min(100, player.hp));
  const hpTone = hpPercent <= 20 ? 'danger' : hpPercent <= 50 ? 'warning' : 'healthy';
  const reloadProgress = getReloadProgress(player, weapon, snapshot.serverTime);
  const isReloading = reloadProgress !== null;
  const ammoRatio = weapon ? Math.max(0, Math.min(1, player.ammo / weapon.magazineSize)) : 0;
  const recentHit = useMemo(
    () => latestRecent(snapshot.damageEvents, snapshot.serverTime, (event) => event.attackerId === playerId, 240),
    [playerId, snapshot.damageEvents, snapshot.serverTime]
  );
  const recentDamageEvents = useMemo(
    () => snapshot.damageEvents.filter((event) => event.targetId === playerId && snapshot.serverTime - event.createdAt <= 900),
    [playerId, snapshot.damageEvents, snapshot.serverTime]
  );

  useCombatAudio(snapshot.damageEvents, playerId, player.reloadingUntil, snapshot.serverTime);

  return (
    <div className="hud">
      <LowHealthOverlay hp={player.hp} />
      <DamageOverlay events={recentDamageEvents} player={player} players={snapshot.players} serverTime={snapshot.serverTime} />
      <HitMarker event={recentHit} serverTime={snapshot.serverTime} />

      {!vrMode ? (
        <>
          <MatchHud
            time={timeLabel}
            hp={player.hp}
            hpRatio={hpPercent / 100}
            hpTone={hpTone}
            weaponName={weapon ? weapon.name : 'Weapon'}
            ammo={player.ammo}
            magazineSize={weapon?.magazineSize ?? null}
            ammoRatio={ammoRatio}
            reloading={isReloading}
            reloadProgress={reloadProgress}
          />
          {ads && player.weaponId ? <ADSOverlay weaponId={player.weaponId} ads={ads} /> : <div className="crosshair" />}
        </>
      ) : null}

      {!player.alive ? (
        <div className="respawn">Respawn in {Math.ceil(respawnMs / 1000)}s</div>
      ) : null}
      {player.alive && invincibleMs > 0 ? (
        <div className="respawn invincible">無敵中 {(invincibleMs / 1000).toFixed(1)}</div>
      ) : null}
      <KillStreakMessage events={snapshot.killFeedEvents} localPlayerId={playerId} serverTime={snapshot.serverTime} />
      <KillFeed events={snapshot.killFeedEvents} localPlayerId={playerId} serverTime={snapshot.serverTime} />
      {scoreboardOpen ? (
        <div className="scoreboard">
          <h2>Scoreboard</h2>
          {ranking.map((entry) => (
            <div className="score-row" key={entry.id}>
              <span>{entry.name}</span>
              <span>{entry.kills} / {entry.deaths}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function useCombatAudio(damageEvents: DamageEvent[], playerId: string, reloadingUntil: number | null, serverTime: number) {
  const seenDamageEvents = useRef(new Set<string>());
  const wasReloading = useRef(false);

  useEffect(() => {
    for (const event of damageEvents) {
      if (seenDamageEvents.current.has(event.id)) continue;
      seenDamageEvents.current.add(event.id);
      if (event.attackerId === playerId) playHitSound(event.isHeadshot, event.isHeadshot ? 0.72 : 0.58);
      if (event.targetId === playerId) playHurtSound(event.damage >= 45 ? 0.72 : 0.5);
    }
  }, [damageEvents, playerId]);

  useEffect(() => {
    const isReloading = Boolean(reloadingUntil && reloadingUntil > serverTime);
    if (isReloading && !wasReloading.current) playReloadSound(0.62);
    if (!isReloading && wasReloading.current) playReloadDoneSound(0.34);
    wasReloading.current = isReloading;
  }, [reloadingUntil, serverTime]);
}

function getReloadProgress(player: PlayerState, weapon: typeof WEAPONS[keyof typeof WEAPONS] | null, serverTime: number) {
  if (!weapon || !player.reloadingUntil || player.reloadingUntil <= serverTime) return null;
  const startedAt = player.reloadingUntil - weapon.reloadMs;
  return Math.max(0, Math.min(1, (serverTime - startedAt) / weapon.reloadMs));
}

function latestRecent(events: DamageEvent[], serverTime: number, predicate: (event: DamageEvent) => boolean, maxAgeMs: number) {
  return events
    .filter((event) => predicate(event) && serverTime - event.createdAt <= maxAgeMs)
    .sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
}

function HitMarker({ event, serverTime }: { event: DamageEvent | null; serverTime: number }) {
  if (!event) return null;
  const age = serverTime - event.createdAt;
  const alpha = Math.max(0, 1 - age / 240);
  const className = event.isHeadshot ? 'hit-marker headshot' : 'hit-marker';
  return (
    <div className={className} style={{ opacity: alpha }}>
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function DamageOverlay({
  events,
  player,
  players,
  serverTime
}: {
  events: DamageEvent[];
  player: PlayerState;
  players: PlayerState[];
  serverTime: number;
}) {
  if (events.length === 0) return null;

  return (
    <div className="damage-indicators">
      <div className="damage-flash" style={{ opacity: getDamageFlashOpacity(events, serverTime) }} />
      {events.map((event) => {
        const attacker = players.find((candidate) => candidate.id === event.attackerId);
        const angle = attacker ? getDamageAngle(player, attacker) : 0;
        const age = serverTime - event.createdAt;
        const opacity = Math.max(0, 1 - age / 900);
        return (
          <div
            key={event.id}
            className={event.damage >= 45 ? 'damage-arrow heavy' : 'damage-arrow'}
            style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-38vh)`, opacity }}
          />
        );
      })}
    </div>
  );
}

function getDamageFlashOpacity(events: DamageEvent[], serverTime: number) {
  return Math.min(
    0.52,
    events.reduce((strongest, event) => {
      const age = serverTime - event.createdAt;
      const base = event.damage >= 45 ? 0.52 : 0.36;
      return Math.max(strongest, base * Math.max(0, 1 - age / 650));
    }, 0)
  );
}

function getDamageAngle(player: PlayerState, attacker: PlayerState) {
  const dx = attacker.position.x - player.position.x;
  const dz = attacker.position.z - player.position.z;
  const worldAngle = Math.atan2(dx, -dz);
  const relative = worldAngle - player.rotationY;
  return THREE_RAD_TO_DEG(relative);
}

function THREE_RAD_TO_DEG(radians: number) {
  return radians * (180 / Math.PI);
}

function LowHealthOverlay({ hp }: { hp: number }) {
  if (hp > 30) return null;
  const strength = hp <= 20 ? 0.36 : 0.22;
  return <div className="low-health-overlay" style={{ opacity: strength }} />;
}
