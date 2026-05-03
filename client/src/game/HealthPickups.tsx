import HealthPickup from './HealthPickup';
import type { HealthPickupState } from './types';

type Props = {
  pickups: HealthPickupState[];
  serverTime: number;
};

export default function HealthPickups({ pickups, serverTime }: Props) {
  return (
    <>
      {pickups.map((pickup) => (
        <HealthPickup key={pickup.id} pickup={pickup} serverTime={serverTime} />
      ))}
    </>
  );
}
