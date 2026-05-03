import { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from './types';

export type BulletTracerItem = {
  id: number;
  from: Vec3;
  to: Vec3;
  createdAt: number;
};

type Props = {
  tracers: BulletTracerItem[];
};

export default function BulletTracer({ tracers }: Props) {
  return (
    <>
      {tracers.map((tracer) => (
        <TracerLine key={tracer.id} tracer={tracer} />
      ))}
    </>
  );
}

function TracerLine({ tracer }: { tracer: BulletTracerItem }) {
  const line = useMemo(() => {
    const points = [
      new THREE.Vector3(tracer.from.x, tracer.from.y, tracer.from.z),
      new THREE.Vector3(tracer.to.x, tracer.to.y, tracer.to.z)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: '#ffe6a3', transparent: true, opacity: 0.85 });
    return new THREE.Line(geometry, material);
  }, [tracer]);

  return <primitive object={line} />;
}
