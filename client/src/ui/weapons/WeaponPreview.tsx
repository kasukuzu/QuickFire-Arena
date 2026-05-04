import type { WeaponId } from '../../game/types';

type Props = {
  weaponId: WeaponId;
};

export default function WeaponPreview({ weaponId }: Props) {
  return (
    <div className={`weapon-preview weapon-preview-${weaponId}`} aria-hidden="true">
      <span className="gun-body" />
      <span className="gun-barrel" />
      <span className="gun-stock" />
      <span className="gun-grip" />
      <span className="gun-mag" />
      {weaponId === 'sr' ? <span className="gun-scope" /> : null}
    </div>
  );
}
