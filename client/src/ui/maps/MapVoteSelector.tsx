import { MAP_SELECTIONS } from '../../game/maps/mapDefinitions';
import type { MapSelectionId } from '../../game/types';
import MapCard from './MapCard';

type Props = {
  selectedMap: MapSelectionId | null;
  onSelect: (mapId: MapSelectionId) => void;
};

export default function MapVoteSelector({ selectedMap, onSelect }: Props) {
  return (
    <div className="map-grid">
      {MAP_SELECTIONS.map((map) => (
        <MapCard
          key={map.id}
          id={map.id}
          name={map.name}
          description={map.description}
          selected={selectedMap === map.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
