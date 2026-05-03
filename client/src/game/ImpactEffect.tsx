import type { Vec3 } from './types';

export type ImpactEffectItem = {
  id: number;
  position: Vec3;
  kind: 'world' | 'hit';
  createdAt: number;
};

type Props = {
  impacts: ImpactEffectItem[];
};

export default function ImpactEffect({ impacts }: Props) {
  return (
    <>
      {impacts.map((impact) => (
        <mesh key={impact.id} position={[impact.position.x, impact.position.y, impact.position.z]}>
          <sphereGeometry args={[impact.kind === 'hit' ? 0.16 : 0.1, 8, 8]} />
          <meshBasicMaterial color={impact.kind === 'hit' ? '#ff5a4a' : '#ffd27a'} transparent opacity={0.82} />
        </mesh>
      ))}
    </>
  );
}
