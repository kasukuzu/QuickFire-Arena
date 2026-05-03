import FactoryMap from './FactoryMap';
import RooftopMap from './RooftopMap';
import WarehouseMap from './WarehouseMap';
import type { MapId } from './mapDefinitions';

type Props = {
  activeMapId: MapId;
};

export default function GameMap({ activeMapId }: Props) {
  if (activeMapId === 'factory') return <FactoryMap />;
  if (activeMapId === 'rooftop') return <RooftopMap />;
  return <WarehouseMap />;
}
