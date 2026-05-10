import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import type { PlayerState } from './types';

type Props = {
  player: PlayerState;
};

export default function VRSessionBridge({ player }: Props) {
  const { camera, gl } = useThree();

  useEffect(() => {
    gl.xr.enabled = true;
    const button = VRButton.createButton(gl);
    button.classList.add('quickfire-vr-button');
    document.body.appendChild(button);

    return () => {
      button.remove();
      gl.xr.enabled = false;
    };
  }, [gl]);

  useFrame(() => {
    if (gl.xr.isPresenting) return;
    camera.position.set(player.position.x, player.position.y + 1.6, player.position.z);
    camera.rotation.set(player.pitch, player.rotationY, 0, 'YXZ');
  });

  return null;
}
