export type CharacterId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type CharacterDefinition = {
  id: CharacterId;
  name: string;
  skin: string;
  helmet: string;
  torso: string;
  arms: string;
  legs: string;
  accent: string;
};

export const CHARACTERS: CharacterDefinition[] = [
  { id: 0, name: 'SoldierGreen', skin: '#c7966b', helmet: '#1c211f', torso: '#3e6b3c', arms: '#4d7f48', legs: '#293d2e', accent: '#101413' },
  { id: 1, name: 'SoldierBlue', skin: '#d09b72', helmet: '#dfe8e9', torso: '#315f91', arms: '#3f75a9', legs: '#243b61', accent: '#e8eeee' },
  { id: 2, name: 'SoldierRed', skin: '#bd825f', helmet: '#161616', torso: '#8e3431', arms: '#a4443e', legs: '#3a1f20', accent: '#111111' },
  { id: 3, name: 'SoldierYellow', skin: '#d4a27a', helmet: '#6b4c2f', torso: '#b59533', arms: '#c7a844', legs: '#60492c', accent: '#6b4c2f' },
  { id: 4, name: 'SoldierPurple', skin: '#c18c68', helmet: '#60666a', torso: '#67428d', arms: '#7753a1', legs: '#3e3548', accent: '#8a9092' },
  { id: 5, name: 'SoldierOrange', skin: '#c58e66', helmet: '#1b1b1b', torso: '#c0622e', arms: '#d27439', legs: '#3b312c', accent: '#111111' },
  { id: 6, name: 'SoldierCyan', skin: '#d7a37b', helmet: '#f1f4f2', torso: '#2b9aa3', arms: '#3fb7c0', legs: '#28666d', accent: '#f7fbfb' },
  { id: 7, name: 'SoldierGray', skin: '#b88463', helmet: '#151718', torso: '#60676a', arms: '#737b7d', legs: '#303538', accent: '#111315' }
];

export function getCharacter(id: number) {
  return CHARACTERS[Math.max(0, Math.min(7, Math.floor(id)))] ?? CHARACTERS[0];
}
