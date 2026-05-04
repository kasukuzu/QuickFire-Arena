import type { MapSelectionId } from '../../game/types';

type Props = {
  id: MapSelectionId;
  name: string;
  description: string;
  selected: boolean;
  onSelect: (mapId: MapSelectionId) => void;
};

export default function MapCard({ id, name, description, selected, onSelect }: Props) {
  return (
    <button className={selected ? 'map-card active' : 'map-card'} onClick={() => onSelect(id)}>
      <span className={`map-thumb map-thumb-${id}`} />
      <strong>{name}</strong>
      <small>{description}</small>
    </button>
  );
}
